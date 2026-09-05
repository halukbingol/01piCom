# How it works

This document explains the architecture, the finite-state machine, the reusable
`Zhb` library, the build, and the replay test.

## Architecture

Navigation is composed of two cooperating classes plus content:

- **`ZintStepByStepGUI`** (in `src/lib/navigation/`) renders itself as a single SVG of
  circular buttons inside `#div-navigation` and runs the finite-state machine.
  It reads the number of states once at construction from the client and drives
  the client on every transition.

- **`ZintStepByStepClient`** (in `src/lib/navigation/`) is the abstract base class that all
  content extends. The GUI mirrors every state change onto it via `setState(n)`
  plus the transition hooks (`reset`, `noAction`, `smoothNext`, `fastForward`,
  `jumpTo`).

- **`ZintStepByStepContent`** (in `src/lib/navigation/`) is a reusable content renderer that
  extends `ZintStepByStepClient`. Given a compiled `ContentModule`, it renders
  the `code`, `board`, `description`, and `trace` panes and steps the board
  through states. It validates the module against `stepsNO` at load
  (`console.error` on mismatch).

- **A content** lives under `src/contents/<id>/` and is compiled into a
  `ContentModule` (config + code + highlight + description + board steps). See
  `docs/adding_content.md`. Two ship in the box: `content-LLS-2To0` (singly
  linked list) and `content-LLD-2To0` (doubly linked list).

- **`Steps` / board files** define the `steps` array — one render function per
  state — using the reusable `Zhb` primitives.

```
btnNext / btnPrevious / btnState_X   (SVG buttons)
        │  delegated click + keydown, resolved by data-nav
        ▼
ZintStepByStepGUI  ── FSM ──►  updates active button (class + aria-current)
        │
        ▼  mirrors every transition
ZintStepByStepClient (ContentBoard)
        │
        ▼  setState(n): clear board, replay steps[0..n]
   #board SVG
```

## The finite-state machine

States are numbered `0 .. S-1` where `S = stateNO`. `P` is the present state.
On construction the system calls `reset()`, starting at state 0.

- **btnNext**: if `P` is the last state, `noAction()`; otherwise `smoothNext()`
  (animate `P → P+1`).
- **btnPrevious**: if `P = 0`, `noAction()`; otherwise `jumpTo(P-1)`.
- **btnState_X**: if `X = P`, `noAction()`; if `X = P+1`, `smoothNext()`;
  otherwise `jumpTo(X)`.

`jumpTo(N)` is defined recursively in terms of the simpler moves: if `N = 0` it
resets; otherwise it `fastForward(N-1)` (reset then fast-run 0..N-1 with no
animation) followed by `smoothNext()` to land on `N`. Every one of these calls
is mirrored onto the client, so content stays in lock-step with the GUI.

The active state button carries both the `is-active` class and
`aria-current="step"`; only one is active at a time.

## Interactions & accessibility

- **One delegated listener each** for click and keydown on the container — never
  one listener per button.
- Controls are resolved via a **`data-nav`** attribute (`previous`, `next`,
  `state-<n>`), never by DOM position.
- Each control is focusable (`tabindex="0"`, `role="button"`) and activates on
  **Enter/Space**. **Right/Left arrows** map to next/previous.
- The GUI is **container-scoped** — no global ids — so multiple instances can
  coexist on one page.

## Debug mode

Add `?debug` to the URL. The debug pane is revealed and the GUI appends a
`<li>` per logged transition: `smooth-N` when `smoothNext` lands on `N`, and
`jumpTo-N` when `jumpTo(N)` is called.

## The reusable library

The library is grouped into three self-contained folders under `src/`, each with
its own barrel `index.ts`:

**`src/lib/board/`** — SVG primitives:

- `ZhbConstant` — shared constants (the SVG namespace).
- `ZhbDrawable` — the stateful, animatable base every primitive extends. It owns
  a `<g class="zhb">` group, holds `isVisible`/`isHighlighted`/`isAnimated` flags
  with get/set methods, mounts/unmounts, and reflects visibility and highlight as
  CSS classes on the group.
- `ZhbCircle`, `ZhbBox`, `ZhbText`, `ZhbLink` — SVG primitives. Each implements
  `build(group)` once; visibility/highlight come from the base's flag system.
  `ZhbLink` draws a line with an arrowhead at one or both ends (both ends =
  doubly linked) and overrides `animateElements` for a hand-drawing reveal.
- `ZhbLine`, `ZhbNode`, `NodeNull`, `ZhbNodeLLS` — higher-level drawables.
  `ZhbNode` is a box with centered content and an id on its top edge; `NodeNull`
  is a thick short bar for a null node; `ZhbNodeLLS` is a list node whose link
  points to null (a ground symbol) by default and to another node via
  `setLink(target)`, routed from the source's upper-left up and over to the
  destination's upper-left.
