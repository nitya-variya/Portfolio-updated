import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Works.scss';

gsap.registerPlugin(ScrollTrigger);

// ── Data ─────────────────────────────────────────────────────────────────────
const PROJECTS = [
  {
    id: 1,
    title: 'Canadian Food Exporters',
    type: 'Multilingual',
    img: 'assets/cfea-mock.jpg',
    shape: 'fs_shape_tall',
    align: 'fs_align_bottom',
    num: '01',
  },
  {
    id: 2,
    title: 'Global Soccer Dev',
    type: 'Digital Transformation',
    img: 'assets/gsd-mock.jpg',
    shape: 'fs_shape_wide',
    align: 'fs_align_top',
    num: '02',
  },
  {
    id: 3,
    title: 'Quick Deli Style',
    type: 'Frontend Systems',
    img: 'assets/quickdeli-mock.jpg',
    shape: 'fs_shape_square',
    align: 'fs_align_center',
    num: '03',
  },
  {
    id: 4,
    title: 'GlamAI Production',
    type: 'Interactive Platform',
    img: 'assets/glamai-mock.jpg',
    shape: 'fs_shape_tall',
    align: 'fs_align_bottom',
    num: '04',
  },
  {
    id: 5,
    title: 'Vino Zero',
    type: 'Campaign Media',
    img: 'assets/vino-mock.jpg',
    shape: 'fs_shape_wide',
    align: 'fs_align_top',
    num: '05',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function WorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    // ── Skip horizontal scroll on mobile — CSS handles vertical layout ────────
    const isMobile = window.innerWidth <= 768;
    if (isMobile) return;

    // ── Measure total horizontal travel ──────────────────────────────────────
    const getScrollW = () => track.scrollWidth - window.innerWidth;

    // ── Image parallax — each image counter-scrolls slightly ─────────────────
    const images = gsap.utils.toArray<HTMLImageElement>('.fs_ed_img');
    const imgParallaxTweens = images.map((img) =>
      gsap.fromTo(
        img,
        { x: '-8%' },
        {
          x: '8%',
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => '+=' + getScrollW(),
            scrub: true,
          },
        }
      )
    );

    // ── Master timeline: pin + horizontal scroll ──────────────────────────────
    const master = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        pin: true,
        scrub: 1,
        start: 'top top',
        anticipatePin: 1,
        end: () => '+=' + getScrollW(),
        invalidateOnRefresh: true,
      },
    });

    // Tween 1 — the horizontal scroll
    master.to(
      track,
      { x: () => -getScrollW(), ease: 'none' },
      0
    );

    return () => {
      master.scrollTrigger?.kill();
      imgParallaxTweens.forEach((t) => t.scrollTrigger?.kill());
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);


  return (
    <section className="fs_editorial_master" ref={sectionRef} id="work">



      {/* ── Horizontal Track ────────────────────────────────────────────────── */}
      <div className="fs_editorial_track" ref={trackRef}>
        {PROJECTS.map((project) => (
          <div
            className={`fs_ed_card ${project.shape} ${project.align}`}
            key={project.id}
            data-num={project.num}
          >
            {/* Image wrapper with precision reticles */}
            <div className="fs_ed_img_wrapper">
              <div className="fs_reticle fs_reticle_tl" aria-hidden="true" />
              <div className="fs_reticle fs_reticle_tr" aria-hidden="true" />
              <div className="fs_reticle fs_reticle_bl" aria-hidden="true" />
              <div className="fs_reticle fs_reticle_br" aria-hidden="true" />
              <img
                src={project.img}
                alt={project.title}
                className="fs_ed_img"
                loading="lazy"
              />
              {/* Project index stamp — sits over image */}
              <span className="fs_ed_index" aria-hidden="true">{project.num}</span>
            </div>

            {/* Footer row */}
            <div className="fs_ed_footer">
              <div className="fs_ed_meta">
                <h3 className="fs_ed_title">{project.title}</h3>
                <span className="fs_ed_type">{project.type}</span>
              </div>

              <a
                href={`/project/${project.id}`}
                className="fs_ed_btn"
                aria-label={`View ${project.title}`}
              >
                {/* Arrow-out icon */}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M1 13L13 1M13 1H4M13 1V10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* ── Bottom progress rule ─────────────────────────────────────────────── */}
      <div className="fs_ed_progress_wrap" aria-hidden="true">
        <div className="fs_ed_progress_rule" />
      </div>
    </section>
  );
}
