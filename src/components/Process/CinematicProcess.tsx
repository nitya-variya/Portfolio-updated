import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// --- ABSTRACT ANIMATED SVG ICONS ---------------------------------------------

const IconArchitecture = () => (
  <svg viewBox="0 0 100 100" className="fs_process_icon" aria-hidden="true">
    <rect x="10" y="10" width="80" height="80" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" className="fs_anim_spin" style={{ transformOrigin: '50px 50px' }} />
    <rect x="22" y="22" width="56" height="56" fill="none" stroke="#F9C176" strokeWidth="0.8" className="fs_anim_spin_reverse" style={{ transformOrigin: '50px 50px' }} />
    <rect x="34" y="34" width="32" height="32" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" className="fs_anim_spin" style={{ transformOrigin: '50px 50px', animationDuration: '12s' }} />
    <circle cx="50" cy="50" r="3" fill="#F9C176" opacity="0.9" />
    <line x1="10" y1="10" x2="25" y2="10" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
    <line x1="10" y1="10" x2="10" y2="25" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
    <line x1="90" y1="90" x2="75" y2="90" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
    <line x1="90" y1="90" x2="90" y2="75" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
    <line x1="90" y1="10" x2="75" y2="10" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
    <line x1="90" y1="10" x2="90" y2="25" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
    <line x1="10" y1="90" x2="25" y2="90" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
    <line x1="10" y1="90" x2="10" y2="75" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
    <line x1="50" y1="10" x2="50" y2="90" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
    <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
  </svg>
);

const IconKinetics = () => (
  <svg viewBox="0 0 100 100" className="fs_process_icon" aria-hidden="true">
    <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" strokeDasharray="5 4" className="fs_anim_spin_reverse" style={{ transformOrigin: '50px 50px', animationDuration: '18s' }} />
    <circle cx="50" cy="50" r="30" fill="none" stroke="#F9C176" strokeWidth="0.8" strokeDasharray="10 3" className="fs_anim_spin" style={{ transformOrigin: '50px 50px', animationDuration: '14s' }} />
    <circle cx="50" cy="50" r="16" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" className="fs_anim_pulse" style={{ transformOrigin: '50px 50px' }} />
    <circle cx="50" cy="50" r="5" fill="#FFFFFF" />
    <circle cx="50" cy="6" r="2" fill="#F9C176" opacity="0.7" className="fs_anim_spin" style={{ transformOrigin: '50px 50px', animationDuration: '14s' }} />
    <circle cx="50" cy="20" r="1.5" fill="rgba(255,255,255,0.4)" className="fs_anim_spin_reverse" style={{ transformOrigin: '50px 50px', animationDuration: '18s' }} />
  </svg>
);

const IconExecution = () => (
  <svg viewBox="0 0 100 100" className="fs_process_icon" aria-hidden="true">
    <polygon points="50,5 95,50 50,95 5,50" fill="none" stroke="#F9C176" strokeWidth="0.8" className="fs_anim_spin" style={{ transformOrigin: '50px 50px', animationDuration: '25s' }} />
    <polygon points="50,20 80,50 50,80 20,50" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" className="fs_anim_spin_reverse" style={{ transformOrigin: '50px 50px', animationDuration: '20s' }} />
    <polygon points="50,35 65,50 50,65 35,50" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" className="fs_anim_float" style={{ transformOrigin: '50px 50px' }} />
    <polygon points="50,43 57,50 50,57 43,50" fill="#F9C176" opacity="0.85" />
    <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
    <line x1="50" y1="5" x2="50" y2="95" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
    <circle cx="50" cy="5" r="2.5" fill="#F9C176" opacity="0.6" />
    <circle cx="95" cy="50" r="2.5" fill="#F9C176" opacity="0.6" />
    <circle cx="50" cy="95" r="2.5" fill="#F9C176" opacity="0.6" />
    <circle cx="5" cy="50" r="2.5" fill="#F9C176" opacity="0.6" />
  </svg>
);

// --- DATA ---------------------------------------------------------------------

