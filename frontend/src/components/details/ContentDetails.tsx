import React, { useEffect, useState, useMemo } from 'react';
import { TitleDetails, Episode, MediaItem } from '../../types';
import { api } from '../../services/api';
import { useFocusable } from '../focus/FocusContext';
import { Play, Plus, Check, ArrowLeft, Star, Clock, Calendar, Film, RotateCcw, Cast } from 'lucide-react';
import { CastModal } from '../player/CastModal';

interface ContentDetailsProps {
  contentId: string;
  mediaType: 'movie' | 'tv' | 'anime';
  profileId?: string;
  onPlay: (item: MediaItem, season?: number, episode?: number) => void;
  onBack: () => void;
  onGoHome?: () => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (item: MediaItem) => void;
  onSelectRelated: (item: MediaItem) => void;
}

export const ContentDetails: React.FC<ContentDetailsProps> = ({
  contentId,
  mediaType,
  profileId,
  onPlay,
  onBack,
  onGoHome,
  isInWatchlist,
  onToggleWatchlist,
  onSelectRelated
}) => {
  const [details, setDetails] = useState<TitleDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [showCastModal, setShowCastModal] = useState(false);

  const savedProgress = useMemo(() => {
    return api.getItemProgress(contentId, profileId);
  }, [contentId, profileId]);

  const hasResume = Boolean(savedProgress && savedProgress.positionMs > 5000);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.getTitleDetails(contentId, mediaType)
      .then((data) => {
        if (isMounted) {
          setDetails(data);
          setLoading(false);
          if (data.seasons && data.seasons.length > 0) {
            setSelectedSeason(data.seasons[0].number);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load title details:', err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [contentId, mediaType]);

  // Load episodes when season changes
  useEffect(() => {
    if (details?.type === 'tv' && selectedSeason >= 1) {
      let isMounted = true;
      setLoadingEpisodes(true);

      api.getSeasonEpisodes(contentId, selectedSeason)
        .then((eps) => {
          if (isMounted) {
            setEpisodes(eps);
            setLoadingEpisodes(false);
          }
        })
        .catch((err) => {
          console.error(`Failed to load season ${selectedSeason} episodes:`, err);
          if (isMounted) setLoadingEpisodes(false);
        });

      return () => { isMounted = false; };
    }
  }, [contentId, details?.type, selectedSeason]);

  if (loading || !details) {
    return (
      <div className="fixed inset-0 bg-[#141414] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#E50914] border-t-transparent animate-spin" />
        <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase">Loading from Netflix...</p>
      </div>
    );
  }

  const backdropUrl = details.backdrop || details.poster;

  return (
    <div className="relative min-h-screen w-full bg-[#141414] text-white pb-24 select-none px-4 sm:px-8 md:px-12 lg:px-16 overflow-x-hidden">
      {/* Ambient Backdrop with Atmospheric Scrims */}
      <div
        className="fixed inset-0 bg-cover bg-center md:bg-right-top opacity-30 pointer-events-none transition-all duration-700 blur-[2px]"
        style={{ backgroundImage: `url(${backdropUrl})` }}
      />
      {/* Dual Gradient Scrims: Left-to-right and Top-to-bottom for signature Netflix hero look */}
      <div className="fixed inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/85 to-transparent pointer-events-none w-full md:w-3/4" />
      <div className="fixed inset-0 bg-gradient-to-b from-[#141414]/60 via-[#141414]/85 to-[#141414] pointer-events-none" />

      {/* Top Bar with Back Button and Clickable Netflix Brand */}
      <div className="relative z-30 pt-6 sm:pt-8 flex items-center justify-between">
        <BackButton onBack={onBack} />
        {/* Netflix Red Logo - Clickable to Home */}
        <div
          onClick={onGoHome || onBack}
          className="flex items-center space-x-2 cursor-pointer select-none group hover:opacity-80 transition-opacity"
          role="button"
          title="Return to Netflix Home"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              (onGoHome || onBack)();
            }
          }}
        >
          <svg viewBox="0 0 100 160" width="20" height="28" className="w-4.5 h-6 sm:w-5 sm:h-7 filter drop-shadow">
            <path d="M0 0h34v160H0z" fill="#B81D24" />
            <path d="M66 0h34v160H66z" fill="#B81D24" />
            <path d="M0 0h34l66 160H66z" fill="#E50914" />
          </svg>
          <span className="text-[10px] sm:text-xs font-black tracking-widest text-zinc-400 group-hover:text-white transition-colors font-sans uppercase">
            {details.type === 'tv' ? 'NETFLIX SERIES' : 'NETFLIX FILM'}
          </span>
        </div>
      </div>

      {/* Main Content Layout - Spans full screen width */}
      <div className="relative z-20 pt-6 sm:pt-8 w-full space-y-8 sm:space-y-10">
        {/* Header Hero Area: Side-by-Side Opened Movie Poster & Information */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 lg:gap-10 w-full">
          {/* Opened Movie Poster Card */}
          <div
            onClick={() =>
              onPlay(
                details,
                details.type === 'tv' ? (savedProgress?.season || selectedSeason) : undefined,
                details.type === 'tv' ? (savedProgress?.episode || 1) : undefined
              )
            }
            className="flex-shrink-0 w-44 sm:w-56 md:w-64 lg:w-72 xl:w-80 rounded-xl overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.9)] border border-white/15 bg-zinc-900 group cursor-pointer relative hover:border-white/30 transition-all duration-300 active:scale-98"
            role="button"
            title={`Play ${details.title}`}
          >
            <div className="relative aspect-[2/3] w-full">
              <img
                src={details.poster || details.backdrop}
                alt={details.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  if (details.backdrop && e.currentTarget.src !== details.backdrop) {
                    e.currentTarget.src = details.backdrop;
                  }
                }}
              />
              {/* Top-left Netflix Red "N" ribbon */}
              <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
                <svg viewBox="0 0 100 160" width="16" height="24" className="w-4 h-6 filter drop-shadow">
                  <path d="M0 0h34v160H0z" fill="#B81D24" />
                  <path d="M66 0h34v160H66z" fill="#B81D24" />
                  <path d="M0 0h34l66 160H66z" fill="#E50914" />
                </svg>
              </div>

              {/* Hover Play Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <div className="w-14 h-14 rounded-full bg-white/90 text-black flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                  <Play className="w-7 h-7 fill-black ml-0.5" />
                </div>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Details & Action Controls */}
          <div className="flex-1 space-y-3.5 sm:space-y-4 max-w-4xl">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">
              {details.title}
            </h1>

            {/* Badges Bar */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-white">
              <span className="text-emerald-400 font-bold">98% Match</span>

              <span className="px-1.5 py-0.2 border border-zinc-500 text-zinc-300 text-[10px] rounded-[2px]">
                {details.type === 'tv' ? 'TV-MA' : '16+'}
              </span>

              {details.year && <span className="text-zinc-300 font-normal">{details.year}</span>}

              {details.type === 'tv' && details.numberOfSeasons && (
                <span className="text-zinc-300 font-normal">
                  {details.numberOfSeasons} {details.numberOfSeasons === 1 ? 'Season' : 'Seasons'}
                </span>
              )}

              {details.runtime && (
                <span className="text-zinc-300 font-normal">{details.runtime}m</span>
              )}

              <span className="px-1.5 py-0.2 border border-zinc-600 text-zinc-300 text-[10px] rounded-[2px] font-mono">
                4K Ultra HD
              </span>

              <span className="px-1.5 py-0.2 border border-zinc-600 text-zinc-300 text-[10px] rounded-[2px] font-mono">
                5.1
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <PlayButton
                focusKey="detail-play"
                label={
                  details.type === 'tv'
                    ? (hasResume && savedProgress?.season && savedProgress?.episode
                        ? `Resume S${savedProgress.season}:E${savedProgress.episode}`
                        : 'Play Episode 1')
                    : (hasResume ? 'Resume Movie' : 'Play Movie')
                }
                onClick={() =>
                  onPlay(
                    details,
                    details.type === 'tv' ? (savedProgress?.season || selectedSeason) : undefined,
                    details.type === 'tv' ? (savedProgress?.episode || 1) : undefined
                  )
                }
              />
              {hasResume && (
                <RestartButton
                  focusKey="detail-restart"
                  onClick={() => {
                    api.saveProgress(contentId, {
                      profileId: profileId || 'bolt',
                      mediaType: details.type,
                      season: details.type === 'tv' ? 1 : undefined,
                      episode: details.type === 'tv' ? 1 : undefined,
                      positionMs: 0,
                      durationMs: savedProgress?.durationMs || 7200000,
                      title: details.title,
                      poster: details.poster || details.backdrop
                    }).catch(() => {});
                    onPlay(details, details.type === 'tv' ? 1 : undefined, details.type === 'tv' ? 1 : undefined);
                  }}
                />
              )}
              <MyListButton
                focusKey="detail-watchlist"
                isInWatchlist={isInWatchlist}
                onClick={() => onToggleWatchlist(details)}
              />
              <CastDetailButton
                focusKey="detail-cast"
                onClick={() => setShowCastModal(true)}
              />
            </div>

            {/* Synopsis */}
            <p className="text-zinc-300 text-sm md:text-base leading-relaxed pt-2 font-normal">
              {details.overview || 'Watch this Netflix title streaming now in Ultra HD.'}
            </p>

            {/* Cast */}
            {details.cast && details.cast.length > 0 && (
              <p className="text-xs text-zinc-400 pt-1">
                <span className="text-zinc-500 font-semibold">Starring: </span>
                {details.cast.slice(0, 5).map(c => c.name).join(', ')}
              </p>
            )}
          </div>
        </div>

        {/* Episodic Section (TV Shows Only) */}
        {details.type === 'tv' && (
          <div className="space-y-4 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-white">Episodes</h2>

              {/* Seasons Selector Tabs */}
              {details.seasons && details.seasons.length > 0 && (
                <div className="flex items-center space-x-2">
                  {details.seasons.map((s) => (
                    <SeasonTabButton
                      key={`season-tab-${s.number}`}
                      number={s.number}
                      name={s.name}
                      isSelected={selectedSeason === s.number}
                      onSelect={() => setSelectedSeason(s.number)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Episode Cards Carousel */}
            {loadingEpisodes ? (
              <div className="py-8 flex items-center justify-center text-zinc-500 font-mono text-xs">
                Loading episodes...
              </div>
            ) : episodes.length > 0 ? (
              <div className="flex space-x-4 overflow-x-auto py-3 no-scrollbar">
                {episodes.map((ep) => (
                  <EpisodeCard
                    key={`ep-${details.id}-${selectedSeason}-${ep.number}`}
                    episode={ep}
                    seasonNumber={selectedSeason}
                    onPlay={() => onPlay(details, selectedSeason, ep.number)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm py-4">No episode listing available for this season.</p>
            )}
          </div>
        )}

        {/* More Like This (Related Titles) - Perfectly Fits Screen Horizontally */}
        {details.recommendations && details.recommendations.length > 0 && (
          <div className="space-y-4 pt-8 border-t border-white/10 w-full">
            <div className="flex items-center justify-between w-full">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">More Like This</h2>
              <span className="text-xs text-zinc-400 font-mono">
                {details.recommendations.length} Recommendations
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5 w-full">
              {details.recommendations.slice(0, 12).map((rec, idx) => (
                <MoreLikeThisCard
                  key={`rec-${rec.id}-${idx}`}
                  rec={rec}
                  index={idx}
                  onSelect={() => onSelectRelated(rec)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cast to TV or PC Modal */}
      {details && (
        <CastModal
          isOpen={showCastModal}
          onClose={() => setShowCastModal(false)}
          item={details}
          currentTime={(savedProgress?.positionMs || 0) / 1000}
          duration={(savedProgress?.durationMs || 0) / 1000}
          season={details.type === 'tv' ? (savedProgress?.season || selectedSeason) : undefined}
          episode={details.type === 'tv' ? (savedProgress?.episode || 1) : undefined}
        />
      )}
    </div>
  );
};

const BackButton: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { ref, isFocused } = useFocusable({
    focusKey: 'detail-back-btn',
    groupId: 'detail-nav',
    onEnter: onBack
  });

  return (
    <button
      ref={ref}
      onClick={onBack}
      className={`flex items-center space-x-2 px-4 py-2 rounded-[4px] text-xs font-bold transition-all tv-focusable cursor-pointer ${
        isFocused ? 'bg-white text-black' : 'bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-700'
      }`}
      title="Back to Home"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>Back</span>
    </button>
  );
};

const PlayButton: React.FC<{
  focusKey: string;
  label: string;
  onClick: () => void;
}> = ({ focusKey, label, onClick }) => {
  const { ref, isFocused } = useFocusable({
    focusKey,
    groupId: 'detail-actions',
    onEnter: onClick
  });

  return (
    <button
      ref={ref}
      onClick={onClick}
      className={`flex items-center space-x-2.5 px-8 py-2.5 rounded-[4px] font-black text-sm tracking-wide transition-all tv-focusable ${
        isFocused
          ? 'scale-108 bg-white text-black shadow-2xl ring-4 ring-white/50'
          : 'bg-white text-black hover:bg-zinc-200'
      }`}
    >
      <Play className="w-5 h-5 fill-black text-black" />
      <span>{label}</span>
    </button>
  );
};

const RestartButton: React.FC<{
  focusKey: string;
  onClick: () => void;
}> = ({ focusKey, onClick }) => {
  const { ref, isFocused } = useFocusable({
    focusKey,
    groupId: 'detail-actions',
    onEnter: onClick
  });

  return (
    <button
      ref={ref}
      onClick={onClick}
      className={`flex items-center space-x-2 px-5 py-2.5 rounded-[4px] font-bold text-sm tracking-wide transition-all tv-focusable ${
        isFocused
          ? 'scale-108 bg-white text-black shadow-2xl ring-4 ring-white/50'
          : 'bg-zinc-800 text-white hover:bg-zinc-700 border border-white/20'
      }`}
      title="Start from Beginning"
    >
      <RotateCcw className="w-4 h-4" />
      <span>Restart</span>
    </button>
  );
};

const MyListButton: React.FC<{
  focusKey: string;
  isInWatchlist: boolean;
  onClick: () => void;
}> = ({ focusKey, isInWatchlist, onClick }) => {
  const { ref, isFocused } = useFocusable({
    focusKey,
    groupId: 'detail-actions',
    onEnter: onClick
  });

  return (
    <button
      ref={ref}
      onClick={onClick}
      className={`flex items-center justify-center w-10 h-10 rounded-full transition-all tv-focusable ${
        isFocused
          ? 'scale-110 bg-white text-black shadow-2xl ring-4 ring-white/50'
          : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-white/20'
      }`}
      title={isInWatchlist ? 'Remove from My List' : 'Add to My List'}
    >
      {isInWatchlist ? <Check className="w-5 h-5 text-emerald-400" /> : <Plus className="w-5 h-5" />}
    </button>
  );
};

const CastDetailButton: React.FC<{
  focusKey: string;
  onClick: () => void;
}> = ({ focusKey, onClick }) => {
  const { ref, isFocused } = useFocusable({
    focusKey,
    groupId: 'detail-actions',
    onEnter: onClick
  });

  return (
    <button
      ref={ref}
      onClick={onClick}
      className={`flex items-center space-x-2 px-5 py-2.5 rounded-[4px] font-bold text-sm tracking-wide tv-focusable transition-all duration-200 cursor-pointer ${
        isFocused
          ? 'scale-108 bg-white text-black shadow-2xl ring-4 ring-white/50'
          : 'bg-zinc-800 text-white hover:bg-zinc-700 border border-white/20'
      }`}
      title="Cast to TV or PC"
    >
      <Cast className="w-4 h-4 text-[#E50914]" />
      <span>Cast</span>
    </button>
  );
};

const SeasonTabButton: React.FC<{
  number: number;
  name: string;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ number, name, isSelected, onSelect }) => {
  const { ref, isFocused } = useFocusable({
    focusKey: `season-tab-${number}`,
    groupId: 'season-tabs',
    onEnter: onSelect
  });

  return (
    <button
      ref={ref}
      onClick={onSelect}
      className={`px-3 py-1.5 rounded-[2px] text-xs font-bold transition-all tv-focusable ${
        isFocused
          ? 'bg-white text-black'
          : isSelected
          ? 'bg-[#E50914] text-white'
          : 'bg-zinc-800 text-zinc-400 hover:text-white'
      }`}
    >
      {name || `Season ${number}`}
    </button>
  );
};

const EpisodeCard: React.FC<{
  episode: Episode;
  seasonNumber: number;
  onPlay: () => void;
}> = ({ episode, seasonNumber, onPlay }) => {
  const { ref, isFocused } = useFocusable({
    focusKey: `episode-${seasonNumber}-${episode.number}`,
    groupId: 'episode-rail',
    onEnter: onPlay
  });

  return (
    <div
      ref={ref}
      onClick={onPlay}
      className={`shrink-0 w-72 rounded-[4px] overflow-hidden bg-zinc-900 border border-zinc-800 cursor-pointer tv-focusable transition-all duration-200 ${
        isFocused ? 'scale-105 border-white shadow-2xl ring-2 ring-[#E50914]' : 'hover:scale-102'
      }`}
    >
      {/* Still Preview */}
      <div className="relative aspect-video w-full bg-zinc-950">
        {episode.still ? (
          <img src={episode.still} alt={episode.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-700">
            <Play className="w-8 h-8" />
          </div>
        )}
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-[2px] bg-black/80 text-[10px] font-mono font-bold text-white">
          EP {episode.number}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1">
        <p className="text-xs font-bold text-white truncate">{episode.name}</p>
        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
          {episode.overview || 'Select to stream this episode in HD.'}
        </p>
      </div>
    </div>
  );
};

const MoreLikeThisCard: React.FC<{
  rec: MediaItem;
  index: number;
  onSelect: () => void;
}> = ({ rec, index, onSelect }) => {
  const { ref, isFocused } = useFocusable({
    focusKey: `detail-rec-${index}`,
    groupId: 'detail-recommendations',
    onEnter: onSelect
  });

  return (
    <div
      ref={ref}
      onClick={onSelect}
      className={`group relative aspect-[2/3] rounded-[4px] overflow-hidden bg-zinc-900 border cursor-pointer tv-focusable transition-all duration-200 ${
        isFocused
          ? 'scale-105 border-white ring-4 ring-[#E50914] shadow-2xl z-20 brightness-110'
          : 'border-zinc-800 hover:scale-102 hover:border-zinc-600'
      }`}
    >
      <img
        src={rec.poster || rec.backdrop}
        alt={rec.title}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/95 via-black/60 to-transparent">
        <p className="text-[11px] font-bold text-white truncate drop-shadow">{rec.title}</p>
        <div className="flex items-center space-x-1.5 text-[9px] text-zinc-300 font-mono">
          {rec.year && <span>{rec.year}</span>}
          {rec.rating && <span className="text-amber-400 font-bold">★ {rec.rating}</span>}
        </div>
      </div>
    </div>
  );
};