- `Board` — owns the board `<svg>` and the set of mounted drawables, exposing the
  common operations (`add`, `remove`, `clear`, `reset`, and bulk `setVisible` /
  `setHighlighted` / `setAnimated`). Every board mutation from the renderer goes
  through it, so the live set and the DOM stay in sync. Free-function wrappers
  (`boardClear`, `boardReset`, `boardSetVisible`, …) are exported too.

**`src/lib/navigation/`** — the engine:

- `ZintStepByStepClient`, `ZintStepByStepGUI` — the navigation engine.
- `ZintStepByStepContent` — the pane renderer driven by a `ContentModule`.

**`src/lib/content/`** — content data:

- `contentTypes`, `contentConfig` — the content data types plus parsers and
  validators for `config.txt` (including pane visibility), the highlight spec,
  and the description.
- `trace` — parses a content's `trace` file (`state@|@text` lines, `#` comments)
  and selects the lines visible at state k (states 0..k, cumulative).

Content reuses these primitives instead of hand-writing SVG, and any new content
type reuses the same GUI/client engine.

## The direct-access model

Board steps are imperative functions `(board, ctx) => void` that manipulate
drawables directly — mounting cells, assigning values, calling `setVisible` /
`setHighlighted` / `setAnimated` on objects they hold references to. A step
performs its changes; it does not declare them.

Two systems cooperate:

- the **navigation** FSM decides WHICH step(s) a transition needs;
- the **executor** (`lib/execution/executor.ts`, `StepExecutor`) EXECUTES them:
  `runStep(n, animate)` executes a single step on top of the current board
  (forward smooth transitions), and `runTo(n)` rebuilds deterministically —
  clear the board, call the content's `resetBoard()`, execute `steps[0..n]`
  instantly (reset, fast-forward, jumps).

### Consistency across paths

A state can be reached by one forward execution or by a full replay, so steps
must be deterministic and self-contained: keep all drawables in a module
registry recreated by `resetBoard()`, and given the board after `steps[0..n-1]`,
executing `steps[n]` must always produce the same result. With that contract,
every navigation route lands on the identical board — verified by the
`board is consistent across navigation paths` test (forward, backward, and
zig-zag routes against canonical jump snapshots).

## Animation

Animation is a transient hand-drawing reveal, triggered by putting objects in a
step's `animateOn` array on a forward smooth transition. `ZhbLink` overrides
`animateElements` to grow its line via a `stroke-dashoffset` reveal over
`animationMax` seconds (default `1`); its arrowheads stay hidden (CSS
`zhb--drawing`) until the line completes. When the reveal finishes, the
`animated` flag clears, so the settled object is indistinguishable from one drawn
instantly — which is what keeps the board consistent regardless of path.

Resets, fast-forwards, and jumps pass `animate: false`, so they render instantly
— matching the FSM spec where `fastForward` is explicitly "without animation".

Animation runs only in a real browser. When `requestAnimationFrame` or
`matchMedia` is unavailable (as under jsdom), or the user prefers reduced
motion, the object is drawn instantly.

## The page layout

A responsive four-row layout: `#div-title`, `#div-navigation`, a debug row, and
`#div-page`. The page row splits into a three-column top (`#div-page-top-left`
holding `#code` + `#download`, `#div-page-top-center` holding `#board`,
`#div-page-top-right` holding `#description`) and a full-width bottom
(`#div-page-bottom` holding `#trace`). Breakpoints:

- **< 1200px** — `trace` hidden; `description` moves to the bottom row.
- **< 920px** — `trace` and `download` hidden.
- **< 600px** — `code`, `board`, `description` stack in one column.

## The build

- **TypeScript, strict** via `ts-loader` (`tsconfig.json`).
- **webpack**, one entry + one `HtmlWebpackPlugin` per page; `chunks:
[page.name]` means each HTML file loads only its own bundle.
- **External CSS** copied verbatim into `dist/` by `copy-webpack-plugin` and
  linked with `<link>`; **external JS** injected via `<script src>`.
- **ESLint** flat config with `curly: "all"`; **Prettier** for formatting.

## The consistency test

`tests/integration.test.js` runs under Jest against the **built** bundle: it
boots `dist/index.html` + the hashed bundle inside jsdom with `runScripts:
'dangerously'`, then drives the real SVG buttons.

### Path-independence

The critical test, `board is consistent across navigation paths`, runs for every
shipped content. It first captures a canonical board snapshot for each state by a
fresh direct jump, then checks that three other routes reproduce each canonical
snapshot exactly: (A) forward stepping from 0, (B) overshooting to the last state
then walking backward with btnPrevious, and (C) a zig-zag of jumps. Because these
routes exercise both forward deltas and full rebuilds, matching snapshots prove
the cumulative board is path-independent — the same state always looks the same,
however it was reached.
