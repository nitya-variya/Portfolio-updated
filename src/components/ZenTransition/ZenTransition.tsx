import { useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { createNoise3D, createNoise2D } from '../../utils/simplexNoise';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ZenTransition.scss';

gsap.registerPlugin(ScrollTrigger);

// ── Step Content Data ─────────────────────────────────────────────────────────
const STEPS = [
  {
    num: '01',
    title: 'Rooted in quiet discipline.',
    desc: 'Before code is written, system architecture is conceived in stillness—building for stability and clarity from day one.',
    positionClass: 'zt_step--left-top',
  },
  {
    num: '02',
    title: 'Filtered to its purest form.',
    desc: 'Stripping away complexity like water shaping stone, until only raw performance and refined intention remain.',
    positionClass: 'zt_step--right-mid',
  },
  {
    num: '03',
    title: 'Built to endure.',
    desc: 'Digital artifacts crafted with mathematical precision and natural intuition—designed to leave a lasting imprint.',
    positionClass: 'zt_step--left-bottom',
  },
];

// ── fBm Helpers ───────────────────────────────────────────────────────────────
function fbm3(noise3D: ReturnType<typeof createNoise3D>, x: number, y: number, z: number, octaves = 4) {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxAmp = 0;
  for (let i = 0; i < octaves; i++) {
    value += noise3D(x * frequency, y * frequency, z * frequency) * amplitude;
    maxAmp += amplitude;
    amplitude *= 0.5;
    frequency *= 2.15;
  }
  return value / maxAmp;
}

function fbm2(noise2D: ReturnType<typeof createNoise2D>, x: number, y: number, octaves = 4) {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxAmp = 0;
  for (let i = 0; i < octaves; i++) {
    value += noise2D(x * frequency, y * frequency) * amplitude;
    maxAmp += amplitude;
    amplitude *= 0.5;
    frequency *= 2.05;
  }
  return value / maxAmp;
}

// ── 1. Natural Monolith Geometry (fBm Layered Simplex Noise) ──────────────────
function buildNaturalStoneGeometry() {
  const stoneGeo = new THREE.DodecahedronGeometry(1.8, 24);
  const posAttr = stoneGeo.attributes.position;
  const vertex = new THREE.Vector3();
  const noise3D = createNoise3D();

  for (let i = 0; i < posAttr.count; i++) {
    vertex.fromBufferAttribute(posAttr, i);

    const formNoise = fbm3(noise3D, vertex.x * 0.55, vertex.y * 0.55, vertex.z * 0.55, 3);
    const detailNoise = fbm3(noise3D, vertex.x * 3.2, vertex.y * 3.2, vertex.z * 3.2, 3);

    const taper = 1.0 + (vertex.y > 0 ? vertex.y * 0.12 : -vertex.y * 0.08);
    const displacement = 1 + formNoise * 0.22 + detailNoise * 0.05;

    vertex.x *= taper * displacement;
    vertex.y *= 1.08 * displacement;
    vertex.z *= taper * displacement;

    posAttr.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  stoneGeo.computeVertexNormals();
  return stoneGeo;
}

// ── 2. Coherent Procedural Stone PBR Texture (Color + Roughness + Normal Map) ─
function createNaturalStonePBR(): {
  colorMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
} {
  const size = 1024;
  const noise2D = createNoise2D();
  const veinNoise2D = createNoise2D();
  const lichenNoise2D = createNoise2D();

  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const colorCtx = colorCanvas.getContext('2d')!;
  const colorImg = colorCtx.createImageData(size, size);
  const cPix = colorImg.data;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const roughCtx = roughCanvas.getContext('2d')!;
  const roughImg = roughCtx.createImageData(size, size);
  const rPix = roughImg.data;

  const height = new Float32Array(size * size);

  const baseA = new THREE.Color('#2a2622'); // warm dark basalt
  const baseB = new THREE.Color('#1a1815'); // near-black recess
  const baseC = new THREE.Color('#3a332c'); // lighter mineral fleck patch
  const lichen = new THREE.Color('#4a5c3a'); // muted moss-stain
  const tmp = new THREE.Color();

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = y * size + x;
      const nx = x / size;
      const ny = y / size;

      const patch = fbm2(noise2D, nx * 4, ny * 4, 4);
      const grain = fbm2(noise2D, nx * 24, ny * 24, 2) * 0.15;

      const mix = (patch + 1) / 2;
      tmp.copy(baseA).lerp(baseB, Math.max(0, 0.5 - mix));
      tmp.lerp(baseC, Math.max(0, mix - 0.6) * 2);

      const vein = veinNoise2D(nx * 6, ny * 6);
      const veinLine = 1 - Math.min(1, Math.abs(vein) * 14);
      if (veinLine > 0) {
        tmp.lerp(new THREE.Color('#8a7d68'), veinLine * 0.5);
      }

      const lichenVal = fbm2(lichenNoise2D, nx * 3, ny * 3, 3);
      if (lichenVal > 0.35) {
        tmp.lerp(lichen, Math.min(1, (lichenVal - 0.35) * 2));
      }

      const g = Math.min(1, Math.max(0, grain));
      const idx4 = idx * 4;
      cPix[idx4] = Math.round((tmp.r + g * 0.06) * 255);
      cPix[idx4 + 1] = Math.round((tmp.g + g * 0.06) * 255);
      cPix[idx4 + 2] = Math.round((tmp.b + g * 0.06) * 255);
      cPix[idx4 + 3] = 255;

      let roughVal = 0.55 + patch * 0.15;
      if (veinLine > 0) roughVal -= veinLine * 0.25;
      if (lichenVal > 0.35) roughVal += 0.25;
      roughVal = Math.min(1, Math.max(0.1, roughVal));
      rPix[idx4] = rPix[idx4 + 1] = rPix[idx4 + 2] = Math.round(roughVal * 255);
      rPix[idx4 + 3] = 255;

      height[idx] = patch * 0.6 + grain * 0.4 - veinLine * 0.3;
    }
  }

  colorCtx.putImageData(colorImg, 0, 0);
  roughCtx.putImageData(roughImg, 0, 0);

  // Sobel-style normal map derivation
  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = size;
  normalCanvas.height = size;
  const normalCtx = normalCanvas.getContext('2d')!;
  const normalImg = normalCtx.createImageData(size, size);
  const nPix = normalImg.data;
  const strength = 2.5;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const xL = height[y * size + ((x - 1 + size) % size)];
      const xR = height[y * size + ((x + 1) % size)];
      const yU = height[((y - 1 + size) % size) * size + x];
      const yD = height[((y + 1) % size) * size + x];

      const dx = (xL - xR) * strength;
      const dy = (yU - yD) * strength;
      const dz = 1.0;
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz);

      const idx4 = (y * size + x) * 4;
      nPix[idx4] = Math.round(((dx / len) * 0.5 + 0.5) * 255);
      nPix[idx4 + 1] = Math.round(((dy / len) * 0.5 + 0.5) * 255);
      nPix[idx4 + 2] = Math.round(((dz / len) * 0.5 + 0.5) * 255);
      nPix[idx4 + 3] = 255;
    }
  }
  normalCtx.putImageData(normalImg, 0, 0);

  const colorMap = new THREE.CanvasTexture(colorCanvas);
  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  const normalMap = new THREE.CanvasTexture(normalCanvas);

  [colorMap, roughnessMap, normalMap].forEach((t) => {
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 2);
    t.needsUpdate = true;
  });

  return { colorMap, roughnessMap, normalMap };
}

