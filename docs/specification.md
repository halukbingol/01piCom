# directAccess — System Specification

Version 1.0. This document is the authoritative specification of the entire
directAccess system: its purpose, architecture, every component and its contract,
the finite-state machine, the content model, the animation model, the page
layout, the build pipeline, and the test strategy. Companion documents:
`how_it_works.md` (narrative walkthrough) and `adding_content.md` (author
guide).

---

## 1. Overview

### 1.1 Purpose

directAccess is a framework for **step-by-step visual explanations**. A lesson
("content") is broken into numbered states; the learner walks through them with
a navigation bar, and each state simultaneously updates four synchronized panes:
an SVG drawing (`board`), highlighted source `code`, a per-step `description`,
and a running `trace`.

### 1.2 Design goals

1. **Reusability first.** A small library of standalone modules (`Zhb*`) is the
   foundation; contents are thin data on top of it.
2. **Deterministic replay.** Any state is reproducible exactly from its index,
   independent of the path taken to reach it. This is a hard invariant, enforced
   by an integration test.
3. **Separation of concerns.** Navigation logic (the FSM), rendering (the panes),
   and content data (the lessons) are independent and independently testable.
4. **Accessibility and responsiveness.** Keyboard-navigable, ARIA-annotated,
   container-scoped for multiple instances, and responsive from desktop to
   phone.
5. **Progressive enhancement.** Animation runs in real browsers and degrades to
   instant rendering where it cannot (jsdom, reduced-motion).

### 1.3 Technology

TypeScript (strict) compiled by webpack (one entry + one `HtmlWebpackPlugin` per
page), external CSS and JS, ESLint (flat config, `curly: "all"`), Prettier, and
a jsdom + Jest integration test that runs against the built bundle.

---

## 2. Architecture

### 2.1 Component map

```
                    ┌───────────────────────────┐
   user input  ──►  │   ZhbStepByStepGUI       │   SVG button bar in
  (click / key)     │   (finite-state machine)  │   #div-navigation
                    └────────────┬──────────────┘
                                 │ mirrors every transition
                                 ▼
                    ┌───────────────────────────┐
                    │   ZhbStepByStepClient     │   abstract base
                    │   (setState + hooks)       │
                    └────────────┬──────────────┘
                                 │ extended by
                                 ▼
                    ┌───────────────────────────┐
                    │   ZhbStepByStepContent    │   renders panes
                    │   code · board · desc ·    │
                    │   trace                    │
                    └────────────┬──────────────┘
                                 │ draws with
                                 ▼
            ┌────────────────────────────────────────┐
            │  Zhb library (ZhbDrawable subclasses)   │
            │  ZhbBox · ZhbCircle · ZhbText · ZhbLink │
            └────────────────────────────────────────┘

   ContentModule  =  config.txt + code + highlight + description + board steps
                     (one directory under src/contents/<id>/)
```

### 2.2 Layers

- **Library** — reusable, content-agnostic modules, grouped by concern:
  `src/lib/board/` (SVG primitives), `src/lib/navigation/` (the FSM engine and pane
  renderer), and `src/lib/content/` (content data types and parsers). Each group has
  a barrel `index.ts`. No knowledge of any specific lesson.
- **Contents (`src/contents/<id>/`)** — data: what to show at each state.
- **Page (`src/pages/`, `src/templates/`, `src/styles/`)** — the shell that
  hosts the panes and wires a content to the engine.

### 2.3 Module inventory

