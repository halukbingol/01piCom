import { ZhbConstant } from './ZhbConstant';
import { ZhbDrawable } from './ZhbDrawable';

/**
 * ZhbBox draws an SVG rectangle. Reusable, stateful, animatable primitive.
 *
 * Visibility, highlight, and animation are handled by the {@link ZhbDrawable}
 * base via CSS classes on the group; this class only builds the geometry.
 */
export class ZhbBox extends ZhbDrawable {
  public constructor(
    private readonly x: number,
    private readonly y: number,
    private readonly w: number,
    private readonly h: number,
  ) {
    super();
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
}
