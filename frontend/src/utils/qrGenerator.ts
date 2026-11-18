/**
 * Lightweight, self-contained QR Code Generator in pure TypeScript.
 * Generates standard QR Code 2D boolean matrices and SVG strings
 * with zero external dependencies.
 */

// GF(256) Math tables for Reed-Solomon error correction
const EXP_TABLE = new Uint8Array(256);
const LOG_TABLE = new Uint8Array(256);

(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    LOG_TABLE[x] = i;
    x <<= 1;
    if (x & 256) {
      x ^= 0x11d; // Generator polynomial x^8 + x^4 + x^3 + x^2 + 1
    }
  }
  for (let i = 255; i < 512; i++) {
    EXP_TABLE[i] = EXP_TABLE[i - 255];
  }
})();

function gmult(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP_TABLE[LOG_TABLE[a] + LOG_TABLE[b]];
}

function makeRsGeneratorPoly(errorCorrectionLength: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < errorCorrectionLength; i++) {
    const nextPoly = new Uint8Array(poly.length + 1);
    const factor = EXP_TABLE[i];
    for (let j = 0; j < poly.length; j++) {
      nextPoly[j] ^= gmult(poly[j], factor);
      nextPoly[j + 1] ^= poly[j];
    }
    poly = nextPoly;
  }
  return poly;
}

function calculateRsRemainder(data: Uint8Array, errorCorrectionLength: number): Uint8Array {
  const genPoly = makeRsGeneratorPoly(errorCorrectionLength);
  const remainder = new Uint8Array(errorCorrectionLength);

  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ remainder[0];
    for (let j = 0; j < errorCorrectionLength - 1; j++) {
      remainder[j] = remainder[j + 1] ^ gmult(genPoly[j + 1], factor);
    }
    remainder[errorCorrectionLength - 1] = gmult(genPoly[errorCorrectionLength], factor);
  }
  return remainder;
}

// QR Code Version capacities for Low error correction (L)
// [version, totalCodewords, dataCodewords, ecCodewordsPerBlock, numBlocks]
const VERSION_SPECS_L: Array<[number, number, number, number, number]> = [
  [1, 26, 19, 7, 1],
  [2, 44, 34, 10, 1],
  [3, 70, 55, 15, 1],
  [4, 100, 80, 20, 1],
  [5, 134, 108, 26, 1],
  [6, 172, 136, 18, 2],
  [7, 196, 156, 20, 2],
  [8, 242, 194, 24, 2]
];

// Alignment pattern centers for Versions 1 through 8
const ALIGNMENT_PATTERN_CENTERS: number[][] = [
  [], // V1
  [6, 18], // V2
  [6, 22], // V3
  [6, 26], // V4
  [6, 30], // V5
  [6, 34], // V6
  [6, 22, 38], // V7
  [6, 24, 42]  // V8
];

export interface QRCodeData {
  version: number;
  size: number;
  modules: boolean[][];
}