| Module                  | Group        | Responsibility                                     |
| ----------------------- | ------------ | -------------------------------------------------- |
| `ZhbConstant`           | `board`      | Shared constants (SVG namespace, TRACE_SEPARATOR). |
| `ZhbDrawable`           | `board`      | Animatable base: `draw()` + `animate()`.           |
| `ZhbBox`                | `board`      | Rectangle primitive (animatable, styleable).       |
| `ZhbCircle`             | `board`      | Circle primitive (animatable).                     |
| `ZhbText`               | `board`      | Centered text primitive (animatable, styleable).   |
| `ZhbLink`               | `board`      | Line/arrow connector (animatable).                 |
| `Board`                 | `board`      | Owns the board SVG + live set; clear/reset/add/…   |
| `StepExecutor`          | `execution`  | Executes the step(s) the navigation selects.       |
| `ZhbLine`               | `board`      | Straight line segment (thick option).              |
| `ZhbNode`               | `board`      | Box with centered content + id on the top edge.    |
| `NodeNull`              | `board`      | Null node marker (thick short bar).                |
| `ZhbNodeLLS`            | `board`      | List node; link to null (ground) or `setLink`.     |
| `ZhbStepByStepClient`  | `navigation` | Abstract content base driven by the GUI.           |
| `ZhbStepByStepGUI`     | `navigation` | SVG navigation + finite-state machine.             |
| `ZhbStepByStepContent` | `navigation` | Concrete client rendering the four panes.          |
| `contentTypes`          | `content`    | `StepFn`, `StepContext`, `ContentConfig`, etc.     |
| `contentConfig`         | `content`    | Parsers/validators for config, highlight, desc.    |

---

## 3. The finite-state machine

### 3.1 Definitions

- `S` = number of states, including state 0 (`stateNO`, from the content's
  `stepsNO`).
- `P` = present state, in `0 .. S-1`.
- `N` = next state.

On construction the GUI calls `reset()`, so the system starts at state 0.

### 3.2 Transition algorithm

Pressing **btnNext**:

- if `P = S-1` → `noAction()`
- else → `smoothNext()` (animate `P → P+1`)

Pressing **btnPrevious**:

- if `P = 0` → `noAction()`
- else → `jumpTo(P-1)`

Pressing **btnState_X**:

- if `X = P` → `noAction()`
- if `X = P+1` → `smoothNext()`
- otherwise → `jumpTo(X)`

Keyboard: **Right arrow** ≡ btnNext, **Left arrow** ≡ btnPrevious, **Enter/Space**
activate the focused control.

### 3.3 Method contracts

- **`reset()`** — present ← 0; mark `btnState_0` active; mirror
  `client.reset()`.
- **`noAction()`** — do nothing; mirror `client.noAction()`.
- **`smoothNext()`** — `N = P+1`; mark `btnState_N` active, `btnState_P`
  inactive; present ← N; mirror `client.smoothNext(N)`. This is the only
  transition that animates.
- **`fastForward(N)`** — reset, then run 0..N with no animation; mark
  `btnState_N` active; mirror `client.fastForward(N)`.
- **`jumpTo(N)`** — if `N = 0`, `reset()`; else `fastForward(N-1)` then
  `smoothNext()`; mirror `client.jumpTo(N)`.

### 3.4 Invariants

- Exactly one state button is active at any time; it carries both the
  `is-active` class and `aria-current="step"`.
- Every GUI transition results in exactly one settled `client.setState(n)` call
  path, so the client and GUI never disagree on the present state.

---

## 4. Client contract

`ZhbStepByStepClient` is abstract. A content subclass implements:

- **`getNumberOfStates(): number`** (required) — the total state count `S`; read
  once by the GUI at construction.
- **`setState(n)`** — called for every resulting state; the single source of
  truth a content renders from.

Default hook implementations (`reset`, `noAction`, `smoothNext`, `fastForward`,
`jumpTo`) delegate to `setState` so a subclass overrides only what it needs.
`ZhbStepByStepContent` overrides `smoothNext` to enable animation for that one
transition.

---

## 5. Content model

### 5.1 Directory layout

```
src/contents/<id>/
├── config.txt          # CSV parameters
├── <code file>         # source shown in the code pane
├── <code file>-ch.txt  # per-step highlight spec
├── <code file>-decr.html   # per-step description (<li> each)
├── board.ts            # exports steps: StepFn[]
└── index.ts            # assembles a ContentModule
```

### 5.2 `config.txt`

A CSV of `key,value` lines. `stepsNO` (the number of steps including step 0) is
always required.

**Comments.** `#` starts a comment that runs to the end of the line — a line
beginning with `#` is a full comment, and a trailing `# ...` after a value is
stripped.

**Panes and files.** For each of `code`, `board`, `description`, and `trace`, the
config must EITHER define the pane's related file(s) OR mark the pane invisible;
otherwise a `console.error` is emitted at load. `fileBoard` is required unless
`board` is invisible. (`download` and `debug` have no files.)

