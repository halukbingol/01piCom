# CLAUDE.md

## General

- Make Claude's answers more Markdown-structured.


Step-by-step SVG navigation FSM built on a reusable **Zhb** library.
Stack: TypeScript + webpack, Jest for tests, ESLint + Prettier.

## Commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Tests | `npm test` (builds first, then Jest) |
| Jest only | `npm run test:jest` |
| Lint | `npm run lint` / `npm run lint:fix` |
| Format | `npm run format` |

Node >= 22.15.0 (see `.nvmrc`).

## Architecture

- `src/lib/` — reusable **Zhb** library. `src/lib/board/` holds the SVG
  drawable primitives (`ZhbMemory`, `ZhbLocation`, `ZhbConstant`, ...).
  Library code must not depend on anything under `src/contents/`.
- `src/contents/content-*/` — one folder per teaching module. Each has a
  `config.txt` plus `*-board.ts`, `*-code.js`, `*-desc.html`,
  `*-trace.txt`, `*-highlight.txt`. See `docs/adding_content.md`.
- `src/pages/`, `src/templates/`, `src/styles/` — the app shell
  (four-row layout; see the header comment in `src/styles/style.css`).

## Conventions

- BEM class names in CSS (`block__element--modifier`). SVG diagram classes
  are `zhb__*`; JS toggles state modifiers `zhb--hidden` / `zhb--highlighted`
  / `zhb--drawing`.
- Colors come from CSS custom properties in `:root` — never hard-code hex.
- Run `npm run lint` and `npm run test` before proposing a change is done.
- Prettier owns formatting; don't hand-format.

## Notes

- Content files were recently renamed (`LLS.js` -> `LLS-code.js`, etc.);
  when moving files, stage delete + add together so git records a rename.
