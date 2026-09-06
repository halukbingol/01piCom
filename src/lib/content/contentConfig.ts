import { ContentConfig, PaneName, PANE_NAMES } from './contentTypes';

/**
 * Strip a `#` comment from a config line: everything from the first `#` to the
 * end of the line is removed (so a line starting with `#` becomes empty, and a
 * trailing `# ...` on a value line is dropped).
 *
 * @param line A raw line.
 * @returns The line with any comment removed.
 */
function stripComment(line: string): string {
  const hash = line.indexOf('#');
  return hash === -1 ? line : line.slice(0, hash);
}

/**
 * Parse a `config.txt` CSV (key,value per line) into a {@link ContentConfig}.
 *
 * Comment syntax: `#` begins a comment that runs to the end of the line — a line
 * starting with `#` is a full comment, and a trailing `# ...` after a value is
 * stripped.
 *
 * Page title: the `title` line (`title,<text>`) supplies the HTML page title.
 * It is optional; when absent the build-time default title is kept.
 *
 * Pane visibility: `<pane>,invisible` hides that pane. For each of `code`,
 * `description`, and `board`, the config must EITHER define the pane's file(s)
 * OR mark the pane invisible; otherwise a `console.error` is emitted. `stepsNO`
 * is always required, and `fileBoard` is required unless `board` is invisible.
 *
 * @param text Raw config file contents.
 * @returns The parsed config.
 */
export function parseConfig(text: string): ContentConfig {
  const map = new Map<string, string>();
  for (const raw of text.split(/\r?\n/)) {
    const line = stripComment(raw).trim();
    if (line === '') {
      continue;
    }
    const comma = line.indexOf(',');
    if (comma === -1) {
      continue;
    }
    const key = line.slice(0, comma).trim();
    const value = line.slice(comma + 1).trim();
    map.set(key, value);
  }

  const hiddenPanes = parsePaneVisibility(map);

  const stepsNORaw = map.get('stepsNO');
  if (stepsNORaw === undefined) {
    throw new Error('config.txt is missing required key: stepsNO.');
  }

  const title = map.get('title');

  const fileCode = map.get('fileCode');
  const fileCodeHighlight = map.get('fileCodeHighlight');
  const fileDescription = map.get('fileDescription');
  const fileBoard = map.get('fileBoard');
  const fileTrace = map.get('fileTrace');

  // Each pane must either define its file(s) or be marked invisible.
  const requireFilesOrHidden = (
    pane: PaneName,
    ...files: (string | undefined)[]
  ): void => {
    if (!hiddenPanes.has(pane) && files.some((f) => f === undefined)) {
      console.error(
        `[config] pane '${pane}' is visible but its file(s) are not defined; ` +
          `either define them or set '${pane},invisible'.`,
      );
    }
  };
  requireFilesOrHidden('code', fileCode, fileCodeHighlight);
  requireFilesOrHidden('description', fileDescription);
  requireFilesOrHidden('board', fileBoard);
  requireFilesOrHidden('trace', fileTrace);

  if (fileBoard === undefined && !hiddenPanes.has('board')) {
    throw new Error('config.txt is missing required key: fileBoard.');
  }

  return {
    title,
    stepsNO: Number(stepsNORaw),
    fileCode,
    fileCodeHighlight,
    fileDescription,
    fileBoard: fileBoard ?? '',
    fileTrace,
    hiddenPanes,
  };
}

/**
 * Collect the panes marked `invisible` from parsed config entries. A pane is
 * hidden when its name maps to the exact value `invisible` (case-insensitive).
 *
 * @param entries The parsed key,value map from `config.txt`.
 * @returns The set of panes to hide (visible panes are simply absent).
 */
export function parsePaneVisibility(
  entries: Map<string, string>,
): ReadonlySet<PaneName> {
  const hidden = new Set<PaneName>();
  for (const pane of PANE_NAMES) {
    if (entries.get(pane)?.toLowerCase() === 'invisible') {
      hidden.add(pane);
    }
  }
  return hidden;
}

/**
 * Parse a highlight-spec file into a per-step list of highlighted line numbers.
 * Each non-comment line corresponds to one step. A line is a comma-separated
 * list of line numbers and ranges (`1,3,5-8`), or `nop` for no highlight.
 *
 * Lines beginning with `#` are treated as comments and skipped, so a leading
 * `#nop` (as in the spec's example) does not count as a step line.
 *
 * @param text Raw highlight file contents.
 * @returns An array of arrays; entry k is the highlighted lines for step k.
 */
export function parseHighlight(text: string): number[][] {
  const perStep: number[][] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line === '' || line.startsWith('#')) {
      continue;
    }
    if (line.toLowerCase() === 'nop') {
      perStep.push([]);
      continue;
    }
    const lines: number[] = [];
    for (const part of line.split(',')) {
      const token = part.trim();
      if (token === '') {
        continue;
      }
      const dash = token.indexOf('-');
      if (dash === -1) {
        lines.push(Number(token));
      } else {
        const start = Number(token.slice(0, dash));
        const end = Number(token.slice(dash + 1));
        for (let n = start; n <= end; n += 1) {
          lines.push(n);
        }
      }
    }
    perStep.push(lines);
  }
  return perStep;
}

/**
 * Count the number of `<li>` elements in a description HTML fragment.
 *
 * @param html Raw description HTML.
 * @returns The number of `<li>` tags.
 */
export function countListItems(html: string): number {
  const matches = html.match(/<li\b/gi);
  return matches === null ? 0 : matches.length;
}

/**
 * Derive a language hint from a code filename's extension.
 *
 * @param fileName e.g. `PrimitiveTypes.java`.
 * @returns The lowercased extension, e.g. `java`, or `text` if none.
 */
export function languageFromFilename(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  return dot === -1 ? 'text' : fileName.slice(dot + 1).toLowerCase();
}
