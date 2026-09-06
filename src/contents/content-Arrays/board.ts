import type { Board } from '../../lib/board/board';
import type { StepFn } from '../../lib/content/contentTypes';
import { ZhbMemory } from '../../lib/board/ZhbMemory';
import { ZhbLocation } from '../../lib/board/ZhbLocation';
import { ZhbText } from '../../lib/board/ZhbText';

/**
 * Visualization of the Java fragment:
 *
 * ```java
 * int[] nums = new int[5];
 * nums[0] = 10;
 * nums[1] = 20;
 * nums[2] = 30;
 * nums[3] = 40;
 * int sum = nums[0] + nums[1];
 * ```
 *
 * The array `nums` is modelled as a 5-location {@link ZhbMemory} — an array is,
 * at heart, a block of indexed memory cells, which is exactly what `ZhbMemory`
 * already draws (index label to the left, value inside). The scalar `sum` is a
 * single {@link ZhbLocation} placed alongside it.
 */

/** This content's board coordinate space (min-x min-y width height). */
const VIEW_BOX = '-150 -150 300 300';

/** Left edge of the array's memory column. */
const X_ARR = -30;
/** Top edge of the array's memory column. */
const Y_ARR = -70;
/** Number of elements in `nums`. */
const ARR_SIZE = 5;

/** `sum`'s location, placed to the right of the array. */
const X_SUM = 70;
const Y_SUM = -10;
const W_SUM = 50;
const H_SUM = 20;

/** Module-level registry, recreated by {@link resetBoard}. */
let nums: ZhbMemory;
let sum: ZhbLocation;
let title: ZhbText;

/**
 * Recreate the drawable registry. Called by the executor before every replay
 * from state 0, so replayed steps reference freshly-created drawables.
 */
export function resetBoard(): void {
  nums = new ZhbMemory(ARR_SIZE, X_ARR, Y_ARR);
  sum = new ZhbLocation(X_SUM, Y_SUM, W_SUM, H_SUM, 'sum', '');
  title = new ZhbText(X_ARR + 25, Y_ARR - 15, 'nums[]');
}

// Create the initial registry at module load, so the first render has objects.
resetBoard();

/**
 * The step functions of this content. Each performs one variable/array
 * mutation; step 0 leaves the board empty (before execution).
 */
export const arrSteps: StepFn[] = [];

// arrSteps[0]: before execution — nothing on the board yet.
arrSteps[0] = (board: Board): void => {
  board.getSvg().setAttribute('viewBox', VIEW_BOX);
};

// arrSteps[1]: int[] nums = new int[5]; — mount the 5-cell array, all zeroed.
arrSteps[1] = (board: Board): void => {
  board.add(nums, title);
  for (let i = 0; i < ARR_SIZE; i += 1) {
    nums.assignLiteral(i, '0');
  }
};

// arrSteps[2]: nums[0] = 10;
arrSteps[2] = (): void => {
  nums.assignLiteral(0, '10');
};

// arrSteps[3]: nums[1] = 20;
arrSteps[3] = (): void => {
  nums.assignLiteral(1, '20');
};

// arrSteps[4]: nums[2] = 30;
arrSteps[4] = (): void => {
  nums.assignLiteral(2, '30');
};

// arrSteps[5]: nums[3] = 40;
arrSteps[5] = (): void => {
  nums.assignLiteral(3, '40');
};

// arrSteps[6]: int sum = nums[0] + nums[1]; — read two elements, mount sum.
arrSteps[6] = (board: Board): void => {
  board.add(sum);
  nums.getLocation(0).setHighlighted(true);
  nums.getLocation(1).setHighlighted(true);
  sum.setContent('30');
  sum.setHighlighted(true);
};

/**
 * The ordered steps handed to the executor. Aliased to {@link arrSteps} so the
 * content module's public `steps` contract is unchanged.
 */
export const steps: StepFn[] = arrSteps;
