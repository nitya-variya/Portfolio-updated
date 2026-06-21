import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import jQuery from 'jquery';
import './Manifesto.scss';

export default function Manifesto() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const spark = jQuery('.interactive-spark');

    const handleMouseEnter = function (this: HTMLElement) {
      gsap.killTweensOf(this);

      gsap.set(this, {
        backgroundImage: 'linear-gradient(to right, #A3652A, #EFB06E, #FEFBF2, #F9C176, #E77B33, #DC702A, #733D19)',
        backgroundSize: '400px 100px',
        backgroundClip: 'text',
        webkitBackgroundClip: 'text',
        webkitTextFillColor: 'transparent',
        color: 'transparent'
      });

      gsap.fromTo(this,
        { backgroundPositionX: '0px' },
        { backgroundPositionX: '400px', duration: 1.2, ease: 'power2.out' }
      );
    };

    const handleMouseLeave = function (this: HTMLElement) {
      gsap.killTweensOf(this);

      gsap.to(this, {
        color: '#555555',
        webkitTextFillColor: '#555555',
        duration: 0.4,
        ease: 'power2.out',
        onComplete: () => {
          gsap.set(this, {
            backgroundImage: 'none'
          });
        }
      });
    };

    spark.on('mouseenter', handleMouseEnter);
    spark.on('mouseleave', handleMouseLeave);

    return () => {
      spark.off('mouseenter', handleMouseEnter);
      spark.off('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="manifesto-section"
      aria-label="Kinetic manifesto section"
    >
      <div className="hook-container">
        <h2 className="minimal-hook">
          3 years <br /> engineering
          <span className="interactive-pill">
            <span className="pill-text">scalable</span>
            <span className="px-measure top-measure">&lt; cleanly structured &gt;</span>
          </span>{' '}
          architecture. Zero technical debt.<br /> Absolute polish.
        </h2>
      </div>
    </section>
  );
}

