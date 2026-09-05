import { ZhbConstant } from './ZhbConstant';
import { ZhbDrawable } from './ZhbDrawable';

/**
 * NodeNull represents a `null` node: a thick, short horizontal line drawn at
 * the point where a node's content center would be. It is a `ZhbNode` with no
 * id and no content, visualized specially (a `ZhbLine`-style bar).
 *
 * In the linked-list content, a link to null is drawn as a ground symbol (see
 * {@link ZhbNodeLLS}); this standalone drawable is available for places that
 * want to place an explicit null marker as its own object.
 */
export class NodeNull extends ZhbDrawable {
  /** Half-length of the thick null bar. */
  private static readonly HALF = 12;

  /**
   * @param cx Center x of the null marker.
   * @param cy Center y of the null marker.
   */
  public constructor(
    private readonly cx: number,
    private readonly cy: number,
  ) {
    super();
  }

  /**
   * Build the thick short horizontal line.
   * @param group The group element to populate.
   */
  protected override build(group: SVGGElement): void {
    const el = document.createElementNS(ZhbConstant.SVG_NS, 'line');
    el.setAttribute('x1', String(this.cx - NodeNull.HALF));
    el.setAttribute('y1', String(this.cy));
    el.setAttribute('x2', String(this.cx + NodeNull.HALF));
    el.setAttribute('y2', String(this.cy));
    el.setAttribute('class', 'zhb__shape zhb__line--thick');
    group.appendChild(el);
  }
}
