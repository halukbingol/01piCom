import { ZhbDrawable } from "./ZhbDrawable";
import { ZhbLocation } from "./ZhbLocation";

export class ZhbMemory extends ZhbDrawable {
  private static readonly W_DEFAULT = 50;
  private static readonly H_DEFAULT = 20;
  private static readonly H_GAP = 4;

  private readonly arrLocation: ZhbLocation[] = [];

  public constructor(
    size: number,
    x = 0,
    y = 0,
    w: number = ZhbMemory.W_DEFAULT,
    h: number = ZhbMemory.H_DEFAULT,
  ) {
    super();
    for (let i = 0; i < size; i += 1) {
      //   const cellY = y + i * h;
      const cellY = y + i * (h + ZhbMemory.H_GAP);
      this.arrLocation[i] = new ZhbLocation(x, cellY, w, h, String(i), "");
    }
  }

  public getSize(): number {
    return this.arrLocation.length;
  }

  public getLocation(i: number): ZhbLocation {
    const loc = this.arrLocation[i];
    if (loc === undefined) {
      throw new RangeError(`ZhbMemory: index ${String(i)} out of range`);
    }
    return loc;
  }

  public setContent(i: number, content: string): void {
    this.getLocation(i).setContent(content);
  }

  protected override build(group: SVGGElement): void {
    const parent = group as unknown as SVGSVGElement;
    for (const loc of this.arrLocation) {
      loc.mount(parent);
    }
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ instructions

  public assignLiteral(i: number, value: string): void {
    this.setContent(i, value);
  }

  public assignVariable(i: number, j: number): void {
    this.setContent(i, this.getLocation(j).getContent());
  }
}
