import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './PinnedSlider.scss';

gsap.registerPlugin(ScrollTrigger);

const ABOUT_SLIDES = [
  {
    id: 1,
    title: 'Designer',
    desc1: 'I craft interfaces that feel',
    desc2: 'inevitable, not just functional.',
    img: 'assets/nitya-portrait.jpg',
  },
  {
    id: 2,
    title: 'Engineer',
    desc1: 'Clean architecture, zero debt,',
    desc2: 'shipped at absolute polish.',
    img: 'assets/nitya-portrait-2.jpg',
  },
  {
    id: 3,
    title: 'Thinker',
    desc1: 'I question every pixel before',
    desc2: 'committing it to the screen.',
    img: 'assets/nitya-portrait-3.jpg',
  },
  {
    id: 4,
    title: 'Builder',
    desc1: '3 years turning complex ideas',
    desc2: 'into scalable, living products.',
    img: 'assets/nitya-portrait-4.jpg',
  },
];

export default function PinnedAboutMe() {
  const sectionRef = useRef<HTMLElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const parallax = parallaxRef.current;
    if (!section || !parallax) return;

    const ctx = gsap.context(() => {
      const handleMouseMove = (e: MouseEvent) => {
        const dx = (e.clientX - window.innerWidth / 2) / window.innerWidth;
        const dy = (e.clientY - window.innerHeight / 2) / window.innerHeight;

        gsap.to(parallax, {
          x: dx * 24,
          y: dy * 18,
          rotationY: dx * 6,
          rotationX: -dy * 6,
          duration: 1.8,
          ease: 'power3.out',
        });

        if (orb1Ref.current) {
          gsap.to(orb1Ref.current, { x: -dx * 60, y: -dy * 40, duration: 2.5, ease: 'power2.out' });
        }
        if (orb2Ref.current) {
          gsap.to(orb2Ref.current, { x: dx * 80, y: dy * 60, duration: 3.2, ease: 'power2.out' });
        }
      };
      window.addEventListener('mousemove', handleMouseMove);

      const slideCount = ABOUT_SLIDES.length;
      const PANEL_VH = 120;

      // 2. Setup initial state for stack layers
      slideRefs.current.forEach((slide, i) => {
        if (!slide) return;
        const imgWrapper = slide.querySelector<HTMLElement>('.fs_creative_img_wrapper');
        const img = slide.querySelector<HTMLImageElement>('img');
        const title = slide.querySelector<HTMLElement>('.fs_about_title');
        const desc = slide.querySelector<HTMLElement>('.fs_about_desc');

        if (i === 0) {
          // Slide 1 is active initially
          gsap.set(imgWrapper, { clipPath: 'inset(0% 0 0 0)' });
          gsap.set(img, { scale: 1 });
          gsap.set([title, desc], { yPercent: 0, opacity: 1 });
        } else {
          // All subsequent slides start hidden below clip mask
          gsap.set(imgWrapper, { clipPath: 'inset(100% 0 0 0)' });
          gsap.set(img, { scale: 1.25 });
          gsap.set([title, desc], { yPercent: 108, opacity: 0 });
        }
      });

      // 3. Master Pin & Scrub Timeline
      const totalPinDuration = (slideCount - 1) * PANEL_VH;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger:       section,
          start:         'top top',
          end:           `+=${totalPinDuration}vh`,
          pin:           true,
          anticipatePin: 1,
          scrub:         1.2,
        }
      });

      // 4. Sequence transitions sequentially in the single timeline
      for (let i = 0; i < slideCount - 1; i++) {
        const slide1 = slideRefs.current[i];
        const slide2 = slideRefs.current[i + 1];
        if (!slide1 || !slide2) continue;

        const s1Title = slide1.querySelector<HTMLElement>('.fs_about_title');
        const s1Desc  = slide1.querySelector<HTMLElement>('.fs_about_desc');

        const s2Img     = slide2.querySelector<HTMLImageElement>('img');
        const s2Wrapper = slide2.querySelector<HTMLElement>('.fs_creative_img_wrapper');
        const s2Title   = slide2.querySelector<HTMLElement>('.fs_about_title');
        const s2Desc    = slide2.querySelector<HTMLElement>('.fs_about_desc');

        const label = `slide_${i}`;
        tl.addLabel(label);

        // Exit current slide text
        tl.to([s1Title, s1Desc].filter(Boolean), {
          yPercent: -108,
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut',
        }, label);

        // Next image clip-path reveal (snappy & smooth)
        tl.to(s2Wrapper, {
          clipPath: 'inset(0% 0 0 0)',
          duration: 0.8,
          ease: 'power3.inOut',
        }, `${label}+=0.1`);

        // Image scale parallax
        tl.to(s2Img, {
          scale: 1,
          duration: 0.8,
          ease: 'power3.inOut',
        }, `${label}+=0.1`);

        // Next text entry
        tl.to([s2Title].filter(Boolean), {
          yPercent: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
        }, `${label}+=0.40`);

        tl.to([s2Desc].filter(Boolean), {
          yPercent: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
        }, `${label}+=0.50`);

        // Resting point hold
        tl.to({}, { duration: 0.4 });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      className="fs_about_master"
      ref={sectionRef}
      id="about"
      aria-label="About Me Section"
    >
      {/* Cinematic Film Grain Overlay */}
      <div className="fs_noise_overlay" aria-hidden="true" />

      {/* Luxury Background Ambient Orbs */}
      <div className="fs_orb fs_orb_1" ref={orb1Ref} aria-hidden="true" />
      <div className="fs_orb fs_orb_2" ref={orb2Ref} aria-hidden="true" />

      {/* 3D Parallax Stage */}
      <div className="fs_parallax_wrapper" ref={parallaxRef}>

        {/* Precise Technical Corner Brackets */}
        <div className="fs_corner_bracket fs_cb_tl" aria-hidden="true" />
        <div className="fs_corner_bracket fs_cb_tr" aria-hidden="true" />
        <div className="fs_corner_bracket fs_cb_bl" aria-hidden="true" />
        <div className="fs_corner_bracket fs_cb_br" aria-hidden="true" />

        {ABOUT_SLIDES.map((slide, index) => (
          <div
            className="fs_about_slide"
            key={slide.id}
            ref={(el) => { slideRefs.current[index] = el; }}
            style={{ zIndex: index + 1 }}
          >
            {/* Giant Bleeding Italic Title */}
            <div className="fs_title_mask">
              <h2 className="fs_about_title">{slide.title}</h2>
            </div>

            {/* Bottom-to-Top Clip Reveal Image Container */}
            <div className="fs_creative_img_wrapper">
              <img
                src={slide.img}
                alt={slide.title}
                loading={index === 0 ? 'eager' : 'lazy'}
                draggable={false}
              />
              <div className="fs_photo_vignette" />

              {/* Subtle tech crosshair inside each portrait */}
              <div className="fs_card_crosshair" aria-hidden="true" />
            </div>

            {/* Elegant Bleeding Description */}
            <div className="fs_desc_mask">
              <p className="fs_about_desc">
                {slide.desc1}<br />{slide.desc2}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}