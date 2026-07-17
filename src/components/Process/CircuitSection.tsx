import { useRef, useLayoutEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface ToolItem {
  label: string;
  title: string;
  body: string;
}

export interface ToolCategory {
  category: string;
  items: ToolItem[];
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  title: string;
  body: string;
}

// Helper component to render inline SVG paths for each tool logo
function renderTechIcon(name: string) {
  switch (name.toUpperCase()) {
    case 'HTML5':
      return (
        <g transform="translate(-7, -7) scale(0.7)">
          <path d="M2,2 L18,2 L16.5,15 L10,18 L3.5,15 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M10,5 L14,5 L13.5,9.5 L10,9.5 L10,12 L12.5,11 L12.7,9.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </g>
      );
    case 'CSS3':
      return (
        <g transform="translate(-7, -7) scale(0.7)">
          <path d="M2,2 L18,2 L16.5,15 L10,18 L3.5,15 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M10,5 L14,5 L13.5,9.5 L10,9.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <path d="M6.5,5 L10,5 L10,9 L7,9" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </g>
      );
    case 'JAVASCRIPT':
      return (
        <g transform="translate(-6.5, -6.5) scale(0.65)">
          <rect x="2" y="2" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <text x="14" y="15" textAnchor="end" fontSize="9" fontWeight="bold" fontFamily="system-ui" fill="currentColor">JS</text>
        </g>
      );
    case 'REACT':
      return (
        <g transform="scale(0.75)">
          <ellipse rx="9" ry="3.5" fill="none" stroke="currentColor" strokeWidth="1.2" transform="rotate(0)" />
          <ellipse rx="9" ry="3.5" fill="none" stroke="currentColor" strokeWidth="1.2" transform="rotate(60)" />
          <ellipse rx="9" ry="3.5" fill="none" stroke="currentColor" strokeWidth="1.2" transform="rotate(120)" />
          <circle r="1.5" fill="currentColor" />
        </g>
      );
    case 'GSAP':
      return (
        <g transform="translate(-7, -7) scale(0.7)">
          <path d="M3,5 C7,1 13,1 17,5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M3,10 C7,6 13,6 17,10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M3,15 C7,11 13,11 17,15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      );
    case 'FIGMA':
      return (
        <g transform="translate(-5, -7) scale(0.7)">
          <path d="M3,3 A2,2 0 0,1 5,5 A2,2 0 0,1 3,7 A2,2 0 0,1 1,5 A2,2 0 0,1 3,3 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <path d="M7,3 A2,2 0 0,1 9,5 A2,2 0 0,1 7,7 A2,2 0 0,1 5,5 A2,2 0 0,1 7,3 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <path d="M7,8 A2,2 0 0,1 9,10 A2,2 0 0,1 7,12 A2,2 0 0,1 5,10 A2,2 0 0,1 7,8 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <path d="M3,8 A2,2 0 0,1 5,10 A2,2 0 0,1 3,12 A2,2 0 0,1 1,10 A2,2 0 0,1 3,8 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <path d="M3,13 A2,2 0 0,1 5,15 A2,2 0 0,1 3,17 A2,2 0 0,1 1,15 A2,2 0 0,1 3,13 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </g>
      );
    case 'WORDPRESS':
      return (
        <g transform="scale(0.75)">
          <circle r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M-6,-4 L-3,5 L0,-2 L3,5 L6,-4" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case 'ELEMENTOR':
      return (
        <g transform="translate(-7, -7) scale(0.7)">
          <rect x="0" y="0" width="20" height="20" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="5" y1="5" x2="5" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="10" y1="5" x2="10" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="15" y1="5" x2="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case 'CLAUDE':
      return (
        <g transform="translate(-7, -7) scale(0.7)">
          <path d="M10,2 C10,5 8,7 5,7 C8,7 10,9 10,12 C10,9 12,7 15,7 C12,7 10,5 10,2 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="10" cy="7" r="1.5" fill="currentColor" />
        </g>
      );
    case 'CHATGPT':
      return (
        <g transform="scale(0.75)">
          <circle r="2.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <path d="M0,-2.5 A3,3 0 0,1 2.5,0 A3,3 0 0,1 0,2.5 A3,3 0 0,1 -2.5,0 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <path d="M0,0 M2,-2 L4,-4 M-2,2 L-4,4 M-2,-2 L-4,-4 M2,2 L4,4" stroke="currentColor" strokeWidth="1.2" />
        </g>
      );
    case 'PYTHON':
      return (
        <g transform="translate(-7, -7) scale(0.7)">
          <path d="M10,2 L7,2 C5,2 5,3.5 5,5 L5,7 L10,7 L10,8 L4,8 C2,8 2,9.5 2,11.5 L2,14 C2,16 3.5,16 5.5,16 L7,16 L7,14.5 C7,13 8.5,13 10,13 L12,13 C14,13 14,11.5 14,10 L14,8 L9,8 L9,7 L14,7 C16,7 16,5.5 16,3.5 L16,2 A2,2 0 0,0 14,0 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="6.5" cy="4.5" r="0.8" fill="currentColor" />
          <circle cx="11.5" cy="11.5" r="0.8" fill="currentColor" />
        </g>
      );
    default:
      return (
        <circle r="3" fill="currentColor" />
      );
  }
}

interface NodeDef {
  id: string;
  cx: number;
  cy: number;
  r: number;
  label: string;
  fontSize: number;
  fontSizeMob: number;
  title: string;
  body: string;
  type: 'hub' | 'category' | 'leaf';
  color: string;
}

interface WireDef {
  id: string;
  d: string;
  type: 'trunk' | 'branch';
}

// ─── LAYOUT GEOMETRY ─────────────────────────────────────────────────────────
// SVG viewBox: 1000 × 500. Hub sits at ~160,250. Categories at ~480,110/250/390.
// Leaves at ~760,row+-45.

function buildGraph(tools: ToolCategory[]): { nodes: NodeDef[]; wires: WireDef[] } {
  const nodes: NodeDef[] = [];
  const wires: WireDef[] = [];

  const hubX = 155;
  const hubY = 250;
  const catX = 470;
  const leafX = 750;
  const catYPositions = [110, 250, 390];

  // Hub node — small ring (r=9)
  nodes.push({
    id: 'hub',
    cx: hubX,
    cy: hubY,
    r: 9,
    label: '',
    fontSize: 11,
    fontSizeMob: 10,
    title: 'Core',
    body: 'Nitya Variya — The central hub driving every layer of the build.',
    type: 'hub',
    color: '#c96121',
  });

  const cats = tools.slice(0, 3);
  // Color tokens per layer
  const catColors = ['#df7738', '#f4a261', '#e9c46a'];

  cats.forEach((cat, ci) => {
    const catY = catYPositions[ci];
    const catId = `cat-${ci}`;
    const col = catColors[ci];

    // Category node — small ring (r=7)
    nodes.push({
      id: catId,
      cx: catX,
      cy: catY,
      r: 7,
      label: cat.category.toUpperCase(),
      fontSize: 10,
      fontSizeMob: 9,
      title: cat.category,
      body: `${cat.category} layer of the tech stack.`,
      type: 'category',
      color: col,
    });

    // Trunk wire: hub to category (smooth bezier) — offsets match r=9 and r=7
    const mx = (hubX + catX) / 2;
    wires.push({
      id: `trunk-${ci}`,
      d: `M ${hubX + 9} ${hubY} C ${mx} ${hubY}, ${mx} ${catY}, ${catX - 7} ${catY}`,
      type: 'trunk',
    });

    // Leaf nodes per category (dynamic spacing based on item count)
    const leafItems = cat.items;
    const count = leafItems.length;
    const spacing = count > 3 ? 38 : 46;

    leafItems.forEach((item, li) => {
      const offset = (li - (count - 1) / 2) * spacing;
      const leafY = catY + offset;
      const leafId = `leaf-${ci}-${li}`;

      // Leaf node — small ring (r=12)
      nodes.push({
        id: leafId,
        cx: leafX,
        cy: leafY,
        r: 12,
        label: item.label,
        fontSize: 10,
        fontSizeMob: 9,
        title: item.title,
        body: item.body,
        type: 'leaf',
        color: col,
      });

      // Branch wire: category to leaf — offsets match r=7 and r=12
      const bmx = (catX + leafX) / 2;
      wires.push({
        id: `branch-${ci}-${li}`,
        d: `M ${catX + 7} ${catY} C ${bmx} ${catY}, ${bmx} ${leafY}, ${leafX - 12} ${leafY}`,
        type: 'branch',
      });
    });
  });

  return { nodes, wires };
}

// ─── DEFAULT TOOLS PROP ───────────────────────────────────────────────────────

const DEFAULT_TOOLS: ToolCategory[] = [
  {
    category: 'Foundation',
    items: [
      { label: 'HTML5', title: 'HTML5', body: 'Semantic, SEO-optimized, accessible markup.' },
      { label: 'CSS3', title: 'CSS3', body: 'Modern stylesheets using layout grids and Custom Properties.' },
      { label: 'JavaScript', title: 'JavaScript', body: 'Dynamic scripting, ES6+ modules, and async operations.' },
      { label: 'React', title: 'React', body: 'Component architecture, custom hooks, and state management.' },
    ],
  },
  {
    category: 'Creative',
    items: [
      { label: 'GSAP', title: 'GSAP', body: 'High-performance interactive motion and timeline execution.' },
      { label: 'Figma', title: 'Figma', body: 'User interface design, structural wireframes, and design systems.' },
      { label: 'WordPress', title: 'WordPress', body: 'Scalable custom themes, block layouts, and CMS control.' },
      { label: 'Elementor', title: 'Elementor', body: 'Fast visual building and custom pixel-perfect layout systems.' },
    ],
  },
  {
    category: 'Intelligence',
    items: [
      { label: 'Claude', title: 'Anthropic Claude', body: 'Large language model prompting, analysis, and API flows.' },
      { label: 'ChatGPT', title: 'OpenAI ChatGPT', body: 'Interactive code support, reasoning, and prompt pipelines.' },
      { label: 'Python', title: 'Python', body: 'Backend scripts, data structures, and terminal tools.' },
    ],
  },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────

interface CircuitSectionProps {
  tools?: ToolCategory[];
}

export default function CircuitSection({ tools = DEFAULT_TOOLS }: CircuitSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const ledRef = useRef<HTMLSpanElement>(null);
  const statusTextRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false, x: 0, y: 0, title: '', body: '',
  });

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const { nodes, wires } = buildGraph(tools);
  const trunkWires = wires.filter((w) => w.type === 'trunk');
  const branchWires = wires.filter((w) => w.type === 'branch');

  // ── Tooltip logic ──────────────────────────────────────────────────────────
  const handleNodeEnter = useCallback(
    (e: React.PointerEvent<SVGGElement>, node: NodeDef) => {
      if (!panelRef.current) return;
      const panelRect = panelRef.current.getBoundingClientRect();
      const rawX = e.clientX - panelRect.left + 12;
      const rawY = e.clientY - panelRect.top + 12;
      const tipW = 200;
      const tipH = 70;
      const clampedX = Math.min(rawX, panelRect.width - tipW - 8);
      const clampedY = Math.min(rawY, panelRect.height - tipH - 8);
      setTooltip({ visible: true, x: clampedX, y: clampedY, title: node.title, body: node.body });
    },
    []
  );

  const handleNodeMove = useCallback(
    (e: React.PointerEvent<SVGGElement>) => {
      if (!panelRef.current) return;
      const panelRect = panelRef.current.getBoundingClientRect();
      const tipW = 200;
      const tipH = 70;
      const rawX = e.clientX - panelRect.left + 12;
      const rawY = e.clientY - panelRect.top + 12;
      const clampedX = Math.min(rawX, panelRect.width - tipW - 8);
      const clampedY = Math.min(rawY, panelRect.height - tipH - 8);
      setTooltip((prev) => ({ ...prev, x: clampedX, y: clampedY }));
    },
    []
  );

  const handleNodeLeave = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  // ── GSAP animation ────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const ctx = gsap.context(() => {
      const wireEl = (id: string): SVGPathElement | null =>
        svg.querySelector(`[data-wid="${id}"]`);
      const nodeGEl = (id: string): SVGGElement | null =>
        svg.querySelector(`[data-nid="${id}"]`);
      const nodeCircleEl = (id: string): SVGCircleElement | null => {
        const g = nodeGEl(id);
        return g ? g.querySelector('circle.cs_node_circle') : null;
      };
      const nodeLabelEls = (id: string): NodeListOf<SVGTextElement> | null => {
        const g = nodeGEl(id);
        return g ? g.querySelectorAll('text') : null;
      };
      const nodeGlowEl = (id: string): SVGCircleElement | null => {
        const g = nodeGEl(id);
        return g ? g.querySelector('circle.cs_node_glow') : null;
      };

      const powerOnNode = (id: string, tl: gsap.core.Timeline, pos: string | number = '>') => {
        const circle = nodeCircleEl(id);
        const labels = nodeLabelEls(id);
        const glow = nodeGlowEl(id);

        const targetNode = nodes.find(n => n.id === id);
        const nodeColor = targetNode?.color || '#c96121';

        if (id === 'hub') {
          const logoGroup = svg.querySelector('.cs_logo_group');
          if (logoGroup) tl.to(logoGroup, { opacity: 1, duration: 0.5, ease: 'power2.out' }, pos);
        } else {
          if (circle) tl.to(circle, { attr: { stroke: nodeColor }, duration: 0.35, ease: 'power2.out' }, pos);
        }

        if (glow) tl.to(glow, { opacity: 0.22, duration: 0.5, ease: 'power2.out' }, pos);
        if (labels && labels.length > 0) {
          tl.to(Array.from(labels), { opacity: 0.9, duration: 0.35, ease: 'power2.out' }, pos);
        }
      };

      const drawWire = (
        id: string,
        tl: gsap.core.Timeline,
        pos: string | number,
        duration: number
      ) => {
        const el = wireEl(id);
        if (!el) return;
        const len = el.getTotalLength();
        gsap.set(el, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
        tl.to(el, { strokeDashoffset: 0, duration, ease: 'power2.inOut' }, pos);
      };

      if (prefersReduced) {
        // Show everything static in on-state
        nodes.forEach((n) => {
          const circle = nodeCircleEl(n.id);
          const labels = nodeLabelEls(n.id);
          const glow = nodeGlowEl(n.id);
          if (n.id === 'hub') {
            const logoGroup = svg.querySelector('.cs_logo_group');
            if (logoGroup) gsap.set(logoGroup, { opacity: 1 });
          } else {
            if (circle) gsap.set(circle, { attr: { stroke: n.color } });
          }
          if (glow) gsap.set(glow, { opacity: 0.22 });
          if (labels) gsap.set(Array.from(labels), { opacity: 0.9 });
        });
        wires.forEach((w) => {
          const el = wireEl(w.id);
          if (!el) return;
          const len = el.getTotalLength();
          gsap.set(el, { strokeDasharray: len, strokeDashoffset: 0, opacity: 1, attr: { stroke: 'url(#cs_wire_gradient)' } });
        });
        if (ledRef.current) {
          gsap.set(ledRef.current, { backgroundColor: '#c96121', boxShadow: '0 0 8px #c96121' });
        }
        if (statusTextRef.current) statusTextRef.current.textContent = 'status: online';
        return;
      }

      // Init wires to use gradient stroke and be initially hidden via dash offsets
      wires.forEach((w) => {
        const el = wireEl(w.id);
        if (!el) return;
        const len = el.getTotalLength();
        gsap.set(el, { strokeDasharray: len, strokeDashoffset: len, stroke: 'url(#cs_wire_gradient)', opacity: 1 });
      });

      const tl = gsap.timeline({ paused: true });

      // 1. Hub powers on
      powerOnNode('hub', tl, 0);

      // 2. Trunk wires draw (slight stagger)
      trunkWires.forEach((w, i) => {
        drawWire(w.id, tl, i === 0 ? '>-0.1' : `>-0.4`, 0.5);
      });

      // 3. Category nodes power on together
      const catIds = nodes.filter((n) => n.type === 'category').map((n) => n.id);
      catIds.forEach((id) => powerOnNode(id, tl, '>'));

      // 4. Branch wires draw with stagger
      branchWires.forEach((w, i) => {
        drawWire(w.id, tl, i === 0 ? '>' : '>-0.35', 0.4);
      });

      // 5. Leaf nodes power on one by one
      const leafIds = nodes.filter((n) => n.type === 'leaf').map((n) => n.id);
      leafIds.forEach((id, i) => {
        powerOnNode(id, tl, i === 0 ? '>' : '>-0.3');
      });

      // 6. Status LED flips
      tl.to(
        ledRef.current,
        {
          backgroundColor: '#c96121',
          boxShadow: '0 0 8px #c96121, 0 0 16px rgba(201,97,33,0.5)',
          duration: 0.4,
          ease: 'power2.out',
        },
        '<'
      );
      tl.add(() => {
        if (statusTextRef.current) statusTextRef.current.textContent = 'status: online';
      }, '<+0.1');

      // 7. Spawn infinite pulse dots on trunk wires (slower & cleaner)
      tl.add(() => {
        trunkWires.forEach((w) => {
          const el = wireEl(w.id);
          if (!el) return;
          const dot = svg.querySelector<SVGCircleElement>(`[data-pulse="${w.id}"]`);
          if (!dot) return;
          gsap.set(dot, { opacity: 1 });
          const dur = 3.8;
          const delay = Math.random() * 1.5;
          gsap.to(dot, {
            motionPath: {
              path: el,
              align: el,
              alignOrigin: [0.5, 0.5],
              autoRotate: false,
            },
            duration: dur,
            ease: 'none',
            repeat: -1,
            delay,
          });
        });
      }, '>');

      // ScrollTrigger — fires once when panel enters at 65%
      ScrollTrigger.create({
        trigger: panelRef.current,
        start: 'top 65%',
        once: true,
        onEnter: () => tl.play(),
      });
    }, sectionRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="cs_section" ref={sectionRef} id="craft-circuit" aria-label="Circuit — Craft Stack">

      {/* Copy block */}
      <div className="cs_copy">
        <p className="cs_index_label">
          <span className="cs_index_dot" aria-hidden="true" />
          03
        </p>
        <h2 className="cs_heading">The Circuit.</h2>
        <p className="cs_desc">
          Every interface is a living system — components wired together with precision,
          animated with purpose, and shipped without compromise. This is the stack that
          powers that pipeline.
        </p>
        <p className="cs_hint" aria-hidden="true">hover a node · desktop only</p>
      </div>

      {/* Panel */}
      <div className="cs_panel" ref={panelRef}>

        {/* Corner brackets */}
        <span className="cs_bracket cs_bracket--tl" aria-hidden="true" />
        <span className="cs_bracket cs_bracket--tr" aria-hidden="true" />
        <span className="cs_bracket cs_bracket--bl" aria-hidden="true" />
        <span className="cs_bracket cs_bracket--br" aria-hidden="true" />

        {/* Status readout */}
        <div className="cs_status" aria-live="polite" aria-label="Circuit status">
          <span className="cs_status_led" ref={ledRef} aria-hidden="true" />
          <span className="cs_status_text" ref={statusTextRef}>status: idle</span>
        </div>

        {/* SVG circuit */}
        <svg
          ref={svgRef}
          className="cs_svg"
          viewBox="0 0 1000 500"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          role="presentation"
        >
          <defs>
            <linearGradient id="cs_wire_gradient" x1="150" y1="250" x2="750" y2="250" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#c96121" />
              <stop offset="40%" stopColor="#df7738" />
              <stop offset="70%" stopColor="#f4a261" />
              <stop offset="100%" stopColor="#e9c46a" />
            </linearGradient>
            <filter id="cs_glow_filter" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="cs_pulse_glow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background trace wires (off state PCB lines) */}
          {wires.map((w) => (
            <path
              key={`bg-${w.id}`}
              d={w.d}
              fill="none"
              stroke="#2a2620"
              strokeWidth={w.type === 'trunk' ? 1.5 : 1}
              opacity={0.8}
            />
          ))}

          {/* Active Wires — animation sets stroke-dashoffset */}
          {wires.map((w) => (
            <path
              key={w.id}
              data-wid={w.id}
              d={w.d}
              fill="none"
              stroke="url(#cs_wire_gradient)"
              strokeWidth={w.type === 'trunk' ? 1.8 : 1.2}
              className="cs_wire"
              opacity={1}
            />
          ))}

          {/* Pulse dots (only on trunk wires to prevent congestion) */}
          {trunkWires.map((w) => (
            <circle
              key={`pulse-${w.id}`}
              data-pulse={w.id}
              r={2.5}
              fill="#ffffff"
              filter="url(#cs_pulse_glow)"
              opacity={0}
              className="cs_pulse_dot"
            />
          ))}

          {/* Nodes */}
          {nodes.map((node) => (
            <g
              key={node.id}
              data-nid={node.id}
              className={`cs_node cs_node--${node.type}`}
              onPointerEnter={(e) => handleNodeEnter(e, node)}
              onPointerMove={handleNodeMove}
              onPointerLeave={handleNodeLeave}
              style={{ cursor: 'crosshair' }}
              tabIndex={0}
              role="button"
              aria-label={`${node.title}: ${node.body}`}
              onFocus={() => {
                if (!panelRef.current || !svgRef.current) return;
                const panelRect = panelRef.current.getBoundingClientRect();
                const svgRect = svgRef.current.getBoundingClientRect();
                const scaleX = svgRect.width / 1000;
                const scaleY = svgRect.height / 500;
                const rawX = node.cx * scaleX + (svgRect.left - panelRect.left) + 12;
                const rawY = node.cy * scaleY + (svgRect.top - panelRect.top) + 12;
                setTooltip({ visible: true, x: rawX, y: rawY, title: node.title, body: node.body });
              }}
              onBlur={handleNodeLeave}
            >
              {/* Soft glow halo */}
              <circle
                className="cs_node_glow"
                cx={node.cx}
                cy={node.cy}
                r={node.r + 4}
                fill={node.color}
                filter="url(#cs_glow_filter)"
                opacity={0}
              />

              {node.type === 'hub' ? (
                <>
                  {/* Logo content replaced CORE circle node */}
                  <g className="cs_logo_group" transform={`translate(${node.cx - 16}, ${node.cy - 16}) scale(0.32)`} opacity={0.35}>
                    <path d="M82.0723 64.98L82.063 71.3035H82.0723L75.6523 71.4V64.98H82.0723Z" fill="#C96121" />
                    <path d="M64.0976 71.4001H52.168L63.7786 28.6001H75.708L64.0976 71.4001Z" fill="white" />
                    <path d="M52.1668 28.6001H41.4668V71.4001H52.1668V28.6001Z" fill="white" />
                    <path d="M29.8572 71.4001H17.9277L29.5316 28.6001H41.4677L29.8572 71.4001Z" fill="white" />
                  </g>
                  {/* Blinking indicator LED dot beside the logo */}
                  <circle
                    className="cs_logo_blink_dot"
                    cx={node.cx + 20}
                    cy={node.cy - 12}
                    r={2.5}
                    fill="#C96121"
                  />
                </>
              ) : node.type === 'leaf' ? (
                <>
                  {/* Leaf outer ring */}
                  <circle
                    className="cs_node_circle"
                    cx={node.cx}
                    cy={node.cy}
                    r={node.r}
                    fill="#0a0a0a"
                    stroke="#2a2620"
                    strokeWidth={1.5}
                  />
                  {/* Inline tech icon centered inside node */}
                  <g
                    transform={`translate(${node.cx}, ${node.cy})`}
                    style={{ color: node.color, pointerEvents: 'none' }}
                  >
                    {renderTechIcon(node.label)}
                  </g>
                </>
              ) : (
                /* Category Node Ring */
                <circle
                  className="cs_node_circle"
                  cx={node.cx}
                  cy={node.cy}
                  r={node.r}
                  fill="#0a0a0a"
                  stroke="#2a2620"
                  strokeWidth={1.5}
                />
              )}

              {/* Label positions */}
              {node.type === 'category' && (
                <text
                  x={node.cx - node.r - 8}
                  y={node.cy - node.r - 5}
                  textAnchor="end"
                  dominantBaseline="auto"
                  className="cs_node_label"
                  opacity={0}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: `${node.fontSize}px`,
                    fill: '#f1ede6',
                    letterSpacing: '0.08em',
                  }}
                >
                  {node.label}
                </text>
              )}
              {node.type === 'leaf' && (
                <text
                  x={node.cx + node.r + 10}
                  y={node.cy}
                  textAnchor="start"
                  dominantBaseline="middle"
                  className="cs_node_label"
                  opacity={0}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: `${node.fontSize}px`,
                    fill: '#f1ede6',
                    letterSpacing: '0.08em',
                  }}
                >
                  {node.label}
                </text>
              )}
            </g>
          ))}
        </svg>

        {/* Tooltip */}
        <div
          ref={tooltipRef}
          className={`cs_tooltip${tooltip.visible ? ' cs_tooltip--visible' : ''}`}
          style={{ left: tooltip.x, top: tooltip.y }}
          aria-hidden="true"
        >
          <span className="cs_tooltip_title">{tooltip.title}</span>
          <span className="cs_tooltip_body">{tooltip.body}</span>
        </div>
      </div>
    </section>
  );
}
