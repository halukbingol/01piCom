import type { Board } from './board';
import { ZhbDrawable } from './ZhbDrawable';
import { ZhbLink } from './ZhbLink';
import { ZhbLocation } from './ZhbLocation';
import { ZhbPoint } from './ZhbPoint';

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
      this.arrLocation[i] = new ZhbLocation(x, cellY, w, h, String(i), '');
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


  
  public static setLinkST2Memory(stLoc: ZhbLocation, memLoc: ZhbLocation): ZhbLink {
    const pS = stLoc.getPointMiddleRight();
    const pD = memLoc.getPointMiddleLeft();
    const pDm = new ZhbPoint(pD.x - 4, pD.y);
    const pC1 = new ZhbPoint(pS.x + 20, pS.y - 15);
    const pC2 = new ZhbPoint(pD.x - 20, pD.y - 15);
    return new ZhbLink(pS, pDm, pC1, pC2, true, false);
  }


  protected override build(group: SVGGElement): void {
    const parent = group as unknown as SVGSVGElement;
    for (const loc of this.arrLocation) {
      loc.mount(parent);
    }
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ V instructions


  /**
   * Model a variable declaration: write the symbol-table entry and its backing
   * memory cell, then link the two.
   *
   *  - writes `stValue` into location `stA` of this memory,
   *  - writes `memValue` into location `memA` of `mem`,
   *  - attaches a {@link ZhbLink} running from the upper-right corner of the
   *    `stA` location to the middle-left point of the `memA` location of `mem`,
   *    stored on the `stA` location via {@link ZhbBox.setLink}.
   *
   * @param board The board, so the newly created link can be mounted/tracked.
   * @param stA Index of the symbol-table location (in this memory).
   * @param stValue Value written into location `stA`.
   * @param mem The backing memory holding the value.
   * @param memA Index of the location in `mem`.
   * @param memValue Value written into location `memA` of `mem`.
   */
  public declareInit(
    board: Board,
    stA: number,
    stValue: string,
    mem: ZhbMemory,
    memA: number,
    memValue: string,
  ): void {
    const stLoc = this.getLocation(stA);
    const memLoc = mem.getLocation(memA);
    stLoc.setContent(stValue);
    memLoc.setContent(memValue);

    // Idempotent: reuse the link already attached at this slot instead of
    // creating (and mounting) a duplicate when the step is replayed on the
    // same ZhbMemory instance.
    let link = stLoc.getLink(stA);
    if (link === null) {
      link = ZhbMemory.setLinkST2Memory(stLoc, memLoc);
      // const pS = stLoc.getPointMiddleRight();
      // const pD = memLoc.getPointMiddleLeft();
      // const pC1 = new ZhbPoint(pS.x + 10, pS.y - 10);
      // const pC2 = new ZhbPoint(pD.x - 10, pD.y - 10);
      // link = new ZhbLink(pS, pD, pC1, pC2, true, false);
      stLoc.setLink(stA, link);
    }
    board.add(link); // idempotent for a given instance (Set + re-append mount)
  }

  public assignLiteral(i: number, value: string): void {
    this.setContent(i, value);
  }

  public assignVariable(i: number, j: number): void {
    this.setContent(i, this.getLocation(j).getContent());
  }
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ A instructions

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ V highlight
  public highlight(i: number, value: boolean): void {
    const loc = this.arrLocation[i];
    loc.setHighlighted(value);
  }

  public highlightOff(): void {
    this.arrLocation.forEach((element) => {
      element.setHighlighted(false);
    });
  }
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ A highlight
}
