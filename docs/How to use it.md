# How to use it

This is an end-user guide to _using_ directAccess — running it and navigating a
lesson. (For authoring new lessons, see `adding_content.md`; for the internals,
see `specification.md`.)

## Starting it

From the project folder:

```bash
npm install   # first time only
npm run dev   # starts a local server, usually at http://localhost:8080/
```

Open the URL your terminal prints after `Project is running at:` — normally
<http://localhost:8080/>.

## Choosing a lesson (content)

A lesson is called a **content**. You pick one with the `?content=` parameter in
the URL:

```txt
http://localhost:8080/?content=content-MyContent
```

Replace `content-MyContent` with the id of the content you want. The ids that
ship with directAccess are:

- `content-memory` — variable assignment over memory cells (`a = 42`, `c = a`).
- `content-LLS` — inserting a node at the head of a singly linked list.

Examples:

```txt
http://localhost:8080/?content=content-memory
http://localhost:8080/?content=content-LLS
```

Opening the base URL with **no** `?content=` (or an unknown id) loads the first
available content as a default.

## Navigating the steps

Each content is a sequence of numbered **states** (0, 1, 2, …). The navigation
bar at the top has:

- a **▶ next** button (green) — advance one state,
- a **◀ previous** button (red) — go back one state,
- a **numbered button per state** — jump straight to that state.

Keyboard shortcuts: **→** = next, **←** = previous; **Enter**/**Space** activate
the focused button.

As you move between states, the panels update together:

- **board** — the picture (cells, nodes, links) for the current state.
- **code** — the program, with the current step's line(s) highlighted.
- **description** — an explanation of _this_ state only.
- **trace** — a running log of the states you've visited.

You can jump around freely — forward, backward, or straight to any state — and
the board always shows the correct picture for whatever state you land on.

## Debug view

Add `?debug` to the URL to reveal a debug panel that logs each navigation action
(useful when authoring or reporting a problem):

```txt
http://localhost:8080/?content=content-LLS&debug
```

If a content has intentionally hidden its debug panel, `?debug` has no effect for
that content.
