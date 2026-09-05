/**
 * ZintStepByStepClient is the base class that all content extends.
 *
 * The GUI ({@link ZintStepByStepGUI}) drives a client: every state change the
 * GUI performs is mirrored by a call into the client. A concrete content class
 * (`Content_X`) subclasses this and overrides the hooks it cares about — at
 * minimum {@link setState}, which is called for every resulting state.
 *
 * The default implementations are deliberately side-effect free so a subclass
 * can override only what it needs.
 */
export abstract class ZintStepByStepClient {
  /**
   * The number of states this content defines, including state 0. The GUI reads
   * this once at construction to lay out its state buttons.
   *
   * @returns The total state count (>= 1).
   */
  public abstract getNumberOfStates(): number;

  /**
   * Called whenever the resulting present state becomes `n`, regardless of how
   * the transition happened (reset, smoothNext, fastForward, jumpTo). This is
   * the single source of truth a content class should render from.
   *
   * @param n The new present state index.
   */
  public setState(_n: number): void {
    // Default: no-op. Content overrides to render state `n`.
  }

  /** Mirror of GUI reset: return to state 0. */
  public reset(): void {
    this.setState(0);
  }

  /** Mirror of GUI noAction: do nothing. */
  public noAction(): void {
    // Intentionally empty.
  }

  /**
   * Mirror of GUI smoothNext: animate P -> N=P+1 and settle on `n`.
   *
   * @param n The state being animated to.
   */
  public smoothNext(n: number): void {
    this.setState(n);
  }

  /**
   * Mirror of GUI fastForward: jump through states 0..n without animation.
   *
   * @param n The target state.
   */
  public fastForward(n: number): void {
    this.setState(n);
  }

  /**
   * Mirror of GUI jumpTo: settle directly on `n`.
   *
   * @param n The target state.
   */
  public jumpTo(n: number): void {
    this.setState(n);
  }
}
