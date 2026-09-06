# directAccess

A step-by-step memory visualizer built on the direct-access model: board steps
are imperative functions that manipulate drawables directly (assign values,
toggle highlight/visibility). The **navigation** FSM decides which step or steps
a transition needs; the **executor** executes them against the board.

## Quick start

```bash
npm install       # required first — installs webpack-cli and everything else
npm run dev       # dev server at http://localhost:8080/
npm run build     # production build into dist/
npm run lint      # ESLint (flat config, curly: "all")
npm run format    # Prettier (write)
npm test          # build, then run the jsdom integration test
```

Add `?debug` to the URL (e.g. `http://localhost:8080/?debug`) to reveal the
debug pane and log transitions.

## Choosing a content

A lesson is a **content**, selected at runtime with the `?content=` query
parameter:

```txt
http://localhost:8080/?content=content-MyContent
```

Replace `content-MyContent` with a content id. The ids that ship include
`content-memory` (the default), `content-LLS`, and `content-Arrays`:

```txt
http://localhost:8080/?content=content-memory
http://localhost:8080/?content=content-LLS
http://localhost:8080/?content=content-Arrays
```

Opening the base URL with no `?content=` (or an unknown id) loads the first
registered content. Combine with debug via `?content=content-LLS&debug`. See
`docs/How to use it.md` for the full end-user guide.

## What's inside

- **FSM navigation** — `ZintStepByStepGUI` renders the SVG buttons and runs the
  next-state algorithm (btnNext / btnPrevious / btnState_X → noAction /
  smoothNext / fastForward / jumpTo).
- **Content engine** — `ZintStepByStepClient` is the base every content extends;
  `ZintStepByStepContent` renders a compiled content across the code / board /
  description / trace panes and validates it against `stepsNO`.
- **Directory-based contents** — each lives under `src/contents/<id>/` with a
  `config.txt`, code, highlight, description, and board steps. A content can hide
  any pane via `config.txt` (e.g. `code,invisible`). Three ship in the box:
  `content-LLS-2To0`, `content-LLD-2To0`, and
  `content-highlightVisibleAnimate` (node visibility + highlight demo).
- **Reusable library** — grouped into `src/lib/board/` (stateful SVG primitives:
  `ZhbConstant`, `ZhbDrawable`, `ZhbCircle`, `ZhbBox`, `ZhbText`, `ZhbLink`),
  `src/lib/navigation/` (the FSM engine and pane renderer), and
  `src/lib/content/` (data types and parsers), each with a barrel `index.ts`.
  Drawables carry visibility/highlight/animation flags; links hand-draw over
  `animationMax` seconds (default 1) on forward smooth steps.
- **Responsive 4-row layout** — title / navigation / debug / page, with the page
  splitting into code+download / board / description and a full-width trace,
  collapsing at 1200 / 920 / 600px.
- **Accessible** — one delegated click + keydown listener, controls resolved by
  `data-nav`, active control marked with a class and `aria-current="step"`,
  keyboard support (Enter/Space, Left/Right arrows), container-scoped so multiple
  instances coexist.

## Layout

```
directAccess/
├── src/
│   ├── lib/                   # reusable library, grouped by concern
│   │   ├── board/             # SVG primitives (reusable)
│   │   │   ├── ZhbConstant.ts  ZhbDrawable.ts   # animatable base
│   │   │   ├── ZhbCircle.ts  ZhbBox.ts  ZhbText.ts  ZhbLink.ts
│   │   │   └── index.ts       # barrel export
│   │   ├── navigation/        # FSM engine + pane renderer
│   │   │   ├── ZintStepByStepClient.ts
│   │   │   ├── ZintStepByStepGUI.ts
│   │   │   ├── ZintStepByStepContent.ts
│   │   │   └── index.ts       # barrel export
│   │   ├── execution/         # StepExecutor: runs the steps
│   │   └── content/           # content data types + parsers
│   │       ├── contentTypes.ts  contentConfig.ts
│   │       └── index.ts       # barrel export
│   ├── contents/              # one folder per content
│   │   ├── content-memory/    # direct-access memory visualization
│   │   └── content-LLS/       # singly linked list: insert at head
│   ├── pages/index.ts         # page entry: registry + wiring
│   ├── templates/index.html   # 4-row responsive layout
│   └── styles/style.css       # external CSS, dark theme, responsive
├── tests/integration.test.js
├── docs/specification.md  docs/how_it_works.md  docs/adding_content.md
├── webpack.config.js  tsconfig.json  eslint.config.js  .prettierrc.json
└── .gitignore
```

The project ships two contents: `content-memory` (the default) showing literal
and variable-to-variable assignment over cells a, b, c, d, and `content-LLS`
visualizing insert-at-head on a singly linked list. Select with `?content=<id>`.

See `docs/specification.md` for the full system spec, `docs/how_it_works.md` for
the architecture narrative, and `docs/adding_content.md` to
add states, content classes, or pages.
