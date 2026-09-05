import { ZhbConstant } from '../board/ZhbConstant';
import { ZintStepByStepClient } from './ZintStepByStepClient';

/**
 * Options controlling a {@link ZintStepByStepGUI} instance.
 */
export interface ZintGuiOptions {
  /** Container element that hosts the navigation SVG (e.g. `#div-navigation`). */
  readonly container: HTMLElement;
  /** The content/client this GUI drives. */
  readonly client: ZintStepByStepClient;
  /** Optional debug list element; when present, debug output is appended here. */
  readonly debugList?: HTMLElement | null;
  /** Whether debug mode is on (reveals + logs to the debug pane). */
  readonly debug?: boolean;
}

/**
 * ZintStepByStepGUI renders a step navigator as a single SVG of circular
 * buttons inside its container and runs the finite-state machine described in
 * the spec. It drives any {@link ZintStepByStepClient} (content extends the
 * client), mirroring every state change onto it.
 *
 * States are numbered 0..S-1 where S = client.getNumberOfStates(). The GUI is
 * fully container-scoped (no global ids), so multiple instances coexist.
 */
export class ZintStepByStepGUI {
  /** Total number of states, including state 0 (the spec's `S`). */
  public readonly stateNO: number;

  /** The container hosting this GUI's SVG. */
  private readonly container: HTMLElement;

  /** The content this GUI drives. */
  private readonly client: ZintStepByStepClient;

  /** Optional debug list element. */
  private readonly debugList: HTMLElement | null;

  /** Whether debug logging is enabled. */
  private readonly debug: boolean;

  /** The present state P. */
  private present: number = 0;

  /** Map from state index to its button `<g>` element, for active toggling. */
  private readonly stateButtons: Map<number, SVGGElement> = new Map();

  /**
   * Index of the currently active state button, or null before the first
   * activation. Tracked so `setActive` only mutates the two affected buttons.
   */
  private activeIndex: number | null = null;

  /** Geometry constants for laying out the button row. */
  private static readonly BTN_R = 18;
  private static readonly GAP = 14;
  private static readonly PAD = 12;
  private static readonly HEIGHT = 60;

  /**
   * @param options See {@link ZintGuiOptions}.
   */
  public constructor(options: ZintGuiOptions) {
    this.container = options.container;
    this.client = options.client;
    this.debugList = options.debugList ?? null;
    this.debug = options.debug ?? false;
    this.stateNO = this.client.getNumberOfStates();

    this.render();
    this.attachListeners();

    if (this.debug && this.debugList !== null) {
      const pane = this.debugList.closest('[data-debug-pane]');
      if (pane instanceof HTMLElement) {
        pane.hidden = false;
      }
    }

    // On construction the system starts at state 0.
    this.reset();
  }

  /** @returns The present state P. */
  public getPresent(): number {
    return this.present;
  }

  // ----------------------------------------------------------------- FSM ---

  /**
   * Reset the system to state 0 and mark `btnState_0` active.
   */
  public reset(): void {
    this.present = 0;
    this.setActive(0);
    this.client.reset();
  }

  /**
   * Do nothing (a transition that isn't allowed), mirrored to the client.
   */
  public noAction(): void {
    this.client.noAction();
  }

  /**
   * Animate the transition from present state P to N = P + 1, updating the
   * active button and mirroring to the client.
   */
  public smoothNext(): void {
    const n = this.present + 1;
    this.setActive(n);
    this.present = n;
    this.logDebug(`smooth-${n}`);
    this.client.smoothNext(n);
  }

  /**
   * Reset then fast-run states 0..n without animation, leaving `btnState_n`
   * active.
   *
   * @param n The target state.
   */
  public fastForward(n: number): void {
    this.reset();
    this.present = n;
    this.setActive(n);
    this.client.fastForward(n);
  }

  /**
   * Jump to state N. If N = 0, reset; otherwise fast-forward to N-1, then
   * smoothly step to N. Mirrored to the client.
   *
   * @param n The target state.
   */
  public jumpTo(n: number): void {
    this.logDebug(`jumpTo-${n}`);
    if (n === 0) {
      this.reset();
    } else {
      this.fastForward(n - 1);
      this.smoothNext();
    }
    this.client.jumpTo(n);
  }

