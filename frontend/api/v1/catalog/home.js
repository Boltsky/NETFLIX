const TMDB_API_KEYS = [
  '8265bd1679663a7ea12ac168da84d2e8',
  '4113f36a5fa39233075242c75e340294',
  'b86ae9481977e13e00e0fe7ce13a9ba0',
  '15d2ade0fe30e38371f7d329acfb97d5'
];

let keyIdx = 0;

async function tmdbFetch(endpoint, params = {}) {
  for (let i = 0; i < TMDB_API_KEYS.length; i++) {
    const key = TMDB_API_KEYS[(keyIdx + i) % TMDB_API_KEYS.length];
    const query = new URLSearchParams({
      api_key: key,
      language: 'en-US',
      ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
    });
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 3500);
    try {
      const res = await fetch(`https://api.themoviedb.org/3${endpoint}?${query.toString()}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      });
      clearTimeout(tid);
      if (res.ok) return await res.json();
      if (res.status === 401 || res.status === 429) {
        keyIdx = (keyIdx + 1) % TMDB_API_KEYS.length;
        continue;
      }
      return null;
    } catch {
      clearTimeout(tid);
      keyIdx = (keyIdx + 1) % TMDB_API_KEYS.length;
    }
  }
  return null;
}

function mapItem(raw, defaultType = 'movie') {
  const isTv =
    raw.media_type === 'tv' ||
    raw.first_air_date !== undefined ||
    raw.number_of_seasons !== undefined ||
    Boolean(raw.name && !raw.title);
  const isAnime = Array.isArray(raw.genre_ids) && raw.genre_ids.includes(16);
  const type = isTv ? (isAnime ? 'anime' : 'tv') : isAnime ? 'anime' : raw.type || defaultType;
  const poster = raw.poster_path ? `https://image.tmdb.org/t/p/w342${raw.poster_path}` : raw.poster;
  const backdrop = raw.backdrop_path ? `https://image.tmdb.org/t/p/w780${raw.backdrop_path}` : poster;
  const year = raw.release_date
    ? raw.release_date.slice(0, 4)
    : raw.first_air_date
    ? raw.first_air_date.slice(0, 4)
    : raw.year;

  return {
    id: String(raw.id),
    title: raw.title || raw.name || 'Untitled',
    type,
    rating: raw.vote_average ? String(Number(raw.vote_average).toFixed(1)) : undefined,
    year,
    poster,
    backdrop,
    overview: raw.overview || '',
    genres: []
  };
}

function mergeUnique(lists, defaultType) {
  const seen = new Set();
  const out = [];
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const raw of list) {
      if (!raw || !raw.id) continue;
      const mapped = mapItem(raw, raw.media_type === 'tv' ? 'tv' : defaultType);
      if (!seen.has(mapped.id)) {
        seen.add(mapped.id);
        out.push(mapped);
      }
    }
  }
  return out;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600');

  const today = new Date().toISOString().slice(0, 10);

  try {
    const [
      dailyMovies,
      nowPlayingP1,
      nowPlayingP2,
      trendingP1,
      trendingP2,
      popularMovies,
      popularTvP1,
      popularTvP2,
      topRatedMovies,
      topRatedTv,
      upcoming,
      airingToday,
      onTheAir,
      action,
      scifi,
      thriller,
      comedy,
      animeMovies,
      animeTv,
      drama,
      horror
    ] = await Promise.all([
      tmdbFetch('/discover/movie', {
        'primary_release_date.lte': today,
        'vote_count.gte': 5,
        sort_by: 'primary_release_date.desc',
        page: 1
      }),
      tmdbFetch('/movie/now_playing', { page: 1 }),
      tmdbFetch('/movie/now_playing', { page: 2 }),
      tmdbFetch('/trending/all/day', { page: 1 }),
      tmdbFetch('/trending/all/day', { page: 2 }),
      tmdbFetch('/movie/popular', { page: 1 }),
      tmdbFetch('/tv/popular', { page: 1 }),
      tmdbFetch('/tv/popular', { page: 2 }),
      tmdbFetch('/movie/top_rated', { page: 1 }),
      tmdbFetch('/tv/top_rated', { page: 1 }),
      tmdbFetch('/movie/upcoming', { page: 1 }),
      tmdbFetch('/tv/airing_today', { page: 1 }),
      tmdbFetch('/tv/on_the_air', { page: 1 }),
      tmdbFetch('/discover/movie', { with_genres: 28, sort_by: 'popularity.desc', page: 1 }),
      tmdbFetch('/discover/movie', { with_genres: 878, sort_by: 'popularity.desc', page: 1 }),
      tmdbFetch('/discover/movie', { with_genres: 53, sort_by: 'popularity.desc', page: 1 }),
      tmdbFetch('/discover/movie', { with_genres: 35, sort_by: 'popularity.desc', page: 1 }),
      tmdbFetch('/discover/movie', { with_genres: 16, sort_by: 'popularity.desc', page: 1 }),
      tmdbFetch('/discover/tv', { with_genres: 16, sort_by: 'popularity.desc', page: 1 }),
      tmdbFetch('/discover/movie', { with_genres: 18, sort_by: 'popularity.desc', page: 1 }),
      tmdbFetch('/discover/movie', { with_genres: 27, sort_by: 'popularity.desc', page: 1 })
    ]);

    const rails = [];
    const pushRail = (id, title, type, category, lists) => {
      const items = mergeUnique(lists, type);
      if (items.length > 0) rails.push({ id, title, type, category, items });
    };

    pushRail('rail-new-releases', 'Added Daily • New Releases', 'movie', 'new_releases', [dailyMovies?.results, nowPlayingP1?.results, nowPlayingP2?.results]);
    pushRail('rail-trending', 'Trending Today', 'movie', 'trending', [trendingP1?.results, trendingP2?.results]);
    pushRail('rail-popular-movies', 'Blockbuster Movies', 'movie', 'popular', [popularMovies?.results]);
    pushRail('rail-popular-tv', 'Popular TV Series', 'tv', 'tv', [popularTvP1?.results, popularTvP2?.results]);
    pushRail('rail-tv-airing', 'Airing Today & New Episodes', 'tv', 'tv_airing', [airingToday?.results, onTheAir?.results]);
    pushRail('rail-top-rated-movies', 'Top Rated Movies', 'movie', 'top_rated', [topRatedMovies?.results]);
    pushRail('rail-top-rated-tv', 'Critically Acclaimed Series', 'tv', 'tv', [topRatedTv?.results]);
    pushRail('rail-upcoming', 'Upcoming & In Theaters', 'movie', 'upcoming', [upcoming?.results]);
    pushRail('rail-action', 'Action & Adventure', 'movie', 'action', [action?.results]);
    pushRail('rail-scifi', 'Sci-Fi & Fantasy', 'movie', 'scifi', [scifi?.results]);
    pushRail('rail-thriller', 'Thrillers & Suspense', 'movie', 'thriller', [thriller?.results]);
    pushRail('rail-comedy', 'Comedy Hits', 'movie', 'comedy', [comedy?.results]);
    pushRail('rail-anime', 'Acclaimed Anime & Animation', 'anime', 'anime', [animeMovies?.results, animeTv?.results]);
    pushRail('rail-drama', 'Critically Acclaimed Dramas', 'movie', 'drama', [drama?.results]);
    pushRail('rail-horror', 'Chilling Horror & Thrills', 'movie', 'horror', [horror?.results]);

    const heroPool = [
      ...(trendingP1?.results || []),
      ...(nowPlayingP1?.results || []),
      ...(popularMovies?.results || [])
    ];
    const heroRaw = heroPool.find((r) => r.backdrop_path && r.poster_path && r.overview && r.overview.length > 20) || heroPool[0];
    const hero = heroRaw ? mapItem(heroRaw, heroRaw.media_type === 'tv' ? 'tv' : 'movie') : rails[0]?.items?.[0] || null;

    return res.status(200).json({
      success: true,
      date: today,
      data: { hero, rails }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'Catalog fetch failed'
    });
  }
}
