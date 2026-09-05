import { ZhbConstant } from './ZhbConstant';
import { ZhbNode } from './ZhbNode';

/**
 * ZhbNodeLLS is a node for a singly linked list: a {@link ZhbNode} plus a link
 * that, by default, points to `null` (drawn as a ground symbol). `setLink`
 * connects the link to another `ZhbNodeLLS`.
 *
 * ## Link routing (per the content rules)
 *
 * A link starts at the **upper-left corner** of the source and ends at the
 * **upper-left corner** of the destination. It goes **up** at the source and
 * comes **down** into the destination, routed along a raised horizontal rail:
 *
 * ```
 *      ┌─────── rail ───────┐
 *      │ up                 │ down
 *   (src UL)             (dst UL)
 * ```
 *
 * A link to `null` instead drops to a **ground symbol** just above the source.
 *
 * The link is rebuilt whenever the target changes, so `setLink` works after the
 * node is already on the board.
 */
export class ZhbNodeLLS extends ZhbNode {
  /** How far above the box top the routing rail sits. */
  private static readonly RAIL = 26;
  /** Half-width of the ground symbol's widest bar. */
  private static readonly GROUND = 10;

  /** The current link target, or null for a link-to-null. */
  private target: ZhbNodeLLS | null = null;

  /** The group holding the link's SVG (a child of the node group). */
  private linkGroup: SVGGElement | null = null;

  /**
   * @param x Left edge of the node box.
   * @param y Top edge of the node box.
   * @param id Node id (shown at the top of the box).
   * @param content Node content (shown centered).
   */
  public constructor(x: number, y: number, id: string, content: string) {
    super(x, y, id, content);
  }

  /**
   * Point this node's link at `target`, or at `null` when omitted. Redraws the
   * link immediately if the node is already built.
   *
   * @param target The destination node, or null.
   */
  public setLink(target: ZhbNodeLLS | null): void {
    this.target = target;
    this.refreshLink();
  }

  /** @returns The current link target, or null. */
  public getLink(): ZhbNodeLLS | null {
    return this.target;
  }

  /**
   * Build the node, then its link layer on top.
   * @param group The node's group element.
   */
  protected override build(group: SVGGElement): void {
    super.build(group);
    const linkGroup = document.createElementNS(ZhbConstant.SVG_NS, 'g');
    linkGroup.setAttribute('class', 'zhb__linklayer');
    group.appendChild(linkGroup);
    this.linkGroup = linkGroup;
    this.drawLink();
  }

  /** Clear and redraw the link layer for the current target. */
  private refreshLink(): void {
    if (this.linkGroup === null) {
      return;
    }
    while (this.linkGroup.firstChild !== null) {
      this.linkGroup.removeChild(this.linkGroup.firstChild);
    }
    this.drawLink();
  }

  /** Draw either the ground symbol (null) or a routed arrow to the target. */
  private drawLink(): void {
    const g = this.linkGroup;
    if (g === null) {
      return;
    }
    const src = this.upperLeft();
    const railY = src.y - ZhbNodeLLS.RAIL;

    if (this.target === null) {
      // Link to null: go up from the source UL, then a ground symbol.
      this.line(g, src.x, src.y, src.x, railY);
      this.ground(g, src.x, railY);
      return;
    }

    // Link to a node: src UL -> up -> across the rail -> down -> dst UL.
    const dst = this.target.upperLeft();
    this.line(g, src.x, src.y, src.x, railY); // up at source
    this.line(g, src.x, railY, dst.x, railY); // across the rail
    this.line(g, dst.x, railY, dst.x, dst.y); // down into destination
    this.arrowHead(g, dst.x, railY, dst.x, dst.y); // arrow at destination UL
  }

  /** Append a line to the link layer. */
  private line(
    g: SVGGElement,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): void {
    const el = document.createElementNS(ZhbConstant.SVG_NS, 'line');
    el.setAttribute('x1', String(x1));
    el.setAttribute('y1', String(y1));
    el.setAttribute('x2', String(x2));
    el.setAttribute('y2', String(y2));
    el.setAttribute('class', 'zhb__shape zhb__linkline');
    g.appendChild(el);
  }

  /** Draw an arrowhead at (tx,ty) pointing along (fx,fy)->(tx,ty). */
  private arrowHead(
    g: SVGGElement,
    fx: number,
    fy: number,
    tx: number,
    ty: number,
  ): void {
    const angle = Math.atan2(ty - fy, tx - fx);
    const h = 8;
    const a1 = angle - Math.PI / 6;
    const a2 = angle + Math.PI / 6;
    const p1x = tx - h * Math.cos(a1);
    const p1y = ty - h * Math.sin(a1);
    const p2x = tx - h * Math.cos(a2);
    const p2y = ty - h * Math.sin(a2);
    const head = document.createElementNS(ZhbConstant.SVG_NS, 'polyline');
    head.setAttribute('points', `${p1x},${p1y} ${tx},${ty} ${p2x},${p2y}`);
    head.setAttribute('class', 'zhb__shape zhb__linkhead');
    g.appendChild(head);
  }

  /** Draw a ground symbol (three shrinking horizontal bars) below (x,y). */
  private ground(g: SVGGElement, x: number, y: number): void {
    const widths = [
      ZhbNodeLLS.GROUND,
      ZhbNodeLLS.GROUND * 0.6,
      ZhbNodeLLS.GROUND * 0.25,
    ];
    widths.forEach((half, i) => {
      const yy = y + i * 4;
      const el = document.createElementNS(ZhbConstant.SVG_NS, 'line');
      el.setAttribute('x1', String(x - half));
      el.setAttribute('y1', String(yy));
      el.setAttribute('x2', String(x + half));
      el.setAttribute('y2', String(yy));
      el.setAttribute('class', 'zhb__shape zhb__ground');
      g.appendChild(el);
    });
  }
}