export function generateQRCodeMatrix(text: string): QRCodeData {
  // UTF-8 encode input text
  const utf8Bytes = new TextEncoder().encode(text);
  const dataLen = utf8Bytes.length;

  // Find lowest version that can hold dataLen bytes
  let selectedSpec: [number, number, number, number, number] | null = null;
  for (const spec of VERSION_SPECS_L) {
    // Byte mode overhead: 4 bits mode + 8 bits char count (for v1-9) + data = 12 bits + dataLen*8
    const requiredCodewords = Math.ceil((4 + 8 + dataLen * 8 + 4) / 8);
    if (requiredCodewords <= spec[2]) {
      selectedSpec = spec;
      break;
    }
  }

  if (!selectedSpec) {
    // Fallback to highest supported version in table
    selectedSpec = VERSION_SPECS_L[VERSION_SPECS_L.length - 1];
  }

  const [version, totalCodewords, dataCodewords, ecPerBlock, numBlocks] = selectedSpec;
  const size = version * 4 + 17;

  // Build bitstream in Byte Mode
  const bits: number[] = [];
  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  };

  // 1. Mode indicator: 0100 for Byte mode
  pushBits(0b0100, 4);

  // 2. Character count indicator (8 bits for versions 1-9)
  pushBits(dataLen, 8);

  // 3. Data bytes
  for (let i = 0; i < dataLen; i++) {
    pushBits(utf8Bytes[i], 8);
  }

  // 4. Terminator: up to 4 zero bits
  const terminatorLen = Math.min(4, dataCodewords * 8 - bits.length);
  pushBits(0, terminatorLen);

  // 5. Pad to multiple of 8 bits
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  // 6. Pad bytes (0xEC and 0x11 alternating)
  const dataBytes = new Uint8Array(dataCodewords);
  for (let i = 0; i < bits.length / 8; i++) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      b = (b << 1) | bits[i * 8 + j];
    }
    dataBytes[i] = b;
  }
  let padToggle = false;
  for (let i = bits.length / 8; i < dataCodewords; i++) {
    dataBytes[i] = padToggle ? 0x11 : 0xec;
    padToggle = !padToggle;
  }

  // 7. Error Correction Codewords calculation
  const blockSize = Math.floor(dataCodewords / numBlocks);
  const blocksData: Uint8Array[] = [];
  const blocksEc: Uint8Array[] = [];

  for (let b = 0; b < numBlocks; b++) {
    const start = b * blockSize;
    const end = (b === numBlocks - 1) ? dataCodewords : start + blockSize;
    const slice = dataBytes.slice(start, end);
    blocksData.push(slice);
    blocksEc.push(calculateRsRemainder(slice, ecPerBlock));
  }

  // Interleave data and EC codewords
  const finalCodewords: number[] = [];
  const maxBlockLen = Math.max(...blocksData.map((b) => b.length));
  for (let i = 0; i < maxBlockLen; i++) {
    for (let b = 0; b < numBlocks; b++) {
      if (i < blocksData[b].length) {
        finalCodewords.push(blocksData[b][i]);
      }
    }
  }
  for (let i = 0; i < ecPerBlock; i++) {
    for (let b = 0; b < numBlocks; b++) {
      finalCodewords.push(blocksEc[b][i]);
    }
  }

  // Prepare QR Matrix & isFunction grid
  const modules: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const isFunction: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const setFunctionModule = (r: number, c: number, val: boolean) => {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      modules[r][c] = val;
      isFunction[r][c] = true;
    }
  };

  // Add 7x7 Finder Pattern with Separator
  const addFinderPattern = (startR: number, startC: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = startR + r;
        const nc = startC + c;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;

        if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            setFunctionModule(nr, nc, true);
          } else {
            setFunctionModule(nr, nc, false);
          }
        } else {
          // Separator
          setFunctionModule(nr, nc, false);
        }
      }
    }
  };

  addFinderPattern(0, 0); // Top-left
  addFinderPattern(0, size - 7); // Top-right
  addFinderPattern(size - 7, 0); // Bottom-left

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    const val = (i % 2 === 0);
    setFunctionModule(6, i, val);
    setFunctionModule(i, 6, val);
  }

  // Dark module
  setFunctionModule(size - 8, 8, true);

  // Alignment patterns for version >= 2
  if (version >= 2) {
    const centers = ALIGNMENT_PATTERN_CENTERS[version - 1];
    for (const r of centers) {
      for (const c of centers) {
        // Skip if overlapping finder patterns
        if ((r <= 8 && c <= 8) || (r <= 8 && c >= size - 9) || (r >= size - 9 && c <= 8)) {
          continue;
        }
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const isBorder = Math.abs(dr) === 2 || Math.abs(dc) === 2;
            const isCenter = dr === 0 && dc === 0;
            setFunctionModule(r + dr, c + dc, isBorder || isCenter);
          }
        }
      }
    }
  }

  // Reserve format information areas
  for (let i = 0; i <= 8; i++) {
    setFunctionModule(8, i, false);
    setFunctionModule(i, 8, false);
  }
  for (let i = size - 8; i < size; i++) {
    setFunctionModule(8, i, false);
    setFunctionModule(i, 8, false);
  }

  // Place Codewords into Data Modules
  let bitIdx = 0;
  const allBits: number[] = [];
  for (const byte of finalCodewords) {
    for (let i = 7; i >= 0; i--) {
      allBits.push((byte >> i) & 1);
    }
  }

  let upward = true;
  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // Skip vertical timing column

    for (let vert = 0; vert < size; vert++) {
      const r = upward ? (size - 1 - vert) : vert;
      for (let colOffset = 0; colOffset < 2; colOffset++) {
        const c = right - colOffset;
        if (!isFunction[r][c]) {
          const val = bitIdx < allBits.length ? allBits[bitIdx++] === 1 : false;
          modules[r][c] = val;
        }
      }
    }
    upward = !upward;
  }

  // Apply Mask Pattern 0: (row + col) % 2 === 0
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!isFunction[r][c] && ((r + c) % 2 === 0)) {
        modules[r][c] = !modules[r][c];
      }
    }
  }

  // Format info for Error Correction Level L and Mask 0: 0b111011111000100 (BCH code with mask 0x5412)
  const formatBits = [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0];

  // Top-left format info
  for (let i = 0; i <= 5; i++) modules[8][i] = formatBits[i] === 1;
  modules[8][7] = formatBits[6] === 1;
  modules[8][8] = formatBits[7] === 1;
  modules[7][8] = formatBits[8] === 1;
  for (let i = 9; i < 15; i++) modules[14 - i][8] = formatBits[i] === 1;

  // Split format info around edges
  for (let i = 0; i < 8; i++) modules[8][size - 1 - i] = formatBits[i] === 1;
  for (let i = 8; i < 15; i++) modules[size - 15 + i][8] = formatBits[i] === 1;

  return { version, size, modules };
}
