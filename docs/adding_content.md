# Adding new content

A **content** is a self-contained lesson living under `src/contents/<id>/`. It
supplies the code to display, the per-step highlighting, the per-step
description, and the board drawing. The navigation engine and the four panes
(`code`, `board`, `description`, `trace`) are shared infrastructure.

## Directory layout of a content

```
src/contents/content-LLS-2To0/
├── config.txt                 # CSV of parameters
├── LinkedList.js              # fileCode: source shown in the code pane
├── LinkedList.js-ch.txt       # fileCodeHighlight: highlighted lines per step
├── LinkedList.js-decr.html    # fileDescription: one <li> per step
├── LinkedList.js-trace.txt    # fileTrace: state@|@text lines
├── board.ts                   # fileBoard: exports steps: StepFn[]
└── index.ts                   # assembles a ContentModule from the above
```

### `config.txt`

A CSV (key,value per line). `stepsNO` is the number of steps including step 0.

**Comments.** `#` begins a comment that runs to the end of the line: a line
starting with `#` is a full comment line, and a `# ...` after a value is
stripped.

**Title.** An optional `title,<text>` line sets both the HTML page title
(`document.title`) and the `#div-title` header text when this content is loaded.
Without it, the markup's build-time defaults are kept.

**Panes.** For each of `code`, `board`, `description`, and `trace`, the config
must EITHER define the pane's related file(s) OR mark the pane `invisible`. The
`download` pane's file (`fileDownload`) is optional — see below. The `debug` pane
has no file. All panes are visible unless marked `invisible`.

Example:

```txt
# config.txt

# html page title
title,My Content

# required
stepsNO,3

# download pane
download,invisible

# code pane
#code,invisible
fileCode,MyContent.js
fileCodeHighlight,MyContent.js-ch.txt

# description pane
#description,invisible
fileDescription,MyContent.js-decr.html

# board pane
#board,invisible
fileBoard,LinkedList-brd.ts

# trace pane
#trace,invisible
fileTrace,MyContent.js-trace.txt
```

#### Pane visibility

The panes `code`, `description`, `board`, `download`, `trace`, and `debug` are
visible by default. To hide one for this content, add a line naming the pane with
the value `invisible` (e.g. `code,invisible`). A hidden pane needn't define its
files. Any pane not listed stays visible.

#### What is `?debug`?

`?debug` is a URL query flag (e.g.
`http://localhost:8080/?content=content-LLS&debug`). When present, it reveals the
**debug pane** — a panel that logs each navigation action the FSM performs
(`smooth-N`, `jumpTo-N`, resets). It's a developer aid for watching _which_ steps
the navigation decides to run; end users normally don't need it. Because the
debug pane is what `?debug` reveals, hiding `debug` in `config.txt`
(`debug,invisible`) also suppresses `?debug` for that content — there's no pane to
show.

### `fileCode`

The source displayed in the `code` pane. Its extension names the language.
Omit it (and `fileCodeHighlight`) only when `code` is `invisible`.

### `fileCodeHighlight`

One line per step. Each line lists the lines to highlight for that step:
`1,3,5-8` highlights 1, 3, 5, 6, 7, 8; `nop` highlights nothing. Lines starting
with `#` are comments and are skipped. The number of step lines must equal
`stepsNO`, otherwise a `console.error` is emitted at load.

### `fileDescription`

An HTML fragment of top-level `<li>` items, one per step (count must equal
`stepsNO`). At state k, the description pane shows **only the inside of the k-th
`<li>`** — its inner HTML, which may contain paragraphs, nested lists, `<code>`,
etc. For example, a `<li>` for a step can hold a `<p>` plus an `<ol>` of
sub-points, and all of it appears at that state.

### `fileTrace`

Feeds the `trace` pane. Like `code`, `board`, and `description`, `trace` is a
"define a file or set invisible" pane: either give `fileTrace,<name>` or add
`trace,invisible`.

Each non-comment line has the form `state@|@text`, where `@|@` is the separator
(`ZhbConstant.TRACE_SEPARATOR`). The first field is the state number; everything
after the separator is the text shown for that line, preserved verbatim so
column padding lines up (the pane is monospace with whitespace preserved). `#`
starts a comment to end of line; comment-only and blank lines are skipped and
never shown.

At state k the pane shows every line whose state is in `{0, …, k}`, in file
order — so the trace grows as you step forward and shrinks as you step back. A
line may repeat a state (e.g. two header lines both at state 0), and multiple
lines may share a state.

Example (`MyContent-trace.txt`):

```txt
# state@|@text
0@|@code           L5 L7 a  b
0@|@               u  u  u  u
1@|@init literals  5  7  u  u
2@|@a=5;           5  7  5  u
3@|@b=7;           5  7  5  7
4@|@a=b;           5  7  7  7
```

At state 0 only the two state-0 lines show; at state 4 all six show.

### `fileDownload`

Feeds the `download` pane. Optional: give `fileDownload,<name>` to offer files
for download, or omit it (the pane then shows nothing; add `download,invisible`
to hide the pane entirely).

The named file is a **manifest**: each line is a path to a file to offer,
**relative to this content's `assets/` directory**. A line whose first column is
`#` is a comment; blank lines are skipped. Every other line is trimmed and used
verbatim.

Put the files under `src/contents/<id>/assets/` (subdirectories allowed). The
build copies that tree to `dist/contents/<id>/assets/…` — this is why a content's
**`id` (in `index.ts`) must equal its directory name**. Each manifest line
becomes a link in the pane, labelled with the file's basename (full relative path
on hover); clicking it downloads the file.

Example (`MyContent-download.txt`):

