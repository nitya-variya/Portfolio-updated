// ── Interactive SVG Wireframe Animations for Capabilities Section ────────────

const NS = "http://www.w3.org/2000/svg";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const norm = (v: unknown) =>
  typeof v === "number" && Number.isFinite(v) ? clamp(v, 0, 1) : 0.5;

const hex = (s: string): [number, number, number] => {
  const clean = s.trim().replace(/^#/, "");
  const n = parseInt(clean, 16);
  if (isNaN(n)) return [232, 105, 31];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const mix = (
  a: [number, number, number],
  b: [number, number, number],
  t: number
) =>
  "rgb(" +
  a.map((v, i) => Math.round(lerp(v, b[i], t))).join(",") +
  ")";

const rgb = (a: [number, number, number]) => "rgb(" + a.join(",") + ")";

const reducedMotion = () =>
  typeof matchMedia !== "undefined" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches;

interface SpringState {
  x: number;
  v: number;
}

// damped spring: s={x,v}; returns true while still moving
function spr(s: SpringState, tg: number, dt: number, k = 170, d = 22) {
  s.v += (k * (tg - s.x) - d * s.v) * dt;
  s.x += s.v * dt;
  return Math.abs(s.v) > 0.02 || Math.abs(tg - s.x) > 0.02;
}

export interface AnimationHandle {
  update: (next: Record<string, unknown>) => void;
  destroy: () => Promise<void>;
}

export interface AnimationOptions {
  onRead?: (cap: string) => void;
  intensity?: number;
  label?: string;
}

/* ==========================================================================
   FIGURE 1: EXPLODED STACK (Frontend Architecture)
   ========================================================================== */
const W = 200;
const H = 160;
const U = 6;
const CX = U * Math.cos(Math.PI / 6);
const CY = U * Math.sin(Math.PI / 6);
const A = 12;
const B = 9;
const T = 2.5; // plate footprint (grid units) and thickness (screen units)

const rect = (x: number, y: number, w: number, h: number) => ({
  pts: [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ] as [number, number][],
  closed: true,
});

const line = (...pts: [number, number][]) => ({ pts, closed: false });

const nodes: [number, number][] = [
  [2.5, 2],
  [6, 2],
  [9.5, 2],
  [4.2, 6.5],
  [8, 6.5],
];

const links: [number, number][] = [
  [0, 1],
  [1, 2],
  [0, 3],
  [1, 3],
  [1, 4],
  [2, 4],
  [3, 4],
];

interface ShapeDef {
  pts: [number, number][];
  closed: boolean;
}

const DEF: { cap: string; shapes: ShapeDef[] }[] = [
  {
    cap: "Layer 1 of 4 · Data and API · typed contracts",
    shapes: [
      ...[0, 1, 2].flatMap((r) =>
        [0, 1, 2, 3].map((c) => rect(1.5 + c * 2.6, 1.5 + r * 2.4, 1.6, 1.4))
      ),
      line([1.5, 8], [10.5, 8]),
    ],
  },
  {
    cap: "Layer 2 of 4 · Next.js server · routes streamed with RSC",
    shapes: [0, 1, 2, 3].flatMap((r) => [
      rect(1.5, 1.4 + r * 1.9, 9, 1.1),
      line([2.4, 1.95 + r * 1.9], [5, 1.95 + r * 1.9]),
    ]),
  },
  {
    cap: "Layer 3 of 4 · State and hooks · predictable data flow",
    shapes: [
      ...links.map(([a, b]) => line(nodes[a], nodes[b])),
      ...nodes.map(([x, y]) => rect(x - 0.7, y - 0.7, 1.4, 1.4)),
    ],
  },
  {
    cap: "Layer 4 of 4 · Components · accessible and pixel-perfect",
    shapes: [
      rect(1, 1, 10, 1.5),
      rect(1, 3.2, 4.7, 3.6),
      rect(6.3, 3.2, 4.7, 3.6),
      line([1.8, 4.3], [4.9, 4.3]),
      line([7.1, 4.3], [10.2, 4.3]),
      rect(1, 7.4, 3.2, 1),
    ],
  },
];
const REST = "Frontend architecture · four layers";

const palette = (h: HTMLElement) => {
  const s = getComputedStyle(h);
  const c = (n: string, f: string): [number, number, number] => {
    const val = s.getPropertyValue(n).trim();
    return val ? hex(val) : hex(f);
  };
  return {
    HI: c("--hairline-hi", "#e8691f"),
    EDGE: c("--hairline-edge", "#8a7f76"),
    MID: c("--hairline-mid", "#4a4541"),
  };
};

export function exploded(
  host: HTMLElement,
  o: AnimationOptions = {}
): AnimationHandle {
  const opts = { ...o };
  let ptr: { x: number; y: number } | null = null;
  let raf = 0;
  let last = 0;
  let visible = true;
  let closing = false;
  let tClose = 0;
  let lastCap = "";
  let done: Promise<void> | null = null;
  let resolveDone: () => void = () => {};

  const pal = palette(host);
  const HI = pal.HI;
  const EDGE = pal.EDGE;
  const MID = pal.MID;

  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("role", "img");
  svg.setAttribute(
    "aria-label",
    opts.label ||
      "Isometric app window pulled apart into four layers: components, state, server and data"
  );
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("stroke-linecap", "round");
  (svg.style as CSSStyleDeclaration).touchAction = "pan-y";

  const mk = (parent: SVGElement, fill: boolean | number) => {
    const p = document.createElementNS(NS, "path");
    p.setAttribute("vector-effect", "non-scaling-stroke");
    (p.style as CSSStyleDeclaration).setProperty("stroke-width", "var(--hairline-stroke, .9)");
    (p.style as CSSStyleDeclaration).setProperty("fill", fill ? "var(--hairline-plate, #0b0b0b)" : "none");
    parent.appendChild(p);
    return p;
  };

  const L = DEF.map((def) => {
    const g = document.createElementNS(NS, "g");
    svg.appendChild(g);
    return {
      def,
      g,
      left: mk(g, 1),
      right: mk(g, 1),
      top: mk(g, 1),
      shapes: def.shapes.map((s) => ({ s, p: mk(g, s.closed) })),
      z: { x: 0, v: 0 },
      a: { x: 0, v: 0 },
      op: { x: 0, v: 0 },
    };
  });

  let ox = 100;
  let oy = 80;
  const P = (x: number, y: number, z: number) =>
    `${(ox + (x - y) * CX).toFixed(2)},${(oy + (x + y) * CY - z).toFixed(2)}`;
  const poly = (pts: [number, number][], z: number) =>
    "M" + pts.map(([x, y]) => P(x, y, z)).join("L");

  function draw(l: (typeof L)[0]) {
    const z = l.z.x;
    const a = clamp(l.a.x, 0, 1);
    l.g.style.opacity = `${clamp(l.op.x, 0, 1)}`;
    l.g.style.stroke = mix(MID, HI, a);
    l.top.style.stroke = mix(EDGE, HI, a);
    l.left.style.stroke = l.right.style.stroke = mix(MID, HI, a * 0.7);
    l.top.setAttribute("d", poly([[0, 0], [A, 0], [A, B], [0, B]], z) + "Z");
    l.right.setAttribute("d", `${poly([[A, 0], [A, B]], z)}L${P(A, B, z - T)}L${P(A, 0, z - T)}Z`);
    l.left.setAttribute("d", `${poly([[0, B], [A, B]], z)}L${P(A, B, z - T)}L${P(0, B, z - T)}Z`);
    for (const { s, p } of l.shapes) {
      p.setAttribute("d", poly(s.pts, z) + (s.closed ? "Z" : ""));
    }
  }

  const t0 = performance.now();
  const reduced = reducedMotion();

  function tick(now: number) {
    raf = 0;
    const dt = Math.min(0.032, (now - last) / 1000 || 0.016);
    last = now;
    const t = (now - t0) / 1000;
    const gapMax = lerp(16, 24, norm(opts.intensity));
    const gap = ptr ? lerp(9, gapMax, ptr.x) : 12 + (reduced ? 0 : 2 * Math.sin(t * 0.9));
    let act = -1;
    if (ptr) act = 3 - clamp(Math.floor(ptr.y * 4), 0, 3);
    else if (!reduced) act = 3 - (Math.floor(t / 2.4) % 4);

    let moving = false;
    L.forEach((l, i) => {
      const born = now - t0 >= i * 70;
      const alive = born && !(closing && now - tClose >= (3 - i) * 50);
      const lift = act >= 0 && i > act ? 7 : 0; // open room above the picked layer
      moving = spr(l.z, alive ? i * gap + lift : 0, dt) || moving;
      moving = spr(l.a, alive && act === i ? 1 : 0, dt) || moving;
      moving = spr(l.op, alive ? 1 : 0, dt) || moving;
    });

    // keep the whole stack optically centred as it opens
    const zt = L[3].z.x;
    const total = (A + B) * CY + zt + T;
    oy = (H - total) / 2 + zt + T;
    ox = W / 2 - ((A - B) * CX) / 2;
    L.forEach(draw);

    const c = act >= 0 && !closing ? DEF[act].cap : REST;
    if (c !== lastCap) {
      lastCap = c;
      opts.onRead?.(c);
    }

    if (closing && L.every((l) => l.op.x < 0.02)) {
      if (svg.parentElement) svg.parentElement.removeChild(svg);
      io.disconnect();
      resolveDone();
      return;
    }

    if (visible && (moving || closing || (!ptr && !reduced))) {
      raf = requestAnimationFrame(tick);
    }
  }

  const wake = () => {
    if (!raf && visible) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  };

  const setPtr = (e: PointerEvent) => {
    const r = svg.getBoundingClientRect();
    ptr = {
      x: clamp((e.clientX - r.left) / r.width, 0, 1),
      y: clamp((e.clientY - r.top) / r.height, 0, 1),
    };
    wake();
  };

  const clear = () => {
    ptr = null;
    wake();
  };

  svg.addEventListener("pointermove", setPtr);
  svg.addEventListener("pointerdown", setPtr);
  svg.addEventListener("pointerleave", clear);
  svg.addEventListener("pointercancel", clear);

  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) wake();
  });
  io.observe(host);
  host.appendChild(svg);
  wake();

  return {
    update(next: Record<string, unknown>) {
      for (const [k, v] of Object.entries(next)) {
        if (v === undefined) delete (opts as Record<string, unknown>)[k];
        else (opts as Record<string, unknown>)[k] = v;
      }
      if ("label" in next) {
        svg.setAttribute(
          "aria-label",
          opts.label || "Isometric app window pulled apart into four layers"
        );
      }
      wake();
    },
    destroy() {
      if (done) return done;
      done = new Promise<void>((r) => (resolveDone = r));
      closing = true;
      tClose = performance.now();
      visible = true;
      wake();
      return done;
    },
  };
}

