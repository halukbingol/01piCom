/**
 * Options controlling an animated draw.
 */
export interface ZhbAnimateOptions {
  /**
   * Animation duration. When elapsed time reaches `animationMax` the object is
   * fully drawn (the stop point is reached). Interpreted in seconds. Default 1.
   */
  readonly animationMax?: number;
  /** Optional callback invoked once the animation completes. */
  readonly onDone?: () => void;
}

/** The default value of `animationMax` (see {@link ZhbAnimateOptions}). */
export const ANIMATION_MAX_DEFAULT = 1;

/** SVG namespace, needed to create SVG elements programmatically. */
const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Base class for every drawable Zhb object.
 *
 * A drawable is a *persistent, stateful* object that owns a `<g>` group in the
 * board's SVG. Its appearance is governed by three flags — visibility,
 * highlight, and animation — each backed by a CSS class on the group, so the
 * visual treatment lives in the stylesheet rather than in JavaScript:
 *
 *  - `zhb--hidden`      when not visible,
 *  - `zhb--highlighted` when highlighted,
 *  - `zhb--animated`    while animating (a hand-drawing reveal).
 *
 * Subclasses implement {@link build}, which creates the object's SVG elements
 * once. The base mounts/unmounts the group and toggles classes when flags
 * change; it never rebuilds the geometry, so flag changes are cheap.
 *
 * ## Determinism / path-independence
 *
 * Under the cumulative board model a state can be reached by different
 * navigation routes (forward stepping, or reset + fast-forward). Consistency
 * requires that a drawable's rendered appearance be a pure function of its
 * current flags — which it is, because each flag maps to exactly one CSS class.
 * Two boards holding the same objects with the same flags are visually
 * identical regardless of the order the flags were set.
 */
export abstract class ZhbDrawable {
  /** CSS class applied to the group while the object is not visible. */
  private static readonly CLASS_HIDDEN = 'zhb--hidden';
  /** CSS class applied to the group while the object is highlighted. */
  private static readonly CLASS_HIGHLIGHTED = 'zhb--highlighted';

  /** Whether the object is shown on the board. Default true. */
  private isVisible = true;
  /** Whether the object is drawn highlighted. Default false. */
  private isHighlighted = false;
  /** Whether the object is currently animating. Default false. */
  private isAnimated = false;

  /** The persistent group holding this drawable's SVG output, or null. */
  private group: SVGGElement | null = null;

  /** Cancels an in-flight animation, if any. */
  private cancelAnim: (() => void) | null = null;

  // --------------------------------------------------------------- flags ---

  /** @returns Whether the object is visible. */
  public getVisible(): boolean {
    return this.isVisible;
  }

  /** @returns Whether the object is highlighted. */
  public getHighlighted(): boolean {
    return this.isHighlighted;
  }

  /** @returns Whether the object is animated. */
  public getAnimated(): boolean {
    return this.isAnimated;
  }

  /**
   * Set visibility and reflect it on the mounted group.
   * @param value The new visibility.
   * @returns The value set.
   */
  public setVisible(value: boolean): boolean {
    this.isVisible = value;
    this.applyClasses();
    return value;
  }

  /**
   * Set highlight and reflect it on the mounted group.
   * @param value The new highlight state.
   * @returns The value set.
   */
  public setHighlighted(value: boolean): boolean {
    this.isHighlighted = value;
    this.applyClasses();
    return value;
  }

  /**
   * Set the animated flag. Turning it on triggers a hand-drawing animation on
   * the mounted group; the flag is transient — it clears once the animation
   * completes so the settled object carries no animation state (keeping the
   * board path-independent). Turning it off cancels any in-flight animation.
   * @param value The new animated state.
   * @returns The value set.
   */
  public setAnimated(value: boolean): boolean {
    this.isAnimated = value;
    if (value) {
      this.runAnimation({
        onDone: () => {
          this.isAnimated = false;
        },
      });
    } else if (this.cancelAnim !== null) {
      this.cancelAnim();
      this.cancelAnim = null;
    }
    return value;
  }