```txt
# files offered in the download pane (paths relative to assets/)
MyContent.java
handout/notes.pdf
```

with:

```
src/contents/my-content/assets/MyContent.java
src/contents/my-content/assets/handout/notes.pdf
```

In `index.ts`, parse it into `downloads`:

```ts
import downloadText from './MyContent-download.txt';
import { parseDownloadManifest } from '../../lib/content/contentConfig';
// ...
export const content: ContentModule = {
  // ...
  downloads: parseDownloadManifest(downloadText),
};
```

### `board.ts`

Exports `steps: StepFn[]` (one entry per state, `steps.length === stepsNO`) and
`resetBoard(): void`, where `StepFn = (board, ctx) => void`.

**Direct-access model.** A step manipulates drawables directly — it mounts them,
assigns values, toggles their flags. Keep every drawable in a module-level
registry recreated by `resetBoard()`, so replays reference identical objects:

```ts
import type { Board } from '../../lib/board/board';
import type { StepFn } from '../../lib/content/contentTypes';
import { MemCell } from './MemCell';

let memory: MemCell[] = [];

function init(board: Board): void {
  memory = [new MemCell(-25, -40, 50, 20, 'a')];
  board.add(...memory);
}

export function resetBoard(): void {
  memory = [];
}

export const steps: StepFn[] = [
  (board): void => {
    init(board); // step-0 builds the scene
  },
  (): void => {
    memory[0]?.setValue(42); // direct manipulation
    memory[0]?.setHighlighted(true);
  },
];
```

The navigation decides which steps run: a forward smooth step executes only
`steps[n]`; every other route triggers a full replay (`resetBoard()` + execute
`steps[0..n]` instantly). Steps must therefore be deterministic: given the board
after `steps[0..n-1]`, executing `steps[n]` always yields the same result — no
randomness, no time, no state outside the registry. Step-0 should build the
initial scene (like `init` above).

`ctx.animate` is true only on a forward smooth step; call `setAnimated(true)`
inside a step (guarded by `ctx.animate`) to hand-draw an object then.

### `index.ts`

Assembles a `ContentModule` by importing the raw artifacts (webpack loads
`.txt`/`.html`/`.js` under `src/contents` as strings), the board `steps`, and the
`resetBoard` hook:

```ts
import {
  parseConfig,
  languageFromFilename,
} from '../../lib/content/contentConfig';
import type { ContentModule } from '../../lib/content/contentTypes';
import { steps, resetBoard } from './board';
import configText from './config.txt';
import codeText from './LinkedList.js';
import highlightText from './LinkedList.js-ch.txt';
import descriptionText from './LinkedList.js-decr.html';
import traceText from './LinkedList.js-trace.txt';

const config = parseConfig(configText);

export const content: ContentModule = {
  id: 'content-LLS-2To0',
  config,
  code: codeText,
  codeLanguage: languageFromFilename(config.fileCode ?? ''),
  highlight: highlightText,
  description: descriptionText,
  trace: traceText,
  steps,
  resetBoard,
};
```

**`id` must equal the content's directory name.** The download pane resolves
asset URLs as `contents/<id>/assets/…`, and the build copies `assets/` by
directory name, so a mismatch silently 404s every download link. The build
enforces this (`assertContentIdsMatchDirs` in `webpack.config.js`) and fails with
a clear message; `src/pages/index.ts` also `console.error`s if a registry key
differs from its module's `id`.

## Register and select a content

Add the content to the registry in `src/pages/index.ts`:

```ts
import { content as contentLLS } from '../contents/content-LLS-2To0';

const CONTENTS = {
  'content-LLS-2To0': contentLLS,
  // ...add yours here
};
```

Select at runtime with the `?content=<id>` query parameter, e.g.
`http://localhost:8080/?content=content-LLD-2To0`. Without it, the first content
is used.

**The registry key must equal the module's `id`** (and therefore the directory
name). `?content=` and the download pane both key off `id`.

## Renaming a content

The content `id`, its directory name, and its registry key must stay identical,
and several files reference the old name. Rename **all** of these together:

1. **The directory** — `src/contents/<old>/` → `src/contents/<new>/`.
2. **The per-role files inside**, if you name them after the content
   (`<old>-board.ts`, `<old>-code.<ext>`, `<old>-highlight.txt`,
   `<old>-desc.html`, `<old>-trace.txt`, `<old>-download.txt`), and every
   `import` of them in `index.ts`. Stage the delete + add together so git records
   a rename.
3. **`config.txt`** — any `fileCode` / `fileBoard` / `fileCodeHighlight` /
   `fileDescription` / `fileTrace` / `fileDownload` line whose filename changed.
4. **`id:` in `index.ts`** → `'<new>'`.
5. **The registry key in `src/pages/index.ts`** → `<new>`.
6. **`ZhbConstant.DEFAULT_CONTENT`** — only if this content was the default.
7. **Asset references** — links in `<new>-download.txt` still point at files under
   `assets/`; rename those files too if they carried the old name.

Then `npm run build`: `assertContentIdsMatchDirs` fails loudly if step 4 (or 1)
was missed, and the console shows an error if step 5 was missed. Steps 4–5 are
what the download pane is most sensitive to — a partial rename 404s its links.

## Validation

At load, `ZintStepByStepContent` checks the board step count, the highlight line
count, and the description `<li>` count all equal `stepsNO`, logging a
`console.error` for any mismatch — so authoring mistakes surface immediately in
the console.

## Add a whole new page (not just a content)

1. Create `src/pages/<name>.ts` and `src/templates/<name>.html` (link
   `style.css`; no `<script>` tag).
2. Register it in `webpack.config.js` `pages` array with `name`, `entry`,
   `template`, `title`.
