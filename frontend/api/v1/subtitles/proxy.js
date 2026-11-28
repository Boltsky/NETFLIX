const ALLOWED_SUBTITLE_HOST_SUFFIXES = [
  'strem.io',
  'opensubtitles.org',
  'bhcxy.com',
  'fodcyy.com',
  'wyzie.ru',
  'framextv.cc',
  'framextv.pro',
  'subdl.com'
];

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
  const isAllowed = ALLOWED_SUBTITLE_HOST_SUFFIXES.some(
    (suffix) => host === suffix || host.endsWith(`.${suffix}`)
  );

  if (!isAllowed) {
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