/* ==========================================================================
   SHARED SCENE BASE & SOLID HELPERS
   ========================================================================== */
const mkp = (par: SVGElement, fill: boolean | number) => {
  const p = document.createElementNS(NS, "path");
  p.setAttribute("vector-effect", "non-scaling-stroke");
  (p.style as CSSStyleDeclaration).setProperty("stroke-width", "var(--hairline-stroke, .9)");
  (p.style as CSSStyleDeclaration).setProperty("fill", fill ? "var(--hairline-plate, #0b0b0b)" : "none");
  par.appendChild(p);
  return p as SVGPathElement;
};

const D = (pts: [number, number][]) =>
  "M" + pts.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join("L");
const Z = (pts: [number, number][]) => D(pts) + "Z";

function hull(pts: [number, number][]) {
  const sorted = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o: [number, number], a: [number, number], b: [number, number]) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: [number, number][] = [];
  const up: [number, number][] = [];
  for (const p of sorted) {
    while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop();
    lo.push(p);
  }
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop();
    up.push(p);
  }
  lo.pop();
  up.pop();
  return lo.concat(up);
}

const rrect = (
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  r: number,
  n = 6
): [number, number][] => {
  const o: [number, number][] = [];
  [
    [x1 - r, y0 + r, -90],
    [x1 - r, y1 - r, 0],
    [x0 + r, y1 - r, 90],
    [x0 + r, y0 + r, 180],
  ].forEach(([cx, cy, a0]) => {
    for (let i = 0; i <= n; i++) {
      const a = ((a0 + (i * 90) / n) * Math.PI) / 180;
      o.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  });
  return o;
};

const circ = (cx: number, cy: number, r: number, n = 28): [number, number][] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });

