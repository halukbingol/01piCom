import type { Board } from '../board/board';
import type { StepContext } from './stepContext';

/**
 * A board step in the DIRECT-ACCESS model: an imperative function that
 * manipulates drawables and the board directly — mounting cells, assigning
 * values, toggling `setVisible` / `setHighlighted` / `setAnimated` on objects
 * it holds references to.
 *
 * The step does not return operations; it performs them. The navigation system
 * decides WHICH step(s) to execute, and the executor (see
 * `lib/execution/executor.ts`) executes them:
 *
 *  - forward smooth transition to `n`  → execute `steps[n]` only,
 *  - reset / fast-forward / jump to `n` → clear the board, call `resetBoard()`,
 *    then execute `steps[0..n]` in order.
 *
 * ## Consistency contract for step authors
 *
 * Because a state can be reached either by one forward execution or by a full
 * replay, a step must be deterministic and self-contained: given the board
 * state produced by `steps[0..n-1]`, executing `steps[n]` must always produce
 * the same result. Keep all drawables in a module registry recreated by
 * `resetBoard()`, and never depend on anything outside it (no randomness, no
 * time, no leftover state from other runs).
 */
export type StepFn = (board: Board, ctx: StepContext) => void;

/**
 * The names of the dynamic panes the page exposes. A content may hide any of
 * these via its `config.txt` (e.g. `code,invisible`).
 */
export type PaneName =
  'code' | 'description' | 'board' | 'download' | 'trace' | 'debug';

/**
 * The full set of pane names, in layout order. Used for validation and
 * iteration.
 */
export const PANE_NAMES: readonly PaneName[] = [
  'code',
  'description',
  'board',
  'download',
  'trace',
  'debug',
];

/**
 * Parsed contents of a content's `config.txt` (a CSV of key,value lines).
 */
export interface ContentConfig {
  /**
   * Title text read from the `title` line of `config.txt`, used for both the
   * HTML page title (`document.title`) and the `#div-title` header. Omitted when
   * the config has no `title` line, in which case the build-time defaults are
   * kept.
   */
  readonly title?: string;
  /** Number of steps, including step 0. */
  readonly stepsNO: number;
  /** Filename of the source code shown in the `code` pane (omitted if hidden). */
  readonly fileCode?: string;
  /** Filename of the per-step highlight spec (omitted if `code` hidden). */
  readonly fileCodeHighlight?: string;
  /** Filename of the per-step description (omitted if `description` hidden). */
  readonly fileDescription?: string;
  /** Filename of the board steps module (always required). */
  readonly fileBoard: string;
  /** Filename of the trace file (omitted if `trace` hidden). */
  readonly fileTrace?: string;
  /**
   * Filename of the download manifest (omitted when the content offers no
   * downloads). Each non-comment line of that file is a path, relative to the
   * content's `assets/` directory, to a file offered in the `download` pane.
   */
  readonly fileDownload?: string;
  /**
   * Panes explicitly marked `invisible` in `config.txt`. All panes are visible
   * by default; a pane listed here is hidden. Empty when none are hidden.
   */
  readonly hiddenPanes: ReadonlySet<PaneName>;
}

/**
 * A fully assembled content, ready to be handed to the content renderer.
 */
export interface ContentModule {
  /** Human-readable content id, e.g. `content-memory`. */
  readonly id: string;
  /** Parsed config. */
  readonly config: ContentConfig;
  /** Raw source code text (for the `code` pane). */
  readonly code: string;
  /** Language hint derived from the code filename extension, e.g. `java`. */
  readonly codeLanguage: string;
  /** Raw highlight-spec text (one line per step). */
  readonly highlight: string;
  /** Raw description HTML (`<li>` per step). */
  readonly description: string;
  /** Raw trace file text (empty when the trace pane is hidden). */
  readonly trace: string;
  /** Board step functions (one per state), executed by the executor. */
  readonly steps: StepFn[];
  /**
   * Paths — each relative to this content's `assets/` directory — of files
   * offered for download in the `download` pane. Parsed from the manifest named
   * by `config.fileDownload`. Absent or empty when the content offers none.
   */
  readonly downloads?: readonly string[];
  /**
   * Hook to reset the board module's own object registry, called by the
   * executor before every replay from state 0, so replayed steps reference
   * freshly-created drawables. Required for deterministic replay.
   */
  readonly resetBoard?: () => void;
}
