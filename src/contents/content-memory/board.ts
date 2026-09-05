import type { Board } from '../../lib/board/board';
import type { StepFn } from '../../lib/content/contentTypes';
import { ZhbConstant } from '../../lib/board/ZhbConstant';

/**
 * Direct-access memory visualization — `arrSteps` variant.
 *
 * Instead of mounting {@link MemCell} drawables through the board's live set,
 * each step in {@link arrSteps} draws directly onto the board's `<svg>`
 * surface. Every step is self-contained and deterministic, matching the
 * executor's replay contract (see `lib/content/contentTypes.ts`):
 *
 *  - `arrSteps[0]` clears the `<svg>` and draws a rectangle for memory
 *    location 0,
 *  - `arrSteps[1]` draws a rectangle for memory location 1,
 *  - `arrSteps[2]` draws a rectangle for memory location 2.
 *
 * A full replay (`runTo`) re-runs `arrSteps[0..n]` from a cleared board, so
 * step 0 re-establishes the blank surface every time.
 */

// ---------------------------------------------------------------- geometry ---

/** Left edge of the memory column. */
const xMem = -25;
/** Top edge of the memory column. */
const yMem = -80;
/** Cell width. */
const W = 50;
/** Cell height. */
const H = 20;

/** Variable names shown next to the cells. */
const NAMES = ['a', 'b', 'c', 'd'];

// ----------------------------------------------------------------- drawing ---

/**
 * Remove every child node from the board's `<svg>`, leaving a blank surface.
 *
 * @param board The board whose `<svg>` is cleared.
 */
function clearSvg(board: Board): void {
  const svg = board.getSvg();
  while (svg.firstChild !== null) {
    svg.removeChild(svg.firstChild);
  }
}

/**
 * Draw a rectangle representing memory location `i` directly on the board's
 * `<svg>`, with the location's name label to its left.
 *
 * @param board The board to draw on.
 * @param i The memory location index (0-based, stacked vertically).
 */
function drawLocation(board: Board, i: number): void {
  const svg = board.getSvg();
  const x = xMem;
  const y = yMem + i * H;

  const rect = document.createElementNS(ZhbConstant.SVG_NS, 'rect');
  rect.setAttribute('x', String(x));
  rect.setAttribute('y', String(y));
  rect.setAttribute('width', String(W));
  rect.setAttribute('height', String(H));
  rect.setAttribute('class', 'zhb__shape');
  svg.appendChild(rect);

  const name = NAMES[i] ?? String(i);
  const label = document.createElementNS(ZhbConstant.SVG_NS, 'text');
  label.setAttribute('x', String(x - 10));
  label.setAttribute('y', String(y + H / 2));
  label.setAttribute('text-anchor', 'end');
  label.setAttribute('dominant-baseline', 'middle');
  label.setAttribute('class', 'zhb__label zhb__label--name');
  label.textContent = name;
  svg.appendChild(label);
}

// -------------------------------------------------------------------- steps ---

/**
 * The step functions of this content. Each one draws directly onto the board's
 * `<svg>`; index 0 also clears it first.
 */
export const arrSteps: StepFn[] = [];

// arrSteps[0]: clear the svg and draw a rectangle for memory location 0.
arrSteps[0] = (board): void => {
  clearSvg(board);
  drawLocation(board, 0);
};

// arrSteps[1]: draw a rectangle for memory location 1.
arrSteps[1] = (board): void => {
  drawLocation(board, 1);
};

// arrSteps[2]: draw a rectangle for memory location 2.
arrSteps[2] = (board): void => {
  drawLocation(board, 2);
};

/**
 * The ordered steps handed to the executor. Aliased to {@link arrSteps} so the
 * content module's public `steps` contract is unchanged.
 */
export const steps: StepFn[] = arrSteps;

/**
 * Reset hook: the steps hold no module-level drawable registry (they draw
 * straight onto the `<svg>`), so there is nothing to recreate. Kept for the
 * `ContentModule.resetBoard` contract; `runTo` clears the board and re-runs
 * `arrSteps[0]`, which re-clears and redraws.
 */
export function resetBoard(): void {
  // No registry to reset.
}
