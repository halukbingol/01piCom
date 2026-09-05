import { ZhbConstant } from './ZhbConstant';
import {
  ZhbDrawable,
  type ZhbAnimateOptions,
  ANIMATION_MAX_DEFAULT,
} from './ZhbDrawable';

/**
 * ZhbLink draws a connector (line, optionally arrow-headed) between two points.
 * Reusable, stateful, animatable primitive used to represent links between
 * linked-list nodes.
 *
 * Visibility and highlight are handled by the {@link ZhbDrawable} base via CSS
 * classes. Animation is a hand-drawing reveal: the line grows from its start
 * point to its end over `animationMax` seconds; the arrowhead(s) fade in on
 * completion (driven by the `zhb--animated` class + CSS).
 */
export class ZhbLink extends ZhbDrawable {
  /** Length of the arrowhead barbs, in user units. */
  private static readonly HEAD = 8;

  /** The main line element (kept for animation). */
  private line: SVGLineElement | null = null;

  /** The total length of the line, cached for the dash reveal. */
  private length = 0;

  public constructor(
    private readonly x1: number,
    private readonly y1: number,
    private readonly x2: number,
    private readonly y2: number,
    private readonly arrow: boolean = true,
    private readonly doubleArrow: boolean = false,
  ) {
    super();
  }

  /**
   * Build the line and arrowhead(s) into the group.
   * @param group The group element to populate.
   */
  protected override build(group: SVGGElement): void {
    const line = document.createElementNS(ZhbConstant.SVG_NS, 'line');
    line.setAttribute('x1', String(this.x1));
    line.setAttribute('y1', String(this.y1));
    line.setAttribute('x2', String(this.x2));
    line.setAttribute('y2', String(this.y2));
    line.setAttribute('class', 'zhb__shape zhb__link-line');
    group.appendChild(line);
    this.line = line;
    this.length = Math.hypot(this.x2 - this.x1, this.y2 - this.y1);

    if (this.arrow) {
      this.buildHead(group, this.x1, this.y1, this.x2, this.y2);
    }
    if (this.doubleArrow) {
      this.buildHead(group, this.x2, this.y2, this.x1, this.y1);
    }
  }

  /**
   * Hand-draw the line by animating a stroke-dash reveal from 0 to full length.
   *
   * @param group The mounted group.
   * @param options Animation options.
   * @returns A cancel function.
   */
  protected override animateElements(
    group: SVGGElement,
    options: ZhbAnimateOptions,
  ): () => void {
    const line = this.line;
    if (line === null) {
      return (): void => {};
    }
    const animationMax = options.animationMax ?? ANIMATION_MAX_DEFAULT;
    const durationMs = animationMax * 1000;
    const len = this.length;

    // Prime the dash so the line starts hidden, then grows to full length.
    line.style.strokeDasharray = String(len);
    line.style.strokeDashoffset = String(len);
    // Arrowheads stay hidden until the line completes (CSS keys off this).
    group.classList.add('zhb--drawing');

    let startTime: number | null = null;
    let rafId = 0;
    let cancelled = false;

    const frame = (now: number): void => {
      if (cancelled) {
        return;
      }
      if (startTime === null) {
        startTime = now;
      }
      const t = Math.min(1, (now - startTime) / durationMs);
      line.style.strokeDashoffset = String(len * (1 - t));
      if (t < 1) {
        rafId = requestAnimationFrame(frame);
      } else {
        // Settle: clear inline dash props and reveal arrowheads.
        line.style.strokeDasharray = '';
        line.style.strokeDashoffset = '';
        group.classList.remove('zhb--drawing');
        options.onDone?.();
      }
    };
    rafId = requestAnimationFrame(frame);

    return (): void => {
      cancelled = true;
      if (typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(rafId);
      }
      line.style.strokeDasharray = '';
      line.style.strokeDashoffset = '';
      group.classList.remove('zhb--drawing');
    };
  }

  /**
   * Build an arrowhead at (tx, ty) pointing along the direction from (fx, fy).
   */
  private buildHead(
    group: SVGGElement,
    fx: number,
    fy: number,
    tx: number,
    ty: number,
  ): void {
    const angle = Math.atan2(ty - fy, tx - fx);
    const h = ZhbLink.HEAD;
    const a1 = angle - Math.PI / 6;
    const a2 = angle + Math.PI / 6;
    const p1x = tx - h * Math.cos(a1);
    const p1y = ty - h * Math.sin(a1);
    const p2x = tx - h * Math.cos(a2);
    const p2y = ty - h * Math.sin(a2);

    const head = document.createElementNS(ZhbConstant.SVG_NS, 'polyline');
    head.setAttribute('points', `${p1x},${p1y} ${tx},${ty} ${p2x},${p2y}`);
    head.setAttribute('class', 'zhb__shape zhb__link-head');
    group.appendChild(head);
  }
}
