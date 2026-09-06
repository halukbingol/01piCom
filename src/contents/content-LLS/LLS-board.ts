import type { StepFn } from '../../lib/content/contentTypes';
import { ZhbNodeLLS } from '../../lib/board/ZhbNodeLLS';

/**
 * Insert-at-head on a singly linked list, direct-access model.
 *
 * Steps manipulate ZhbNodeLLS objects directly (create, link, relink). The
 * navigation decides which step(s) to run; the executor runs them. Step-0
 * builds the initial scene (just `head`), and `resetBoard()` recreates the
 * registry so replays are deterministic.
 *
 *   step-0: create head -> null
 *   step-1: create n1 -> null
 *   step-2: head -> n1
 *   step-3: create n2 -> null
 *   step-4: n2 -> n1
 *   step-5: head -> n2
 */

// ---------------------------------------------------------------- geometry ---

/** This content's board coordinate space (min-x min-y width height). */
const VIEW_BOX = '-150 -150 300 300';

/** Slot x for the head pointer and the two nodes. */
const HEAD_X = -120;
const N1_X = 10;
const N2_X = 10;
/** Row y positions: head/n1 on the lower row, n2 introduced on an upper row. */
const ROW_Y = 30;
const ROW_Y_UP = -70;

// ---------------------------------------------------------------- registry ---

interface Registry {
  head: ZhbNodeLLS;
  n1: ZhbNodeLLS;
  n2: ZhbNodeLLS;
}

let reg: Registry = makeRegistry();

/** Create the (unmounted) node objects for a fresh run. */
function makeRegistry(): Registry {
  return {
    head: new ZhbNodeLLS(HEAD_X, ROW_Y, 'head', ''),
    n1: new ZhbNodeLLS(N1_X, ROW_Y, 'n1', 'A'),
    n2: new ZhbNodeLLS(N2_X, ROW_Y_UP, 'n2', 'B'),
  };
}

/** Reset hook: recreate the registry before every replay from state 0. */
export function resetBoard(): void {
  reg = makeRegistry();
}

// -------------------------------------------------------------------- steps ---

export const steps: StepFn[] = [
  // step-0: create head; head -> null.
  (board): void => {
    board.getSvg().setAttribute('viewBox', VIEW_BOX);
    reg.head.setLink(null);
    board.add(reg.head);
  },

  // step-1: create n1; n1 -> null.
  (board): void => {
    reg.n1.setLink(null);
    board.add(reg.n1);
  },

  // step-2: head links n1.
  (): void => {
    reg.head.setLink(reg.n1);
    reg.head.setHighlighted(true);
  },

  // step-3: create n2; n2 -> null.
  (board): void => {
    reg.head.setHighlighted(false);
    reg.n2.setLink(null);
    board.add(reg.n2);
  },

  // step-4: n2 -> n1.
  (): void => {
    reg.n2.setLink(reg.n1);
    reg.n2.setHighlighted(true);
  },

  // step-5: head -> n2.
  (): void => {
    reg.n2.setHighlighted(false);
    reg.head.setLink(reg.n2);
    reg.head.setHighlighted(true);
  },
];
