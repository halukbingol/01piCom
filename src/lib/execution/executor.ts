import type { Board } from '../board/board';
import type { StepFn, StepContext } from '../content/contentTypes';

/**
 * StepExecutor is the execution system of the direct-access model.
 *
 * Responsibilities are split cleanly:
 *
 *  - the **navigation** system (the FSM in `lib/navigation/`) decides WHICH
 *    step or steps must run for a transition;
 *  - this **executor** EXECUTES them against the board.
 *
 * It offers exactly two execution shapes, matching what the FSM needs:
 *
 *  - {@link runStep} — execute a single step on top of the current board
 *    (used for a forward smooth transition, which may animate);
 *  - {@link runTo} — rebuild deterministically: clear the board, reset the
 *    content's object registry, then execute `steps[0..n]` in order, instantly
 *    (used for reset, fast-forward, and jumps).
 *
 * Keeping replay inside one class guarantees every rebuild follows the same
 * procedure, which is the backbone of path-independent (consistent) boards.
 */
export class StepExecutor {
  /** The board all steps execute against. */
  private readonly board: Board;

  /** The ordered step functions. */
  private readonly steps: readonly StepFn[];

  /** Recreates the content's drawable registry before a replay. */
  private readonly resetRegistry: (() => void) | undefined;

  /** Animation duration (seconds) passed to steps that animate. */
  private readonly animationMax: number;

  /**
   * @param board The board to execute against.
   * @param steps The ordered steps.
   * @param resetRegistry Optional registry-reset hook (content's `resetBoard`).
   * @param animationMax Animation duration in seconds (default 1).
   */
  public constructor(
    board: Board,
    steps: readonly StepFn[],
    resetRegistry?: () => void,
    animationMax: number = 1,
  ) {
    this.board = board;
    this.steps = steps;
    this.resetRegistry = resetRegistry;
    this.animationMax = animationMax;
  }

  /** @returns The number of steps. */
  public getStepCount(): number {
    return this.steps.length;
  }

  /**
   * Execute a single step `n` on top of the current board.
   *
   * @param n The step index (out-of-range indices are ignored).
   * @param animate Whether the step may animate (forward smooth transitions).
   */
  public runStep(n: number, animate: boolean): void {
    const step = this.steps[n];
    if (step === undefined) {
      return;
    }
    const ctx: StepContext = { animate, animationMax: this.animationMax };
    step(this.board, ctx);
  }

  /**
   * Rebuild deterministically to state `n`: clear the board, reset the content
   * registry, then execute `steps[0..n]` in order with animation off.
   *
   * @param n The target state.
   */
  public runTo(n: number): void {
    this.board.clear();
    this.resetRegistry?.();
    for (let k = 0; k <= n; k += 1) {
      this.runStep(k, false);
    }
  }
}
