/**
 * Universal Subtitle Parser for CineWave TV
 *
 * Implements Feature F6 (Milestone M2)
 * Supports SubRip (.srt), WebVTT (.vtt), and SubStation Alpha (.ass/.ssa)
 * Normalized into SubtitleCue[] objects.
 */

export interface SubtitleCue {
  id: string | number;
  start: number; // in seconds (float)
  end: number;   // in seconds (float)
  text: string;  // clean sanitized string (newlines preserved, tags stripped)
}

/**
 * Parses timestamp string into float seconds.
 * Supports:
 * - SRT: HH:MM:SS,mmm (e.g. 00:01:23,456)
 * - WebVTT: HH:MM:SS.mmm or MM:SS.mmm (e.g. 00:00:10.500 or 01:23.456)
 * - ASS/SSA: H:MM:SS.cs (e.g. 0:01:05.20)
 */
export function parseTimestamp(timestampStr: string): number | null {
  if (!timestampStr) return null;
  const clean = timestampStr.trim().replace(',', '.');
  const parts = clean.split(':');

  if (parts.length === 3) {
    const h = parseFloat(parts[0]);
    const m = parseFloat(parts[1]);
    const s = parseFloat(parts[2]);
    if (!Number.isFinite(h) || !Number.isFinite(m) || !Number.isFinite(s)) {
      return null;
    }
    const total = h * 3600 + m * 60 + s;
    return Number.isFinite(total) && total >= 0 ? total : null;
  } else if (parts.length === 2) {
    const m = parseFloat(parts[0]);
    const s = parseFloat(parts[1]);
    if (!Number.isFinite(m) || !Number.isFinite(s)) {
      return null;
    }
    const total = m * 60 + s;
    return Number.isFinite(total) && total >= 0 ? total : null;
  }

  return null;
}

/**
 * Sanitizes subtitle text:
 * 1. Strips malicious script and style tags along with their inner contents
 * 2. Converts ASS linebreaks (\N, \n) and non-breaking spaces (\h)
 * 3. Strips ASS style override tags ({\...})
 * 4. Strips HTML and WebVTT formatting tags (<b>, <i>, <font>, etc.)
 * 5. Decodes common HTML entities
 * 6. Preserves intentional linebreaks while trimming extraneous whitespace
 */
export function sanitizeSubtitleText(raw: string): string {
  if (!raw) return '';

  let text = raw;

  // 1. Remove dangerous executable/style tags and their contents
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // 2. Convert ASS linebreaks and non-breaking space
  text = text.replace(/\\N/g, '\n');
  text = text.replace(/\\n/g, '\n');
  text = text.replace(/\\h/g, ' ');

  // 3. Strip ASS style override tags like {\b1}, {\an8}, {\c&H...&}
  text = text.replace(/\{[^}]*\}/g, '');

  // 4. Strip HTML / WebVTT formatting tags (<b>, <i>, <u>, <font...>, <c...>, <v...>, </...>)
  text = text.replace(/<\/?[a-zA-Z][^>]*>/g, '');

  // 5. Decode common HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // 6. Normalize line endings: CRLF -> LF
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 7. Trim individual lines while preserving intentional linebreaks
  const lines = text.split('\n').map(l => l.trim());
  text = lines.join('\n').trim();

  return text;
}

/**
 * Parses SRT or WebVTT block-based subtitle content.
 */
function parseSrtOrVtt(content: string): SubtitleCue[] {
  const normalized = content
    .replace(/^\uFEFF/, '') // Strip UTF-8 BOM
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  const blocks = normalized.split(/\n\s*\n+/);
  const cues: SubtitleCue[] = [];
  let autoId = 1;

  for (const block of blocks) {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) continue;

    // Skip WebVTT header/note/style/region blocks that don't represent cues
    if (/^NOTE(\s|$)/i.test(trimmedBlock)) continue;
    if (/^STYLE(\s|$)/i.test(trimmedBlock)) continue;
    if (/^REGION(\s|$)/i.test(trimmedBlock)) continue;

    const lines = trimmedBlock.split('\n');
    const arrowIdx = lines.findIndex(l => l.includes('-->'));
    if (arrowIdx === -1) continue;

    const arrowLine = lines[arrowIdx];
    const [rawStart, rawEndWithSettings] = arrowLine.split('-->');
    if (!rawStart || !rawEndWithSettings) continue;

    const start = parseTimestamp(rawStart);
    // Ignore any WebVTT cue settings (e.g. line:80% position:50%) after end timecode
    const end = parseTimestamp(rawEndWithSettings.trim().split(/\s+/)[0]);

    // Validation: finite numbers and end >= start
    if (start === null || end === null || !Number.isFinite(start) || !Number.isFinite(end)) {
      continue;
    }
    if (end < start) {
      continue;
    }

    let id: string | number = autoId++;
    if (arrowIdx > 0) {
      const parsedId = lines.slice(0, arrowIdx).join(' ').trim();
      if (parsedId && !/^WEBVTT/i.test(parsedId)) {
        id = isNaN(Number(parsedId)) ? parsedId : Number(parsedId);
      }
    }

    const rawText = lines.slice(arrowIdx + 1).join('\n');
    const text = sanitizeSubtitleText(rawText);
    if (!text) continue;

    cues.push({
      id,
      start,
      end,
      text
    });
  }

  return cues;
}

/**
 * Splits ASS Dialogue body into columns adhering to Format max fields.
 */
