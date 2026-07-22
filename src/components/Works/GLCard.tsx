/**
 * GLCard — DataTexture pixel-grid distortion hover effect.
 *
 * Fix: object-fit:cover UV correction in shader.
 *   - Pass uImageAspect (image w/h) and uContainerAspect (canvas w/h) as uniforms
 *   - Fragment shader computes "cover" UVs before applying distortion
 *   - Original image proportions preserved — no stretch
 */

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import './GLCard.scss';

interface GLCardProps {
  img: string;
  num: string;
  title: string;
  tags: string[];
  url?: string;
  tall?: boolean;
  colIndex?: number;
}

// ── Vertex shader ──────────────────────────────────────────────────────────────
const VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ── Fragment shader — cover UVs + DataTexture distortion ──────────────────────
const FRAG = `
  uniform sampler2D uTexture;
  uniform sampler2D uDataTexture;
  uniform float     uImageAspect;      // image intrinsic width / height
  uniform float     uContainerAspect;  // canvas width / height

  varying vec2 vUv;

  // Compute object-fit:cover UV so the image is never stretched
  vec2 coverUV(vec2 uv) {
    float imageAspect     = uImageAspect;
    float containerAspect = uContainerAspect;

    vec2 result = uv;

    if (containerAspect > imageAspect) {
      // Container wider than image — fill width, crop top/bottom
      float scale = imageAspect / containerAspect;
      result.y = (uv.y - 0.5) * scale + 0.5;
    } else {
      // Container taller than image — fill height, crop sides
      float scale = containerAspect / imageAspect;
      result.x = (uv.x - 0.5) * scale + 0.5;
    }

    return result;
  }

  void main() {
    vec4 data = texture2D(uDataTexture, vUv);

    // Base cover UV
    vec2 baseUV = coverUV(vUv);

    // Apply distortion on top of cover UV
    vec2 distortedUV = baseUV - data.rg * 0.08;

    // Chromatic aberration — R/G/B split along X
    float r = texture2D(uTexture, distortedUV + vec2(0.008, 0.0) * data.r).r;
    float g = texture2D(uTexture, distortedUV).g;
    float b = texture2D(uTexture, distortedUV - vec2(0.008, 0.0) * data.r).b;

    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

const GRID_W  = 32;
const GRID_H  = 32;
const SIZE    = GRID_W * GRID_H;
const DAMPING = 0.90;
const RADIUS  = 5;

export default function GLCard({ img, num, title, tags, url, tall, colIndex = 0 }: GLCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapRef      = useRef<HTMLDivElement>(null);
  const titleRef     = useRef<HTMLHeadingElement>(null);
  const rafRef       = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    const wrapper   = wrapRef.current;
    if (!container || !wrapper) return;

    // ── Scene ─────────────────────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    wrapper.appendChild(renderer.domElement);

    // ── Uniforms ──────────────────────────────────────────────────────────────
    const uniforms = {
      uTexture:         { value: new THREE.Texture() },
      uDataTexture:     { value: new THREE.Texture() },
      uImageAspect:     { value: 1.0 },
      uContainerAspect: { value: wrapper.clientWidth / wrapper.clientHeight },
    };

    // ── DataTexture grid ───────────────────────────────────────────────────────
    const pixelData = new Float32Array(4 * SIZE);
    for (let i = 0; i < SIZE; i++) pixelData[i * 4 + 3] = 1;

    const dataTexture = new THREE.DataTexture(
      pixelData, GRID_W, GRID_H, THREE.RGBAFormat, THREE.FloatType
    );
    dataTexture.needsUpdate = true;
    uniforms.uDataTexture.value = dataTexture;

    // ── Image texture ─────────────────────────────────────────────────────────
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(img, (tex) => {
      tex.generateMipmaps = false;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      uniforms.uTexture.value = tex;
      // Set true image aspect ratio once loaded
      if (tex.image) {
        uniforms.uImageAspect.value = tex.image.width / tex.image.height;
      }
    });
    uniforms.uTexture.value = texture;

    // ── Material ──────────────────────────────────────────────────────────────
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
    });
    scene.add(new THREE.Mesh(geometry, material));

    // ── Mouse tracking ────────────────────────────────────────────────────────
    const mouse = { x: 0, y: 0, prevX: 0, prevY: 0, inside: false };
    const lerpMouse = { x: 0, y: 0 };
    const rawMouse  = { x: 0, y: 0 };
    let titleStrength = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) / rect.width;
      mouse.y = 1.0 - (e.clientY - rect.top) / rect.height;
      rawMouse.x = mouse.x *  2 - 1;
      rawMouse.y = mouse.y *  2 - 1;
      mouse.inside = true;
    };
    const handleMouseLeave = () => { mouse.inside = false; };

    container.addEventListener('mousemove',  handleMouseMove, { passive: true });
    container.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    // ── RAF loop ──────────────────────────────────────────────────────────────
    function updateDataTexture() {
      const vX = mouse.x - mouse.prevX;
      const vY = mouse.y - mouse.prevY;
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;

      // Damp all cells
      for (let i = 0; i < SIZE; i++) {
        pixelData[i * 4]     *= DAMPING;
        pixelData[i * 4 + 1] *= DAMPING;
      }

      // Inject velocity when mouse is moving inside card
      if (mouse.inside && (Math.abs(vX) > 0.0001 || Math.abs(vY) > 0.0001)) {
        const gx = Math.floor(mouse.x * GRID_W);
        const gy = Math.floor(mouse.y * GRID_H);

        for (let y = Math.max(0, gy - RADIUS); y < Math.min(GRID_H, gy + RADIUS); y++) {
          for (let x = Math.max(0, gx - RADIUS); x < Math.min(GRID_W, gx + RADIUS); x++) {
            const dist = Math.hypot(x - gx, y - gy);
            if (dist < RADIUS) {
              const idx     = 4 * (x + y * GRID_W);
              const falloff = 1.0 - dist / RADIUS;
              pixelData[idx]     += vX * 25.0 * falloff;
              pixelData[idx + 1] += vY * 25.0 * falloff;
            }
          }
        }
      }

      dataTexture.needsUpdate = true;
    }

    function animate() {
      rafRef.current = requestAnimationFrame(animate);
      updateDataTexture();

      // Title parallax
      const lf = 0.08;
      lerpMouse.x += (rawMouse.x - lerpMouse.x) * lf;
      lerpMouse.y += (rawMouse.y - lerpMouse.y) * lf;
      const targetStr = mouse.inside ? 1.0 : 0.0;
      titleStrength  += (targetStr - titleStrength) * (lf * 0.85);

      if (titleRef.current) {
        titleRef.current.style.transform =
          `translate(${lerpMouse.x * 8 * titleStrength}px, ${lerpMouse.y * -5 * titleStrength}px)`;
      }

      renderer.render(scene, camera);
    }
    animate();

    // ── Resize — update both renderer size and container aspect uniform ────────
    const handleResize = () => {
      if (!wrapper) return;
      const w = wrapper.clientWidth;
      const h = wrapper.clientHeight;
      renderer.setSize(w, h);
      uniforms.uContainerAspect.value = w / h;
    };
    window.addEventListener('resize', handleResize);

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove',  handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      geometry.dispose();
      material.dispose();
      texture.dispose();
      dataTexture.dispose();
      renderer.dispose();
      if (wrapper.contains(renderer.domElement)) {
        wrapper.removeChild(renderer.domElement);
      }
    };
  }, [img]);

  const href = url || `#project-${num}`;

  return (
    <div
      className={`glc_card${tall ? ' glc_card--tall' : ''}`}
      style={{ '--col-index': colIndex } as React.CSSProperties}
      ref={containerRef}
    >
      <a
        href={href}
        target={url ? '_blank' : undefined}
        rel={url ? 'noopener noreferrer' : undefined}
        className="glc_link"
        aria-label={`View ${title}`}
      >
        {/* Three.js renderer injects canvas here */}
        <div className="glc_canvas_wrap" ref={wrapRef} />

        {/* Typography overlay */}
        <div className="glc_meta">
          <span className="glc_num">{num}</span>
          <div className="glc_body">
            <h3 className="glc_title" ref={titleRef}>{title}</h3>
            <div className="glc_tags">
              {tags.map(tag => <span key={tag} className="glc_tag">{tag}</span>)}
            </div>
          </div>
          <span className="glc_arrow">↗</span>
        </div>
      </a>
    </div>
  );
}
