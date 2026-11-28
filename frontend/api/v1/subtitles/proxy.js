const ALLOWED_SUBTITLE_HOST_SUFFIXES = [
  'strem.io',
  'opensubtitles.org',
  'fhxod.com',
  'bhcxy.com',
  'fodcyy.com',
  'wyzie.ru',
  'framextv.cc',
  'framextv.pro',
  'subdl.com',
  'subf2m.co',
  'febbox.com'
];

function isPrivateOrLoopbackHost(host) {
  if (!host) return true;
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host === '::1' ||
    host === '[::1]' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host.startsWith('10.') ||
    host.startsWith('192.168.') ||
    host.startsWith('169.254.') ||
    host.startsWith('127.')
  ) {
    return true;
  }
  const octets = host.split('.');
  if (octets.length === 4 && octets[0] === '172') {
    const second = Number(octets[1]);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const targetUrl = String(req.query?.url || '').trim();
  if (!targetUrl) {
    return res.status(400).send('Missing url parameter');
  }

  let parsed;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return res.status(400).send('Invalid URL');
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return res.status(400).send('Unsupported protocol');
  }

  const host = parsed.hostname.toLowerCase();
  if (isPrivateOrLoopbackHost(host)) {
    return res.status(403).send('Subtitle host not allowed');
  }

  const matchesKnownHost = ALLOWED_SUBTITLE_HOST_SUFFIXES.some(
    (suffix) => host === suffix || host.endsWith(`.${suffix}`)
  );
  const looksLikeSubtitlePath =
    /\.(srt|vtt|ass|ssa|txt)(\?|$)/i.test(parsed.pathname) ||
    parsed.pathname.toLowerCase().includes('/subtitle');

  if (!matchesKnownHost && !(parsed.protocol === 'https:' && looksLikeSubtitlePath)) {
    return res.status(403).send('Subtitle host not allowed');
  }

  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), 5000);

  try {
    const upstream = await fetch(targetUrl, { signal: controller.signal });
    clearTimeout(tid);

    if (!upstream.ok) {
      return res.status(upstream.status).send(`Upstream error ${upstream.status}`);
    }

    const buf = await upstream.arrayBuffer();
    let text = new TextDecoder('utf-8', { fatal: false }).decode(buf);
    if (text.includes('\uFFFD')) {
      try {
        text = new TextDecoder('windows-1252').decode(buf);
      } catch {}
    }

    // Reject HTML error pages (e.g., Cloudflare 403 / Stremio 469) cleanly
    const trimmed = text.trim().toLowerCase();
    if (trimmed.startsWith('<!doctype') || trimmed.startsWith('<html') || trimmed.startsWith('<?xml')) {
      return res.status(502).send('Upstream returned HTML instead of subtitle data');
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(text);
  } catch (err) {
    clearTimeout(tid);
    return res.status(500).send(err?.message || 'Subtitle proxy error');
  }
}
