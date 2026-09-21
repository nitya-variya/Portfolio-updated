/**
 * useImageSequence
 *
 * Dynamically imports every frame from a Vite glob pattern,
 * decodes them in parallel using Image() objects, caches the
 * results in a stable ref (never triggers a re-render),
 * and reports a numeric loading progress to the caller.
 *
 * Uses a small concurrency pool so we never open 168 network
 * requests simultaneously – stays well within browser limits.
 */
import { useEffect, useRef, useState, useCallback } from 'react';

// Vite eager glob: import all WebP frames from the Rock-animation folder.
const frameModules = import.meta.glob<{ default: string }>(
  '/src/assets/Rock-animation/*.webp',
  { eager: true }
);

// Sort keys so frames are in alphabetical / numeric order.
const sortedUrls: string[] = Object.keys(frameModules)
  .sort()
  .map((key) => frameModules[key].default);

export const TOTAL_FRAMES = sortedUrls.length;

// Maximum simultaneous Image loads
const CONCURRENCY = 6;

interface UseImageSequenceReturn {
  /** Stable ref – mutated in place, never causes re-renders */
  imagesRef: React.MutableRefObject<HTMLImageElement[]>;
  /** 0 → 1 loading progress */
  progress: number;
  /** True once all frames are decoded */
  isReady: boolean;
  /** True as soon as frame 0 is ready for instant rendering */
  isInitialReady: boolean;
}

export function useImageSequence(): UseImageSequenceReturn {
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isInitialReady, setIsInitialReady] = useState(false);
  const loadingStartedRef = useRef(false);

  // 1. Instantly load frame 0 for zero-delay canvas mount
  const loadInitialFrame = useCallback(() => {
    if (sortedUrls.length === 0) return;
    const img0 = new Image();
    img0.decoding = 'async';
    img0.src = sortedUrls[0];
    img0.onload = () => {
      if (!imagesRef.current.length) {
        imagesRef.current = new Array<HTMLImageElement>(sortedUrls.length);
      }
      imagesRef.current[0] = img0;
      setIsInitialReady(true);
    };
  }, []);

  // 2. Load the entire sequence progressively in background
  const loadFullSequence = useCallback(async () => {
    if (loadingStartedRef.current) return;
    loadingStartedRef.current = true;

    const total = sortedUrls.length;
    if (total === 0) return;

    if (!imagesRef.current.length) {
      imagesRef.current = new Array<HTMLImageElement>(total);
    }
    const images = imagesRef.current;
    let loaded = images[0]?.complete ? 1 : 0;

    const queue = [...sortedUrls];
    let index = 0;

    const loadNext = (): Promise<void> => {
      if (index >= queue.length) return Promise.resolve();
      const i = index++;
      
      // Skip if already loaded (e.g. frame 0)
      if (images[i]?.complete) {
        return loadNext();
      }

      const url = queue[i];
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          images[i] = img;
          loaded++;
          setProgress(loaded / total);
          resolve();
        };
        img.onerror = () => {
          images[i] = img;
          loaded++;
          setProgress(loaded / total);
          resolve();
        };
        img.src = url;
      }).then(() => loadNext());
    };

    const workers = Array.from({ length: Math.min(CONCURRENCY, total) }, loadNext);
    await Promise.all(workers);

    setIsReady(true);
    setIsInitialReady(true);
  }, []);

  useEffect(() => {
    loadInitialFrame();

    // Defer loading the remaining frames until the main thread is idle or after 800ms
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(() => loadFullSequence(), { timeout: 1500 });
      } else {
        loadFullSequence();
      }
    }, 600);

    // If user starts scrolling, start loading immediately
    const handleScroll = () => {
      loadFullSequence();
      window.removeEventListener('scroll', handleScroll);
    };
    window.addEventListener('scroll', handleScroll, { passive: true, once: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loadInitialFrame, loadFullSequence]);

  return { imagesRef, progress, isReady, isInitialReady };
}
