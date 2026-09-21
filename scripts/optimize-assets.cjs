const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeRockFrames() {
  console.log('--- Optimizing Rock Animation Frames ---');
  const rockDir = path.join(__dirname, '..', 'src', 'assets', 'Rock-animation');
  const files = fs.readdirSync(rockDir).filter(f => f.endsWith('.png'));
  
  let totalOrig = 0;
  let totalNew = 0;

  for (const f of files) {
    const inputPath = path.join(rockDir, f);
    const outputPath = path.join(rockDir, f.replace(/\.png$/, '.webp'));
    const origSize = fs.statSync(inputPath).size;
    totalOrig += origSize;

    await sharp(inputPath)
      .webp({ quality: 80, effort: 5 })
      .toFile(outputPath);

    const newSize = fs.statSync(outputPath).size;
    totalNew += newSize;
  }

  console.log(`Rock Frames: ${(totalOrig / 1024 / 1024).toFixed(2)} MB -> ${(totalNew / 1024 / 1024).toFixed(2)} MB (${((1 - totalNew / totalOrig) * 100).toFixed(1)}% reduction)`);
}

async function optimizeMainAssets() {
  console.log('--- Optimizing Main Image Assets ---');
  const assetsDir = path.join(__dirname, '..', 'src', 'assets');

  // 1. About background
  const aboutIn = path.join(assetsDir, 'About_bg_updated_3.jpeg');
  const aboutOut = path.join(assetsDir, 'About_bg_updated_3.webp');
  if (fs.existsSync(aboutIn)) {
    const origSize = fs.statSync(aboutIn).size;
    await sharp(aboutIn)
      .resize({ width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 84, effort: 5 })
      .toFile(aboutOut);
    const newSize = fs.statSync(aboutOut).size;
    console.log(`About_bg: ${(origSize / 1024 / 1024).toFixed(2)} MB -> ${(newSize / 1024).toFixed(1)} KB`);
  }

  // 2. Project images (1254x1254 PNG -> WebP)
  const projectImages = [
    'Bookmyfarmhouse.png',
    'Decornath.png',
    'Pantryculture.png',
    'Skymaharaja.png',
  ];

  for (const p of projectImages) {
    const inPath = path.join(assetsDir, p);
    const outPath = path.join(assetsDir, p.replace(/\.png$/, '.webp'));
    if (fs.existsSync(inPath)) {
      const origSize = fs.statSync(inPath).size;
      await sharp(inPath)
        .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82, effort: 5 })
        .toFile(outPath);
      const newSize = fs.statSync(outPath).size;
      console.log(`${p}: ${(origSize / 1024 / 1024).toFixed(2)} MB -> ${(newSize / 1024).toFixed(1)} KB`);
    }
  }

  // 3. Parallax footer images
  const footerImages = ['Mountain.png', 'Flower.png'];
  for (const p of footerImages) {
    const inPath = path.join(assetsDir, p);
    const outPath = path.join(assetsDir, p.replace(/\.png$/, '.webp'));
    if (fs.existsSync(inPath)) {
      const origSize = fs.statSync(inPath).size;
      await sharp(inPath)
        .webp({ quality: 85, effort: 5 })
        .toFile(outPath);
      const newSize = fs.statSync(outPath).size;
      console.log(`${p}: ${(origSize / 1024 / 1024).toFixed(2)} MB -> ${(newSize / 1024).toFixed(1)} KB`);
    }
  }
}

async function main() {
  await optimizeRockFrames();
  await optimizeMainAssets();
  console.log('--- Asset Optimization Completed Successfully! ---');
}

main().catch(console.error);