  // ------------------------------------------------------------ lifecycle ---

  /**
   * Mount the drawable into the board: build its group (once) and append it.
   * Idempotent — mounting an already-mounted drawable re-appends it.
   *
   * @param board The board SVG to mount into.
   */
  public mount(board: SVGSVGElement): void {
    if (this.group === null) {
      const g = document.createElementNS(SVG_NS, 'g') as SVGGElement;
      g.setAttribute('class', 'zhb');
      this.build(g);
      this.group = g;
      this.applyClasses();
    }
    board.appendChild(this.group);
  }

  /**
   * Remove the drawable from the board. The group is retained so the same
   * instance can be re-mounted later with its geometry intact.
   */
  public unmount(): void {
    if (this.cancelAnim !== null) {
      this.cancelAnim();
      this.cancelAnim = null;
    }
    this.group?.remove();
  }

  /**
   * @returns The mounted group element, or null while unmounted. Exposed mainly
   * for tests and advanced composition.
   */
  public getGroup(): SVGGElement | null {
    return this.group;
  }

  // -------------------------------------------------------------- drawing ---

  /**
   * Build the object's SVG elements into the given group. Called exactly once,
   * when first mounted. Implementations append their elements and must not
   * depend on the flags — flags are applied by the base via CSS classes.
   *
   * @param group The group element to populate.
   */
  protected abstract build(group: SVGGElement): void;

  /**
   * Optionally animate the object's own elements for a hand-drawing reveal.
   * Default is a no-op (CSS handles the visual via the `zhb--animated` class).
   * Subclasses whose animation needs per-frame geometry (e.g. a growing line)
   * may override this; it is invoked by {@link setAnimated}(true).
   *
   * @param _group The mounted group.
   * @param _options Animation options.
   * @returns A cancel function.
   */
  protected animateElements(
    _group: SVGGElement,
    _options: ZhbAnimateOptions,
  ): () => void {
    return (): void => {};
  }

  /**
   * Run the animation on the mounted group. Falls back to no animation when the
   * environment can't animate; the object is fully drawn either way.
   *
   * @param options Animation options.
   */
  private runAnimation(options: ZhbAnimateOptions = {}): void {
    if (this.group === null || !ZhbDrawable.canAnimate(options)) {
      // Cannot animate here (no rAF / reduced motion): the object is already
      // fully drawn. Clear the transient flag and notify completion.
      this.isAnimated = false;
      options.onDone?.();
      return;
    }
    if (this.cancelAnim !== null) {
      this.cancelAnim();
    }
    const done = options.onDone;
    this.cancelAnim = this.animateElements(this.group, {
      animationMax: options.animationMax ?? ANIMATION_MAX_DEFAULT,
      onDone: () => {
        this.cancelAnim = null;
        done?.();
      },
    });
  }

  /** Reflect the current persistent flags onto the mounted group's classes.
   * (Animation is transient and handled during the reveal, not persisted.) */
  private applyClasses(): void {
    const g = this.group;
    if (g === null) {
      return;
    }
    g.classList.toggle(ZhbDrawable.CLASS_HIDDEN, !this.isVisible);
    g.classList.toggle(ZhbDrawable.CLASS_HIGHLIGHTED, this.isHighlighted);
  }

  /**
   * @param options Animation options.
   * @returns Whether the environment supports animation.
   */
  private static canAnimate(options: ZhbAnimateOptions): boolean {
    return (
      typeof requestAnimationFrame === 'function' &&
      typeof matchMedia === 'function' &&
      (options.animationMax ?? ANIMATION_MAX_DEFAULT) > 0 &&
      !ZhbDrawable.prefersReducedMotion()
    );
  }

  /** @returns Whether the environment reports a reduced-motion preference. */
  private static prefersReducedMotion(): boolean {
    return (
      typeof matchMedia === 'function' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
}