function splitAssFields(body: string, maxFields: number): string[] {
  const result: string[] = [];
  let remaining = body;
  for (let i = 0; i < maxFields - 1; i++) {
    const commaIdx = remaining.indexOf(',');
    if (commaIdx === -1) break;
    result.push(remaining.substring(0, commaIdx).trim());
    remaining = remaining.substring(commaIdx + 1);
  }
  result.push(remaining);
  return result;
}

/**
 * Parses SubStation Alpha (.ass / .ssa) content.
 */
function parseAss(content: string): SubtitleCue[] {
  const normalized = content
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  const lines = normalized.split('\n');
  const cues: SubtitleCue[] = [];

  let startIndex = 1;
  let endIndex = 2;
  let textIndex = 9;
  let numColumns = 10;
  let cueId = 1;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Format specification header in [Events]
    if (line.toLowerCase().startsWith('format:')) {
      const formatStr = line.substring(7).trim();
      const cols = formatStr.split(',').map(c => c.trim().toLowerCase());
      numColumns = cols.length;
      const sIdx = cols.indexOf('start');
      const eIdx = cols.indexOf('end');
      const tIdx = cols.indexOf('text');
      if (sIdx !== -1) startIndex = sIdx;
      if (eIdx !== -1) endIndex = eIdx;
      if (tIdx !== -1) textIndex = tIdx;
      continue;
    }

    // Dialogue event lines
    if (line.toLowerCase().startsWith('dialogue:')) {
      const body = line.substring(9).trim();
      const fields = splitAssFields(body, numColumns);
      if (fields.length <= Math.max(startIndex, endIndex, textIndex)) continue;

      const start = parseTimestamp(fields[startIndex]);
      const end = parseTimestamp(fields[endIndex]);
      const rawText = fields.slice(textIndex).join(',');
      const text = sanitizeSubtitleText(rawText);

      if (start === null || end === null || !Number.isFinite(start) || !Number.isFinite(end)) {
        continue;
      }
      if (end < start) {
        continue;
      }
      if (!text) {
        continue;
      }

      cues.push({
        id: cueId++,
        start,
        end,
        text
      });
    }
  }

  return cues;
}

/**
 * Universal Subtitle Parser Entry Point
 *
 * Automatically detects format (SRT, WebVTT, ASS/SSA) or uses formatHint,
 * sanitizes text, filters invalid timestamps, and sorts chronologically by start time.
 *
 * @param rawContent Raw subtitle text
 * @param formatHint Optional format hint ('srt', 'vtt', 'ass', etc.)
 * @returns Array of normalized SubtitleCue items sorted by start time
 */
export function parseSubtitles(rawContent: string, formatHint?: string): SubtitleCue[] {
  if (!rawContent || typeof rawContent !== 'string' || !rawContent.trim()) {
    return [];
  }

  const trimmed = rawContent.trim();
  const lowerHint = (formatHint || '').toLowerCase().trim();

  let cues: SubtitleCue[] = [];

  // Determine format from content and hint
  const isAss = lowerHint === 'ass' || lowerHint === 'ssa' ||
                trimmed.includes('[Events]') ||
                trimmed.includes('[Script Info]') ||
                /^\s*Dialogue:\s*/m.test(trimmed);

  if (isAss) {
    cues = parseAss(rawContent);
    // Fallback: If ASS parsing produced 0 cues but content has time arrows, try SRT/VTT
    if (cues.length === 0 && trimmed.includes('-->')) {
      cues = parseSrtOrVtt(rawContent);
    }
  } else {
    cues = parseSrtOrVtt(rawContent);
    // Fallback: If SRT/VTT produced 0 cues but content has ASS markers, try ASS
    if (cues.length === 0 && (trimmed.includes('[Events]') || /^\s*Dialogue:\s*/m.test(trimmed))) {
      cues = parseAss(rawContent);
    }
  }

  // Ensure cues are sorted chronologically by start time
  cues.sort((a, b) => {
    if (Math.abs(a.start - b.start) > 0.0001) {
      return a.start - b.start;
    }
    return a.end - b.end;
  });

  return cues;
}

/**
 * Helper: Retrieves all active cues at a given playback timestamp.
 */
export function getActiveCues(cues: SubtitleCue[], currentTime: number): SubtitleCue[] {
  if (!Array.isArray(cues) || cues.length === 0 || !Number.isFinite(currentTime)) {
    return [];
  }
  return cues.filter(c => currentTime >= c.start && currentTime <= c.end);
}

/**
 * Helper: Retrieves the primary active cue at a given playback timestamp.
 */
export function getActiveCue(cues: SubtitleCue[], currentTime: number): SubtitleCue | null {
  const active = getActiveCues(cues, currentTime);
  return active.length > 0 ? active[active.length - 1] : null;
}

/**
 * Helper: Converts normalized SubtitleCue[] back into standard WebVTT text.
 * Useful for creating Blob URLs to inject into HTML5 <track> elements.
 */
export function cuesToWebVtt(cues: SubtitleCue[]): string {
  let vtt = 'WEBVTT\n\n';
  for (let i = 0; i < cues.length; i++) {
    const cue = cues[i];
    vtt += `${cue.id}\n`;
    vtt += `${formatVttTimestamp(cue.start)} --> ${formatVttTimestamp(cue.end)}\n`;
    vtt += `${cue.text}\n\n`;
  }
  return vtt;
}

function formatVttTimestamp(seconds: number): string {
  const s = Math.max(0, seconds);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = Math.floor(s % 60);
  const ms = Math.floor((s % 1) * 1000);

  const pad = (n: number, z = 2) => String(n).padStart(z, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}.${pad(ms, 3)}`;
}
