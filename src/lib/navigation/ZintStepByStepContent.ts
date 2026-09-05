import { ZintStepByStepClient } from './ZintStepByStepClient';
import type { ContentModule } from '../content/contentTypes';
import { countListItems, parseHighlight } from '../content/contentConfig';
import { parseTrace, traceLinesUpTo, type TraceLine } from '../content/trace';
import { Board } from '../board/board';
import { StepExecutor } from '../execution/executor';

/**
 * The set of DOM panes a content renders into.
 */
export interface ContentPanes {
  /** `#code` pane (a `<pre>` or similar). */
  readonly code: HTMLElement | null;
  /** `#board` SVG element. */
  readonly board: SVGSVGElement;
  /** `#description` pane. */
  readonly description: HTMLElement | null;
  /** `#trace` pane. */
  readonly trace: HTMLElement | null;
}

/**
 * ZintStepByStepContent binds a compiled {@link ContentModule} to the page
 * panes and steps its board through states under the navigation GUI.
 *
 * ## Direct-access model
 *
 * Board steps are imperative functions `(board, ctx) => void` that manipulate
 * drawables directly. This class is the bridge between the two systems:
 *
 *  - the **navigation** FSM decides WHICH step(s) a transition needs;
 *  - the **executor** ({@link StepExecutor}) EXECUTES them.
 *
 * A forward smooth transition executes only `steps[n]` (animated); every other
 * route (reset, fast-forward, jumps, backward moves) rebuilds via the
 * executor's `runTo(n)` — clear board, reset registry, execute `steps[0..n]`
 * instantly. Provided steps follow the determinism contract (see
 * `contentTypes.StepFn`), every path to a state produces the identical board.
 */
export class ZintStepByStepContent extends ZintStepByStepClient {
  private readonly module: ContentModule;
  private readonly panes: ContentPanes;

  /** Per-step highlighted line numbers, parsed from the highlight file. */
  private readonly highlightPerStep: number[][];

  /** The rendered code, split into lines for per-line highlighting. */
  private readonly codeLines: string[];

  /** Cached code-line elements (built once) for per-step highlight toggling. */
  private codeLineEls: HTMLElement[] = [];

  /** Per-step description inner HTML (inside of each top-level `<li>`). */
  private descriptionPerStep: string[] = [];

  /** Parsed trace lines (each with the state it first appears at). */
  private readonly traceLines: TraceLine[];

  /** The most recently rendered state. */
  private current: number = 0;

  /** The board surface + drawable bookkeeping (all board ops go through it). */
  private readonly board: Board;

  /** The execution system that runs board steps (navigation decides which). */
  private readonly executor: StepExecutor;

  /**
   * @param module The compiled content.
   * @param panes The DOM panes to render into.
   * @param animationMax Animation duration in seconds (default 1).
   */
  public constructor(
    module: ContentModule,
    panes: ContentPanes,
    animationMax: number = 1,
  ) {
    super();
    this.module = module;
    this.panes = panes;
    this.board = new Board(panes.board);
    this.executor = new StepExecutor(
      this.board,
      module.steps,
      module.resetBoard,
      animationMax,
    );
    this.highlightPerStep = parseHighlight(module.highlight);
    this.codeLines = module.code.replace(/\n$/, '').split('\n');
    this.traceLines = parseTrace(module.trace);

    this.validate();
    this.renderStaticPanes();
  }

  /** @returns The number of states, from the config's `stepsNO`. */
  public override getNumberOfStates(): number {
    return this.module.config.stepsNO;
  }

  /** @returns The state most recently rendered. */
  public getCurrentState(): number {
    return this.current;
  }

  /**
   * Clear the board surface (unmount every drawable), leaving the panes intact.
   * Public so a host can wipe the board outside the normal step flow.
   */
  public clearBoard(): void {
    this.board.clear();
  }

  // --------------------------------------------------------- FSM mirrors ---

  /**
   * Reset to state 0: tear down the board, reset the module's object registry,
   * and apply `step(0)` instantly.
   */
  public override reset(): void {
    this.rebuildTo(0, false);
  }

  /**
   * Forward smooth transition to `n`: the navigation decided that exactly
   * `steps[n]` must run; the executor executes it (animated) on top of the
   * current board.
   *
   * @param n The state to advance to.
   */
  public override smoothNext(n: number): void {
    this.executor.runStep(n, true);
    this.renderPanes(n);
    this.current = n;
  }

  /**
   * Fast-forward to `n` without animation: rebuild from scratch and replay
   * `step(0..n)` instantly.
   *
   * @param n The target state.
   */
  public override fastForward(n: number): void {
    this.rebuildTo(n, false);
  }

