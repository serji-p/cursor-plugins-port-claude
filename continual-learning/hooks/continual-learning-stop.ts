/// <reference types="bun-types-no-globals/lib/index.d.ts" />

// Claude Code Stop hook for the continual-learning plugin.
//
// Ported from the Cursor Team Kit `continual-learning` plugin and adapted to
// Claude Code's Stop hook contract:
//   - stdin fields: session_id, transcript_path, cwd, stop_hook_active, ...
//   - "do not stop, do this instead" is expressed via
//     { hookSpecificOutput: { hookEventName: "Stop", additionalContext } }
//   - stop_hook_active guards against infinite continuation loops.
//
// State is kept per-project under <cwd>/.claude/continual-learning/.

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { stdin } from "bun";

const DEFAULT_MIN_TURNS = 10;
const DEFAULT_MIN_MINUTES = 120;
const TRIAL_DEFAULT_MIN_TURNS = 3;
const TRIAL_DEFAULT_MIN_MINUTES = 15;
const TRIAL_DEFAULT_DURATION_MINUTES = 24 * 60;

// Stop hook input from Claude Code (subset we use).
interface StopHookInput {
  session_id?: string;
  transcript_path?: string | null;
  cwd?: string | null;
  hook_event_name?: string;
  stop_hook_active?: boolean;
}

interface ContinualLearningState {
  version: 1;
  lastRunAtMs: number;
  turnsSinceLastRun: number;
  lastTranscriptMtimeMs: number | null;
  trialStartedAtMs: number | null;
}

function stateDir(cwd: string): string {
  return resolve(cwd, ".claude/continual-learning");
}
function statePath(cwd: string): string {
  return resolve(stateDir(cwd), "continual-learning.json");
}
function indexPath(cwd: string): string {
  return resolve(stateDir(cwd), "continual-learning-index.json");
}