const solid = (par: SVGElement) => ({
  side: mkp(par, 1),
  top: mkp(par, 1),
});

const setSolid = (
  s: { side: SVGPathElement; top: SVGPathElement },
  P: (x: number, y: number, z: number) => [number, number],
  ring: [number, number][],
  z0: number,
  z1: number
) => {
  const b = ring.map(([x, y]) => P(x, y, z0));
  const t = ring.map(([x, y]) => P(x, y, z1));
  s.side.setAttribute("d", Z(hull([...b, ...t])));
  s.top.setAttribute("d", Z(t));
};

const stroke = (s: { side: SVGPathElement; top: SVGPathElement }, col: string) => {
  s.side.style.stroke = s.top.style.stroke = col;
};

const EASE: [string, (u: number) => number][] = [
  ["linear", (u) => u],
  ["ease-out cubic", (u) => 1 - Math.pow(1 - u, 3)],
  ["ease-in-out", (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2)],
  ["spring overshoot", (u) => 1 - Math.cos(u * Math.PI * 3.2) * Math.exp(-u * 4.5)],
];

interface BaseContext {
  t: number;
  dt: number;
  ptr: { x: number; y: number } | null;
  k: number;
  mv: boolean;
}

function base(
  host: HTMLElement,
  o: AnimationOptions = {},
  label: string,
  build: (
    g: SVGGElement,
    pal: { HI: [number, number, number]; EDGE: [number, number, number]; MID: [number, number, number] }
  ) => (c: BaseContext) => string
): AnimationHandle {
  const opts = { ...o };
  let ptr: { x: number; y: number } | null = null;
  let raf = 0;
  let last = 0;
  let vis = true;
  let closing = false;
  let lastCap = "";
  let done: Promise<void> | null = null;
  let res: () => void = () => {};

  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", opts.label || label);
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("stroke-linecap", "round");
  (svg.style as CSSStyleDeclaration).touchAction = "pan-y";

  const g = document.createElementNS(NS, "g");
  svg.appendChild(g);
  const step = build(g, palette(host));
  const op: SpringState = { x: 0, v: 0 };
  const t0 = performance.now();
  const reduced = reducedMotion();

  function tick(now: number) {
    raf = 0;
    const dt = Math.min(0.032, (now - last) / 1000 || 0.016);
    last = now;
    const c: BaseContext = {
      t: (now - t0) / 1000,
      dt,
      ptr,
      k: norm(opts.intensity),
      mv: false,
    };
    const cap = step(c);
    c.mv = spr(op, closing ? 0 : 1, dt) || c.mv;
    g.style.opacity = `${clamp(op.x, 0, 1)}`;
    if (cap !== lastCap) {
      lastCap = cap;
      opts.onRead?.(cap);
    }
    if (closing && op.x < 0.02) {
      if (svg.parentElement) svg.parentElement.removeChild(svg);
      io.disconnect();
      res();
      return;
    }
    if (vis && (c.mv || closing || (!ptr && !reduced))) {
      raf = requestAnimationFrame(tick);
    }
  }

  const wake = () => {
    if (!raf && vis) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  };

  const setPtr = (e: PointerEvent) => {
    const r = svg.getBoundingClientRect();
    ptr = {
      x: clamp((e.clientX - r.left) / r.width, 0, 1),
      y: clamp((e.clientY - r.top) / r.height, 0, 1),
    };
    wake();
  };

  const clear = () => {
    ptr = null;
    wake();
  };

  svg.addEventListener("pointermove", setPtr);
  svg.addEventListener("pointerdown", setPtr);
  svg.addEventListener("pointerleave", clear);
  svg.addEventListener("pointercancel", clear);

  const io = new IntersectionObserver(([e]) => {
    vis = e.isIntersecting;
    if (vis) wake();
  });
  io.observe(host);
  host.appendChild(svg);
  wake();

  return {
    update(n: Record<string, unknown>) {
      for (const [k, v] of Object.entries(n)) {
        if (v === undefined) delete (opts as Record<string, unknown>)[k];
        else (opts as Record<string, unknown>)[k] = v;
      }
      wake();
    },
    destroy() {
      if (done) return done;
      done = new Promise<void>((r) => (res = r));
      closing = true;
      vis = true;
      wake();
      return done;
    },
  };
}

