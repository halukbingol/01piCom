import { ZhbConstant } from './ZhbConstant';
import { ZhbDrawable } from './ZhbDrawable';
import type { ZhbLink } from './ZhbLink';
import { ZhbPoint } from './ZhbPoint';

/**
 * ZhbBox draws an SVG rectangle. Reusable, stateful, animatable primitive.
 *
 * Visibility, highlight, and animation are handled by the {@link ZhbDrawable}
 * base via CSS classes on the group; this class only builds the geometry.
 *
 * A box can own {@link ZhbLink}s (see {@link setLink}). Attached links are
 * *slaved* to the box: whenever the box's visibility, highlight, or animation
 * flag is set, the same value is applied to every attached link. This makes a
 * link created from a source box behave in lockstep with that box.
 */
export class ZhbBox extends ZhbDrawable {
  /**
   * Links attached to this box, indexed by slot. Null until the first
   * {@link setLink} call, which lazily creates the backing array. Each attached
   * link mirrors this box's visibility / highlight / animation flags.
   */
  protected arrLink: ZhbLink[] | null = null;

  public constructor(
    protected readonly x: number,
    protected readonly y: number,
    protected readonly w: number,
    protected readonly h: number,
  ) {
    super();
  }

  /**
   * Attach an already-created {@link ZhbLink} at slot `i`. The backing array is
   * created on first use, so `arrLink` starts as null.
   *
   * @param i Index in {@link arrLink}.
   * @param zhbLink An existing ZhbLink instance.
   */
  public setLink(i: number, zhbLink: ZhbLink): void {
    if (this.arrLink === null) {
      this.arrLink = [];
    }
    this.arrLink[i] = zhbLink;
    // Adopt the box's current persistent flags so the link matches from the
    // outset (animation is transient and is not replayed here).
    zhbLink.setVisible(this.getVisible());
    zhbLink.setHighlighted(this.getHighlighted());
  }

  /**
   * @param i Index in {@link arrLink}.
   * @returns The link at slot `i`, or null if none is set (or no links exist).
   */
  public getLink(i: number): ZhbLink | null {
    return this.arrLink?.[i] ?? null;
  }

  /** Run `fn` on every attached link (no-op while no links exist). */
  private forEachLink(fn: (link: ZhbLink) => void): void {
    this.arrLink?.forEach(fn);
  }

  /**
   * Set visibility on this box and mirror it onto every attached link.
   * @param value The new visibility.
   * @returns The value set.
   */
  public override setVisible(value: boolean): boolean {
    super.setVisible(value);
    this.forEachLink((link) => link.setVisible(value));
    return value;
  }

  /**
   * Set highlight on this box and mirror it onto every attached link.
   * @param value The new highlight state.
   * @returns The value set.
   */
  public override setHighlighted(value: boolean): boolean {
    super.setHighlighted(value);
    this.forEachLink((link) => link.setHighlighted(value));
    return value;
  }

  /**
   * Set the animation flag on this box and mirror it onto every attached link,
   * so a slaved link performs its hand-drawing reveal together with the box.
   * @param value The new animation state.
   * @returns The value set.
   */
  public override setAnimated(value: boolean): boolean {
    super.setAnimated(value);
    this.forEachLink((link) => link.setAnimated(value));
    return value;
  }

  /**
   * Build the rectangle into the group.
   * @param group The group element to populate.
   */
  protected override build(group: SVGGElement): void {
    const el = document.createElementNS(ZhbConstant.SVG_NS, 'rect');
    el.setAttribute('x', String(this.x));
    el.setAttribute('y', String(this.y));
    el.setAttribute('width', String(this.w));
    el.setAttribute('height', String(this.h));
    el.setAttribute('class', 'zhb__shape');
    group.appendChild(el);
  }



  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ V get point

  /** @returns The upper left corner. */
  public getPointUpperLeft(): ZhbPoint {
    const pX = this.x;
    const pY = this.y;
    return new ZhbPoint(pX, pY);
  }

  /** @returns The upper right corner. */
  public getPointUpperRight(): ZhbPoint {
    const pX = this.x + this.w;
    const pY = this.y;
    return new ZhbPoint(pX, pY);
  }

  /** @returns The middle left corner. */
  public getPointMiddleLeft(): ZhbPoint {
    const pX = this.x;
    const pY = this.y + this.h/2;
    return new ZhbPoint(pX, pY);
  }

  /** @returns The middle right corner. */
  public getPointMiddleRight(): ZhbPoint {
    const pX = this.x + this.w;
    const pY = this.y + this.h/2;
    return new ZhbPoint(pX, pY);
  }

  /** @returns The lower left corner. */
  public getPointLowerLeft(): ZhbPoint {
    const pX = this.x;
    const pY = this.y + this.h;
    return new ZhbPoint(pX, pY);
  }

  /** @returns The lower right corner. */
  public getPointLowerRight(): ZhbPoint {
    const pX = this.x + this.w;
    const pY = this.y + this.h;
    return new ZhbPoint(pX, pY);
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ A get point

}
