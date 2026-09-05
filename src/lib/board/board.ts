import type { ZhbDrawable } from './ZhbDrawable';

/**
 * Board owns the board's `<svg>` surface and the set of drawables currently
 * mounted on it. It centralizes every common board operation — add, remove,
 * clear, reset, and bulk visibility / highlight / animation toggles — so that
 * neither the content renderer nor individual contents manipulate the SVG or
 * track live objects by hand.
 *
 * Keeping this bookkeeping in one place is what lets the higher layers stay
 * consistent: the live set and each drawable's mounted group never drift out of
 * sync, because all mutations go through this class.
 */
export class Board {
  /** The `<svg>` element this board manages. */
  private readonly svg: SVGSVGElement;

  /** Drawables currently mounted, in insertion order. */
  private readonly liveSet: Set<ZhbDrawable> = new Set();

  /**
   * @param svg The board `<svg>` element to manage.
   */
  public constructor(svg: SVGSVGElement) {
    this.svg = svg;
  }

  // ---------------------------------------------------------------- access ---

  /** @returns The managed `<svg>` element. */
  public getSvg(): SVGSVGElement {
    return this.svg;
  }

  /** @returns The drawables currently on the board, in insertion order. */
  public getLive(): ZhbDrawable[] {
    return [...this.liveSet];
  }

  /**
   * @param d A drawable.
   * @returns Whether `d` is currently mounted on this board.
   */
  public has(d: ZhbDrawable): boolean {
    return this.liveSet.has(d);
  }

  // ------------------------------------------------------------ add/remove ---

  /**
   * Mount one or more drawables onto the board. Already-mounted drawables are
   * re-appended (idempotent) and stay tracked once.
   *
   * @param drawables The drawables to add.
   */
  public add(...drawables: ZhbDrawable[]): void {
    for (const d of drawables) {
      d.mount(this.svg);
      this.liveSet.add(d);
    }
  }

  /**
   * Unmount one or more drawables from the board. Unknown drawables are ignored.
   *
   * @param drawables The drawables to remove.
   */
  public remove(...drawables: ZhbDrawable[]): void {
    for (const d of drawables) {
      d.unmount();
      this.liveSet.delete(d);
    }
  }

  // ---------------------------------------------------------- clear/reset ---

  /**
   * Clear the board: unmount every live drawable and drop any stray nodes,
   * leaving an empty SVG. Retains no object state.
   */
  public clear(): void {
    for (const d of this.liveSet) {
      d.unmount();
    }
    this.liveSet.clear();
    // Defensive: remove any nodes not tracked as drawables.
    while (this.svg.firstChild !== null) {
      this.svg.removeChild(this.svg.firstChild);
    }
  }

  /**
   * Reset the board to a blank initial surface. Currently equivalent to
   * {@link clear}, but named separately so callers can express intent ("start a
   * fresh run") and so future per-board reset behavior has a home.
   */
  public reset(): void {
    this.clear();
  }

  // -------------------------------------------------- bulk flag operations ---

  /**
   * Set visibility on the given drawables, or on ALL live drawables when none
   * are supplied.
   *
   * @param value The visibility to set.
   * @param drawables Specific targets; defaults to every live drawable.
   */
  public setVisible(value: boolean, ...drawables: ZhbDrawable[]): void {
    this.targets(drawables).forEach((d) => d.setVisible(value));
  }

  /**
   * Set highlight on the given drawables, or on ALL live drawables when none
   * are supplied.
   *
   * @param value The highlight state to set.
   * @param drawables Specific targets; defaults to every live drawable.
   */
  public setHighlighted(value: boolean, ...drawables: ZhbDrawable[]): void {
    this.targets(drawables).forEach((d) => d.setHighlighted(value));
  }

  /**
   * Trigger animation on the given drawables, or on ALL live drawables when
   * none are supplied. Animation is transient (see {@link ZhbDrawable}).
   *
   * @param value Whether to animate.
   * @param drawables Specific targets; defaults to every live drawable.
   */
  public setAnimated(value: boolean, ...drawables: ZhbDrawable[]): void {
    this.targets(drawables).forEach((d) => d.setAnimated(value));
  }

  /**
   * Resolve the operation targets: the explicit list if non-empty, otherwise
   * every live drawable.
   *
   * @param drawables The explicitly named targets (may be empty).
   * @returns The drawables to operate on.
   */
  private targets(drawables: ZhbDrawable[]): ZhbDrawable[] {
    return drawables.length > 0 ? drawables : [...this.liveSet];
  }
}

/* --------------------------------------------------------------------------
 * Free-function facade
 *
 * Thin wrappers over the {@link Board} methods, for callers who prefer a
 * function style (`boardClear(board)`) over method style (`board.clear()`).
 * Both operate on the same Board instance and are fully equivalent.
 * ------------------------------------------------------------------------ */

/** Clear the board (unmount all drawables). */
export function boardClear(board: Board): void {
  board.clear();
}

/** Reset the board to a blank surface. */
export function boardReset(board: Board): void {
  board.reset();
}

/**
 * Set visibility on the given drawables, or on all live drawables when none are
 * supplied.
 */
export function boardSetVisible(
  board: Board,
  value: boolean,
  ...drawables: ZhbDrawable[]
): void {
  board.setVisible(value, ...drawables);
}

/**
 * Set highlight on the given drawables, or on all live drawables when none are
 * supplied.
 */
export function boardSetHighlighted(
  board: Board,
  value: boolean,
  ...drawables: ZhbDrawable[]
): void {
  board.setHighlighted(value, ...drawables);
}

/**
 * Trigger animation on the given drawables, or on all live drawables when none
 * are supplied.
 */
export function boardSetAnimated(
  board: Board,
  value: boolean,
  ...drawables: ZhbDrawable[]
): void {
  board.setAnimated(value, ...drawables);
}
