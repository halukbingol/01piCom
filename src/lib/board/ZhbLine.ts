import { ZhbConstant } from './ZhbConstant';
import { ZhbDrawable } from './ZhbDrawable';

/**
 * ZhbLine draws a straight SVG line segment. Reusable, stateful primitive.
 *
 * Used on its own (e.g. the short thick bar of a null node) and as a building
 * block for composite drawables. Visibility and highlight come from the
 * {@link ZhbDrawable} base via CSS classes.
 */
export class ZhbLine extends ZhbDrawable {
  /**
   * @param x1 Start x.
   * @param y1 Start y.
   * @param x2 End x.
   * @param y2 End y.
   * @param thick Whether to draw a thicker stroke (default false).
   */
  public constructor(
    private readonly x1: number,
    private readonly y1: number,
    private readonly x2: number,
    private readonly y2: number,
    private readonly thick: boolean = false,
  ) {
    super();
  }

  /**
   * Build the line into the group.
   * @param group The group element to populate.
   */
  protected override build(group: SVGGElement): void {
    const el = document.createElementNS(ZhbConstant.SVG_NS, 'line');
    el.setAttribute('x1', String(this.x1));
    el.setAttribute('y1', String(this.y1));
    el.setAttribute('x2', String(this.x2));
    el.setAttribute('y2', String(this.y2));
    el.setAttribute(
      'class',
      this.thick ? 'zhb__shape zhb__line--thick' : 'zhb__shape',
    );
    group.appendChild(el);
  }
}