// ── 3. MOSS: Instanced Clumps of Bumpy Icosahedron Nubs ──────────────────────
function buildMossClumps(clumpCenters: THREE.Vector3[]): {
  mesh: THREE.InstancedMesh;
  geo: THREE.IcosahedronGeometry;
  mat: THREE.MeshStandardMaterial;
} {
  const DOTS_PER_CLUMP = 55;
  const total = clumpCenters.length * DOTS_PER_CLUMP;

  const nubGeo = new THREE.IcosahedronGeometry(0.045, 1);
  const mossMat = new THREE.MeshStandardMaterial({
    roughness: 0.92,
    metalness: 0,
    flatShading: true,
  });

  const mossInstanced = new THREE.InstancedMesh(nubGeo, mossMat, total);
  mossInstanced.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(total * 3), 3);

  const dummy = new THREE.Object3D();
  const colorDark = new THREE.Color('#2f4a20');
  const colorLit = new THREE.Color('#7ba043');
  const colorDry = new THREE.Color('#9c8f4a');

  let idx = 0;
  clumpCenters.forEach((center) => {
    const clumpRadius = 0.12 + Math.random() * 0.1;
    const clumpHeight = 0.05 + Math.random() * 0.06;

    for (let i = 0; i < DOTS_PER_CLUMP; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * clumpRadius;
      const h = Math.pow(Math.random(), 1.5) * clumpHeight;

      dummy.position.set(
        center.x + Math.cos(theta) * r,
        center.y + h,
        center.z + Math.sin(theta) * r
      );
      const s = 0.6 + Math.random() * 1.1;
      dummy.scale.setScalar(s);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      dummy.updateMatrix();
      mossInstanced.setMatrixAt(idx, dummy.matrix);

      const roll = Math.random();
      const c = roll > 0.94 ? colorDry.clone() : colorDark.clone().lerp(colorLit, Math.random());
      mossInstanced.setColorAt(idx, c);

      idx++;
    }
  });

  mossInstanced.instanceMatrix.needsUpdate = true;
  if (mossInstanced.instanceColor) mossInstanced.instanceColor.needsUpdate = true;
  return { mesh: mossInstanced, geo: nubGeo, mat: mossMat };
}

