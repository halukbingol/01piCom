/**
 * Context passed to a board step when it is executed.
 */
export interface StepContext {
  /**
   * Whether this execution is a forward smooth transition (may animate) or part
   * of an instant replay (reset / fast-forward / jump).
   */
  readonly animate: boolean;
  /** The `animationMax` duration to use when animating (seconds). */
  readonly animationMax: number;
}
