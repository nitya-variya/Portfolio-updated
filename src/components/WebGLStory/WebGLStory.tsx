import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import jQuery from 'jquery';
import './WebGLStory.scss';

gsap.registerPlugin(ScrollTrigger);

export default function WebGLStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // --- Three.js Setup ---
    const scene = new THREE.Scene();

    // Set up camera
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 8;

    // Set up renderer with alpha and antialias
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Resize handler to match canvas dimensions
    const resizeCanvas = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create complex shape: IcosahedronGeometry (radius 2, detail 1)
    const geometry = new THREE.IcosahedronGeometry(2, 1);

    // Wireframe Mesh: MeshBasicMaterial
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      wireframe: true,
      color: 0xA3652A,
      transparent: true,
      opacity: 1,
    });
    const wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);

    // Solid Mesh: MeshStandardMaterial
    const solidMaterial = new THREE.MeshStandardMaterial({
      color: 0x1A1A1A,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0,
    });
    const solidMesh = new THREE.Mesh(geometry, solidMaterial);

    // Create Group and add meshes
    const group = new THREE.Group();
    group.add(wireframeMesh);
    group.add(solidMesh);
    scene.add(group);

    // Ambient light and Directional light (color #A3652A)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xA3652A, 2.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Object containing animated values for reference in loop
    const rotationSpeed = { value: 1 };

    // GSAP ScrollTrigger timeline scrubbing
    const scrubTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: '.webgl-story-section',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      },
    });

    // Phase 1 (0% to 50%)
    scrubTimeline
      .to(group.scale, { x: 1.3, y: 1.3, z: 1.3, ease: 'none', duration: 0.5 }, 0)
      .to(rotationSpeed, { value: 3, ease: 'none', duration: 0.5 }, 0)
      .to(wireframeMesh.scale, { x: 1.2, y: 1.2, z: 1.2, ease: 'none', duration: 0.5 }, 0)

      // Phase 2 (50% to 100%)
      .to(wireframeMesh.scale, { x: 1.0, y: 1.0, z: 1.0, ease: 'none', duration: 0.5 }, 0.5)
      .to(wireframeMaterial, { opacity: 0, ease: 'none', duration: 0.5 }, 0.5)
      .to(solidMaterial, { opacity: 1, ease: 'none', duration: 0.5 }, 0.5);

    // Loop through pillars and create ScrollTriggers using explicit jQuery keyword
    jQuery('.story-pillar').each(function (this: HTMLElement) {
      const element = this;
      gsap.fromTo(
        element,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 80%',
          },
        }
      );
    });

    // RequestAnimationFrame loop
    let animationFrameId: number;
    const animate = () => {
      // Rotation logic using speed variable animated by GSAP
      group.rotation.y += 0.005 * rotationSpeed.value;
      group.rotation.x += 0.003 * rotationSpeed.value;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      geometry.dispose();
      wireframeMaterial.dispose();
      solidMaterial.dispose();

      // Clean up triggers created in this component
      ScrollTrigger.getAll().forEach((st) => {
        if (
          st.trigger &&
          (jQuery(st.trigger).hasClass('webgl-story-section') ||
            jQuery(st.trigger).hasClass('story-pillar'))
        ) {
          st.kill();
        }
      });
    };
  }, []);

  return (
    <section className="webgl-story-section" ref={containerRef}>
      <div className="story-container">
        {/* LEFT SIDE: Pinned Three.js Canvas */}
        <div className="canvas-sticky-wrapper">
          <canvas id="value-canvas" ref={canvasRef}></canvas>
        </div>

        {/* RIGHT SIDE: The Scrolling Pillars */}
        <div className="story-scroll-content">
          <div className="story-pillar">
            <span className="pillar-number">01</span>
            <h3 className="pillar-title">Architectural Foundation</h3>
            <p className="pillar-text">
              I don't just build websites; I structure scalable digital environments. Every line of
              code is written with intention, ensuring your platform is as robust under the hood as
              it is beautiful on the surface.
            </p>
          </div>

          <div className="story-pillar">
            <span className="pillar-number">02</span>
            <h3 className="pillar-title">Kinetic Interactions</h3>
            <p className="pillar-text">
              Static web pages are dead. I engineer fluid, physics-based micro-interactions and
              GSAP animations that make the browser feel like a high-end native application.
            </p>
          </div>

          <div className="story-pillar">
            <span className="pillar-number">03</span>
            <h3 className="pillar-title">Zero-Compromise Performance</h3>
            <p className="pillar-text">
              Premium aesthetics mean nothing if the site lags. I obsess over the technical
              details—optimizing assets, refining rendering paths, and ensuring a flawless 60fps
              experience across all devices.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