// ── 4. FLOWERS: Extruded Petal Geometry & Radial Array ────────────────────────
function createPetalGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.quadraticCurveTo(0.045, 0.06, 0.026, 0.15);
  shape.quadraticCurveTo(0.014, 0.19, 0, 0.205);
  shape.quadraticCurveTo(-0.014, 0.19, -0.026, 0.15);
  shape.quadraticCurveTo(-0.045, 0.06, 0, 0);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.006,
    bevelEnabled: true,
    bevelThickness: 0.003,
    bevelSize: 0.003,
    bevelSegments: 2,
    curveSegments: 10,
  });
  geo.translate(0, 0, -0.003);
  return geo;
}

type FlowerOptions = {
  petalColor: string;
  centerColor: string;
  petalCount?: number;
  scale?: number;
  splay?: number;
};

function createFlower(
  opts: FlowerOptions,
  sharedPetalGeo: THREE.ExtrudeGeometry,
  sharedCenterGeo: THREE.SphereGeometry
): THREE.Group {
  const { petalColor, centerColor, petalCount = 9, scale = 1, splay = 0.95 } = opts;

  const group = new THREE.Group();

  const petalMat = new THREE.MeshStandardMaterial({
    color: petalColor,
    roughness: 0.4,
    side: THREE.DoubleSide,
    emissive: petalColor,
    emissiveIntensity: 0.04,
  });

  for (let i = 0; i < petalCount; i++) {
    const pivot = new THREE.Object3D();
    const petal = new THREE.Mesh(sharedPetalGeo, petalMat);
    pivot.add(petal);
    pivot.rotation.x = -splay + (Math.random() - 0.5) * 0.15;
    pivot.rotation.y = (i / petalCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.1;
    group.add(pivot);
  }

  const centerMat = new THREE.MeshStandardMaterial({
    color: centerColor,
    roughness: 0.55,
    emissive: centerColor,
    emissiveIntensity: 0.2,
  });
  group.add(new THREE.Mesh(sharedCenterGeo, centerMat));

  group.scale.setScalar(scale);
  return group;
}

export default function ZenTransition() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textStepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    // ── Three.js Scene Setup ─────────────────────────────────────────────────
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    // Renderer with HiDPI ratio & antialias
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Root Composite Assembly Group
    const compositeGroup = new THREE.Group();
    scene.add(compositeGroup);

    // ── 1. Natural Monolith Geometry & Coherent PBR Material ────────────────
    const stoneGeo = buildNaturalStoneGeometry();
    const { colorMap, roughnessMap, normalMap } = createNaturalStonePBR();

    const stoneMaterial = new THREE.MeshStandardMaterial({
      map: colorMap,
      roughnessMap,
      roughness: 1.0,
      metalness: 0.05,
      normalMap,
      normalScale: new THREE.Vector2(1.2, 1.2),
    });

    const stoneMesh = new THREE.Mesh(stoneGeo, stoneMaterial);
    compositeGroup.add(stoneMesh);

    // ── 2. Instanced Bumpy Moss Clumps ──────────────────────────────────────
    const mossClumpCenters: THREE.Vector3[] = [];
    const clumpCount = 14;
    for (let i = 0; i < clumpCount; i++) {
      const angle = (i / clumpCount) * Math.PI * 2 + Math.random() * 0.4;
      const r = 0.4 + Math.random() * 0.65;
      mossClumpCenters.push(
        new THREE.Vector3(Math.cos(angle) * r, 0.88 + Math.random() * 0.15, Math.sin(angle) * r)
      );
    }
    const { mesh: mossInstanced, geo: mossNubGeo, mat: mossMat } = buildMossClumps(mossClumpCenters);
    compositeGroup.add(mossInstanced);

    // ── 3. Radial Extruded Petal Wildflowers ────────────────────────────────
    const flowerGroup = new THREE.Group();
    compositeGroup.add(flowerGroup);

    const stemMat = new THREE.MeshStandardMaterial({ color: '#4a6b2e', roughness: 0.7 });
    const stemGeo = new THREE.CylinderGeometry(0.006, 0.009, 1, 5);

    const sharedPetalGeo = createPetalGeometry();
    const sharedCenterGeo = new THREE.SphereGeometry(0.032, 12, 12);

    const flowerRecipes: FlowerOptions[] = [
      { petalColor: '#FFF3F6', centerColor: '#F2C14E', petalCount: 10, scale: 0.9 }, // white daisy
      { petalColor: '#F6A6C1', centerColor: '#E8862E', petalCount: 8, scale: 0.75 },  // pink cosmos
      { petalColor: '#FFD15C', centerColor: '#7A5A1E', petalCount: 6, scale: 0.6 },   // buttercup
    ];

    const flowerCount = 18;
    for (let i = 0; i < flowerCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.35 + Math.random() * 0.85;
      const baseX = Math.cos(angle) * r;
      const baseZ = Math.sin(angle) * r;
      const baseY = 0.9 + Math.random() * 0.2;

      const recipe = flowerRecipes[i % flowerRecipes.length];
      const flower = createFlower(recipe, sharedPetalGeo, sharedCenterGeo);

      const stemHeight = 0.12 + Math.random() * 0.1;
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.scale.set(1, stemHeight, 1);
      stem.position.set(baseX, baseY - stemHeight / 2, baseZ);
      stem.rotation.set((Math.random() - 0.5) * 0.4, 0, (Math.random() - 0.5) * 0.4);
      flowerGroup.add(stem);

      flower.position.set(baseX, baseY + stemHeight / 2, baseZ);
      flower.rotation.y = Math.random() * Math.PI * 2;
      flowerGroup.add(flower);
    }

    // ── 4. Sprouting Refractive Quartz Crystals ──────────────────────────────
    const crystalGroup = new THREE.Group();
    compositeGroup.add(crystalGroup);

    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#FFFFFF'),
      transmission: 0.88,
      opacity: 0.95,
      transparent: true,
      ior: 1.54,
      roughness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      emissive: new THREE.Color('#FFF2DB'),
      emissiveIntensity: 0.25,
    });

    const crystalGeo = new THREE.ConeGeometry(0.12, 0.55, 6);

    for (let i = 0; i < 12; i++) {
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      const angle = (i / 12) * Math.PI * 2 + 0.2;
      const r = 0.3 + Math.random() * 0.6;
      const h = 0.7 + Math.random() * 0.5;
      crystal.position.set(Math.cos(angle) * r, 1.1 + Math.random() * 0.1, Math.sin(angle) * r);
      crystal.scale.set(1 + Math.random() * 0.5, h, 1 + Math.random() * 0.5);
      crystal.rotation.set((Math.random() - 0.5) * 0.3, Math.random() * Math.PI, (Math.random() - 0.5) * 0.3);
      crystalGroup.add(crystal);
    }

    // ── 5. Photorealistic Multi-Light Studio Environment ────────────────────
    const sunBeam = new THREE.DirectionalLight('#FFF4E0', 4.2);
    sunBeam.position.set(4.5, 7.5, 4.5);
    scene.add(sunBeam);

    const skyFill = new THREE.DirectionalLight('#7894B0', 1.4);
    skyFill.position.set(-4.5, 5.0, 3.0);
    scene.add(skyFill);

    const bounceLight = new THREE.DirectionalLight('#D47A38', 1.8);
    bounceLight.position.set(0, -5.0, 2.0);
    scene.add(bounceLight);

    const coreLight = new THREE.PointLight('#C96121', 2.0, 8);
    coreLight.position.set(0, 0.4, 0);
    scene.add(coreLight);

    const ambientLight = new THREE.AmbientLight('#161412', 1.2);
    scene.add(ambientLight);

    // Floating Golden Particles
    const sporeCount = 120;
    const sporeGeo = new THREE.BufferGeometry();
    const sporePos = new Float32Array(sporeCount * 3);

    for (let i = 0; i < sporeCount * 3; i += 3) {
      sporePos[i] = (Math.random() - 0.5) * 14;
      sporePos[i + 1] = (Math.random() - 0.5) * 14;
      sporePos[i + 2] = (Math.random() - 0.5) * 10;
    }
    sporeGeo.setAttribute('position', new THREE.BufferAttribute(sporePos, 3));

    const sporeMat = new THREE.PointsMaterial({
      color: new THREE.Color('#FFD15C'),
      size: 0.035,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const spores = new THREE.Points(sporeGeo, sporeMat);
    scene.add(spores);

    // Initial position (Centered)
    compositeGroup.position.set(0, 0, 0);
    compositeGroup.rotation.set(0.25, 0.3, 0);

    // ── Render Loop ──────────────────────────────────────────────────────────
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Floating idle motion
      compositeGroup.position.y = Math.sin(elapsedTime * 0.7) * 0.06;
      compositeGroup.rotation.y += 0.002;
      spores.rotation.y = elapsedTime * 0.015;

      renderer.render(scene, camera);
    };
    animate();

    // ── Window Resize Handler ────────────────────────────────────────────────
    const handleResize = () => {
      if (!canvas) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // ── GSAP ScrollTrigger Sequence ─────────────────────────────────────────
    const ctx = gsap.context(() => {
      const stepElements = textStepRefs.current.filter(Boolean);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1.2,
          start: 'top top',
          end: '+=250%',
          anticipatePin: 1,
        },
      });

      // Step 1 → Step 2: Smooth 360 rotation + Core Light surge
      tl.to(
        compositeGroup.rotation,
        {
          y: Math.PI * 1.15,
          x: 0.4,
          z: 0.2,
          ease: 'power2.inOut',
        },
        0.33
      );

      tl.to(
        coreLight,
        {
          intensity: 4.5,
          ease: 'power2.inOut',
        },
        0.33
      );

      // Step 2 → Step 3: Turn to reveal glowing crystals & sakura blooms
      tl.to(
        compositeGroup.rotation,
        {
          y: Math.PI * 2.2,
          x: 0.15,
          z: -0.1,
          ease: 'power2.inOut',
        },
        0.66
      );

      tl.to(
        coreLight,
        {
          intensity: 7.0,
          ease: 'power2.inOut',
        },
        0.66
      );

      // Text Steps Visibility & Slide Animations
      if (stepElements.length === 3) {
        gsap.set(stepElements[0], { opacity: 1, y: 0 });
        gsap.set(stepElements[1], { opacity: 0, y: 35 });
        gsap.set(stepElements[2], { opacity: 0, y: 35 });

        tl.to(stepElements[0], { opacity: 0, y: -30, duration: 0.3, ease: 'power2.in' }, 0.28);
        tl.to(stepElements[1], { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 0.38);

        tl.to(stepElements[1], { opacity: 0, y: -30, duration: 0.3, ease: 'power2.in' }, 0.62);
        tl.to(stepElements[2], { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 0.72);
      }
    }, section);

    // ── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      ctx.revert();
      stoneGeo.dispose();
      stoneMaterial.dispose();
      colorMap.dispose();
      roughnessMap.dispose();
      normalMap.dispose();
      mossNubGeo.dispose();
      mossMat.dispose();
      stemGeo.dispose();
      stemMat.dispose();
      sharedPetalGeo.dispose();
      sharedCenterGeo.dispose();
      crystalGeo.dispose();
      crystalMat.dispose();
      sporeGeo.dispose();
      sporeMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section
      className="zt_section"
      ref={sectionRef}
      id="zen-story"
      aria-label="Philosophy & Creation Story"
    >
      {/* Three.js 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="zt_canvas" />

      {/* Atmospheric Background Vignette */}
      <div className="zt_bg_vignette" aria-hidden="true" />

      {/* Staggered Clean Text Steps Container */}
      <div className="zt_stage">
        {STEPS.map((step, idx) => (
          <div
            key={step.num}
            ref={(el) => (textStepRefs.current[idx] = el)}
            className={`zt_step ${step.positionClass}`}
          >
            <span className="zt_num">{step.num}</span>
            <h3 className="zt_title">{step.title}</h3>
            <p className="zt_desc">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