  // ------------------------------------------------------------- controls ---

  /**
   * Handle a control activation resolved via its `data-nav` attribute.
   *
   * @param nav The `data-nav` value of the activated control.
   */
  private handleControl(nav: string): void {
    const p = this.present;
    const last = this.stateNO - 1;

    if (nav === 'next') {
      // Pressing btnNext.
      if (p === last) {
        this.noAction();
      } else {
        this.smoothNext();
      }
      return;
    }

    if (nav === 'previous') {
      // Pressing btnPrevious.
      if (p === 0) {
        this.noAction();
      } else {
        this.jumpTo(p - 1);
      }
      return;
    }

    if (nav.startsWith('state-')) {
      // Pressing btnState_X.
      const x = Number(nav.slice('state-'.length));
      if (x === p) {
        this.noAction();
      } else if (x === p + 1) {
        this.smoothNext();
      } else {
        this.jumpTo(x);
      }
    }
  }

  // ------------------------------------------------------------ rendering ---

  /**
   * Build the SVG navigation and mount it in the container.
   */
  private render(): void {
    this.container.replaceChildren();

    const count = this.stateNO;
    const step = ZintStepByStepGUI.BTN_R * 2 + ZintStepByStepGUI.GAP;
    // prev + states + next, laid left to right.
    const totalButtons = count + 2;
    const width =
      ZintStepByStepGUI.PAD * 2 +
      totalButtons * (ZintStepByStepGUI.BTN_R * 2) +
      (totalButtons - 1) * ZintStepByStepGUI.GAP;

    const svg = document.createElementNS(ZhbConstant.SVG_NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${ZintStepByStepGUI.HEIGHT}`);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', String(ZintStepByStepGUI.HEIGHT));
    svg.setAttribute('role', 'group');
    svg.setAttribute('aria-label', 'Step navigation');

    const cy = ZintStepByStepGUI.HEIGHT / 2;
    let cx = ZintStepByStepGUI.PAD + ZintStepByStepGUI.BTN_R;

    // btnPrevious: left-pointing red triangle with a "-".
    this.drawTriangle(svg, cx, cy, 'previous', 'previous', 'left', '−');
    cx += step;

    // State buttons.
    for (let i = 0; i < count; i += 1) {
      const g = this.drawStateButton(svg, cx, cy, i);
      this.stateButtons.set(i, g);
      cx += step;
    }

    // btnNext: right-pointing green triangle with a "+".
    this.drawTriangle(svg, cx, cy, 'next', 'next', 'right', '+');

    this.container.appendChild(svg);
  }

  /**
   * Draw a triangular control (previous/next) as a focusable group.
   */
  private drawTriangle(
    svg: SVGSVGElement,
    cx: number,
    cy: number,
    nav: string,
    kind: 'previous' | 'next',
    direction: 'left' | 'right',
    glyph: string,
  ): void {
    const r = ZintStepByStepGUI.BTN_R;
    const g = this.makeControlGroup(nav, `${kind} button`);

    const tri = document.createElementNS(ZhbConstant.SVG_NS, 'polygon');
    const pts =
      direction === 'left'
        ? `${cx + r},${cy - r} ${cx + r},${cy + r} ${cx - r},${cy}`
        : `${cx - r},${cy - r} ${cx - r},${cy + r} ${cx + r},${cy}`;
    tri.setAttribute('points', pts);
    tri.setAttribute('class', `nav-tri nav-tri--${kind}`);
    g.appendChild(tri);

    const label = document.createElementNS(ZhbConstant.SVG_NS, 'text');
    label.setAttribute('x', String(direction === 'left' ? cx + 2 : cx - 2));
    label.setAttribute('y', String(cy));
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('dominant-baseline', 'central');
    label.setAttribute('class', 'nav-glyph');
    label.textContent = glyph;
    g.appendChild(label);

    svg.appendChild(g);
  }

  /**
   * Draw a numbered circular state button as a focusable group.
   *
   * @returns The group element (for later active toggling).
   */
  private drawStateButton(
    svg: SVGSVGElement,
    cx: number,
    cy: number,
    index: number,
  ): SVGGElement {
    const g = this.makeControlGroup(`state-${index}`, `state ${index}`);
    g.setAttribute('data-state', String(index));

    const circle = document.createElementNS(ZhbConstant.SVG_NS, 'circle');
    circle.setAttribute('cx', String(cx));
    circle.setAttribute('cy', String(cy));
    circle.setAttribute('r', String(ZintStepByStepGUI.BTN_R));
    circle.setAttribute('class', 'nav-state__circle');
    g.appendChild(circle);

    const label = document.createElementNS(ZhbConstant.SVG_NS, 'text');
    label.setAttribute('x', String(cx));
    label.setAttribute('y', String(cy));
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('dominant-baseline', 'central');
    label.setAttribute('class', 'nav-state__label');
    label.textContent = String(index);
    g.appendChild(label);

    svg.appendChild(g);
    return g;
  }

  /**
   * Create a focusable, accessible control group carrying a `data-nav` value.
   */
  private makeControlGroup(nav: string, ariaLabel: string): SVGGElement {
    const g = document.createElementNS(ZhbConstant.SVG_NS, 'g');
    g.setAttribute('data-nav', nav);
    g.setAttribute('class', 'nav-btn');
    g.setAttribute('role', 'button');
    g.setAttribute('tabindex', '0');
    g.setAttribute('aria-label', ariaLabel);
    return g;
  }

  /**
   * Mark the given state button active (class + aria-current="step") and all
   * others inactive.
   *
   * @param n The state to mark active.
   */
  private setActive(n: number): void {
    // Only two buttons ever change: the previously-active one and the new one.
    // Touching just those (instead of iterating every button) keeps this O(1)
    // regardless of the number of states.
    if (this.activeIndex === n) {
      return;
    }

    if (this.activeIndex !== null) {
      const prev = this.stateButtons.get(this.activeIndex);
      if (prev !== undefined) {
        prev.classList.remove('is-active');
        prev.removeAttribute('aria-current');
      }
    }

    const next = this.stateButtons.get(n);
    if (next !== undefined) {
      next.classList.add('is-active');
      next.setAttribute('aria-current', 'step');
    }

    this.activeIndex = n;
  }

  // ------------------------------------------------------------ listeners ---

  /**
   * Attach a single delegated click + keydown listener on the container, plus
   * arrow-key navigation. Controls are resolved via `data-nav`, never DOM
   * position.
   */
  private attachListeners(): void {
    this.container.addEventListener('click', (ev) => {
      const target = ev.target as Element | null;
      const control = target?.closest('[data-nav]');
      if (control instanceof SVGElement || control instanceof HTMLElement) {
        const nav = control.getAttribute('data-nav');
        if (nav !== null) {
          this.handleControl(nav);
        }
      }
    });

    this.container.addEventListener('keydown', (ev) => {
      // Right/Left arrows map to next/previous regardless of focus.
      if (ev.key === 'ArrowRight') {
        ev.preventDefault();
        this.handleControl('next');
        return;
      }
      if (ev.key === 'ArrowLeft') {
        ev.preventDefault();
        this.handleControl('previous');
        return;
      }

      // Enter/Space activate the focused control.
      if (ev.key === 'Enter' || ev.key === ' ') {
        const target = ev.target as Element | null;
        const control = target?.closest('[data-nav]');
        if (control instanceof SVGElement || control instanceof HTMLElement) {
          const nav = control.getAttribute('data-nav');
          if (nav !== null) {
            ev.preventDefault();
            this.handleControl(nav);
          }
        }
      }
    });
  }

  // ---------------------------------------------------------------- debug ---

  /**
   * Append a `<li>` line to the debug list when debug mode is on.
   *
   * @param info The line to append.
   */
  private logDebug(info: string): void {
    if (!this.debug || this.debugList === null) {
      return;
    }
    const li = document.createElement('li');
    li.textContent = info;
    this.debugList.appendChild(li);
  }
}