**Pane visibility.** The panes `code`, `description`, `board`, `download`,
`trace`, and `debug` are visible by default. A pane is hidden by adding a line
`<pane>,invisible` (e.g. `code,invisible`). Parsed into
`ContentConfig.hiddenPanes`; the page hides each named pane's group at load.
Hiding `debug` also suppresses `?debug` for that content.

### 5.3 `fileCodeHighlight`

One line per step; line `k` describes the lines to highlight in step `k`.
Format: a comma list of numbers and ranges, e.g. `1,3,5-8` → lines 1, 3, 5, 6,
7, 8. `nop` means no highlight. `#` lines are comments and are skipped (so a
leading `#nop` does not count as a step). The number of step lines must equal
`stepsNO`, else a `console.error` is emitted.

### 5.4 `fileDescription`

An HTML fragment of top-level `<li>` items, one per step (count must equal
`stepsNO`, else a `console.error` is emitted). At state k the description pane
shows **only the inner HTML of the k-th `<li>`** — that step's content, which may
include paragraphs, nested lists, `<code>`, etc. The pane content swaps per
state; it does not show all items at once.

### 5.4a `fileTrace`

Feeds the `trace` pane; a "define a file or set invisible" pane. Lines are
`state@|@text`, where `@|@` is `ZhbConstant.TRACE_SEPARATOR`. The first field is
the state number; the rest is the verbatim text (the pane is monospace with
whitespace preserved, so columns align). `#` begins a comment to end of line;
comment-only and blank lines are skipped and never displayed. At state k the
pane shows every line whose state ∈ `{0, …, k}`, in file order — cumulative
forward, shrinking backward. Parsed by `lib/content/trace.ts`
(`parseTrace` + `traceLinesUpTo`).

### 5.5 `board.ts` and the step model

Exports `steps: StepFn[]` and `resetBoard(): void`, where
`StepFn = (board: Board, ctx: StepContext) => void`.

**Direct-access model.** A step is an imperative function that manipulates
drawables directly: it mounts objects (`board.add(...)`), assigns values, and
calls `setVisible` / `setHighlighted` / `setAnimated` on references it holds.
The step performs its changes rather than declaring them.

**Execution split.** The navigation system decides WHICH step(s) to execute for
a transition; the executor (`lib/execution/executor.ts`) executes them:

- forward smooth transition to `n` → `runStep(n, animate=true)` — execute
  `steps[n]` only, on top of the current board;
- reset / fast-forward / jump to `n` → `runTo(n)` — clear the board, call
  `resetBoard()`, execute `steps[0..n]` in order, instantly.

**Determinism contract for authors.** Keep all drawables in a module-level
registry recreated by `resetBoard()`. Given the board produced by
`steps[0..n-1]`, executing `steps[n]` must always yield the same result — no
randomness, no time dependence, no state outside the registry. `stepsNO` must
equal `steps.length`.

### 5.6 `ContentModule`

The compiled form the renderer consumes: `{ id, config, code, codeLanguage,
highlight, description, steps, resetBoard? }`. `index.ts` assembles it by
importing the raw artifacts (webpack loads content `.txt/.html/.js` as source
strings) and the board steps + reset hook.

### 5.7 Validation

At load, `ZhbStepByStepContent` checks board step count, highlight line count,
and description `<li>` count all equal `stepsNO`, emitting a `console.error` for
any mismatch. Authoring errors surface immediately in the console.

### 5.8 Shipped contents

- `content-memory` — literal and variable-to-variable assignment over memory
  cells a, b, c, d.
- `content-LLS` — insert-at-head on a singly linked list, using `ZhbNodeLLS`
  nodes. Links start at the source's upper-left, rise to a rail, and drop into
  the destination's upper-left; a link to null is drawn as a ground symbol.

Select at runtime with `?content=<id>`; the first content is the default.

### 5.9 Consistency across navigation paths

**Question.** Under the direct-access model, can reaching the same state by
different navigation routes leave the board in different visual states?

**Answer.** Not when steps honor the determinism contract (§5.5) — and the
invariant is enforced by tests. The reasoning:

