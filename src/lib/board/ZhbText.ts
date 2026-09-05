import { ZhbConstant } from './ZhbConstant';
import { ZhbDrawable } from './ZhbDrawable';

/**
 * ZhbText draws centered SVG text. Reusable, stateful, animatable primitive.
 *
 * Visibility, highlight, and animation are handled by the {@link ZhbDrawable}
 * base via CSS classes on the group; this class only builds the geometry.
 */
export class ZhbText extends ZhbDrawable {
  /** The live text element, kept so the content can be updated after build. */
  private textEl: SVGTextElement | null = null;

  public constructor(
    private readonly x: number,
    private readonly y: number,
    private content: string,
  ) {
    super();
  }

  /** @returns The current text content. */
  public getContent(): string {
    return this.content;
  }

  /**
   * Update the displayed text. Safe to call before or after mounting.
   *
   * @param content The new text.
   */
  public setContent(content: string): void {
    this.content = content;
    if (this.textEl !== null) {
      this.textEl.textContent = content;
    }
  }

  /**
   * Build the text element into the group.
   * @param group The group element to populate.
   */
  protected override build(group: SVGGElement): void {
    const el = document.createElementNS(ZhbConstant.SVG_NS, 'text');
    el.setAttribute('x', String(this.x));
    el.setAttribute('y', String(this.y));
    el.setAttribute('text-anchor', 'middle');
    el.setAttribute('dominant-baseline', 'middle');
    el.setAttribute('class', 'zhb__label');
    el.textContent = this.content;
    group.appendChild(el);
    this.textEl = el;
  }
}