  /**
   * Settle on state `n`. The GUI reaches non-adjacent states via reset +
   * fast-forward before mirroring `jumpTo`/`setState`, so by the time this runs
   * the board is already at `n`; this only needs to ensure the panes match.
   * When called out of band with a different target, it rebuilds to be safe.
   *
   * @param n The target state.
   */
  public override setState(n: number): void {
    if (this.current !== n) {
      this.rebuildTo(n, false);
    } else {
      this.renderPanes(n);
    }
  }

  // ---------------------------------------------------------- board core ---

  /**
   * Rebuild the board deterministically to state `n`: unmount everything, reset
   * the module registry, then apply `step(0..n)` (instantly).
   *
   * @param n The target state.
   * @param animate Whether the final step should animate (always false for
   *   rebuilds; kept for symmetry).
   */
  private rebuildTo(n: number, _animate: boolean): void {
    this.executor.runTo(n);
    this.renderPanes(n);
    this.current = n;
  }

  // ------------------------------------------------------------ validation ---

  /**
   * Validate the module's artifacts against `stepsNO`, reporting mismatches via
   * `console.error` as required by the content specification. (Board step count
   * is checked; per-step op contents are content-authored and not countable.)
   */
  private validate(): void {
    const expected = this.module.config.stepsNO;

    if (this.module.steps.length !== expected) {
      console.error(
        `[${this.module.id}] board steps count ${this.module.steps.length} ` +
          `!= stepsNO ${expected}.`,
      );
    }

    if (this.highlightPerStep.length !== expected) {
      console.error(
        `[${this.module.id}] highlight line count ` +
          `${this.highlightPerStep.length} != stepsNO ${expected}.`,
      );
    }

    const liCount = countListItems(this.module.description);
    if (liCount !== expected) {
      console.error(
        `[${this.module.id}] description <li> count ${liCount} ` +
          `!= stepsNO ${expected}.`,
      );
    }
  }

  // -------------------------------------------------------------- rendering ---

  /** Refresh the per-step panes (code highlight, description, trace) for `n`. */
  private renderPanes(n: number): void {
    this.renderCodeHighlight(n);
    this.renderDescription(n);
    this.renderTrace(n);
  }

  /** Render the panes that don't change per step: code text and description. */
  private renderStaticPanes(): void {
    if (this.panes.code !== null) {
      this.panes.code.replaceChildren();
      this.codeLineEls = this.codeLines.map((text, index) => {
        const lineEl = document.createElement('div');
        lineEl.className = 'code-line';
        lineEl.dataset.line = String(index + 1);
        lineEl.textContent = text === '' ? '\u00a0' : text;
        return lineEl;
      });
      this.panes.code.append(...this.codeLineEls);
      this.panes.code.dataset.language = this.module.codeLanguage;
    }

    // Parse the description's top-level <li> items into per-step inner HTML.
    // At state k the description pane shows only the inside of the k-th <li>.
    const holder = document.createElement('ol');
    holder.innerHTML = this.module.description;
    this.descriptionPerStep = Array.from(holder.children)
      .filter((el) => el.tagName.toLowerCase() === 'li')
      .map((li) => li.innerHTML);
  }

  /**
   * Show the current step's description: the inner HTML of the k-th `<li>`.
   *
   * @param n The step index.
   */
  private renderDescription(n: number): void {
    if (this.panes.description === null) {
      return;
    }
    this.panes.description.innerHTML = this.descriptionPerStep[n] ?? '';
  }

  /**
   * Highlight the code lines for step `n`. The line elements were captured once
   * in {@link renderStaticPanes}, so no DOM query happens per transition.
   *
   * @param n The step index.
   */
  private renderCodeHighlight(n: number): void {
    const highlighted = new Set(this.highlightPerStep[n] ?? []);
    this.codeLineEls.forEach((el, index) => {
      el.classList.toggle('is-highlight', highlighted.has(index + 1));
    });
  }

  /**
   * Render the trace pane for state `n`: show every trace-file line whose state
   * is in `{0, …, n}`, in file order. The text is presented verbatim (in a
   * monospace block) so column alignment in the file is preserved.
   *
   * @param n The current state.
   */
  private renderTrace(n: number): void {
    if (this.panes.trace === null) {
      return;
    }
    this.panes.trace.replaceChildren();
    for (const text of traceLinesUpTo(this.traceLines, n)) {
      const line = document.createElement('div');
      line.className = 'trace-line';
      // Preserve verbatim text (including padding); '' renders as a blank line.
      line.textContent = text === '' ? '\u00a0' : text;
      this.panes.trace.appendChild(line);
    }
  }
}
