const FRAMEX_API = 'https://api.framextv.pro';
const TMDB_KEY = '8265bd1679663a7ea12ac168da84d2e8';

const BLACKLIST = [
  'fastcloud', 'dummy_stream', '/error.m3u8', '/404.m3u8',
  'atlantic.st', 'classroom.best', 'fprime.at', 'transcode.cfd',
  'totallyacdn.cc', 'amnestyinternational.dev', 'tiktokcdn.com',
  'ngcloud.tech', 'rivestream.app', 'vidzee.wtf', 'hybrows.workers.dev',
  'bigtits', 'ad_segment', 'spotx', 'springserve', 'aniview', 'preroll', 'midroll'
];

function isCleanSource(url) {
  if (!url) return false;
  const lower = decodeURIComponent(url).toLowerCase();
  if (BLACKLIST.some((b) => lower.includes(b))) return false;
  // Require CORS-friendly direct stream hosts (api.framextv.* /api/proxy returns ACAO: null in browsers)
  if (lower.includes('api.framextv.') && lower.includes('/api/proxy')) return false;
  return true;
}

async function fetchWithTimeout(url, options = {}, ms = 4000) {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), ms);
  try {
    const r = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(tid);
    return r;
  } catch {
    clearTimeout(tid);
    return null;
  }
}

