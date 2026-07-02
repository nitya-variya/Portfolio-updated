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
    url: '',
  },
  {
    id: 2,
    title: 'Global Soccer Dev',
    type: 'Digital Transformation',
    img: 'assets/gsd-mock.jpg',
    shape: 'fs_shape_wide',
    align: 'fs_align_top',
    num: '02',
    url: '',
  },
  {
    id: 3,
    title: 'Quick Deli Style',
    type: 'Frontend Systems',
    img: 'assets/quickdeli-mock.jpg',
    shape: 'fs_shape_square',
    align: 'fs_align_center',
    num: '03',
    url: '',
  },
  {
    id: 4,
    title: 'Vino Zero',
    type: 'Campaign Media',
    img: 'assets/vino-mock.jpg',
    shape: 'fs_shape_wide',
    align: 'fs_align_top',
    num: '04',
    url: '',
  },
  {
    id: 5,
    title: 'Book My Farmhouse',
    type: 'Luxury Rental & Booking Engine',
    img: 'assets/bookmyfarmhouse-mock.png',
    shape: 'fs_shape_tall',
    align: 'fs_align_bottom',
    num: '05',
    url: 'http://bookmyfarmhouse.com/',
  },
  {
    id: 6,
    title: 'Decornath',
    type: 'DIY & Home Improvement Marketplace',
    img: 'assets/decornath-mock.png',
    shape: 'fs_shape_wide',
    align: 'fs_align_top',
    num: '06',
    url: 'https://decornath.com/',
  },
  {
    id: 7,
    title: 'Skymaharaja',
    type: 'Elite Private Jet Booking Platform',
    img: 'assets/skymaharaja-mock.png',
    shape: 'fs_shape_square',
    align: 'fs_align_center',
    num: '07',
    url: 'https://skymaharaja.com/',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function WorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const bgTextRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const bgText = bgTextRef.current;
    if (!section || !track || !bgText) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // ── Desktop: Horizontal Scroll, Inner Parallax, BG Text ────────────
      mm.add('(min-width: 769px)', () => {
        const getScrollW = () => track.scrollWidth - window.innerWidth;

        const tl = gsap.timeline({
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

        // 1. Move entire track left
        tl.to(track, { x: () => -getScrollW(), ease: 'none' }, 0);

        // 2. INNER PARALLAX — images pan right as track moves left
        const images = track.querySelectorAll('.fs_ed_img');
        tl.to(images, { x: 100, ease: 'none' }, 0);

        // 3. Subtly drift the background title
        tl.to(bgText, { x: -150, opacity: 0.02, ease: 'none' }, 0);

        return () => {
          tl.scrollTrigger?.kill();
        };
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section className="fs_editorial_master" ref={sectionRef} id="work">

      {/* ── Sticky Background Title ──────────────────────────────────────── */}
      <div className="fs_sticky_context">
        <h2 className="fs_bg_title" ref={bgTextRef}>
          Selected<br />Works.
        </h2>
      </div>

      {/* ── Horizontal Track ─────────────────────────────────────────────── */}
      <div className="fs_editorial_track" ref={trackRef}>
        {PROJECTS.map((project) => (
          <div
            className={`fs_ed_card ${project.shape} ${project.align}`}
            key={project.id}
          >
            {/* Polished Image Container */}
            <div className="fs_ed_img_wrapper">
              <div className="fs_reticle fs_reticle_tl" />
              <div className="fs_reticle fs_reticle_br" />
              <img
                src={project.img}
                alt={project.title}
                className="fs_ed_img"
                loading="lazy"
              />

              {/* Hover Reveal Overlay */}
              <a
                href={project.url || `/project/${project.id}`}
                target={project.url ? '_blank' : undefined}
                rel={project.url ? 'noopener noreferrer' : undefined}
                className="fs_ed_overlay"
                aria-label={`View ${project.title}`}
              >
                <div className="fs_ed_btn">
                  <svg
                    width="20"
                    height="20"
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
                </div>
              </a>
            </div>

            {/* Tightened Meta Footer */}
            <div className="fs_ed_meta">
              <h3 className="fs_ed_title">{project.title}</h3>
              <span className="fs_ed_type">{project.type}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
