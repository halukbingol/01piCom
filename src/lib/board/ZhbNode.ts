import { ZhbConstant } from './ZhbConstant';
import { ZhbDrawable } from './ZhbDrawable';

/**
 * ZhbNode is a generic node: a box with its `content` centered inside and its
 * `id` shown at the center of the box's top side.
 *
 * Implemented as `ZhbBox` + `ZhbText` conceptually, but composed inline into a
 * single group so the whole node shows/hides/highlights as one unit.
 */
export class ZhbNode extends ZhbDrawable {
  /** Standard node dimensions, in user units. */
  public static readonly WIDTH = 54;
  public static readonly HEIGHT = 40;

  /**
   * @param x Left edge of the node box.
   * @param y Top edge of the node box.
   * @param id Identifier shown at the top of the box (empty for a null node).
   * @param content Text shown in the center of the box.
   * @param w Box width (defaults to {@link ZhbNode.WIDTH}).
   * @param h Box height (defaults to {@link ZhbNode.HEIGHT}).
   */
  public constructor(
    protected readonly x: number,
    protected readonly y: number,
    protected readonly id: string,
    protected readonly content: string,
    protected readonly w: number = ZhbNode.WIDTH,
    protected readonly h: number = ZhbNode.HEIGHT,
  ) {
    super();
  }

  /** @returns The node's center point in board coordinates. */
  public center(): { x: number; y: number } {
    return { x: this.x + this.w / 2, y: this.y + this.h / 2 };
  }

  /** @returns The node's upper-left corner in board coordinates. */
  public upperLeft(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  /**
   * Build the box, the centered content, and the id label at the top edge.
   * @param group The group element to populate.
   */
  protected override build(group: SVGGElement): void {
    this.buildBox(group);
    this.buildContent(group);
    this.buildId(group);
  }

  /** Draw the node's box. */
  private buildBox(group: SVGGElement): void {
    const rect = document.createElementNS(ZhbConstant.SVG_NS, 'rect');
    rect.setAttribute('x', String(this.x));
    rect.setAttribute('y', String(this.y));
    rect.setAttribute('width', String(this.w));
    rect.setAttribute('height', String(this.h));
    rect.setAttribute('class', 'zhb__shape');
    group.appendChild(rect);
  }

  /** Draw the centered content text (skipped when empty). */
  private buildContent(group: SVGGElement): void {
    if (this.content === '') {
      return;
    }
    const text = document.createElementNS(ZhbConstant.SVG_NS, 'text');
    text.setAttribute('x', String(this.x + this.w / 2));
    text.setAttribute('y', String(this.y + this.h / 2));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('class', 'zhb__label');
    text.textContent = this.content;
    group.appendChild(text);
  }

  /** Draw the id label at the center of the top side (skipped when empty). */
  private buildId(group: SVGGElement): void {
    if (this.id === '') {
      return;
    }
    const text = document.createElementNS(ZhbConstant.SVG_NS, 'text');
    text.setAttribute('x', String(this.x + this.w / 2));
    text.setAttribute('y', String(this.y));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('class', 'zhb__label zhb__label--id');
    text.textContent = this.id;
    group.appendChild(text);
  }
}
