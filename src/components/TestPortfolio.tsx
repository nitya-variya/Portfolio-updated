import { useRef, useLayoutEffect, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function TestPortfolio() {
    const masterRef = useRef<HTMLElement>(null);
    const portalRef = useRef<HTMLDivElement>(null);
    const portalTextRef = useRef<HTMLSpanElement>(null);

    // Glow Refs
    const glow1Ref = useRef<HTMLDivElement>(null);
    const glow2Ref = useRef<HTMLDivElement>(null);

    // Project Refs
    const project1Ref = useRef<HTMLDivElement>(null);
    const project1ImgRef = useRef<HTMLDivElement>(null);
    const project1TextRef = useRef<HTMLDivElement>(null);

    const project2Ref = useRef<HTMLDivElement>(null);
    const project2ImgRef = useRef<HTMLDivElement>(null);
    const project2TextRef = useRef<HTMLDivElement>(null);

    // Cursor Ref
    const cursorRef = useRef<HTMLDivElement>(null);

    // Interactive States
    const [activeProject, setActiveProject] = useState<number>(0);
    const [cursorActive, setCursorActive] = useState<boolean>(false);

    useEffect(() => {
        // Set body and background styles
        document.body.style.backgroundColor = '#050505';
        document.body.style.color = '#FFFFFF';
        document.body.style.margin = '0';
        document.body.style.overflowX = 'hidden';

        // Load google fonts if not loaded
        const linkId = 'gsap-portfolio-google-fonts';
        if (!document.getElementById(linkId)) {
            const link = document.createElement('link');
            link.id = linkId;
            link.href = "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&family=Space+Mono&display=swap";
            link.rel = "stylesheet";
            document.head.appendChild(link);
        }
    }, []);

    // Custom Magnetic Cursor physics with GSAP quickTo
    useEffect(() => {
        const cursor = cursorRef.current;
        if (!cursor) return;

        const xTo = gsap.quickTo(cursor, "x", { duration: 0.4, ease: "power3.out" });
        const yTo = gsap.quickTo(cursor, "y", { duration: 0.4, ease: "power3.out" });

        const handleMouseMove = (e: MouseEvent) => {
            xTo(e.clientX);
            yTo(e.clientY);

            // Subtle parallax zoom on active project image relative to cursor position
            const xPercent = (e.clientX / window.innerWidth) - 0.5;
            const yPercent = (e.clientY / window.innerHeight) - 0.5;

            if (activeProject === 1 && project1ImgRef.current) {
                const img = project1ImgRef.current.querySelector('img');
                if (img) {
                    gsap.to(img, {
                        x: xPercent * -35,
                        y: yPercent * -35,
                        duration: 0.8,
                        ease: "power2.out",
                        overwrite: "auto"
                    });
                }
            } else if (activeProject === 2 && project2ImgRef.current) {
                const img = project2ImgRef.current.querySelector('img');
                if (img) {
                    gsap.to(img, {
                        x: xPercent * -35,
                        y: yPercent * -35,
                        duration: 0.8,
                        ease: "power2.out",
                        overwrite: "auto"
                    });
                }
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, [activeProject]);

    useLayoutEffect(() => {
        if (!masterRef.current) return;

        const ctx = gsap.context(() => {
            // Initial reset states
            gsap.set([project1Ref.current, project2Ref.current], { autoAlpha: 0, pointerEvents: 'none' });
            gsap.set([project1ImgRef.current, project2ImgRef.current], { 
                scale: 1.25, 
                clipPath: 'inset(15% 20% 15% 20% round 30px)' 
            });

            // Target word nodes for reveal effect
            const p1TitleWords = project1TextRef.current?.querySelectorAll('.fs_word') || [];
            const p1MetaDivider = project1TextRef.current?.querySelector('.fs_meta_divider');
            const p1FadeEls = project1TextRef.current?.querySelectorAll('.fs_meta_category, .fs_meta_desc, .fs_spec_item, .fs_meta_btn') || [];

            const p2TitleWords = project2TextRef.current?.querySelectorAll('.fs_word') || [];
            const p2MetaDivider = project2TextRef.current?.querySelector('.fs_meta_divider');
            const p2FadeEls = project2TextRef.current?.querySelectorAll('.fs_meta_category, .fs_meta_desc, .fs_spec_item, .fs_meta_btn') || [];

            gsap.set([p1TitleWords, p2TitleWords], { yPercent: 105 });
            gsap.set([p1MetaDivider, p2MetaDivider], { scaleX: 0, transformOrigin: "left center" });
            gsap.set([p1FadeEls, p2FadeEls], { y: 25, opacity: 0 });

            // Create Master Scroll-Pinned Timeline
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: masterRef.current,
                    start: "top top",
                    end: "+=600%", // Long immersive scroll sequence
                    pin: true,
                    scrub: 1.2, // Smooth follow through
                    invalidateOnRefresh: true,
                }
            });

            // --- PHASE 1: The Scalable Portal ---
            tl.to(portalTextRef.current, { 
                opacity: 0, 
                letterSpacing: '24px', 
                scale: 0.85, 
                duration: 1.5,
                ease: "power2.inOut" 
            }, 0);

            tl.to(portalRef.current, {
                width: "100vw",
                height: "100vh",
                borderRadius: "0px",
                duration: 2.2,
                ease: "power3.inOut"
            }, 0);

            // Warp zoom effect on inside video
            const portalVideo = portalRef.current?.querySelector('video');
            if (portalVideo) {
                tl.fromTo(portalVideo, { scale: 1.5 }, { scale: 1.0, duration: 2.2, ease: "power3.inOut" }, 0);
            }

            // Shift ambient glows to emerald/cyan theme
            tl.to(glow1Ref.current, { backgroundColor: '#00f2fe', xPercent: -15, yPercent: -10, duration: 2, ease: "power2.inOut" }, 0.5);
            tl.to(glow2Ref.current, { backgroundColor: '#4facfe', xPercent: 15, yPercent: 10, duration: 2, ease: "power2.inOut" }, 0.5);

            // --- PHASE 2: Project 01 Emerges ---
            const p1Start = 2.8;
            tl.set(project1Ref.current, { autoAlpha: 1, pointerEvents: 'auto' }, p1Start);
            tl.call(() => setActiveProject(1), undefined, p1Start);

            // Image Frame expands
            tl.to(project1ImgRef.current, {
                clipPath: 'inset(0% 0% 0% 0% round 0px)',
                duration: 2.4,
                ease: "power4.inOut"
            }, p1Start);

            // Parallax scale reduction
            const img1 = project1ImgRef.current?.querySelector('img');
            if (img1) {
                tl.fromTo(img1, { scale: 1.25 }, { scale: 1.0, duration: 2.4, ease: "power3.inOut" }, p1Start);
            }

            // Reveal Editorial Typography Block
            if (p1TitleWords.length) {
                tl.to(p1TitleWords, {
                    yPercent: 0,
                    duration: 1.4,
                    stagger: 0.08,
                    ease: "power3.out"
                }, p1Start + 0.6);
            }

            if (p1MetaDivider) {
                tl.to(p1MetaDivider, {
                    scaleX: 1,
                    duration: 1.2,
                    ease: "power2.inOut"
                }, p1Start + 0.8);
            }

            if (p1FadeEls.length) {
                tl.to(p1FadeEls, {
                    y: 0,
                    opacity: 1,
                    duration: 1.2,
                    stagger: 0.06,
                    ease: "power2.out"
                }, p1Start + 1.0);
            }

            // --- PHASE 3: Project 01 Fades Out / Glow shifts to Violet ---
            const p1End = p1Start + 4.5;
            tl.to(project1Ref.current, {
                opacity: 0,
                y: -60,
                filter: 'blur(12px)',
                scale: 0.96,
                duration: 1.8,
                ease: "power3.in"
            }, p1End);

            tl.to(project1ImgRef.current, {
                clipPath: 'inset(10% 15% 10% 15% round 30px)',
                duration: 1.8,
                ease: "power3.in"
            }, p1End);

            // Glow shifts to hot violet/pink
            tl.to(glow1Ref.current, { backgroundColor: '#b100ff', xPercent: 15, yPercent: 20, duration: 2.2, ease: "power2.inOut" }, p1End);
            tl.to(glow2Ref.current, { backgroundColor: '#ff007f', xPercent: -15, yPercent: -20, duration: 2.2, ease: "power2.inOut" }, p1End);

            // --- PHASE 4: Project 02 Emerges (Opposite grid alignment) ---
            const p2Start = p1End + 1.8;
            tl.set(project2Ref.current, { autoAlpha: 1, pointerEvents: 'auto' }, p2Start);
            tl.call(() => setActiveProject(2), undefined, p2Start);

            // Image Frame expands
            tl.to(project2ImgRef.current, {
                clipPath: 'inset(0% 0% 0% 0% round 0px)',
                duration: 2.4,
                ease: "power4.inOut"
            }, p2Start);

            const img2 = project2ImgRef.current?.querySelector('img');
            if (img2) {
                tl.fromTo(img2, { scale: 1.25 }, { scale: 1.0, duration: 2.4, ease: "power3.inOut" }, p2Start);
            }

            // Reveal Editorial Typography Block
            if (p2TitleWords.length) {
                tl.to(p2TitleWords, {
                    yPercent: 0,
                    duration: 1.4,
                    stagger: 0.08,
                    ease: "power3.out"
                }, p2Start + 0.6);
            }

            if (p2MetaDivider) {
                tl.to(p2MetaDivider, {
                    scaleX: 1,
                    duration: 1.2,
                    ease: "power2.inOut"
                }, p2Start + 0.8);
            }

            if (p2FadeEls.length) {
                tl.to(p2FadeEls, {
                    y: 0,
                    opacity: 1,
                    duration: 1.2,
                    stagger: 0.06,
                    ease: "power2.out"
                }, p2Start + 1.0);
            }

            // --- PHASE 5: Project 02 Fades Out ---
            const p2End = p2Start + 4.5;
            tl.to(project2Ref.current, {
                opacity: 0,
                y: -60,
                filter: 'blur(12px)',
                scale: 0.96,
                duration: 1.8,
                ease: "power3.in"
            }, p2End);

            tl.to(project2ImgRef.current, {
                clipPath: 'inset(10% 15% 10% 15% round 30px)',
                duration: 1.8,
                ease: "power3.in"
            }, p2End);

            // Glow shifts back to baseline
            tl.to(glow1Ref.current, { backgroundColor: '#f9c176', xPercent: 0, yPercent: 0, duration: 2, ease: "power2.inOut" }, p2End);
            tl.to(glow2Ref.current, { backgroundColor: '#ff007f', xPercent: 0, yPercent: 0, duration: 2, ease: "power2.inOut" }, p2End);
            tl.call(() => setActiveProject(0), undefined, p2End + 1.8);
        }, masterRef);

        return () => ctx.revert();
    }, []);

    // Text split helper for word reveal animations
    const renderSplitWords = (text: string, className: string) => {
        return (
            <span className={className} style={{ display: 'block', overflow: 'hidden' }}>
                {text.split(' ').map((word, index) => (
                    <span 
                        key={index} 
                        className="fs_word_wrapper" 
                        style={{ display: 'inline-block', overflow: 'hidden', marginRight: '0.22em', verticalAlign: 'top' }}
                    >
                        <span 
                            className="fs_word" 
                            style={{ display: 'inline-block', willChange: 'transform' }}
                        >
                            {word}
                        </span>
                    </span>
                ))}
            </span>
        );
    };

    return (
        <>
            <style>{`
                /* Ambient Glow Layers */
                .fs_ambient_container {
                  position: absolute;
                  inset: 0;
                  overflow: hidden;
                  pointer-events: none;
                  z-index: 0;
                }
                .fs_glow_circle {
                  position: absolute;
                  width: 60vw;
                  height: 60vw;
                  max-width: 800px;
                  max-height: 800px;
                  border-radius: 50%;
                  filter: blur(140px);
                  opacity: 0.14;
                  mix-blend-mode: screen;
                  will-change: transform, background-color;
                }
                .fs_glow_1 {
                  top: -10%;
                  left: -10%;
                  background-color: #f9c176;
                }
                .fs_glow_2 {
                  bottom: -10%;
                  right: -10%;
                  background-color: #ff007f;
                }

                /* Magnetic Custom Follower Badge */
                .fs_magnetic_cursor {
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 90px;
                  height: 90px;
                  background: rgba(255, 255, 255, 0.08);
                  backdrop-filter: blur(16px) saturate(180%);
                  -webkit-backdrop-filter: blur(16px) saturate(180%);
                  border: 1px solid rgba(255, 255, 255, 0.18);
                  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
                  border-radius: 50%;
                  pointer-events: none;
                  z-index: 99999;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  transform: translate(-50%, -50%) scale(0);
                  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s;
                  color: #fff;
                  font-family: 'Space Mono', monospace;
                  font-size: 10px;
                  font-weight: 500;
                  letter-spacing: 2px;
                  opacity: 0;
                }
                .fs_magnetic_cursor.active {
                  transform: translate(-50%, -50%) scale(1);
                  opacity: 1;
                }

                /* Intro Manifesto Spacer */
                .fs_spacer_intro {
                  height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background-color: #050505;
                  position: relative;
                  z-index: 2;
                }
                .fs_intro_content {
                  text-align: center;
                  max-width: 800px;
                  padding: 0 24px;
                }
                .fs_intro_label {
                  font-family: 'Space Mono', monospace;
                  font-size: 11px;
                  letter-spacing: 4px;
                  color: #f9c176;
                  text-transform: uppercase;
                  margin-bottom: 24px;
                  display: block;
                  opacity: 0.85;
                }
                .fs_intro_heading {
                  font-family: 'Inter', sans-serif;
                  font-size: 3.8vw;
                  font-weight: 300;
                  line-height: 1.25;
                  color: #fff;
                  letter-spacing: -0.01em;
                  margin: 0;
                }
                .fs_italic_accent {
                  font-family: 'Instrument Serif', serif;
                  font-style: italic;
                  font-size: 4.8vw;
                  color: #f9c176;
                }
                .fs_scroll_indicator {
                  margin-top: 50px;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  gap: 12px;
                }
                .fs_scroll_mouse {
                  width: 22px;
                  height: 38px;
                  border: 2px solid rgba(255, 255, 255, 0.35);
                  border-radius: 12px;
                  position: relative;
                  display: flex;
                  justify-content: center;
                }
                .fs_scroll_wheel {
                  width: 2px;
                  height: 6px;
                  background-color: #f9c176;
                  border-radius: 1px;
                  position: absolute;
                  top: 7px;
                  animation: scrollWheelPulse 1.8s infinite ease-in-out;
                }
                @keyframes scrollWheelPulse {
                  0% { transform: translateY(0); opacity: 1; }
                  50% { opacity: 0.8; }
                  100% { transform: translateY(8px); opacity: 0; }
                }
                .fs_scroll_text {
                  font-family: 'Space Mono', monospace;
                  font-size: 10px;
                  letter-spacing: 2px;
                  color: #666;
                  text-transform: uppercase;
                }

                /* The Master Pinned Section */
                .fs_cinematic_master {
                  width: 100vw;
                  height: 100vh;
                  position: relative;
                  overflow: hidden;
                  background-color: #050505;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }

                /* The Expanding Pill */
                .fs_scalable_portal {
                  width: 220px; 
                  height: 56px;
                  border-radius: 28px;
                  border: 1px solid rgba(255, 255, 255, 0.15);
                  overflow: hidden; 
                  position: relative;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  will-change: width, height, border-radius;
                  background: rgba(255, 255, 255, 0.02);
                  backdrop-filter: blur(12px);
                  -webkit-backdrop-filter: blur(12px);
                  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
                  z-index: 1;
                  transition: border-color 0.3s, background 0.3s, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                  cursor: pointer;
                }
                .fs_scalable_portal:hover {
                  border-color: rgba(255, 255, 255, 0.4);
                  background: rgba(255, 255, 255, 0.05);
                  transform: scale(1.04);
                }

                .fs_scalable_text {
                  position: absolute;
                  z-index: 3;
                  font-family: 'Space Mono', monospace;
                  font-size: 12px;
                  font-weight: 500;
                  letter-spacing: 3px;
                  color: #F9C176;
                  pointer-events: none;
                  will-change: opacity, letter-spacing, scale;
                }

                /* The Deep Space / Warp Video Background */
                .fs_video_container {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  width: 100vw; 
                  height: 100vh;
                  z-index: 1;
                }

                .fs_video_container video {
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                  opacity: 0.28; 
                  filter: grayscale(40%) contrast(110%);
                  will-change: scale;
                }

                /* Scanline pattern overlay */
                .fs_scanline_overlay {
                  position: absolute;
                  inset: 0;
                  background: linear-gradient(
                    rgba(18, 16, 16, 0) 50%, 
                    rgba(0, 0, 0, 0.25) 50%
                  );
                  background-size: 100% 4px;
                  pointer-events: none;
                  z-index: 2;
                  opacity: 0.35;
                }

                /* Project Layers */
                .fs_project_layer {
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  z-index: 5;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  will-change: opacity, transform, filter;
                }

                /* Project Columns Container */
                .fs_project_container {
                  width: 85%;
                  max-width: 1400px;
                  height: 75vh;
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  position: relative;
                  z-index: 5;
                }

                /* Image Column */
                .fs_project_image_column {
                  width: 53%;
                  height: 100%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  position: relative;
                  cursor: none;
                }
                .fs_project_img_frame {
                  width: 100%;
                  height: 80%;
                  position: relative;
                  overflow: hidden;
                  border-radius: 20px;
                  border: 1px solid rgba(255, 255, 255, 0.08);
                  box-shadow: 0 35px 90px rgba(0, 0, 0, 0.7);
                  will-change: clip-path;
                }
                .fs_project_img_frame img {
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                  will-change: transform;
                }
                .fs_project_overlay {
                  position: absolute;
                  inset: 0;
                  background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%);
                  z-index: 2;
                  pointer-events: none;
                }

                /* Content Column */
                .fs_project_content_column {
                  width: 40%;
                  display: flex;
                  flex-direction: column;
                  align-items: flex-start;
                  z-index: 10;
                  position: relative;
                  padding-left: 20px;
                }
                .fs_project_container.reversed .fs_project_content_column {
                  padding-left: 0;
                  padding-right: 20px;
                }

                .fs_meta_category {
                  font-family: 'Space Mono', monospace;
                  font-size: 11px;
                  letter-spacing: 3px;
                  color: #F9C176;
                  margin-bottom: 18px;
                  text-transform: uppercase;
                  will-change: transform, opacity;
                }
                .fs_meta_title {
                  font-family: 'Instrument Serif', serif;
                  font-size: 4.8vw;
                  font-style: italic;
                  font-weight: 300;
                  color: #fff;
                  line-height: 0.95;
                  margin: 0 0 24px 0;
                  letter-spacing: -0.02em;
                }
                .fs_meta_divider {
                  width: 100%;
                  height: 1px;
                  background: linear-gradient(to right, rgba(255, 255, 255, 0.25), transparent);
                  margin-bottom: 28px;
                  will-change: scaleX;
                }
                .fs_meta_desc {
                  font-family: 'Inter', sans-serif;
                  font-size: 16px;
                  font-weight: 300;
                  color: rgba(255, 255, 255, 0.7);
                  line-height: 1.6;
                  margin: 0 0 35px 0;
                  max-width: 460px;
                  will-change: transform, opacity;
                }

                /* Specs Grid */
                .fs_meta_specs_grid {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  gap: 20px 30px;
                  width: 100%;
                  margin-bottom: 40px;
                }
                .fs_spec_item {
                  display: flex;
                  flex-direction: column;
                  gap: 4px;
                  will-change: transform, opacity;
                }
                .fs_spec_label {
                  font-family: 'Space Mono', monospace;
                  font-size: 9px;
                  letter-spacing: 2px;
                  color: rgba(255, 255, 255, 0.4);
                  text-transform: uppercase;
                }
                .fs_spec_value {
                  font-family: 'Inter', sans-serif;
                  font-size: 13px;
                  font-weight: 400;
                  color: rgba(255, 255, 255, 0.85);
                }

                /* Premium Hover Button */
                .fs_meta_btn {
                  font-family: 'Space Mono', monospace;
                  font-size: 11px;
                  font-weight: 500;
                  letter-spacing: 2px;
                  color: #fff;
                  background: transparent;
                  border: 1px solid rgba(255, 255, 255, 0.16);
                  padding: 12px 28px;
                  border-radius: 24px;
                  cursor: pointer;
                  position: relative;
                  overflow: hidden;
                  transition: border-color 0.4s, color 0.4s;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  text-decoration: none;
                  z-index: 1;
                  will-change: transform, opacity;
                }
                .fs_meta_btn::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: #fff;
                  transform: translateY(100%);
                  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
                  z-index: -1;
                }
                .fs_meta_btn:hover {
                  color: #050505;
                  border-color: #fff;
                }
                .fs_meta_btn:hover::before {
                  transform: translateY(0);
                }

                /* Mobile responsive tweaks */
                @media (max-width: 991px) {
                  .fs_project_container {
                    flex-direction: column !important;
                    height: auto;
                    gap: 30px;
                    width: 90%;
                  }
                  .fs_project_image_column {
                    width: 100%;
                    height: 45vh;
                    cursor: default;
                  }
                  .fs_project_img_frame {
                    height: 100%;
                  }
                  .fs_project_content_column {
                    width: 100% !important;
                    padding: 0 !important;
                  }
                  .fs_meta_title {
                    font-size: 40px;
                  }
                  .fs_intro_heading {
                    font-size: 28px;
                  }
                  .fs_italic_accent {
                    font-size: 34px;
                  }
                }
              `}</style>

            {/* Custom Mouse Follower */}
            <div className={`fs_magnetic_cursor ${cursorActive ? 'active' : ''}`} ref={cursorRef}>
                <span>VIEW ↗</span>
            </div>

            {/* Intro Spacer / Manifesto */}
            <section className="fs_spacer_intro">
                <div className="fs_intro_content">
                    <span className="fs_intro_label">PORTAL CORE SYSTEM</span>
                    <h2 className="fs_intro_heading">
                        Zero technical debt.<br />
                        <span className="fs_italic_accent">Absolute polish.</span>
                    </h2>
                    <div className="fs_scroll_indicator">
                        <div className="fs_scroll_mouse">
                            <div className="fs_scroll_wheel" />
                        </div>
                        <span className="fs_scroll_text">SCROLL TO UNLOCK</span>
                    </div>
                </div>
            </section>

            {/* --- THE SCROLL-DRIVEN CINEMATIC PORTAL --- */}
            <section className="fs_cinematic_master" ref={masterRef}>

                {/* Ambient glow backdrops */}
                <div className="fs_ambient_container">
                    <div className="fs_glow_circle fs_glow_1" ref={glow1Ref} />
                    <div className="fs_glow_circle fs_glow_2" ref={glow2Ref} />
                </div>

                {/* Expanding Shutter Button Portal */}
                <div className="fs_scalable_portal" ref={portalRef}>
                    <span className="fs_scalable_text" ref={portalTextRef}>ENTER PORTAL</span>

                    {/* Deep Space Background warp video */}
                    <div className="fs_video_container">
                        <video
                            src="https://cdn.pixabay.com/video/2021/08/17/85365-589311656_large.mp4"
                            autoPlay loop muted playsInline
                        />
                        <div className="fs_scanline_overlay" />
                    </div>
                </div>

                {/* --- PROJECT 01 (Image Left, Content Right) --- */}
                <div className="fs_project_layer" ref={project1Ref}>
                    <div className="fs_project_container">
                        <div 
                            className="fs_project_image_column"
                            onMouseEnter={() => setCursorActive(true)}
                            onMouseLeave={() => setCursorActive(false)}
                        >
                            <div className="fs_project_img_frame" ref={project1ImgRef}>
                                <img src="https://images.unsplash.com/photo-1579548122080-c35fd6820ceb?q=80&w=2070&auto=format&fit=crop" alt="Project 1" />
                                <div className="fs_project_overlay"></div>
                            </div>
                        </div>

                        <div className="fs_project_content_column" ref={project1TextRef}>
                            <span className="fs_meta_category">01 / PLATFORM ARCHITECTURE</span>
                            
                            {renderSplitWords("Global Soccer Dev.", "fs_meta_title")}
                            
                            <div className="fs_meta_divider" />
                            
                            <p className="fs_meta_desc">
                                We re-engineered the platform architecture from the ground up, optimizing real-time data flow pipelines for millions of live concurrent users with zero lag.
                            </p>

                            <div className="fs_meta_specs_grid">
                                <div className="fs_spec_item">
                                    <span className="fs_spec_label">SERVICES</span>
                                    <span className="fs_spec_value">Dashboard, Backend Infra</span>
                                </div>
                                <div className="fs_spec_item">
                                    <span className="fs_spec_label">IMPACT</span>
                                    <span className="fs_spec_value">+340% Performance Boost</span>
                                </div>
                                <div className="fs_spec_item">
                                    <span className="fs_spec_label">TECH STACK</span>
                                    <span className="fs_spec_value">React, WebSockets, Node</span>
                                </div>
                                <div className="fs_spec_item">
                                    <span className="fs_spec_label">YEAR</span>
                                    <span className="fs_spec_value">2026</span>
                                </div>
                            </div>

                            <a href="#work" className="fs_meta_btn">
                                Explore Case Study <span>↗</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* --- PROJECT 02 (Image Right, Content Left - reversed) --- */}
                <div className="fs_project_layer" ref={project2Ref}>
                    <div className="fs_project_container reversed" style={{ flexDirection: 'row-reverse' }}>
                        <div 
                            className="fs_project_image_column"
                            onMouseEnter={() => setCursorActive(true)}
                            onMouseLeave={() => setCursorActive(false)}
                        >
                            <div className="fs_project_img_frame" ref={project2ImgRef}>
                                <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" alt="Project 2" />
                                <div className="fs_project_overlay"></div>
                            </div>
                        </div>

                        <div className="fs_project_content_column" ref={project2TextRef}>
                            <span className="fs_meta_category">02 / SPATIAL DESIGN & WEBGL</span>
                            
                            {renderSplitWords("Pulse Studio.", "fs_meta_title")}
                            
                            <div className="fs_meta_divider" />
                            
                            <p className="fs_meta_desc">
                                A masterclass in spatial UI. We threw away traditional navigation grid lines and built a fluid, physics-based environment challenging standard desktop interaction.
                            </p>

                            <div className="fs_meta_specs_grid">
                                <div className="fs_spec_item">
                                    <span className="fs_spec_label">SERVICES</span>
                                    <span className="fs_spec_value">Interaction Design, WebGL</span>
                                </div>
                                <div className="fs_spec_item">
                                    <span className="fs_spec_label">IMPACT</span>
                                    <span className="fs_spec_value">Awwwards Site of the Day</span>
                                </div>
                                <div className="fs_spec_item">
                                    <span className="fs_spec_label">TECH STACK</span>
                                    <span className="fs_spec_value">Three.js, GSAP, React</span>
                                </div>
                                <div className="fs_spec_item">
                                    <span className="fs_spec_label">YEAR</span>
                                    <span className="fs_spec_value">2026</span>
                                </div>
                            </div>

                            <a href="#work" className="fs_meta_btn">
                                Explore Case Study <span>↗</span>
                            </a>
                        </div>
                    </div>
                </div>

            </section>

            {/* Outro Spacer */}
            <section className="fs_spacer_intro" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <h2 style={{ fontFamily: 'Space Mono', fontSize: '13px', letterSpacing: '3px', color: '#F9C176', fontWeight: 400 }}>
                    + END OF ARCHIVE +
                </h2>
            </section>
        </>
    );
}