/* ==========================================================================
   FIGURE 2: EASING BARS (Web & Motion Animation)
   ========================================================================== */
export function motion(
  host: HTMLElement,
  o: AnimationOptions = {}
): AnimationHandle {
  return base(
    host,
    o,
    "Isometric row of cylinders whose heights sample an easing curve, with a playhead bead sliding on a rail",
    (g, pal) => {
      const { HI, EDGE, MID } = pal;
      const S = 1.4;
      const N = 11;
      const GX = 1.55;
      const XL = (N - 1) * GX;
      const RZ = 34;

      const P = (x: number, y: number, z: number): [number, number] => [
        43.6 + (x - y) * CX * S,
        67 + (x + y) * CY * S - z * S,
      ];
      const bs = solid(g);
      stroke(bs, rgb(EDGE));
      setSolid(bs, P, rrect(-1.2, -1.3, XL + 1.2, 1.3, 1.2), -1.6, 0);

      const lip = mkp(g, 0);
      lip.style.stroke = rgb(MID);
      lip.setAttribute(
        "d",
        Z(rrect(-0.8, -0.9, XL + 0.8, 0.9, 0.8).map(([x, y]) => P(x, y, 0)))
      );

      const post = (x: number) => {
        const s = solid(g);
        stroke(s, rgb(EDGE));
        setSolid(s, P, circ(x, 0, 0.2, 16), 0, RZ - 0.6);
        return s;
      };
      post(-0.9);

      const rings = Array.from({ length: N }, (_, i) => circ(i * GX, 0, 0.58));
      const cyl = rings.map(() => ({ s: solid(g), h: { x: 2, v: 0 } }));
      post(XL + 0.9);

      const curve = mkp(g, 0);
      const guide = mkp(g, 0);
      const mark = mkp(g, 1);
      curve.style.stroke = rgb(MID);
      guide.style.stroke = rgb(HI);
      mark.style.stroke = rgb(HI);
      guide.style.strokeDasharray = "0.1 3.2";

      const rail = solid(g);
      stroke(rail, rgb(EDGE));
      setSolid(rail, P, rrect(-1.2, -0.3, XL + 1.2, 0.3, 0.3, 4), RZ - 0.8, RZ);

      const bead = solid(g);
      stroke(bead, rgb(HI));

      const bx = { x: XL / 2, v: 0 };
      const pts = Array.from({ length: 41 }, (_, i) => i / 40);
      const reduced = reducedMotion();

      return (c: BaseContext) => {
        const ez = c.ptr
          ? clamp(Math.floor(c.ptr.y * 4), 0, 3)
          : reduced
          ? 1
          : Math.floor(c.t / 3.5) % 4;
        const tgt = c.ptr
          ? clamp((c.ptr.x - 0.12) / 0.76, 0, 1) * XL
          : XL * (0.5 + (reduced ? 0 : 0.5 * Math.sin(c.t * 0.6 - 1.57)));
        c.mv = spr(bx, tgt, c.dt) || c.mv;
        const f = EASE[ez][1];
        const xb = clamp(bx.x, 0, XL);
        const fi = xb / GX;
        const zf = (u: number) => 2 + 20 * f(u);

        cyl.forEach((cy, i) => {
          const k = 150 - i * 5;
          c.mv = spr(cy.h, zf(i / (N - 1)), c.dt, k, 1.25 * Math.sqrt(k)) || c.mv;
          setSolid(cy.s, P, rings[i], 0, Math.max(cy.h.x, 0.4));
          stroke(cy.s, mix(EDGE, HI, clamp(1 - Math.abs(i - fi) / 1.7, 0, 1)));
        });

        curve.setAttribute("d", D(pts.map((u) => P(u * XL, 0, zf(u)))));
        const zv = zf(xb / XL);
        guide.setAttribute("d", D([P(xb, 0, RZ - 0.6), P(xb, 0, zv + 0.4)]));
        mark.setAttribute("d", Z(circ(xb, 0, 0.3, 16).map(([x, y]) => P(x, y, zv))));
        setSolid(bead, P, circ(xb, 0, 0.55, 20), RZ - 0.6, RZ + 1.1);

        return `Easing · ${EASE[ez][0]} · f(${(xb / XL).toFixed(2)}) = ${f(xb / XL).toFixed(2)}`;
      };
    }
  );
}

