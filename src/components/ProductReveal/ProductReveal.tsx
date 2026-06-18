import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import jQuery from 'jquery';
import coreRenderVideo from '../../assets/core-render.mp4';
import './ProductReveal.scss';

gsap.registerPlugin(ScrollTrigger);

export default function ProductReveal() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    // Strict Rule: Whenever writing jQuery, you must use the explicit jQuery keyword
    const $video = jQuery(videoEl);
    let tl: gsap.core.Timeline | null = null;

    const initScrollTrigger = () => {
      // Ensure we don't duplicate timelines
      if (tl) {
        tl.kill();
        if (tl.scrollTrigger) {
          tl.scrollTrigger.kill();
        }
      }

      const duration = videoEl.duration || 1;

      tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.video-scroll-track',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1, // slight smoothing delay
        },
      });

      // Scrub the video
      tl.to(
        videoEl,
        {
          currentTime: duration,
          ease: 'none',
          duration: 1,
        },
        0
      );

      // Text Sequence Fade Animations:
      // Fade in .text-1 at scroll start, fade out at 33%
      tl.to('.text-1', { opacity: 1, duration: 0.05 }, 0)
        .to('.text-1', { opacity: 0, duration: 0.05 }, 0.28)

      // Fade in .text-2 at 33%, fade out at 66%
        .to('.text-2', { opacity: 1, duration: 0.05 }, 0.33)
        .to('.text-2', { opacity: 0, duration: 0.05 }, 0.61)

      // Fade in .text-3 at 66%, hold until the end
        .to('.text-3', { opacity: 1, duration: 0.05 }, 0.66);
    };

    // Wait for the video's loadedmetadata event using jQuery listener
    $video.on('loadedmetadata', initScrollTrigger);

    // If metadata is already loaded, trigger immediately
    if (videoEl.readyState >= 1) {
      initScrollTrigger();
    }

    return () => {
      $video.off('loadedmetadata', initScrollTrigger);
      if (tl) {
        tl.kill();
        if (tl.scrollTrigger) {
          tl.scrollTrigger.kill();
        }
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="video-scroll-track">
      <div className="video-sticky-container">
        <video
          ref={videoRef}
          className="scrub-video"
          src={coreRenderVideo}
          muted
          playsInline
          preload="auto"
        />

        <div className="overlay-text-container">
          <h2 className="video-headline text-1">Pixel-Perfect Engineering.</h2>
          <h2 className="video-headline text-2">Intelligent Automation.</h2>
          <h2 className="video-headline text-3">Uncompromising Performance.</h2>
        </div>
      </div>
    </div>
  );
}
