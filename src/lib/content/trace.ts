import { ZhbConstant } from '../board/ZhbConstant';

/**
 * A single parsed trace line: the state it first appears at, and the text shown
 * for it on the trace pane.
 */
export interface TraceLine {
  /** The state number at which this line becomes visible. */
  readonly state: number;
  /** The text to present on the trace pane. */
  readonly text: string;
}

/**
 * Strip a `#` comment from a trace line: everything from the first `#` to the
 * end of the line is removed. A line starting with `#` becomes empty (a full
 * comment); a trailing `# ...` is dropped. Comments are never shown on the pane.
 *
 * @param line A raw line.
 * @returns The line with any comment removed.
 */
function stripComment(line: string): string {
  const hash = line.indexOf('#');
  return hash === -1 ? line : line.slice(0, hash);
}

/**
 * Parse a content's `trace` file into ordered {@link TraceLine}s.
 *
 * Format: each line is `state@|@text`, where `@|@` is
 * {@link ZhbConstant.TRACE_SEPARATOR}. The first field is the state number; the
 * remainder (after the first separator) is the text, preserved verbatim so it
 * may contain spaces and column padding. `#` introduces a comment to end of
 * line; comment-only and blank lines are skipped.
 *
 * @param text Raw trace file contents.
 * @returns The parsed lines, in file order.
 */
export function parseTrace(text: string): TraceLine[] {
  const lines: TraceLine[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const stripped = stripComment(raw);
    if (stripped.trim() === '') {
      continue;
    }
    const sep = stripped.indexOf(ZhbConstant.TRACE_SEPARATOR);
    if (sep === -1) {
      continue;
    }
    const stateText = stripped.slice(0, sep).trim();
    const state = Number(stateText);
    if (!Number.isInteger(state)) {
      continue;
    }
    // Text after the separator; trailing whitespace trimmed, internal kept.
    const body = stripped
      .slice(sep + ZhbConstant.TRACE_SEPARATOR.length)
      .replace(/\s+$/, '');
    lines.push({ state, text: body });
  }
  return lines;
}

/**
 * Select the trace lines visible at state `k`: every line whose `state` is in
 * `{0, …, k}`, in file order.
 *
 * @param traceLines All parsed trace lines.
 * @param k The current state.
 * @returns The texts to display, in order.
 */
export function traceLinesUpTo(traceLines: TraceLine[], k: number): string[] {
  return traceLines.filter((t) => t.state <= k).map((t) => t.text);
}