- The FSM has exactly one forward-delta operation, `smoothNext`, which the
  executor serves with `runStep(n)` on a board that already equals "after
  `steps[0..n-1]`". Every other route — previous, non-adjacent state buttons,
  jumps — is served by `runTo(n)`: clear, `resetBoard()`, execute `steps[0..n]`
  instantly. A rebuild is a pure function of `n`.
- A drawable's appearance is a pure function of its persistent flags (visible,
  highlighted) and its own data (e.g. a cell's value) — all of which are set by
  the replayed steps themselves.
- Animation remains transient (the flag clears on completion), so an animated
  forward step and an instant replay settle to identical boards.

The `board is consistent across navigation paths` test verifies this for every
state via forward stepping, backward walking, and zig-zag jumps against
canonical direct-jump snapshots.

---

## 6. The Zhb primitive library

### 6.1 `ZhbDrawable` (stateful, animatable base)

Every primitive extends `ZhbDrawable`, a _persistent, stateful_ object that owns
a `<g class="zhb">` group in the board's SVG. A subclass implements one method,
`build(group)`, which creates its SVG elements once. The base provides:

- **Flags** `isVisible` (default true), `isHighlighted` (default false),
  `isAnimated` (default false), each with `get*` / `set*` methods. `setVisible`
  and `setHighlighted` toggle a CSS class on the group (`zhb--hidden`,
  `zhb--highlighted`); the visual treatment lives entirely in the stylesheet.
- **Lifecycle** `mount(board)` (builds once, then appends) and `unmount()`
  (removes the group but retains it for re-mount).
- **Animation** `setAnimated(true)` runs a hand-drawing reveal via
  `animateElements` (overridable; default no-op). Animation is **transient** —
  the flag clears on completion, so the settled object carries no animation
  state. This is what keeps the board path-independent (§5.9).

Because appearance is a pure function of the persistent flags, two boards
holding the same objects with the same flags are visually identical regardless
of how they got there.

### 6.2 Primitives

- **`ZhbBox(x, y, w, h)`** — rectangle.
- **`ZhbCircle(xc, yc, r)`** — circle.
- **`ZhbText(x, y, content)`** — centered text.
- **`ZhbLink(x1, y1, x2, y2, arrow?, doubleArrow?)`** — connector; overrides
  `animateElements` to hand-draw the line via a `stroke-dashoffset` reveal, with
  arrowheads hidden (CSS `zhb--drawing`) until the line completes.

### 6.3 Styling model

Visibility and highlight are driven by CSS classes on the drawable's group
(`zhb--hidden`, `zhb--highlighted`), applied by the base when flags change.
Shapes carry `zhb__shape` and labels `zhb__label`, so the stylesheet controls
regular vs. highlighted rendering (bright color, thicker strokes) without any
JavaScript styling. (The former `ZhbStyle` helper is removed — its role is now
the flag system.)

---

## 7. GUI rendering and interaction

### 7.1 Visual design

A single SVG holds a row of circular buttons: a left red triangle
(`btnPrevious`, glyph "−"), then `S` numbered state circles (`btnState_0` …
`btnState_{S-1}`), then a right green triangle (`btnNext`, glyph "+"). The active
state circle is filled with the accent color.

### 7.2 Interaction rules

- **One delegated `click` listener and one `keydown` listener** on the container
  — never one per button.
- Controls are resolved via a **`data-nav`** attribute (`previous`, `next`,
  `state-<n>`), never by DOM position.
- Each control is focusable (`role="button"`, `tabindex="0"`) and activates on
  Enter/Space; arrows map to next/previous.
- The GUI is **container-scoped** (no global ids), so multiple instances coexist
  on one page.

### 7.3 Debug mode

When enabled (page passes `debug: true`, triggered by `?debug`), the debug pane
is revealed and the GUI appends a `<li>` per logged transition: `smooth-N` for
`smoothNext` landing on N, `jumpTo-N` for `jumpTo(N)`.

---

## 8. Page layout

Four stacked rows: `#div-title`, `#div-navigation`, a debug row (title +
`#debug`), and `#div-page`. The page row splits into a three-column top and a
full-width bottom:

- `#div-page-top-left` → `#code` (top) and `#download` (bottom)
- `#div-page-top-center` → `#board`
- `#div-page-top-right` → `#description`
- `#div-page-bottom` → `#trace`

Dynamic panes: `debug`, `code`, `download`, `board`, `description`, `trace`.

Responsive breakpoints:

- **< 1200px** — `trace` hidden; `description` moves to the bottom row.
- **< 920px** — `trace` and `download` hidden.
- **< 600px** — `code`, `board`, `description` stack in one column.

Dark theme throughout; the single accent color carries active/ highlight states.

---

## 9. Build and tooling

- **webpack** — a `pages` registry maps each page to one entry + one
  `HtmlWebpackPlugin` with `chunks: [page.name]`, so each HTML file loads only
  its own bundle. Content artifacts under `src/contents` are loaded as source
  strings via `asset/source`.
- **TypeScript** — strict, plus `noUnused*`/`noImplicitReturns`; compiled by
  `ts-loader`.
- **External CSS** — `style.css` copied verbatim into `dist/` and linked with
  `<link>`, never inlined. **External JS** — injected via `<script src>`.
- **ESLint** — flat config, recommended JS + TS rules, `curly: "all"`. Content
  artifacts are ignored (display data, not source).
- **Prettier** — formats source; content artifacts are ignored.

### 9.1 Scripts

| Script              | Effect                                          |
| ------------------- | ----------------------------------------------- |
| `npm run dev`       | webpack-dev-server at `http://localhost:8080/`. |
| `npm run build`     | Production build into `dist/`.                  |
| `npm run lint`      | ESLint.                                         |
| `npm run format`    | Prettier (write).                               |
| `npm run test:jest` | Jest only (expects an existing build).          |
| `npm test`          | Build, then Jest.                               |

---

## 10. Test strategy

The integration test (`tests/integration.test.js`) runs under Jest against the
**built** bundle, booting `dist/index.html` + the hashed bundle inside jsdom with
`runScripts: 'dangerously'` and driving the real SVG controls.

Coverage:

- Layout panes and navigation controls render; system starts at state 0.
- btnNext / btnPrevious / btnState_X transitions and no-ops.
- Arrow-key navigation; debug pane reveal + logging.
- Content system: code/description populated; per-step highlight matches the
  spec; trace accumulates; `?content=` switching; validation.
- **Consistency invariant (critical):** for every shipped content and every
  state, reaching it by forward stepping, by a direct `jumpTo`, by overshooting
  then walking backward, and by zig-zag jump orders all produce an identical
  board snapshot — proving the cumulative board is path-independent (§5.9).
- **Animation:** with a controlled `requestAnimationFrame`, a link's
  `stroke-dashoffset` shrinks to 0 over the reveal, the drawing class toggles on
  then off, and the settled animated board equals the instant-drawn board.

Animation is environment-gated: with no `requestAnimationFrame`/`matchMedia` (as
under jsdom) or reduced-motion, animation is skipped and the object is drawn
instantly, so tests are deterministic.

---

## 11. Performance notes

- **GUI active toggle** is O(1): only the previously-active and newly-active
  buttons are mutated, tracked by an `activeIndex` field, rather than scanning
  all buttons per transition.
- **Animation frames** hold their added elements by reference and remove exactly
  those next frame — no per-frame DOM query and no marker attribute on the
  finished drawing.
- **Pane highlighting** caches the code-line and description-item elements once
  at build time, so per-transition highlighting touches cached nodes with no DOM
  query.
- **Board rendering** is incremental: a forward step applies only its `StepOps`
  deltas (no full redraw), and flag changes toggle a CSS class rather than
  rebuilding geometry. Rebuilds (reset/fast-forward) replay deltas from a
  recreated registry, keeping the object set exact.

---

## 12. Extension points

- **New state** — append a `StepFn` to a content's `board.ts` and add matching
  highlight/description lines; `stepsNO` grows with it.
- **New content** — add a `src/contents/<id>/` directory and register it in the
  page's content registry.
- **New primitive** — extend `ZhbDrawable`, implement `build(group)`; visibility
  and highlight work for free via the flag/CSS system. Override `animateElements`
  for a custom hand-drawing reveal.
- **New page** — add an entry + template and register it in the webpack `pages`
  array.

See `adding_content.md` for step-by-step author instructions.
