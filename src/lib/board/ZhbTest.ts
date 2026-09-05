import { ZhbBox } from './ZhbBox';

/**
 * ZhbTest holds three {@link ZhbBox} rectangles aligned along the y-axis:
 * same x and size, stacked top to bottom one cell-height apart.
 */
export class ZhbTest {
  /** Shared left edge of every box. */
  private static readonly X = 0;
  /** Top edge of the first (topmost) box. */
  private static readonly Y0 = 0;
  /** Box width. */
  private static readonly W = 50;
  /** Box height. */
  private static readonly H = 20;
  /** Number of boxes. */
  private static readonly COUNT = 3;

  /** The three boxes, top to bottom. */
  private readonly boxes: ZhbBox[] = [];

  public constructor() {
    for (let i = 0; i < ZhbTest.COUNT; i += 1) {
      const y = ZhbTest.Y0 + i * ZhbTest.H;
      this.boxes[i] = new ZhbBox(ZhbTest.X, y, ZhbTest.W, ZhbTest.H);
    }
  }

  /** @returns The boxes, top to bottom. */
  public getBoxes(): ZhbBox[] {
    return this.boxes;
  }
}
