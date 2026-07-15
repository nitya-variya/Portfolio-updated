import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface LoaderProps {
  onComplete?: () => void;
}

export default function Loader({ onComplete }: LoaderProps) {
  const masterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const master = masterRef.current;
    if (!master) return;

    const counterNum = master.querySelector('.fs_counter_num');
    const slice1 = master.querySelector('.fs_slice_1');
    const slice2 = master.querySelector('.fs_slice_2') as HTMLElement;
    const slice3 = master.querySelector('.fs_slice_3');
    const doorTop = master.querySelector('.fs_door_top');
    const doorBottom = master.querySelector('.fs_door_bottom');
    const loaderContent = master.querySelector('.fs_loader_content');
    const counter = { val: 0 };

    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });

    tl.to([slice1, slice2, slice3], {
      opacity: 1,
      duration: 0.4,
      stagger: 0.1,
      ease: 'power2.out'
    });

    tl.to(counter, {
      val: 100,
      duration: 2.5,
      ease: 'power4.inOut',
      onUpdate: () => {
        if (counterNum) (counterNum as HTMLElement).textContent = String(Math.round(counter.val));
      }
    }, '<');

    tl.to(slice1, {
      x: -20,
      duration: 2.5,
      ease: 'power4.inOut'
    }, '<');

    tl.to(slice2, {
      x: 20,
      duration: 2.5,
      ease: 'power4.inOut'
    }, '<');

    tl.to(slice3, {
      x: -20,
      duration: 2.5,
      ease: 'power4.inOut'
    }, '<');

    tl.to(slice1, {
      x: 0,
      duration: 0.3,
      ease: 'expo.out'
    });

    tl.to(slice2, {
      x: 0,
      duration: 0.3,
      ease: 'expo.out'
    }, '<');

    tl.to(slice3, {
      x: 0,
      duration: 0.3,
      ease: 'expo.out'
    }, '<');

    tl.to(slice2, {
      color: 'transparent',
      backgroundImage: 'linear-gradient(90deg, #A3652A, #FEFBF2, #733D19)',
      webkitBackgroundClip: 'text',
      webkitTextStroke: '0px',
      duration: 0.4,
      ease: 'power2.inOut',
      onStart: () => {
        slice2.style.backgroundClip = 'text';
        slice2.style.webkitTextFillColor = 'transparent';
      }
    });

    tl.to(doorTop, {
      yPercent: -100,
      duration: 1,
      ease: 'power4.inOut'
    }, '+=0.2');

    tl.to(doorBottom, {
      yPercent: 100,
      duration: 1,
      ease: 'power4.inOut'
    }, '<');

    tl.to(loaderContent, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out'
    }, '<+=0.1');

    tl.set(master, { display: 'none' });

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div className="fs_loader_master" ref={masterRef}>
      <div className="fs_vault_door fs_door_top"></div>
      <div className="fs_vault_door fs_door_bottom"></div>

      <div className="fs_loader_content">
        <div className="fs_sliced_wrapper">
          <h1 className="fs_slice fs_slice_1">NITYA</h1>
          <h1 className="fs_slice fs_slice_2">NITYA</h1>
          <h1 className="fs_slice fs_slice_3">NITYA</h1>
        </div>

        <div className="fs_counter_wrapper">
          <span className="fs_counter_label">Compiling architecture...</span>
          <span className="fs_counter_num">0</span>
          <span className="fs_counter_symbol">%</span>
        </div>
      </div>
    </div>
  );
}
