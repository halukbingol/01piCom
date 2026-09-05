import { ZhbConstant } from '../../lib/board/ZhbConstant';
import { ZhbDrawable } from '../../lib/board/ZhbDrawable';

/**
 * MemCell is a memory cell for the direct-access memory visualization: a box
 * with the cell's current value displayed inside it. It extends
 * {@link ZhbDrawable}, so it mounts as one group and inherits the flag system
 * (`setVisible`, `setHighlighted`, `setAnimated`) — highlighting a cell
 * highlights box and value together.
 */
export class MemCell extends ZhbDrawable {
  /** The live value-text element, kept so the value can be updated. */
  private valueEl: SVGTextElement | null = null;

  /** The cell's current value; null renders as an empty cell. */
  private value: number | null = null;

  /**
   * @param x Left edge of the cell box.
   * @param y Top edge of the cell box.
   * @param w Cell width.
   * @param h Cell height.
   * @param name Optional variable name shown left of the cell.
   */
  public constructor(
    private readonly x: number,
    private readonly y: number,
    private readonly w: number,
    private readonly h: number,
    private readonly name: string = '',
  ) {
    super();
  }

  /** @returns The cell's current value, or null when empty. */
  public getValue(): number | null {
    return this.value;
  }

  /**
   * Set the cell's value and update the display.
   *
   * @param value The new value (null clears the cell).
   */
  public setValue(value: number | null): void {
    this.value = value;
    if (this.valueEl !== null) {
      this.valueEl.textContent = value === null ? '' : String(value);
    }
  }

  /**
   * Build the cell: the box, the value text centered inside, and the optional
   * name label to the left.
   *
   * @param group The group element to populate.
   */
  protected override build(group: SVGGElement): void {
    const rect = document.createElementNS(ZhbConstant.SVG_NS, 'rect');
    rect.setAttribute('x', String(this.x));
    rect.setAttribute('y', String(this.y));
    rect.setAttribute('width', String(this.w));
    rect.setAttribute('height', String(this.h));
    rect.setAttribute('class', 'zhb__shape');
    group.appendChild(rect);

    const value = document.createElementNS(ZhbConstant.SVG_NS, 'text');
    value.setAttribute('x', String(this.x + this.w / 2));
    value.setAttribute('y', String(this.y + this.h / 2));
    value.setAttribute('text-anchor', 'middle');
    value.setAttribute('dominant-baseline', 'middle');
    value.setAttribute('class', 'zhb__label');
    value.textContent = this.value === null ? '' : String(this.value);
    group.appendChild(value);
    this.valueEl = value;

    if (this.name !== '') {
      const label = document.createElementNS(ZhbConstant.SVG_NS, 'text');
      label.setAttribute('x', String(this.x - 10));
      label.setAttribute('y', String(this.y + this.h / 2));
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('dominant-baseline', 'middle');
      label.setAttribute('class', 'zhb__label zhb__label--name');
      label.textContent = this.name;
      group.appendChild(label);
    }
  }
}
