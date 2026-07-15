import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Data ─────────────────────────────────────────────────────────────────────
const PROJECTS = [
  {
    id: 1,
    num: '01',
    title: 'Canadian Food\nExporters',
    type: 'Multilingual',
    year: '2023',
    img: 'assets/cfea-mock.jpg',
    url: '',
  },
  {
    id: 2,
    num: '02',
    title: 'Global Soccer\nDev',
    type: 'Digital Transformation',
    year: '2023',
    img: 'assets/gsd-mock.jpg',
    url: '',
  },
  {
    id: 3,
    num: '03',
    title: 'Quick Deli\nStyle',
    type: 'Frontend Systems',
    year: '2024',
    img: 'assets/quickdeli-mock.jpg',
    url: '',
  },
  {
    id: 4,
    num: '04',
    title: 'Vino Zero',
    type: 'Campaign Media',
    year: '2024',
    img: 'assets/vino-mock.jpg',
    url: '',
  },
  {
    id: 5,
    num: '05',
    title: 'Book My\nFarmhouse',
    type: 'Luxury Rental & Booking',
    year: '2024',
    img: 'assets/bookmyfarmhouse-mock.png',
    url: 'http://bookmyfarmhouse.com/',
  },
  {
    id: 6,
    num: '06',
    title: 'Decornath',
    type: 'Home Improvement Marketplace',
    year: '2025',
    img: 'assets/decornath-mock.png',
    url: 'https://decornath.com/',
  },
  {
    id: 7,
    num: '07',
    title: 'Skymaharaja',
    type: 'Elite Private Jet Booking',
    year: '2025',
    img: 'assets/skymaharaja-mock.png',
    url: 'https://skymaharaja.com/',
  },
];

// ── Crosshair SVG ─────────────────────────────────────────────────────────────
function Crosshair({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  return (
    <span className={`fs_rg_cross fs_rg_cross_${position}`} aria-hidden="true">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <line x1="5" y1="0" x2="5" y2="10" stroke="#555" strokeWidth="1" />
        <line x1="0" y1="5" x2="10" y2="5" stroke="#555" strokeWidth="1" />
      </svg>
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function WorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // ── Desktop: horizontal scroll pinning ───────────────────────────────
      mm.add('(min-width: 769px)', () => {
        const getScrollW = () => track.scrollWidth - window.innerWidth;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 1.2,
            start: 'top top',
            anticipatePin: 1,
            end: () => '+=' + getScrollW(),
            invalidateOnRefresh: true,
          },
        });

        // Translate the entire track leftward
        tl.to(track, { x: () => -getScrollW(), ease: 'none' }, 0);

        // Inner parallax: images pan slightly right as track slides left
        const images = track.querySelectorAll<HTMLElement>('.fs_rg_img');
        tl.to(images, { x: 60, ease: 'none' }, 0);

        return () => { tl.scrollTrigger?.kill(); };
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section className="fs_rg_section" ref={sectionRef} id="work" aria-label="Selected Works">

      {/* ── Horizontal Track ─────────────────────────────────────────────── */}
      <div className="fs_rg_track" ref={trackRef}>

        {/* ── INTRO BLOCK ──────────────────────────────────────────────────── */}
        <div className="fs_rg_col fs_rg_intro">
          <Crosshair position="tl" />
          <Crosshair position="tr" />
          <Crosshair position="bl" />
          <Crosshair position="br" />
          <div className="fs_rg_intro_inner">
            <p className="fs_rg_label">Selected Works</p>
            <h2 className="fs_rg_heading">
              Crafted<br />
              <em>with intent.</em>
            </h2>
            <p className="fs_rg_sub">
              A curated index of digital<br />
              products built end-to-end.
            </p>
            <div className="fs_rg_count">
              <span className="fs_rg_count_num">{PROJECTS.length}</span>
              <span className="fs_rg_count_lbl">Projects</span>
            </div>
          </div>
        </div>

        {/* ── PROJECT CARDS ─────────────────────────────────────────────────── */}
        {PROJECTS.map((project) => (
          <div className="fs_rg_col fs_rg_card_col" key={project.id}>
            <Crosshair position="tl" />
            <Crosshair position="tr" />
            <Crosshair position="bl" />
            <Crosshair position="br" />
            <a
              href={project.url || `#project-${project.id}`}
              target={project.url ? '_blank' : undefined}
              rel={project.url ? 'noopener noreferrer' : undefined}
              className="fs_rg_card"
              aria-label={`View ${project.title}`}
            >
              {/* Image container */}
              <div className="fs_rg_img_wrap">
                <img
                  src={project.img}
                  alt={project.title}
                  className="fs_rg_img"
                  loading="lazy"
                />
                {/* Hover overlay */}
                <div className="fs_rg_hover_overlay" aria-hidden="true">
                  <div className="fs_rg_explore_btn">
                    <span className="fs_rg_explore_text">EXPLORE PROJECT</span>
                    <svg
                      className="fs_rg_explore_arrow"
                      width="16"
                      height="16"
                      viewBox="0 0 14 14"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M1 13L13 1M13 1H4M13 1V10"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Meta */}
              <div className="fs_rg_meta">
                <span className="fs_rg_num">{project.num}</span>
                <div className="fs_rg_meta_body">
                  <h3 className="fs_rg_title">
                    {project.title.split('\n').map((line, i) => (
                      <span key={i}>{line}{i < project.title.split('\n').length - 1 && <br />}</span>
                    ))}
                  </h3>
                  <div className="fs_rg_meta_row">
                    <span className="fs_rg_type">{project.type}</span>
                    <span className="fs_rg_year">{project.year}</span>
                  </div>
                </div>
              </div>
            </a>
          </div>
        ))}

        {/* ── OUTRO BLOCK ──────────────────────────────────────────────────── */}
        <div className="fs_rg_col fs_rg_outro">
          <Crosshair position="tl" />
          <Crosshair position="tr" />
          <Crosshair position="bl" />
          <Crosshair position="br" />
          <div className="fs_rg_outro_inner">
            <p className="fs_rg_outro_label">What's next</p>
            <p className="fs_rg_outro_copy">
              Have a project in mind?<br />Let's build something remarkable.
            </p>
            <a href="#contact" className="fs_rg_outro_cta" id="works-contact-cta">
              <span>Get in touch</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M1 13L13 1M13 1H4M13 1V10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>

      </div>{/* /fs_rg_track */}
    </section>
  );
}