const PROCESS_STEPS = [
  {
    id: '01',
    phase: 'PHASE 01',
    title: ['System', 'Architecture.'],
    desc: 'Before writing a single line of code, we define the structural integrity of the application. State management and component hierarchy are mapped for infinite scalability.',
    Icon: IconArchitecture,
  },
  {
    id: '02',
    phase: 'PHASE 02',
    title: ['Kinetic', 'Motion.'],
    desc: 'Static DOM is dead. We inject life into the browser using advanced mathematics and GSAP. Every interaction is designed with physics-based easing to feel heavy and real.',
    Icon: IconKinetics,
  },
  {
    id: '03',
    phase: 'PHASE 03',
    title: ['Absolute', 'Polish.'],
    desc: 'The final 5% is where the magic lives. Sub-pixel typography rendering, aggressive performance optimisation, and zero layout shifts. We deliver perfection.',
    Icon: IconExecution,
  },
];

// --- COMPONENT ----------------------------------------------------------------

export default function CinematicProcess() {
  const masterRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const numRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Hide steps 2 & 3 initially
      gsap.set(stepRefs.current.slice(1), { y: 120, opacity: 0, scale: 0.94 });
      // Dim number labels except the first
      gsap.set(numRefs.current.slice(1), { opacity: 0.25 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: masterRef.current,
          start: 'top top',
          end: '+=250%',
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
        },
      });

      // Progress bar fills across the entire scroll
      tl.to(progressFillRef.current, { height: '100%', ease: 'none', duration: PROCESS_STEPS.length }, 0);

      // Staggered step transitions
      PROCESS_STEPS.forEach((_, i) => {
        if (i === 0) return;

        const segStart = i;
        const outStart = segStart - 0.55;
        const inStart  = segStart - 0.1;

        // OUT: previous step
        tl.to(stepRefs.current[i - 1], { y: -130, opacity: 0, scale: 1.06, duration: 0.75, ease: 'power2.inOut' }, outStart);
        // IN: current step
        tl.to(stepRefs.current[i], { y: 0, opacity: 1, scale: 1, duration: 0.75, ease: 'power2.out' }, inStart);
        // Number label transitions
        tl.to(numRefs.current[i - 1], { opacity: 0.2, duration: 0.3 }, outStart);
        tl.to(numRefs.current[i], { opacity: 1, duration: 0.3 }, inStart);
        // Dot transitions
        tl.to(dotRefs.current[i - 1], { scale: 0.6, opacity: 0.3, duration: 0.3 }, outStart);
        tl.to(dotRefs.current[i], { scale: 1.4, opacity: 1, duration: 0.3 }, inStart);
      });
    }, masterRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="fs_process_master" ref={masterRef} id="process">

      {/* Left progress indicator */}
      <div className="fs_process_indicator" aria-hidden="true">
        <div className="fs_progress_track">
          <div className="fs_progress_fill" ref={progressFillRef} />
        </div>
        <div className="fs_indicator_items">
          {PROCESS_STEPS.map((step, i) => (
            <div className="fs_indicator_item" key={`ind-${step.id}`}>
              <span
                className="fs_indicator_dot"
                ref={el => { dotRefs.current[i] = el; }}
                style={{ transform: i === 0 ? 'scale(1.4)' : 'scale(0.6)', opacity: i === 0 ? 1 : 0.3 }}
              />
              <span
                className="fs_indicator_num"
                ref={el => { numRefs.current[i] = el; }}
              >
                {step.id}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Section label */}
      <div className="fs_process_label" aria-hidden="true">
        <span>METHODOLOGY</span>
        <span className="fs_process_label_line" />
      </div>

      {/* Steps container */}
      <div className="fs_process_container">
        {PROCESS_STEPS.map((step, index) => (
          <div
            className="fs_process_step_wrapper"
            key={`step-${step.id}`}
            ref={el => { stepRefs.current[index] = el; }}
          >
            {/* Background giant icon */}
            <div className="fs_process_icon_wrapper" aria-hidden="true">
              <step.Icon />
            </div>

            {/* Foreground typography */}
            <div className="fs_process_text_block">
              <div className="fs_pt_step">{step.phase}</div>
              <h2 className="fs_pt_title">
                {step.title.map((line, li) => (
                  <span key={li} className="fs_pt_title_line">{line}</span>
                ))}
              </h2>
              <p className="fs_pt_desc">{step.desc}</p>
              <div className="fs_pt_cta_line" aria-hidden="true">
                <span className="fs_pt_cta_bar" />
                <span className="fs_pt_cta_num">{step.id} / 03</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