/* ==========================================================================
   FIGURE 3: RADIUS SCALE (UI / UX & Design Systems)
   ========================================================================== */
const RAD = ["0", "4px", "8px", "16px", "full"];

export function tokens(
  host: HTMLElement,
  o: AnimationOptions = {}
): AnimationHandle {
  return base(
    host,
    o,
    "Five rounded tiles growing in size and corner radius from square to circle on a slim base; the picked step lifts",
    (g, pal) => {
      const { HI, EDGE, MID } = pal;
      const S = 1.62;
      const TH = 6;
      const LIFT = 9;

      const P = (x: number, y: number, z: number): [number, number] => [
        155.6 + (x - y) * CX * S,
        45.2 + (x + y) * CY * S - z * S,
      ];
      const HS = [0.7, 0.9, 1.1, 1.3, 1.5];
      const YC = [0, 2.5, 5.4, 8.7, 12.4];
      const RR = [0, 0.25, 0.5, 0.75, 1];

      const bs = solid(g);
      stroke(bs, rgb(EDGE));
      setSolid(bs, P, rrect(-2.3, -2, 2.3, 15.2, 1.6), -1.6, 0);

      const lip = mkp(g, 0);
      lip.style.stroke = rgb(MID);
      lip.setAttribute(
        "d",
        Z(rrect(-1.8, -1.5, 1.8, 14.7, 1.2).map(([x, y]) => P(x, y, 0)))
      );

      const drop = mkp(g, 0);
      drop.style.stroke = rgb(HI);
      drop.style.strokeDasharray = "0.1 3.2";

      const tiles = HS.map((hs, i) => ({
        i,
        hs,
        yc: YC[i],
        r: hs * RR[i],
        s: solid(g),
        z: { x: 0, v: 0 },
      }));

      const inner = mkp(g, 0);
      inner.style.stroke = rgb(HI);

      const da = { x: 0, v: 0 };
      const reduced = reducedMotion();

      return (c: BaseContext) => {
        let y = -99;
        if (c.ptr) {
          const u = (c.ptr.x * W - 155.6) / (CX * S);
          const v = (c.ptr.y * H - 45.2) / (CY * S) + TH / CY;
          y = (v - u) / 2;
        } else if (!reduced) {
          y = 6.2 + 6.4 * Math.sin(c.t * 0.55 - 1.57);
        }

        const R = lerp(2.2, 4.2, c.k);
        let act: (typeof tiles)[0] | null = null;
        let best = 0.3;

        tiles.forEach((t) => {
          const a = Math.pow(Math.max(0, 1 - Math.abs(y - t.yc) / R), 2);
          c.mv = spr(t.z, LIFT * a, c.dt) || c.mv;
          setSolid(t.s, P, rrect(-t.hs, t.yc - t.hs, t.hs, t.yc + t.hs, t.r, 8), t.z.x, t.z.x + TH);
          stroke(t.s, mix(EDGE, HI, a));
          if (a > best) {
            best = a;
            act = t;
          }
        });

        if (act) {
          const active = act as (typeof tiles)[0];
          const top = active.z.x + TH;
          const h = active.hs - 0.3;
          inner.setAttribute(
            "d",
            Z(
              rrect(-h, active.yc - h, h, active.yc + h, Math.max(active.r - 0.3, 0), 8).map(
                ([x, yy]) => P(x, yy, top)
              )
            )
          );
          drop.setAttribute(
            "d",
            D([P(0, active.yc, 0), P(0, active.yc, Math.max(active.z.x - 1, 0))])
          );
        }

        c.mv = spr(da, act ? 1 : 0, c.dt) || c.mv;
        inner.style.opacity = drop.style.opacity = `${clamp(da.x, 0, 1)}`;

        return act
          ? `Radius · step ${(act as (typeof tiles)[0]).i + 1} of 5 · ${RAD[(act as (typeof tiles)[0]).i]}`
          : "Radius scale · five steps";
      };
    }
  );
}

