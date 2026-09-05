'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const DIST = path.resolve(__dirname, '..', 'dist');

/**
 * Locate the built HTML file and its content bundle in dist/.
 * @returns {{ html: string, bundlePath: string }}
 */
function loadBuiltArtifacts() {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    throw new Error(
      'dist/ not found. Build first: run `npm run build` (or `npm test`).',
    );
  }
  const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf-8');
  const bundleName = fs
    .readdirSync(DIST)
    .find((f) => f.startsWith('index.') && f.endsWith('.js'));
  if (bundleName === undefined) {
    throw new Error('Built index bundle not found. Run `npm run build`.');
  }
  return { html, bundlePath: path.join(DIST, bundleName) };
}

/**
 * Boot the built page inside jsdom, executing the real bundle.
 * @returns {Promise<{ window: Window }>}
 */
async function bootPage(search = '') {
  const { html, bundlePath } = loadBuiltArtifacts();
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    url: `http://localhost/${search}`,
  });
  const bundleSource = fs.readFileSync(bundlePath, 'utf-8');
  const scriptEl = dom.window.document.createElement('script');
  scriptEl.textContent = bundleSource;
  dom.window.document.body.appendChild(scriptEl);
  return { window: dom.window };
}

/**
 * Snapshot the board's drawables as a stable, comparable string array: one
 * entry per `<g class="zhb">` capturing its flag classes and inner geometry +
 * text. Two boards in the same logical state produce equal snapshots.
 * @param {Document} doc
 * @returns {string[]}
 */
function snapshot(doc) {
  const svg = doc.getElementById('MySvg');
  return Array.from(svg.querySelectorAll(':scope > g.zhb')).map((g) => {
    const flags = Array.from(g.classList)
      .filter((c) => c.startsWith('zhb--'))
      .sort()
      .join(',');
    const inner = Array.from(g.children)
      .map((el) => {
        const tag = el.tagName.toLowerCase();
        const geo = ['x', 'y', 'width', 'height', 'x1', 'y1', 'x2', 'y2']
          .map((a) => (el.hasAttribute(a) ? `${a}=${el.getAttribute(a)}` : ''))
          .filter(Boolean)
          .join(' ');
        const text = el.textContent || '';
        return `${tag}(${geo}){${text}}`;
      })
      .join('|');
    return `g[${flags}]:${inner}`;
  });
}

/** Find a nav control group by its data-nav value. */
function control(doc, nav) {
  return doc.querySelector(`#div-navigation [data-nav="${nav}"]`);
}

/** The index of the currently active state button (aria-current="step"). */
function activeState(doc) {
  const el = doc.querySelector('#div-navigation [aria-current="step"]');
  return el === null ? null : Number(el.getAttribute('data-state'));
}

/** Click a navigation control. */
function click(win, doc, nav) {
  control(doc, nav).dispatchEvent(new win.Event('click', { bubbles: true }));
}

/** The memory-cell groups (each contains a rect), top to bottom. */
function cells(doc) {
  return Array.from(
    doc.getElementById('MySvg').querySelectorAll(':scope > g.zhb'),
  ).filter((g) => g.querySelector('rect') !== null);
}

/** The displayed value of cell index i ('' when empty). */
function cellValue(doc, i) {
  // First text element inside the cell is the centered value.
  const texts = cells(doc)[i].querySelectorAll('text');
  return texts[0].textContent;
}

