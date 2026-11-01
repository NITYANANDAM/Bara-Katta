import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, isMaskable = false) {
  // RGBA buffer with filter byte at start of each row
  const rowLength = width * 4 + 1;
  const rawData = Buffer.alloc(height * rowLength);

  const cx = width / 2;
  const cy = height / 2;
  const radius = isMaskable ? width * 0.48 : width * 0.42;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter byte 0 (None)

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default terracotta background (#2c140e)
      let r = 44, g = 20, b = 14, a = 255;

      // Outer gold ring
      if (Math.abs(dist - radius) < (width * 0.03)) {
        r = 245; g = 158; b = 11; // Gold #f59e0b
      }

      // Safe cross ('X') lines
      const inCross1 = Math.abs(dx - dy) < (width * 0.035) && dist < radius * 0.85;
      const inCross2 = Math.abs(dx + dy) < (width * 0.035) && dist < radius * 0.85;
      if (inCross1 || inCross2) {
        r = 217; g = 119; b = 6; a = 255; // Darker gold #d97706
      }

      // Cowrie Shell central oval
      // Scale coordinates for vertical oval
      const cowrieX = dx / 0.55;
      const cowrieY = dy / 0.8;
      const cowrieDist = Math.sqrt(cowrieX * cowrieX + cowrieY * cowrieY);

      if (cowrieDist < width * 0.28) {
        // Porcelain cream/ivory (#f7eed8)
        r = 247; g = 238; b = 216;

        // Aperture slit in center
        if (Math.abs(dx) < (width * 0.03) && Math.abs(dy) < (width * 0.18)) {
          r = 69; g = 26; b = 3; // Deep slit #451a03
        } else if (Math.abs(dx) < (width * 0.06) && Math.abs(dy) < (width * 0.18)) {
          // Teeth serration pattern
          if (Math.floor(y / 4) % 2 === 0) {
            r = 120; g = 53; b = 15; // Amber teeth
          }
        }
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  // Compress with zlib
  const compressedData = zlib.deflateSync(rawData);

  // PNG structure
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA (6)
  ihdr[10] = 0; // Compression: 0
  ihdr[11] = 0; // Filter: 0
  ihdr[12] = 0; // Interlace: 0

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeInt32BE(crc, 8 + len);
  return chunk;
}

// Simple CRC32 for PNG chunks
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) | 0;
}

// Ensure public directory
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write PNG files
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPNG(64, 64));

console.log('Successfully generated all PWA icons!');
