import { ZhbBox } from './ZhbBox';
import { ZhbConstant } from './ZhbConstant';

/**
 * ZhbLocation draws a memory location: a rectangle with two strings.
 *
 *  - `content` is centered inside the rectangle.
 *  - `locationNo` is placed at the left-center, just outside the rectangle.
 *
 * Extends {@link ZhbBox}: the base draws the rectangle, this class adds the two
 * labels on top. Visibility, highlight, and animation are handled by the
 * {@link ZhbDrawable} base via CSS classes on the group. The `content` string
 * can be updated after mounting (e.g. when a value is written into the
 * location).
 */
export class ZhbLocation extends ZhbBox {
  /** Gap between the rectangle's left edge and the locationNo label. */
  private static readonly LABEL_GAP = 10;

  /** Left inset of the content text from the rectangle's left edge. */
  private static readonly CONTENT_PAD = 5;

  /** The live content text element, kept so it can be updated after build. */
  private contentEl: SVGTextElement | null = null;

  /**
   * @param x Left edge of the rectangle.
   * @param y Top edge of the rectangle.
   * @param w Rectangle width.
   * @param h Rectangle height.
   * @param locationNo Label shown at the left-center, outside the rectangle.
   * @param content Text shown centered inside the rectangle.
   */
  public constructor(
    x: number,
    y: number,
    w: number,
    h: number,
    private readonly locationNo: string,
    private content: string,
  ) {
    super(x, y, w, h);
  }

  /** @returns The location number label. */
  public getLocationNo(): string {
    return this.locationNo;
  }

  /** @returns The current content string. */
  public getContent(): string {
    return this.content;
  }


  /**
   * Update the content shown inside the rectangle. Safe to call before or after
   * mounting.
   *
   * @param content The new content.
   */
  public setContent(content: string): void {
    this.content = content;
    if (this.contentEl !== null) {
      this.contentEl.textContent = content;
    }
  }

  /**
   * Build the rectangle (via {@link ZhbBox}), the centered content, and the
   * left locationNo label.
   * @param group The group element to populate.
   */
  protected override build(group: SVGGElement): void {
    // Rectangle.
    super.build(group);

    const cy = this.y + this.h / 2;

    // locationNo: left-center, outside the rectangle.
    const label = document.createElementNS(ZhbConstant.SVG_NS, 'text');
    label.setAttribute('x', String(this.x - ZhbLocation.LABEL_GAP));
    label.setAttribute('y', String(cy));
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('dominant-baseline', 'middle');
    label.setAttribute('class', 'zhb__label zhb__label--name');
    label.textContent = this.locationNo;
    group.appendChild(label);

    // content: left-aligned inside the rectangle.
    const content = document.createElementNS(ZhbConstant.SVG_NS, 'text');
    content.setAttribute('x', String(this.x + ZhbLocation.CONTENT_PAD));
    content.setAttribute('y', String(cy));
    content.setAttribute('text-anchor', 'start');
    content.setAttribute('dominant-baseline', 'middle');
    content.setAttribute('class', 'zhb__label');
    content.textContent = this.content;
    group.appendChild(content);
    this.contentEl = content;
  }
}
