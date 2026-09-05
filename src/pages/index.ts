import { ZintStepByStepGUI } from '../lib/navigation/ZintStepByStepGUI';
import { ZintStepByStepContent } from '../lib/navigation/ZintStepByStepContent';
import type { ContentModule, PaneName } from '../lib/content/contentTypes';
import { content as contentMemory } from '../contents/content-memory';
import { content as contentLLS } from '../contents/content-LLS';
import { content as contentTestB } from '../contents/contTestB';

/** Registry of available contents, keyed by id. */
const CONTENTS: Record<string, ContentModule> = {
  'content-memory': contentMemory,
  'content-LLS': contentLLS,
  contTestB: contentTestB,
};

/**
 * Hide the DOM group enclosing a pane. The debug pane is special: its container
 * carries `data-debug-pane`; the others sit inside a `.pane-group` wrapper.
 *
 * @param pane The pane to hide.
 */
function hidePane(pane: PaneName): void {
  if (pane === 'debug') {
    const el = document.querySelector('[data-debug-pane]');
    if (el instanceof HTMLElement) {
      el.hidden = true;
    }
    return;
  }
  const paneEl = document.getElementById(pane);
  const group = paneEl?.closest('.pane-group');
  if (group instanceof HTMLElement) {
    group.hidden = true;
  } else if (paneEl instanceof HTMLElement) {
    paneEl.hidden = true;
  }
}

/**
 * Entry point. Selects a content (via `?content=<id>`, default LLS), applies the
 * content's pane-visibility settings, wires the navigation GUI to a content
 * renderer, and fills the descriptive panes. Debug mode is enabled when the URL
 * contains `?debug` (unless the content hides the debug pane).
 */
function main(): void {
  const nav = document.getElementById('div-navigation');
  const svg = document.getElementById('MySvg');
  const debugList = document.getElementById('debug');
  const codePane = document.getElementById('code');
  const descPane = document.getElementById('description');
  const tracePane = document.getElementById('trace');

  if (nav === null || svg === null || !(svg instanceof SVGSVGElement)) {
    throw new Error('Required navigation/board elements are missing.');
  }

  const params = new URLSearchParams(window.location.search);
  const requested = params.get('content');
  const module =
    requested !== null && CONTENTS[requested] !== undefined
      ? CONTENTS[requested]
      : contentMemory;

  // Apply per-content pane visibility (all panes visible unless marked hidden).
  const hidden = module.config.hiddenPanes;
  hidden.forEach((pane) => hidePane(pane));

  // Debug mode: requested via ?debug, but suppressed if the content hides it.
  const debug = params.has('debug') && !hidden.has('debug');

  const content = new ZintStepByStepContent(module, {
    code: codePane,
    board: svg,
    description: descPane,
    trace: tracePane,
  });

  new ZintStepByStepGUI({
    container: nav,
    client: content,
    debugList,
    debug,
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
