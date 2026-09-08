import type { Board } from '../../lib/board/board';
import type { StepFn } from '../../lib/content/contentTypes';
import { ZhbMemory } from '../../lib/board/ZhbMemory';
import { ZhbDrawable } from '../../lib/board';
// import { ZhbPoint } from '../../lib/board/ZhbPoint';

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


/** This content's board coordinate space (min-x min-y width height). */
// const VIEW_BOX = '0 0 400 400';
const VIEW_BOX = '0 0 200 200';

/** symbolTable. */
// Module-level registry, recreated by {@link resetBoard}.
let symbolTable: ZhbMemory;
const ST_W = 80;
const ST_X = 5;
const ST_Y = 5;

/* memory */
// Module-level registry, recreated by {@link resetBoard}.
let memory: ZhbMemory;
const MEM_X = ST_X + ST_W + 60;
const MEM_Y = ST_Y;

// variable `a`
const memA = 0;
const stA = 0;
// variable `b`
const memB = 1;
const stB = 1;



/**
 * Recreate the drawable registry. Called by the executor before every replay
 * from state 0, so replayed steps reference freshly-created drawables.
 */
export function resetBoard(): void {
  symbolTable = new ZhbMemory(3, ST_X, ST_Y, ST_W);
  memory = new ZhbMemory(4, MEM_X, MEM_Y);
}

// Create the initial registry at module load, so the first render has objects.
resetBoard();

/**
 * The step functions of this content. Each performs one memory mutation; step 0
 * also mounts the (freshly reset) memory onto the cleared board.
 */
export const arrSteps: StepFn[] = [];

// statements
let iCount = 0;


// arrSteps[0]: declare a and b — mount the empty two-cell memory.
const i_0 = iCount++;
arrSteps[i_0] = (board: Board): void => {
  // start empty
  board.getSvg().setAttribute('viewBox', VIEW_BOX);
  board.add(symbolTable);
  board.add(memory);

  // highlight
  symbolTable.highlightOff();
  memory.highlightOff();
};

// int a;
const i_int_a = iCount++;
arrSteps[i_int_a] = (board: Board): void => {
  // value changed
  // symbolTable.assignLiteral(stA, 'a : int');
  // memory.assignLiteral(memA,'u');
  symbolTable.declareInit(board,
    stA, 'a : int',
    memory, memA, 'u'
  );

  // highlight
  ZhbDrawable.highlightAllOff();
  symbolTable.highlight(stA, true);
  memory.highlight(memA, true);
};

// a = 4;
const i_aE4 = iCount++;
arrSteps[i_aE4] = (): void => {
  // value changed
  memory.assignLiteral(memA, '4');

  // highlight
  ZhbDrawable.highlightAllOff();
  memory.highlight(memA, true);
};

// int b = 7;
const i_int_bE7 = iCount++;
arrSteps[i_int_bE7] = (board): void => {
  // value changed
  symbolTable.declareInit(board,
    stB, 'b : int',
    memory, memB, '7'
  );

  // highlight
  ZhbDrawable.highlightAllOff();
  symbolTable.highlight(stB, true);
  memory.highlight(memB, true);
};

// b = 8;
const i_bE8 = iCount++;
arrSteps[i_bE8] = (): void => {
  // value changed
  memory.assignLiteral(memB, '8');
  // highlight
  symbolTable.highlight(stB, false);
  memory.highlight(memB, false);
  //
  memory.highlight(memB, true);
};

// b = a;
const bEa = iCount++;
arrSteps[bEa] = (): void => {
  memory.assignVariable(memB, memA);
  // highlight
  memory.highlight(memA, true);
  memory.highlight(memB, true);
};

/**
 * The ordered steps handed to the executor. Aliased to {@link arrSteps} so the
 * content module's public `steps` contract is unchanged.
 */
export const steps: StepFn[] = arrSteps;
