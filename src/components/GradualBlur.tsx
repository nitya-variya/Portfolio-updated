import { useRef, useEffect } from 'react';

interface GradualBlurProps {
  target?: 'parent' | 'self' | 'page';
  position?: 'top' | 'bottom';
  height?: string;
  strength?: number;
  divCount?: number;
  curve?: 'linear' | 'bezier';
}

/**
 * GradualBlur — Ultra-smooth continuous backdrop-filter blur using
 * gradient mask feathering. Completely eliminates striping and banding lines.
 */
export default function GradualBlur({
  target = 'parent',
  position = 'bottom',
  height = '20vh',
}: GradualBlurProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (target === 'parent' && containerRef.current?.parentElement) {
      const parent = containerRef.current.parentElement;
      if (getComputedStyle(parent).position === 'static') {
        parent.style.position = 'relative';
      }
    }
  }, [target]);

  const isBottom = position === 'bottom';
  const maskDirection = isBottom ? 'to top' : 'to bottom';

  return (
    <div
      ref={containerRef}
      className="fs_gradual_blur"
      style={{
        position: 'absolute',
        [position]: 0,
        left: 0,
        width: '100%',
        height,
        pointerEvents: 'none',
        zIndex: 99,
        overflow: 'hidden',
      }}
    >
      {/* Layer 1: Heavy Deep Blur (Bottom Core) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          maskImage: `linear-gradient(${maskDirection}, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 25%, rgba(0,0,0,0) 60%)`,
          WebkitMaskImage: `linear-gradient(${maskDirection}, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 25%, rgba(0,0,0,0) 60%)`,
        }}
      />

      {/* Layer 2: Medium Smooth Blur (Mid Feather) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          maskImage: `linear-gradient(${maskDirection}, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 45%, rgba(0,0,0,0) 80%)`,
          WebkitMaskImage: `linear-gradient(${maskDirection}, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 45%, rgba(0,0,0,0) 80%)`,
        }}
      />

      {/* Layer 3: Soft Feather Blur (Top Transition) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          maskImage: `linear-gradient(${maskDirection}, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0) 100%)`,
          WebkitMaskImage: `linear-gradient(${maskDirection}, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0) 100%)`,
        }}
      />

      {/* Layer 4: Ultra-Continuous Dark Gradient Fade (No Stripes) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(${maskDirection}, rgba(5, 5, 5, 0.95) 0%, rgba(5, 5, 5, 0.65) 35%, rgba(5, 5, 5, 0.2) 70%, transparent 100%)`,
        }}
      />
    </div>
  );
}