/* ==========================================================================
   FIGURE 4: ORBIT (Creative Coding & 3D)
   ========================================================================== */
export function lab(
  host: HTMLElement,
  o: AnimationOptions = {}
): AnimationHandle {
  return base(
    host,
    o,
    "A minimal armillary sphere: three rings spinning on a tilted axis with a satellite on an orbit, above a round plinth",
    (g, pal) => {
      const { HI, EDGE, MID } = pal;
      const S = 1.5;
      const U_SCALE = 6;
      const ZC = 5.3;
      const R = 2.9;
      const RO = 4.5;
      const T2 = Math.PI * 2;
      const Q6 = Math.sqrt(6);

      // z in the same unit as x,y: true isometric
      const P = (x: number, y: number, z: number): [number, number] => [
        100 + (x - y) * CX * S,
        107 + (x + y) * CY * S - z * U_SCALE * S,
      ];

      const pl = solid(g);
      stroke(pl, rgb(EDGE));
      setSolid(pl, P, circ(0, 0, 4.1, 56), -0.8, 0);

      const lip = mkp(g, 0);
      lip.style.stroke = rgb(MID);
      lip.setAttribute("d", Z(circ(0, 0, 3.5, 56).map(([x, y]) => P(x, y, 0))));

      const drop = mkp(g, 0);
      drop.style.stroke = rgb(MID);
      drop.style.strokeDasharray = "0.1 3.2";
      drop.setAttribute("d", D([P(0, 0, 0), P(0, 0, ZC - R)]));

      const oB = mkp(g, 0);
      const tB = mkp(g, 0);
      const sB = mkp(g, 0);
      const sph = mkp(g, 1);
      const rB = mkp(g, 0);
      const rF = mkp(g, 0);
      const oF = mkp(g, 0);
      const tF = mkp(g, 0);
      const sF = mkp(g, 0);

      oB.style.stroke = rB.style.stroke = rgb(MID);
      oB.style.opacity = rB.style.opacity = "0.7";
      sph.style.stroke = rF.style.stroke = oF.style.stroke = rgb(EDGE);
      tB.style.stroke = tF.style.stroke = rgb(HI);
      (tB.style as CSSStyleDeclaration).strokeWidth = (tF.style as CSSStyleDeclaration).strokeWidth = "1.4";
      sB.style.fill = sF.style.fill = sB.style.stroke = sF.style.stroke = rgb(HI);

      // sphere silhouette = great circle perpendicular to the view axis (1,1,1)
      sph.setAttribute(
        "d",
        Z(
          Array.from({ length: 72 }, (_, i) => {
            const a = (i / 72) * T2;
            const c = Math.cos(a);
            const s = Math.sin(a);
            return P(
              R * (c / Math.SQRT2 + s / Q6),
              R * (-c / Math.SQRT2 + s / Q6),
              ZC - (2 * R * s) / Q6
            );
          })
        )
      );

      const fmt = (p: [number, number]) => p[0].toFixed(1) + "," + p[1].toFixed(1);

      // split a polyline into front / back segments by depth (x+y+z) relative to the sphere centre
      const split = (
        pts: [number, number, number][],
        tf: (p: [number, number, number]) => [number, number, number]
      ): [string, string] => {
        let f = "";
        let b = "";
        const q = pts.map((p) => {
          const t = tf(p);
          return [P(t[0], t[1], t[2] + ZC), t[0] + t[1] + t[2]] as [[number, number], number];
        });
        for (let i = 0; i < q.length - 1; i++) {
          const s = "M" + fmt(q[i][0]) + "L" + fmt(q[i + 1][0]);
          if (q[i][1] + q[i + 1][1] > 0) f += s;
          else b += s;
        }
        return [f, b];
      };

      const arc = (
        f: (a: number) => [number, number, number],
        n = 64
      ): [number, number, number][] =>
        Array.from({ length: n + 1 }, (_, i) => f((i / n) * T2));

      const rings = [
        (a: number) => [R * Math.cos(a), R * Math.sin(a), 0] as [number, number, number],
        (a: number) => [R * Math.cos(a), 0, R * Math.sin(a)] as [number, number, number],
        (a: number) => [0, R * Math.cos(a), R * Math.sin(a)] as [number, number, number],
      ].map((f) => arc(f));

      // orbit: horizontal circle, tilted about x by PHI then turned about z by PSI (normal is not perpendicular to the view axis)
      const PHI = -0.9;
      const PSI = 0.8;
      const cp = Math.cos(PHI);
      const sp_ = Math.sin(PHI);
      const cz = Math.cos(PSI);
      const sz = Math.sin(PSI);

      const orbPt = (a: number): [number, number, number] => {
        const x = RO * Math.cos(a);
        const y = RO * Math.sin(a);
        const y1 = y * cp;
        return [x * cz - y1 * sz, x * sz + y1 * cz, y * sp_];
      };

      const [of, ob] = split(arc(orbPt, 96), (p) => p);
      oF.setAttribute("d", of);
      oB.setAttribute("d", ob);

      const rot = (
        p: [number, number, number],
        th: number,
        tl: number
      ): [number, number, number] => {
        const c = Math.cos(th);
        const s = Math.sin(th);
        const x1 = p[0] * c - p[1] * s;
        const y1 = p[0] * s + p[1] * c;
        const ct = Math.cos(tl);
        const st = Math.sin(tl);
        return [x1, y1 * ct - p[2] * st, y1 * st + p[2] * ct];
      };

      let th = 0;
      let sa = 0;
      const w = { x: 0.55, v: 0 };
      const tl = { x: 0.42, v: 0 };
      const reduced = reducedMotion();

      return (c: BaseContext) => {
        c.mv =
          spr(
            w,
            c.ptr ? 0.55 + (c.ptr.x - 0.5) * 3.6 : reduced ? 0 : 0.55,
            c.dt
          ) || c.mv;
        c.mv =
          spr(
            tl,
            c.ptr ? lerp(0.15, 0.75, c.ptr.y) : 0.42 + (reduced ? 0 : 0.06 * Math.sin(c.t * 0.5)),
            c.dt
          ) || c.mv;

        th += w.x * c.dt;
        sa += (reduced && !c.ptr ? 0 : 1.1) * c.dt;

        let rf = "";
        let rb = "";
        rings.forEach((r) => {
          const [f, b] = split(r, (p) => rot(p, th, tl.x));
          rf += f;
          rb += b;
        });
        rF.setAttribute("d", rf);
        rB.setAttribute("d", rb);

        const [tf, tb] = split(
          Array.from({ length: 25 }, (_, i) => orbPt(sa - 1.1 + (i * 1.1) / 24)),
          (p) => p
        );
        tF.setAttribute("d", tf);
        tB.setAttribute("d", tb);

        const sp = orbPt(sa);
        const sc = P(sp[0], sp[1], sp[2] + ZC);
        const dot = Z(
          Array.from({ length: 14 }, (_, i) => {
            const a = (i / 14) * T2;
            return [sc[0] + 3 * Math.cos(a), sc[1] + 3 * Math.sin(a)];
          })
        );
        const front = sp[0] + sp[1] + sp[2] > 0;
        sF.setAttribute("d", front ? dot : "");
        sB.setAttribute("d", front ? "" : dot);

        return `rotateZ(${String(
          Math.round((((th * 180) / Math.PI) % 360 + 360) % 360)
        ).padStart(3, "0")}°) · tilt ${Math.round((tl.x * 180) / Math.PI)}°`;
      };
    }
  );
}

export const CAPABILITY_ANIMATIONS = [exploded, motion, tokens, lab];