describe('directAccess built bundle (jsdom integration)', () => {
  test('renders navigation + panes and starts at state 0 with 4 empty cells', async () => {
    const { window } = await bootPage();
    const doc = window.document;

    for (const id of [
      'div-title',
      'div-navigation',
      'debug',
      'div-page',
      'code',
      'download',
      'board',
      'description',
      'trace',
    ]) {
      expect(doc.getElementById(id)).not.toBeNull();
    }

    expect(activeState(doc)).toBe(0);
    expect(cells(doc).length).toBe(4);
    for (let i = 0; i < 4; i += 1) {
      expect(cellValue(doc, i)).toBe('');
    }
  });

  test('step 1 executes a = 42: cell a shows 42, highlighted', async () => {
    const { window } = await bootPage();
    const doc = window.document;

    click(window, doc, 'next');
    expect(activeState(doc)).toBe(1);
    expect(cellValue(doc, 0)).toBe('42');
    expect(cells(doc)[0].classList.contains('zhb--highlighted')).toBe(true);
  });

  test('step 2 settles: highlight off, value kept', async () => {
    const { window } = await bootPage();
    const doc = window.document;

    click(window, doc, 'next');
    click(window, doc, 'next');
    expect(cellValue(doc, 0)).toBe('42');
    expect(cells(doc)[0].classList.contains('zhb--highlighted')).toBe(false);
  });

  test('step 3 executes c = a: both cells show 42 and highlight', async () => {
    const { window } = await bootPage();
    const doc = window.document;

    // Jump straight to state 3 — navigation decides steps 0..3 must run.
    click(window, doc, 'state-3');
    expect(cellValue(doc, 0)).toBe('42');
    expect(cellValue(doc, 2)).toBe('42');
    expect(cells(doc)[0].classList.contains('zhb--highlighted')).toBe(true);
    expect(cells(doc)[2].classList.contains('zhb--highlighted')).toBe(true);
  });

  test('btnPrevious at state 0 is a no-op; arrows map to next/previous', async () => {
    const { window } = await bootPage();
    const doc = window.document;
    const nav = doc.getElementById('div-navigation');

    const initial = snapshot(doc);
    click(window, doc, 'previous');
    expect(activeState(doc)).toBe(0);
    expect(snapshot(doc)).toEqual(initial);

    nav.dispatchEvent(
      new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    );
    expect(activeState(doc)).toBe(1);
    nav.dispatchEvent(
      new window.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
    );
    expect(activeState(doc)).toBe(0);
  });

  test('code and description panes are populated; description shows the current step; trace accumulates', async () => {
    const { window } = await bootPage();
    const doc = window.document;

    expect(doc.querySelectorAll('#code .code-line').length).toBeGreaterThan(0);

    // Description shows only the current step's content. At state 0 it holds the
    // step-0 text; after stepping it changes to the step-1 text.
    const desc = doc.getElementById('description');
    const at0 = desc.textContent.trim();
    expect(at0.length).toBeGreaterThan(0);

    const before = doc.querySelectorAll('#trace .trace-line').length;
    click(window, doc, 'next');
    expect(doc.querySelectorAll('#trace .trace-line').length).toBeGreaterThan(
      before,
    );
    const at1 = desc.textContent.trim();
    expect(at1).not.toBe(at0);
  });

  test('trace pane shows file lines for states 0..k cumulatively (and shrinks going back)', async () => {
    const { window } = await bootPage();
    const doc = window.document;
    const traceLines = () =>
      Array.from(doc.querySelectorAll('#trace .trace-line')).map((d) =>
        d.textContent.trimEnd(),
      );

    // state 0: only the two state-0 header lines.
    const s0 = traceLines();
    expect(s0.length).toBe(2);
    expect(s0[0]).toContain('a');
    expect(s0[0]).toContain('b');

    // state 1: adds the a = 42 line.
    click(window, doc, 'state-1');
    const s1 = traceLines();
    expect(s1.length).toBe(3);
    expect(s1[2]).toContain('42');

    // state 3: cumulative through c = a (5 lines: 2 header + steps 1,2,3).
    click(window, doc, 'state-3');
    expect(traceLines().length).toBe(5);

    // Going back to state 1 SHRINKS the trace (file-driven, not append-only).
    click(window, doc, 'state-1');
    expect(traceLines().length).toBe(3);

    // Column padding is preserved (multiple spaces survive in the text).
    expect(traceLines()[0]).toMatch(/ {2,}/);
  });

  /**
   * Consistency: the navigation decides which steps to execute (single forward
   * execution vs. full replay). Whatever route reaches a state — forward
   * stepping, direct jump, backward walking, zig-zag — the executor must leave
   * the board in an identical state.
   */
  test('board is consistent across navigation paths', async () => {
    const { window: wBase } = await bootPage();
    const last =
      wBase.document.querySelectorAll('#div-navigation [data-state]').length -
      1;

    // Canonical snapshots via fresh direct jumps.
    const canonical = [];
    for (let s = 0; s <= last; s += 1) {
      const { window: w } = await bootPage();
      const d = w.document;
      click(w, d, `state-${s}`);
      canonical.push(snapshot(d));
    }

    // Path A: forward stepping.
    {
      const { window: w } = await bootPage();
      const d = w.document;
      expect(snapshot(d)).toEqual(canonical[0]);
      for (let s = 1; s <= last; s += 1) {
        click(w, d, 'next');
        expect(snapshot(d)).toEqual(canonical[s]);
      }
    }

    // Path B: overshoot then walk backward.
    {
      const { window: w } = await bootPage();
      const d = w.document;
      click(w, d, `state-${last}`);
      for (let s = last; s >= 0; s -= 1) {
        expect(snapshot(d)).toEqual(canonical[s]);
        if (s > 0) {
          click(w, d, 'previous');
        }
      }
    }

    // Path C: zig-zag jumps.
    {
      const { window: w } = await bootPage();
      const d = w.document;
      for (const s of [last, 0, 1, last, 2, 0]) {
        click(w, d, `state-${s}`);
        expect(snapshot(d)).toEqual(canonical[s]);
      }
    }
  });

  test('debug pane reveals and logs when ?debug is set', async () => {
    const { window } = await bootPage('?debug');
    const doc = window.document;

    expect(doc.querySelector('[data-debug-pane]').hidden).toBe(false);
    click(window, doc, 'state-2');
    const lines = Array.from(doc.querySelectorAll('#debug li')).map(
      (li) => li.textContent,
    );
    expect(lines.some((l) => l.startsWith('jumpTo-2'))).toBe(true);
  });
});

