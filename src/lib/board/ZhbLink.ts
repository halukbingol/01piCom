import { ZhbConstant } from './ZhbConstant';
import {
  ZhbDrawable,
  type ZhbAnimateOptions,
  ANIMATION_MAX_DEFAULT,
} from './ZhbDrawable';
import { ZhbPoint } from './ZhbPoint';

/**
 * ZhbLink draws a connector between two points as a cubic Bézier curve, with an
 * optional arrowhead at either or both ends. Reusable, stateful, animatable
 * primitive used to represent links between linked-list nodes.
 *
 * The curve runs from `pStart` to `pStop`, shaped by the two control points
 * `pC1` (leaving the start) and `pC2` (arriving at the stop) — i.e. the SVG
 * path `M pStart C pC1 pC2 pStop`. Arrowheads are oriented along the curve's
 * tangent at the endpoint.
 *
 * Visibility and highlight are handled by the {@link ZhbDrawable} base via CSS
 * classes. Animation is a hand-drawing reveal: the curve grows from `pStart`
 * to `pStop` over `animationMax` seconds; the arrowhead(s) fade in on
 * completion (driven by the `zhb--drawing` class + CSS).
 */
export class ZhbLink extends ZhbDrawable {
  /** Length of the arrowhead barbs, in user units. */
  private static readonly HEAD = 8;

  /** Number of samples used to approximate the curve length. */
  private static readonly LENGTH_SAMPLES = 64;

  /** The main path element (kept for animation). */
  private path: SVGPathElement | null = null;

  /** The approximate arc length of the curve, cached for the dash reveal. */
  private length = 0;

  /**
   * @param pStart Starting point of the curve.
   * @param pStop Stopping point of the curve.
   * @param pC1 First control point (leaves `pStart`).
   * @param pC2 Second control point (arrives at `pStop`).
   * @param arrow Draw an arrowhead at `pStop` (default true).
   * @param doubleArrow Also draw an arrowhead at `pStart` (default false).
   */
  public constructor(
    private readonly pStart: ZhbPoint,
    private readonly pStop: ZhbPoint,
    private readonly pC1: ZhbPoint,
    private readonly pC2: ZhbPoint,
    private readonly arrow: boolean = true,
    private readonly doubleArrow: boolean = false,
  ) {
    super();
  }

  /**
   * Build the curve and arrowhead(s) into the group.
   * @param group The group element to populate.
   */
  protected override build(group: SVGGElement): void {
    const { pStart: s, pStop: e, pC1: c1, pC2: c2 } = this;

    const path = document.createElementNS(ZhbConstant.SVG_NS, 'path');
    path.setAttribute(
      'd',
      `M ${s.x} ${s.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${e.x} ${e.y}`,
    );
    path.setAttribute('class', 'zhb__shape zhb__link-line');
    group.appendChild(path);
    this.path = path;
    this.length = this.approxLength();

    // Arrowhead at the stop, aligned with the incoming tangent (pC2 -> pStop),
    // falling back to a near-end sample if the control point coincides with it.
    if (this.arrow) {
      const ref = ZhbLink.same(c2, e) ? this.pointAt(0.98) : c2;
      this.buildHead(group, ref.x, ref.y, e.x, e.y);
    }
    // Arrowhead at the start, aligned with the outgoing tangent (pC1 -> pStart).
    if (this.doubleArrow) {
      const ref = ZhbLink.same(c1, s) ? this.pointAt(0.02) : c1;
      this.buildHead(group, ref.x, ref.y, s.x, s.y);
    }
  }

  /**
   * Hand-draw the curve by animating a stroke-dash reveal from 0 to full length.
   *
   * @param group The mounted group.
   * @param options Animation options.
   * @returns A cancel function.
   */
  protected override animateElements(
    group: SVGGElement,
    options: ZhbAnimateOptions,
  ): () => void {
    const path = this.path;
    if (path === null) {
      return (): void => {};
    }
    const animationMax = options.animationMax ?? ANIMATION_MAX_DEFAULT;
    const durationMs = animationMax * 1000;
    const len = this.length;

    // Prime the dash so the curve starts hidden, then grows to full length.
    path.style.strokeDasharray = String(len);
    path.style.strokeDashoffset = String(len);
    // Arrowheads stay hidden until the curve completes (CSS keys off this).
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
      path.style.strokeDashoffset = String(len * (1 - t));
      if (t < 1) {
        rafId = requestAnimationFrame(frame);
      } else {
        // Settle: clear inline dash props and reveal arrowheads.
        path.style.strokeDasharray = '';
        path.style.strokeDashoffset = '';
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
      path.style.strokeDasharray = '';
      path.style.strokeDashoffset = '';
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

  /** Evaluate the cubic Bézier at parameter `t` in [0, 1]. */
  private pointAt(t: number): ZhbPoint {
    const u = 1 - t;
    const a = u * u * u;
    const b = 3 * u * u * t;
    const c = 3 * u * t * t;
    const d = t * t * t;
    return new ZhbPoint(
      a * this.pStart.x + b * this.pC1.x + c * this.pC2.x + d * this.pStop.x,
      a * this.pStart.y + b * this.pC1.y + c * this.pC2.y + d * this.pStop.y,
    );
  }

  /** Approximate the curve's arc length by sampling. */
  private approxLength(): number {
    let total = 0;
    let prev = this.pointAt(0);
    for (let i = 1; i <= ZhbLink.LENGTH_SAMPLES; i++) {
      const next = this.pointAt(i / ZhbLink.LENGTH_SAMPLES);
      total += Math.hypot(next.x - prev.x, next.y - prev.y);
      prev = next;
    }
    return total;
  }

  /** Whether two points are within a sub-pixel epsilon of each other. */
  private static same(p: ZhbPoint, q: ZhbPoint): boolean {
    return Math.abs(p.x - q.x) < 1e-6 && Math.abs(p.y - q.y) < 1e-6;
  }
}
