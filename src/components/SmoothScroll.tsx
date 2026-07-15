import { useEffect, useRef } from 'react';
import { ReactLenis, type LenisRef } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProps {
  children: React.ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<LenisRef | null>(null);

  useEffect(() => {
    let lenisInstance = lenisRef.current?.lenis;

    function update(time: number) {
      if (!lenisInstance && lenisRef.current?.lenis) {
        lenisInstance = lenisRef.current.lenis;
        lenisInstance.on('scroll', ScrollTrigger.update);
        // Recalculate ScrollTrigger start/end coordinates once scroll container is ready
        ScrollTrigger.refresh();
      }
      lenisInstance?.raf(time * 1000);
    }

    gsap.ticker.add(update);

    // Initial refresh after render queue completes
    const timeoutId = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      lenisInstance?.off('scroll', ScrollTrigger.update);
      gsap.ticker.remove(update);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <ReactLenis
      ref={lenisRef}
      autoRaf={false}
      root
      options={{
        duration: 2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