describe('content-LLS insert-at-head (jsdom integration)', () => {
  const q = '?content=content-LLS';

  /** Node groups on the board (each ZhbNodeLLS has a rect). */
  function nodeGroups(doc) {
    return Array.from(
      doc.getElementById('MySvg').querySelectorAll(':scope > g.zhb'),
    ).filter((g) => g.querySelector('rect') !== null);
  }

  /** Count nodes currently showing a ground symbol (link-to-null). */
  function groundCount(doc) {
    return nodeGroups(doc).filter(
      (g) => g.querySelector('.zhb__ground') !== null,
    ).length;
  }

  test('starts at state 0 with head pointing to null (6 states)', async () => {
    const { window } = await bootPage(q);
    const doc = window.document;

    expect(doc.querySelectorAll('#div-navigation [data-state]').length).toBe(6);
    expect(activeState(doc)).toBe(0);
    // Only head exists, and it points to null (ground symbol present).
    expect(nodeGroups(doc).length).toBe(1);
    expect(groundCount(doc)).toBeGreaterThan(0);
  });

  test('stepping creates nodes and links them', async () => {
    const { window } = await bootPage(q);
    const doc = window.document;

    // step 1: n1 created (head + n1 = 2 nodes).
    click(window, doc, 'next');
    expect(nodeGroups(doc).length).toBe(2);

    // step 2: head -> n1 (head no longer points to null; fewer grounds).
    const groundsBefore = groundCount(doc);
    click(window, doc, 'next');
    expect(groundCount(doc)).toBeLessThan(groundsBefore);

    // step 3: n2 created (3 nodes).
    click(window, doc, 'next');
    expect(nodeGroups(doc).length).toBe(3);
  });

  test('final state: three nodes present, no dangling null on head/n2', async () => {
    const { window } = await bootPage(q);
    const doc = window.document;
    click(window, doc, 'state-5');
    expect(nodeGroups(doc).length).toBe(3);
    // After head->n2 and n2->n1, only n1 still points to null: exactly 1 ground.
    expect(groundCount(doc)).toBe(1);
  });

  test('description pane shows only the current step content (LLS)', async () => {
    const { window } = await bootPage(q);
    const doc = window.document;
    const desc = doc.getElementById('description');

    const s0 = desc.textContent;
    expect(s0.toLowerCase()).toContain('head');
    // Only the current step is shown: exactly one <p>, not all six.
    expect(doc.querySelectorAll('#description p').length).toBe(1);

    click(window, doc, 'state-3');
    const s3 = desc.textContent;
    expect(s3.toLowerCase()).toContain('n2');
    expect(s3).not.toBe(s0);
    expect(doc.querySelectorAll('#description p').length).toBe(1);
  });

  test('download pane hidden via config (download,invisible); board visible', async () => {
    const { window } = await bootPage(q);
    const doc = window.document;
    expect(doc.getElementById('download').closest('.pane-group').hidden).toBe(
      true,
    );
    expect(doc.getElementById('board').closest('.pane-group').hidden).toBe(
      false,
    );
  });

  test('board is consistent across navigation paths (LLS)', async () => {
    const { window: wBase } = await bootPage(q);
    const last =
      wBase.document.querySelectorAll('#div-navigation [data-state]').length -
      1;

    const canonical = [];
    for (let s = 0; s <= last; s += 1) {
      const { window: w } = await bootPage(q);
      const d = w.document;
      click(w, d, `state-${s}`);
      canonical.push(snapshot(d));
    }

    // Forward stepping.
    {
      const { window: w } = await bootPage(q);
      const d = w.document;
      expect(snapshot(d)).toEqual(canonical[0]);
      for (let s = 1; s <= last; s += 1) {
        click(w, d, 'next');
        expect(snapshot(d)).toEqual(canonical[s]);
      }
    }

    // Overshoot then backward.
    {
      const { window: w } = await bootPage(q);
      const d = w.document;
      click(w, d, `state-${last}`);
      for (let s = last; s >= 0; s -= 1) {
        expect(snapshot(d)).toEqual(canonical[s]);
        if (s > 0) {
          click(w, d, 'previous');
        }
      }
    }

    // Zig-zag.
    {
      const { window: w } = await bootPage(q);
      const d = w.document;
      for (const s of [last, 0, 2, last, 1, 0]) {
        click(w, d, `state-${s}`);
        expect(snapshot(d)).toEqual(canonical[s]);
      }
    }
  });
});
