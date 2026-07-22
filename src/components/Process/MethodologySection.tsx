import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import img01 from '../../assets/process_01.png';
import img02 from '../../assets/process_02.png';
import img03 from '../../assets/process_03.png';
import img04 from '../../assets/process_04.png';

gsap.registerPlugin(ScrollTrigger);

// --- DATA ---------------------------------------------------------------------

const PROCESS_STEPS = [
  {
    id: '01',
    title: 'System Architecture.',
    desc: 'Before a single line of code is written, we define the structural integrity of the application. State management, routing, and component hierarchy are mapped for infinite scalability. We build the blueprint.',
    img: img01,
  },
  {
    id: '02',
    title: 'Kinetic Prototype.',
    desc: 'Static layouts are dead. We inject life into the browser using advanced mathematics and GSAP early in the process. We give you a clear picture of the artifact, the timeline, and the cost before you commit.',
    img: img02,
  },
  {
    id: '03',
    title: 'Design and Build.',
    desc: 'Custom-coded from the ground up. Engagements run six to twelve weeks. Motion is the medium, running through every transition, scroll moment, and interaction. We build heavily and optimize ruthlessly.',
    img: img03,
  },
  {
    id: '04',
    title: 'Absolute Polish.',
    desc: "The final 5% is where the magic lives. Sub-pixel typography rendering, aggressive performance optimization, and zero layout shifts. We deliver perfection and ship to your brand's domain.",
    img: img04,
  },
];

// --- COMPONENT ----------------------------------------------------------------

export default function MethodologySection() {
  const masterRef = useRef<HTMLElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const indicatorRefs = useRef<(HTMLDivElement | null)[]>([]);

  const activeStepRef = useRef<number>(-1);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Activate step logic: highlight text, show indicator, crossfade sticky image
      const activateStep = (index: number) => {
        if (activeStepRef.current === index) return;
        activeStepRef.current = index;

        // 1. Text step opacity
        stepRefs.current.forEach((step, i) => {
          if (!step) return;
          gsap.to(step, {
            opacity: i === index ? 1 : 0.2,
            duration: 0.4,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        });

        // 2. Gold square indicator
        indicatorRefs.current.forEach((ind, i) => {
          if (!ind) return;
          if (i === index) {
            gsap.to(ind, {
              scale: 1,
              opacity: 1,
              duration: 0.4,
              ease: 'back.out(1.8)',
              overwrite: 'auto',
            });
          } else {
            gsap.to(ind, {
              scale: 0,
              opacity: 0,
              duration: 0.25,
              ease: 'power2.in',
              overwrite: 'auto',
            });
          }
        });

        // 3. Cinematic image crossfade
        imgRefs.current.forEach((img, i) => {
          if (!img) return;
          if (i === index) {
            gsap.to(img, {
              opacity: 1,
              scale: 1,
              duration: 0.55,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          } else {
            gsap.to(img, {
              opacity: 0,
              scale: 1.05,
              duration: 0.55,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          }
        });
      };

      // Initial boot state setup
      gsap.set(imgRefs.current, { opacity: 0, scale: 1.05 });
      gsap.set(stepRefs.current, { opacity: 0.2 });
      gsap.set(indicatorRefs.current, { scale: 0, opacity: 0 });

      // Activate initial step 0
      activateStep(0);

      // Per-step ScrollTriggers
      stepRefs.current.forEach((step, i) => {
        if (!step) return;
        ScrollTrigger.create({
          trigger: step,
          start: 'top 55%',
          end: 'bottom 45%',
          onToggle: (self) => {
            if (self.isActive) {
              activateStep(i);
            }
          },
        });
      });

      // Refresh ScrollTrigger once DOM layout settles
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        });
      });
    }, masterRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="fs_methodology_master" ref={masterRef} id="methodology">
      <div className="fs_methodology_header">
        <h2 className="fs_mh_title">How we work.</h2>
      </div>

      <div className="fs_split_container">
        <div className="fs_split_left" ref={leftColRef}>
          {PROCESS_STEPS.map((step, index) => (
            <div
              className="fs_step_block"
              key={step.id}
              ref={(el) => {
                stepRefs.current[index] = el;
              }}
            >
              <div className="fs_step_meta">
                <span className="fs_step_num">{step.id}</span>
                <div
                  className="fs_step_indicator"
                  ref={(el) => {
                    indicatorRefs.current[index] = el;
                  }}
                />
              </div>

              <div className="fs_step_content">
                <h3 className="fs_step_title">{step.title}</h3>
                <p className="fs_step_desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="fs_split_right">
          <div className="fs_sticky_wrapper" ref={stickyRef}>
            <div className="fs_sticky_corner fs_sticky_corner--tl" aria-hidden="true" />
            <div className="fs_sticky_corner fs_sticky_corner--tr" aria-hidden="true" />
            <div className="fs_sticky_corner fs_sticky_corner--bl" aria-hidden="true" />
            <div className="fs_sticky_corner fs_sticky_corner--br" aria-hidden="true" />

            {PROCESS_STEPS.map((step, index) => (
              <img
                key={`img-${step.id}`}
                src={step.img}
                alt={step.title}
                className="fs_sticky_img"
                ref={(el) => {
                  imgRefs.current[index] = el;
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
