import type { Board } from '../../lib/board/board';
import type { StepFn } from '../../lib/content/contentTypes';
import { ZhbMemory } from '../../lib/board/ZhbMemory';

/**
 * Visualization of the Java fragment:
 *
 * ```java
 * int a = 7;
 * int b = 5;
 * a = b;
 * ```
 *
 * Two variables `a` and `b` are modelled as a two-location {@link ZhbMemory}
 * (location 0 = a, location 1 = b). Each step performs exactly one memory
 * mutation, matching the executor's replay contract (see
 * `lib/content/contentTypes.ts`):
 *
 *  - `arrSteps[0]` declares a and b (empty cells), mounted on the board,
 *  - `arrSteps[1]` `int a = 7;`  → location 0 gets "7",
 *  - `arrSteps[2]` `int b = 5;`  → location 1 gets "5",
 *  - `arrSteps[3]` `a = b;`      → location 0 gets the content of location 1.
 *
 * The module keeps its drawable in a registry recreated by {@link resetBoard},
 * so a full replay (`runTo`) rebuilds identical state regardless of the route.
 */

/** Left edge of the memory column. */
const X_MEM = -25;
/** Top edge of the memory column. */
const Y_MEM = -40;
/** Location index of variable `a`. */
const A = 0;
/** Location index of variable `b`. */
const B = 1;

/** Module-level registry, recreated by {@link resetBoard}. */
let memory: ZhbMemory;

/**
 * Recreate the drawable registry. Called by the executor before every replay
 * from state 0, so replayed steps reference freshly-created drawables.
 */
export function resetBoard(): void {
  memory = new ZhbMemory(2, X_MEM, Y_MEM);
}

// Create the initial registry at module load, so the first render has objects.
resetBoard();

/**
 * The step functions of this content. Each performs one memory mutation; step 0
 * also mounts the (freshly reset) memory onto the cleared board.
 */
export const arrSteps: StepFn[] = [];

// arrSteps[0]: declare a and b — mount the empty two-cell memory.
arrSteps[0] = (board: Board): void => {
  board.add(memory);
};

// arrSteps[1]: int a = 7;
arrSteps[1] = (): void => {
  memory.assignLiteral(A, '7');
};

// arrSteps[2]: int b = 5;
arrSteps[2] = (): void => {
  memory.assignLiteral(B, '5');
};

// arrSteps[3]: a = b;
arrSteps[3] = (): void => {
  memory.assignVariable(A, B);
};

/**
 * The ordered steps handed to the executor. Aliased to {@link arrSteps} so the
 * content module's public `steps` contract is unchanged.
 */
export const steps: StepFn[] = arrSteps;
