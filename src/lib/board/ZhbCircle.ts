import { ZhbConstant } from './ZhbConstant';
import { ZhbDrawable } from './ZhbDrawable';

/**
 * ZhbCircle draws an SVG circle. Reusable, stateful, animatable primitive.
 *
 * Visibility, highlight, and animation are handled by the {@link ZhbDrawable}
 * base via CSS classes on the group; this class only builds the geometry.
 */
export class ZhbCircle extends ZhbDrawable {
  public constructor(
    private readonly xc: number,
    private readonly yc: number,
    private readonly r: number,
  ) {
    super();
  }

  /**
   * Build the circle into the group.
   * @param group The group element to populate.
   */
  protected override build(group: SVGGElement): void {
    const el = document.createElementNS(ZhbConstant.SVG_NS, 'circle');
    el.setAttribute('cx', String(this.xc));
    el.setAttribute('cy', String(this.yc));
    el.setAttribute('r', String(this.r));
    el.setAttribute('class', 'zhb__shape');
    group.appendChild(el);
  }
}