async function fetchOpenSubtitles(contentId, isEpisodic, s, e) {
  try {
    const extRes = await fetchWithTimeout(
      `https://api.themoviedb.org/3/${isEpisodic ? 'tv' : 'movie'}/${encodeURIComponent(contentId)}/external_ids?api_key=${TMDB_KEY}`,
      {},
      3000
    );
    if (!extRes || !extRes.ok) return [];
    const ext = await extRes.json();
    const imdbId = ext?.imdb_id;
    if (!imdbId || !imdbId.startsWith('tt')) return [];

    const stremioUrl = isEpisodic
      ? `https://opensubtitles-v3.strem.io/subtitles/series/${encodeURIComponent(`${imdbId}:${s}:${e}`)}.json`
      : `https://opensubtitles-v3.strem.io/subtitles/movie/${encodeURIComponent(imdbId)}.json`;

    const subRes = await fetchWithTimeout(stremioUrl, {}, 3500);
    if (!subRes || !subRes.ok) return [];
    const data = await subRes.json();
    if (!Array.isArray(data?.subtitles)) return [];

    const langNames = {
      eng: ['English', 'en'],
      en: ['English', 'en'],
      spa: ['Spanish', 'es'],
      es: ['Spanish', 'es'],
      fre: ['French', 'fr'],
      fra: ['French', 'fr'],
      fr: ['French', 'fr'],
      por: ['Portuguese', 'pt'],
      pob: ['Portuguese (BR)', 'pt'],
      ara: ['Arabic', 'ar'],
      ar: ['Arabic', 'ar'],
      ger: ['German', 'de'],
      deu: ['German', 'de'],
      ita: ['Italian', 'it'],
      hin: ['Hindi', 'hi'],
      jpn: ['Japanese', 'ja'],
      kor: ['Korean', 'ko'],
      zho: ['Chinese', 'zh'],
      chi: ['Chinese', 'zh']
    };

    const tracks = [];
    const perLangCount = {};
    const sorted = [...data.subtitles].sort((a, b) => {
      const ae = (a.lang || '').toLowerCase().startsWith('en') ? 0 : 1;
      const be = (b.lang || '').toLowerCase().startsWith('en') ? 0 : 1;
      return ae - be;
    });

    for (const item of sorted) {
      if (!item?.url) continue;
      const rawLang = (item.lang || 'eng').toLowerCase();
      const [displayLang, shortCode] = langNames[rawLang] || [rawLang.toUpperCase(), rawLang.slice(0, 2)];
      perLangCount[displayLang] = (perLangCount[displayLang] || 0) + 1;
      if (perLangCount[displayLang] > 4) continue;
      const rel = item.movieReleaseName || item.subtitleFileName || '';
      const shortRel = rel.length > 26 ? rel.slice(0, 26) + '...' : rel;
      tracks.push({
        url: item.url,
        label: shortRel ? `${displayLang} (${shortRel})` : `${displayLang} #${perLangCount[displayLang]}`,
        lang: shortCode,
        language: displayLang,
        format: item.url.toLowerCase().includes('.vtt') ? 'vtt' : 'srt',
        isDefault: false
      });
      if (tracks.length >= 16) break;
    }
    return tracks;
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

  const contentId = String(req.query?.contentId || '').trim();
  const type = String(req.query?.type || 'movie').toLowerCase();
  const s = Number(req.query?.season || 1);
  const e = Number(req.query?.episode || 1);
  const isEpisodic = type === 'tv' || type === 'anime';

  if (!contentId) {
    return res.status(400).json({ success: false, error: 'contentId is required' });
  }

  const embedServers = [
    {
      name: 'Server 1 (FrameX)',
      url: isEpisodic
        ? `https://framextv.cc/embed/${contentId}/${s}/${e}?autoplay=1&no_ads=1`
        : `https://framextv.cc/embed/${contentId}?autoplay=1&no_ads=1`
    },
    {
      name: 'Server 2 (AutoEmbed)',
      url: isEpisodic
        ? `https://embed.su/embed/tv/${contentId}/${s}/${e}`
        : `https://embed.su/embed/movie/${contentId}`
    },
    {
      name: 'Server 3 (MultiEmbed)',
      url: isEpisodic
        ? `https://vidsrc.net/embed/tv/${contentId}/${s}/${e}`
        : `https://vidsrc.net/embed/movie/${contentId}`
    },
    {
      name: 'Server 4 (2Embed)',
      url: isEpisodic
        ? `https://vidsrc.pm/embed/tv/${contentId}/${s}/${e}`
        : `https://vidsrc.pm/embed/movie/${contentId}`
    }
  ];

  const baseQuery = `id=${encodeURIComponent(contentId)}&type=${isEpisodic ? 'tv' : 'movie'}${isEpisodic ? `&season=${s}&episode=${e}` : ''}`;

  const [bowlerRes, giantRes, defaultRes, osSubs] = await Promise.all([
    fetchWithTimeout(`${FRAMEX_API}/api/stream?${baseQuery}&provider=bowler`, {}, 4500).then((r) => r?.ok ? r.json().catch(() => null) : null),
    fetchWithTimeout(`${FRAMEX_API}/api/stream?${baseQuery}&provider=giant`, {}, 4500).then((r) => r?.ok ? r.json().catch(() => null) : null),
    fetchWithTimeout(`${FRAMEX_API}/api/stream?${baseQuery}`, {}, 4000).then((r) => r?.ok ? r.json().catch(() => null) : null),
    fetchOpenSubtitles(contentId, isEpisodic, s, e)
  ]);

  const rawSources = [
    ...(bowlerRes?.sources || []),
    ...(giantRes?.sources || []),
    ...(defaultRes?.sources || [])
  ];

  const seenUrls = new Set();
  const sources = [];
  for (const src of rawSources) {
    if (!src?.url || seenUrls.has(src.url) || !isCleanSource(src.url)) continue;
    seenUrls.add(src.url);
    sources.push({
      url: src.url,
      quality: src.quality || '720p',
      type: src.type === 'mp4' ? 'mp4' : 'hls',
      server: src.server || 'Direct Cloud HD'
    });
  }

  const streamSubs = [
    ...(bowlerRes?.subtitles || []),
    ...(giantRes?.subtitles || [])
  ].map((sub) => ({
    url: sub.url,
    label: sub.label || sub.language || 'English',
    lang: (sub.lang || sub.language || 'en').slice(0, 2).toLowerCase(),
    language: sub.language || sub.lang || 'English',
    format: sub.format === 'srt' ? 'srt' : 'vtt',
    isDefault: false
  })).filter((sub) => sub.url && !seenUrls.has(sub.url) && seenUrls.add(sub.url));

  // Rank stream-native subtitles first (locked directly to that stream's video cut!), followed by OpenSubtitles v3 release matches
  const subtitles = [...streamSubs.slice(0, 12), ...osSubs];

  return res.status(200).json({
    success: true,
    contentId,
    mediaType: type,
    season: isEpisodic ? s : undefined,
    episode: isEpisodic ? e : undefined,
    provider: sources.length > 0 ? 'FrameX Direct Cloud' : 'Verified Multi-Server Embed',
    sources,
    subtitles,
    embedUrl: embedServers[0].url,
    embedServers,
    alternates: ['bowler', 'giant', 'framex', 'autoembed', 'vidsrc']
  });
}