function followupMessage(cwd: string): string {
  const index = indexPath(cwd);
  return (
    "Run the `continual-learning` skill now, delegating the full flow to the " +
    "`agents-memory-updater` subagent. Use incremental transcript processing with index file " +
    `\`${index}\`: only consider transcripts not in the index or whose mtime is newer than the ` +
    "indexed mtime. Have the subagent refresh index mtimes, drop entries for deleted transcripts, " +
    "and update the `## Learned User Preferences` and `## Learned Workspace Facts` sections of " +
    "`./CLAUDE.md` (create them if absent) only for high-signal recurring user corrections and " +
    "durable workspace facts. Plain bullets only, update matching bullets in place, max 12 per " +
    "section. Exclude one-off/transient details and secrets. If no meaningful updates exist, " +
    "respond exactly: No high-signal memory updates."
  );
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function parseBoolean(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return (
    normalized === "1" ||
    normalized === "true" ||
    normalized === "yes" ||
    normalized === "on"
  );
}

function readEnvValue(primary: string, legacy: string): string | undefined {
  return process.env[primary] ?? process.env[legacy];
}

function loadState(cwd: string): ContinualLearningState {
  const fallback: ContinualLearningState = {
    version: 1,
    lastRunAtMs: 0,
    turnsSinceLastRun: 0,
    lastTranscriptMtimeMs: null,
    trialStartedAtMs: null,
  };

  const path = statePath(cwd);
  if (!existsSync(path)) return fallback;

  try {
    const parsed = JSON.parse(readFileSync(path, "utf-8")) as Partial<ContinualLearningState>;
    if (parsed.version !== 1) return fallback;
    return {
      version: 1,
      lastRunAtMs:
        typeof parsed.lastRunAtMs === "number" && Number.isFinite(parsed.lastRunAtMs)
          ? parsed.lastRunAtMs
          : 0,
      turnsSinceLastRun:
        typeof parsed.turnsSinceLastRun === "number" &&
        Number.isFinite(parsed.turnsSinceLastRun) &&
        parsed.turnsSinceLastRun >= 0
          ? parsed.turnsSinceLastRun
          : 0,
      lastTranscriptMtimeMs:
        typeof parsed.lastTranscriptMtimeMs === "number" &&
        Number.isFinite(parsed.lastTranscriptMtimeMs)
          ? parsed.lastTranscriptMtimeMs
          : null,
      trialStartedAtMs:
        typeof parsed.trialStartedAtMs === "number" &&
        Number.isFinite(parsed.trialStartedAtMs)
          ? parsed.trialStartedAtMs
          : null,
    };
  } catch {
    return fallback;
  }
}

function saveState(cwd: string, state: ContinualLearningState): void {
  const directory = dirname(statePath(cwd));
  if (!existsSync(directory)) mkdirSync(directory, { recursive: true });
  writeFileSync(statePath(cwd), `${JSON.stringify(state, null, 2)}\n`, "utf-8");
}

function getTranscriptMtimeMs(transcriptPath: string | null | undefined): number | null {
  if (!transcriptPath) return null;
  try {
    return statSync(transcriptPath).mtimeMs;
  } catch {
    return null;
  }
}

function emit(output: Record<string, unknown>): void {
  console.log(JSON.stringify(output));
}

async function parseHookInput<T>(): Promise<T> {
  const text = await stdin.text();
  return JSON.parse(text) as T;
}

async function main(): Promise<number> {
  try {
    const input = await parseHookInput<StopHookInput>();
    const cwd = input.cwd && input.cwd.length > 0 ? input.cwd : process.cwd();

    // In a forced-continuation loop already (a prior Stop hook blocked). Do not
    // count this as a new turn and never re-trigger here — prevents loops.
    if (input.stop_hook_active === true) {
      emit({});
      return 0;
    }

    const state = loadState(cwd);

    // A normal Stop event (not a continuation) == one completed turn.
    const turnsSinceLastRun = state.turnsSinceLastRun + 1;
    const now = Date.now();

    const trialEnabled = parseBoolean(
      readEnvValue("CONTINUAL_LEARNING_TRIAL_MODE", "CONTINUOUS_LEARNING_TRIAL_MODE")
    );
    if (trialEnabled && state.trialStartedAtMs === null) {
      state.trialStartedAtMs = now;
    }

    const trialDurationMinutes = parsePositiveInt(
      readEnvValue(
        "CONTINUAL_LEARNING_TRIAL_DURATION_MINUTES",
        "CONTINUOUS_LEARNING_TRIAL_DURATION_MINUTES"
      ),
      TRIAL_DEFAULT_DURATION_MINUTES
    );
    const trialMinTurns = parsePositiveInt(
      readEnvValue("CONTINUAL_LEARNING_TRIAL_MIN_TURNS", "CONTINUOUS_LEARNING_TRIAL_MIN_TURNS"),
      TRIAL_DEFAULT_MIN_TURNS
    );
    const trialMinMinutes = parsePositiveInt(
      readEnvValue("CONTINUAL_LEARNING_TRIAL_MIN_MINUTES", "CONTINUOUS_LEARNING_TRIAL_MIN_MINUTES"),
      TRIAL_DEFAULT_MIN_MINUTES
    );
    const inTrialWindow =
      trialEnabled &&
      state.trialStartedAtMs !== null &&
      now - state.trialStartedAtMs < trialDurationMinutes * 60_000;

    const minTurns = parsePositiveInt(
      readEnvValue("CONTINUAL_LEARNING_MIN_TURNS", "CONTINUOUS_LEARNING_MIN_TURNS"),
      DEFAULT_MIN_TURNS
    );
    const minMinutes = parsePositiveInt(
      readEnvValue("CONTINUAL_LEARNING_MIN_MINUTES", "CONTINUOUS_LEARNING_MIN_MINUTES"),
      DEFAULT_MIN_MINUTES
    );

    const effectiveMinTurns = inTrialWindow ? trialMinTurns : minTurns;
    const effectiveMinMinutes = inTrialWindow ? trialMinMinutes : minMinutes;
    const minutesSinceLastRun =
      state.lastRunAtMs > 0
        ? Math.floor((now - state.lastRunAtMs) / 60000)
        : Number.POSITIVE_INFINITY;
    const transcriptMtimeMs = getTranscriptMtimeMs(input.transcript_path);
    const hasTranscriptAdvanced =
      transcriptMtimeMs !== null &&
      (state.lastTranscriptMtimeMs === null || transcriptMtimeMs > state.lastTranscriptMtimeMs);

    const shouldTrigger =
      turnsSinceLastRun >= effectiveMinTurns &&
      minutesSinceLastRun >= effectiveMinMinutes &&
      hasTranscriptAdvanced;

    if (shouldTrigger) {
      state.lastRunAtMs = now;
      state.turnsSinceLastRun = 0;
      state.lastTranscriptMtimeMs = transcriptMtimeMs;
      saveState(cwd, state);

      emit({
        hookSpecificOutput: {
          hookEventName: "Stop",
          additionalContext: followupMessage(cwd),
        },
      });
      return 0;
    }

    state.turnsSinceLastRun = turnsSinceLastRun;
    saveState(cwd, state);
    emit({});
    return 0;
  } catch (error) {
    console.error("[continual-learning-stop] failed", error);
    emit({});
    return 0;
  }
}

const exitCode = await main();
process.exit(exitCode);
