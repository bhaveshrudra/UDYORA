// Node.js script to generate a standard 32x32 Windows/Browser .ico file with the UDYORA "U" brand mark
const fs = require('fs');
const path = require('path');

function generateFaviconIco() {
  const width = 32;
  const height = 32;

  // Pixel buffer (32x32 RGBA)
  const pixels = new Uint8Array(width * height * 4);

  function setPixel(x, y, r, g, b, a) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = (y * width + x) * 4;
    pixels[idx] = r;
    pixels[idx + 1] = g;
    pixels[idx + 2] = b;
    pixels[idx + 3] = a;
  }

  // Draw background squircle (Navy #091124 to #1e293b)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Check rounded corner distance (corner radius = 7)
      const r = 7;
      let inBounds = true;
      if (x < r && y < r) inBounds = Math.hypot(x - r, y - r) <= r;
      else if (x >= width - r && y < r) inBounds = Math.hypot(x - (width - r - 1), y - r) <= r;
      else if (x < r && y >= height - r) inBounds = Math.hypot(x - r, y - (height - r - 1)) <= r;
      else if (x >= width - r && y >= height - r) inBounds = Math.hypot(x - (width - r - 1), y - (height - r - 1)) <= r;

      if (inBounds) {
        // Gradient from top (#1e293b) to bottom (#091124)
        const t = y / height;
        const bgR = Math.round(30 * (1 - t) + 9 * t);
        const bgG = Math.round(41 * (1 - t) + 17 * t);
        const bgB = Math.round(59 * (1 - t) + 36 * t);
        setPixel(x, y, bgR, bgG, bgB, 255);
      } else {
        setPixel(x, y, 0, 0, 0, 0);
      }
    }
  }

  // Draw top accent stripe (Blue #3b82f6 to Emerald #10b981) at y = 2..3, x = 6..25
  for (let x = 6; x <= 25; x++) {
    const t = (x - 6) / 19;
    const stripeR = Math.round(59 * (1 - t) + 16 * t);
    const stripeG = Math.round(130 * (1 - t) + 185 * t);
    const stripeB = Math.round(246 * (1 - t) + 129 * t);
    for (let y = 2; y <= 3; y++) {
      setPixel(x, y, stripeR, stripeG, stripeB, 255);
    }
  }

  // Draw bold white "U" lettermark
  // Left stem: x = 10..13, y = 9..20
  for (let x = 10; x <= 13; x++) {
    for (let y = 9; y <= 20; y++) {
      setPixel(x, y, 255, 255, 255, 255);
    }
  }
  // Right stem: x = 18..21, y = 9..20
  for (let x = 18; x <= 21; x++) {
    for (let y = 9; y <= 20; y++) {
      setPixel(x, y, 255, 255, 255, 255);
    }
  }
  // Bottom curve: x = 10..21, y = 21..24
  for (let x = 10; x <= 21; x++) {
    for (let y = 21; y <= 24; y++) {
      // Inner hollow cutout at x = 14..17, y = 21..22
      if (x >= 14 && x <= 17 && y <= 21) {
        // Keep navy background
      } else {
        setPixel(x, y, 255, 255, 255, 255);
      }
    }
  }

  // Build ICO file binary
  const bmpHeaderSize = 40;
  const xorSize = width * height * 4;
  const andSize = ((width + 31) >> 5) * 4 * height; // 128 bytes
  const imageSize = bmpHeaderSize + xorSize + andSize; // 4264 bytes
  const headerSize = 6 + 16; // 22 bytes
  const totalSize = headerSize + imageSize; // 4286 bytes

  const icoBuf = Buffer.alloc(totalSize);

  // ICONHEADER (6 bytes)
  icoBuf.writeUInt16LE(0, 0); // Reserved
  icoBuf.writeUInt16LE(1, 2); // Type: 1 = ICO
  icoBuf.writeUInt16LE(1, 4); // Count: 1 image

  // ICONDIRENTRY (16 bytes)
  icoBuf.writeUInt8(width, 6);        // Width (32)
  icoBuf.writeUInt8(height, 7);       // Height (32)
  icoBuf.writeUInt8(0, 8);            // Color count (0 for 32bpp)
  icoBuf.writeUInt8(0, 9);            // Reserved
  icoBuf.writeUInt16LE(1, 10);        // Color planes (1)
  icoBuf.writeUInt16LE(32, 12);       // Bits per pixel (32)
  icoBuf.writeUInt32LE(imageSize, 14); // Image size in bytes
  icoBuf.writeUInt32LE(headerSize, 18); // Offset to image data (22)

  // BITMAPINFOHEADER (40 bytes)
  let offset = headerSize;
  icoBuf.writeUInt32LE(bmpHeaderSize, offset); offset += 4;
  icoBuf.writeInt32LE(width, offset); offset += 4;
  icoBuf.writeInt32LE(height * 2, offset); offset += 4; // Double height for mask
  icoBuf.writeUInt16LE(1, offset); offset += 2; // Planes
  icoBuf.writeUInt16LE(32, offset); offset += 2; // BitCount
  icoBuf.writeUInt32LE(0, offset); offset += 4; // BI_RGB (uncompressed)
  icoBuf.writeUInt32LE(xorSize, offset); offset += 4; // ImageSize
  icoBuf.writeInt32LE(0, offset); offset += 4; // XPelsPerMeter
  icoBuf.writeInt32LE(0, offset); offset += 4; // YPelsPerMeter
  icoBuf.writeUInt32LE(0, offset); offset += 4; // ClrUsed
  icoBuf.writeUInt32LE(0, offset); offset += 4; // ClrImportant

  // XOR Bitmap Data (Bottom-Up BGRA)
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      icoBuf.writeUInt8(pixels[srcIdx + 2], offset);     // B
      icoBuf.writeUInt8(pixels[srcIdx + 1], offset + 1); // G
      icoBuf.writeUInt8(pixels[srcIdx], offset + 2);     // R
      icoBuf.writeUInt8(pixels[srcIdx + 3], offset + 3); // A
      offset += 4;
    }
  }

  // AND Mask (1 bit per pixel, 0 = opaque/alpha-controlled)
  for (let i = 0; i < andSize; i++) {
    icoBuf.writeUInt8(0, offset++);
  }

  const outPath = path.resolve(__dirname, '../public/favicon.ico');
  fs.writeFileSync(outPath, icoBuf);
  console.log(`Successfully generated favicon.ico at: ${outPath} (${totalSize} bytes)`);
}

generateFaviconIco();
