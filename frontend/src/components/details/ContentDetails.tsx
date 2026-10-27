import React, { useEffect, useState } from 'react';
import { TitleDetails, Episode, MediaItem } from '../../types';
import { api } from '../../services/api';
import { useFocusable } from '../focus/FocusContext';
import { Play, Plus, Check, ArrowLeft, Star, Clock, Calendar, Film } from 'lucide-react';

interface ContentDetailsProps {
  contentId: string;
  mediaType: 'movie' | 'tv' | 'anime';
  onPlay: (item: MediaItem, season?: number, episode?: number) => void;
  onBack: () => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (item: MediaItem) => void;
  onSelectRelated: (item: MediaItem) => void;
}

export const ContentDetails: React.FC<ContentDetailsProps> = ({
  contentId,
  mediaType,
  onPlay,
  onBack,
  isInWatchlist,
  onToggleWatchlist,
  onSelectRelated
}) => {
  const [details, setDetails] = useState<TitleDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

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
    <div className="relative min-h-screen bg-[#141414] text-white pb-24 select-none pl-24 pr-12">
      {/* Background Backdrop with Scrims */}
      <div
        className="fixed inset-0 bg-cover bg-center opacity-30 pointer-events-none"
        style={{ backgroundImage: `url(${backdropUrl})` }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-[#141414]/70 via-[#141414]/90 to-[#141414] pointer-events-none" />

      {/* Top Bar with Back Button */}
      <div className="relative z-30 pt-8 flex items-center justify-between">
        <BackButton onBack={onBack} />
        {/* Netflix Red Logo */}
        <div className="flex items-center space-x-2">
          <svg viewBox="0 0 100 160" width="20" height="28" className="w-5 h-7 filter drop-shadow">
            <path d="M0 0h34v160H0z" fill="#B81D24" />
            <path d="M66 0h34v160H66z" fill="#B81D24" />
            <path d="M0 0h34l66 160H66z" fill="#E50914" />
          </svg>
          <span className="text-xs font-black tracking-widest text-zinc-400 font-sans uppercase">
            {details.type === 'tv' ? 'NETFLIX SERIES' : 'NETFLIX FILM'}
          </span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="relative z-20 pt-8 max-w-5xl space-y-8">
        {/* Header Hero Area */}
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            {details.title}
          </h1>

          {/* Badges Bar */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-white">
            <span className="text-emerald-400 font-bold">98% Match</span>

            <span className="px-1.5 py-0.2 border border-zinc-500 text-zinc-300 text-[10px] rounded-[2px]">
              {details.type === 'tv' ? 'TV-MA' : '16+'}
            </span>

            {details.year && <span className="text-zinc-300 font-normal">{details.year}</span>}

            {details.numberOfSeasons && (
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
          <div className="flex items-center space-x-4 pt-2">
            <PlayButton
              focusKey="detail-play"
              label={details.type === 'tv' ? 'Resume S1:E1' : 'Play'}
              onClick={() => onPlay(details, details.type === 'tv' ? selectedSeason : undefined, details.type === 'tv' ? 1 : undefined)}
            />
            <MyListButton
              focusKey="detail-watchlist"
              isInWatchlist={isInWatchlist}
              onClick={() => onToggleWatchlist(details)}
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

        {/* More Like This (Related Titles) */}
        {details.recommendations && details.recommendations.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-xl font-bold tracking-tight text-white">More Like This</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {details.recommendations.slice(0, 10).map((rec, idx) => (
                <div
                  key={`rec-${rec.id}-${idx}`}
                  onClick={() => onSelectRelated(rec)}
                  className="aspect-[2/3] rounded-[4px] overflow-hidden bg-zinc-900 border border-zinc-800 cursor-pointer hover:scale-105 transition-transform"
                >
                  <img
                    src={rec.poster || rec.backdrop}
                    alt={rec.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
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
      className={`flex items-center space-x-2 px-4 py-2 rounded-[4px] text-xs font-bold transition-all tv-focusable ${
        isFocused ? 'bg-white text-black' : 'bg-zinc-800/80 text-zinc-300 hover:text-white'
      }`}
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
