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

// Vite eager glob: import all PNGs from the Rock-animation folder.
// The object keys are the original module paths; values are the resolved URLs.
const frameModules = import.meta.glob<{ default: string }>(
  '/src/assets/Rock-animation/*.png',
  { eager: true }
);

// Sort keys so frames are in alphabetical / numeric order.
const sortedUrls: string[] = Object.keys(frameModules)
  .sort()
  .map((key) => frameModules[key].default);

export const TOTAL_FRAMES = sortedUrls.length;

// Maximum simultaneous Image loads (tune for network & browser limits)
const CONCURRENCY = 8;

interface UseImageSequenceReturn {
  /** Stable ref – mutated in place, never causes re-renders */
  imagesRef: React.MutableRefObject<HTMLImageElement[]>;
  /** 0 → 1 loading progress */
  progress: number;
  /** True once all frames are decoded */
  isReady: boolean;
}

export function useImageSequence(): UseImageSequenceReturn {
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const load = useCallback(async () => {
    const total = sortedUrls.length;
    if (total === 0) return;

    const images = new Array<HTMLImageElement>(total);
    let loaded = 0;

    // Concurrency-limited loader
    const queue = [...sortedUrls];
    let index = 0;

    const loadNext = (): Promise<void> => {
      if (index >= queue.length) return Promise.resolve();
      const i = index++;
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
          // Even on error, fill slot and move on to avoid deadlock
          images[i] = img;
          loaded++;
          setProgress(loaded / total);
          resolve();
        };
        img.src = url;
      }).then(() => loadNext());
    };

    // Start CONCURRENCY workers
    const workers = Array.from({ length: Math.min(CONCURRENCY, total) }, loadNext);
    await Promise.all(workers);

    imagesRef.current = images;
    setIsReady(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { imagesRef, progress, isReady };
}
