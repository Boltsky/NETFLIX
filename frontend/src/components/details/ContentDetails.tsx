import React, { useEffect, useState, useMemo, useRef } from 'react';
import { TitleDetails, Episode, MediaItem, CastMember, DownloadResolution, DownloadedItem } from '../../types';
import { api } from '../../services/api';
import { downloadService } from '../../services/downloadService';
import { useFocusable } from '../focus/FocusContext';
import { Play, Plus, Check, ArrowLeft, Star, Clock, Calendar, Film, RotateCcw, User, ChevronLeft, ChevronRight, Download, CheckCircle, RefreshCw, HardDrive, ArrowDownToLine, ChevronDown, Trash2 } from 'lucide-react';

interface ContentDetailsProps {
  contentId: string;
  mediaType: 'movie' | 'tv' | 'anime';
  profileId?: string;
  onPlay: (item: MediaItem, season?: number, episode?: number) => void;
  onPlayOffline?: (item: DownloadedItem, blobUrl: string) => void;
  onBack: () => void;
  onGoHome?: () => void;
  onSelectCast?: (actorName: string) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (item: MediaItem) => void;
  onSelectRelated: (item: MediaItem) => void;
}

export const ContentDetails: React.FC<ContentDetailsProps> = ({
  contentId,
  mediaType,
  profileId,
  onPlay,
  onPlayOffline,
  onBack,
  onGoHome,
  onSelectCast,
  isInWatchlist,
  onToggleWatchlist,
  onSelectRelated
}) => {
  const [details, setDetails] = useState<TitleDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const castRailRef = useRef<HTMLDivElement>(null);

  const scrollCast = (direction: 'left' | 'right') => {
    if (castRailRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      castRailRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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
      <div className="relative z-30 pt-4 sm:pt-6 md:pt-8 flex items-center justify-between">
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
      <div className="relative z-20 pt-4 sm:pt-6 md:pt-8 w-full space-y-6 sm:space-y-8 md:space-y-10">
        {/* Header Hero Area: Side-by-Side Opened Movie Poster & Information */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-5 sm:gap-6 md:gap-8 lg:gap-10 w-full">
          {/* Opened Movie Poster Card */}
          <div
            onClick={() =>
              onPlay(
                details,
                details.type === 'tv' ? (savedProgress?.season || selectedSeason) : undefined,
                details.type === 'tv' ? (savedProgress?.episode || 1) : undefined
              )
            }
            className="flex-shrink-0 w-36 xs:w-44 sm:w-52 md:w-64 lg:w-72 xl:w-80 rounded-xl overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.9)] border border-white/15 bg-zinc-900 group cursor-pointer relative hover:border-white/30 transition-all duration-300 active:scale-98 mx-auto md:mx-0"
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
              <div className="absolute top-2 sm:top-2.5 left-2 sm:left-2.5 z-10 pointer-events-none">
                <svg viewBox="0 0 100 160" width="16" height="24" className="w-3.5 h-5 sm:w-4 sm:h-6 filter drop-shadow">
                  <path d="M0 0h34v160H0z" fill="#B81D24" />
                  <path d="M66 0h34v160H66z" fill="#B81D24" />
                  <path d="M0 0h34l66 160H66z" fill="#E50914" />
                </svg>
              </div>

              {/* Hover Play Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/90 text-black flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                  <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-black ml-0.5" />
                </div>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Details & Action Controls - On the Side of the Poster */}
          <div className="flex-1 min-w-0 w-full space-y-2 sm:space-y-2.5 md:space-y-3 flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight w-full">
              {details.title}
            </h1>

            {/* Badges Bar */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-2.5 text-xs font-bold text-white w-full">
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-2.5 sm:gap-3 pt-0.5 sm:pt-1 w-full">
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
              <div className="flex items-center justify-center md:justify-start gap-2.5 sm:gap-3 flex-wrap">
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
                <DownloadDetailsButton
                  details={details}
                  season={details.type === 'tv' ? selectedSeason : undefined}
                  episode={details.type === 'tv' ? 1 : undefined}
                  onPlayOffline={onPlayOffline}
                />
              </div>
            </div>

            {/* Synopsis */}
            <p className="text-zinc-300 text-xs sm:text-sm md:text-[13px] lg:text-sm leading-relaxed pt-0.5 font-normal max-w-3xl text-left w-full line-clamp-3">
              {details.overview || 'Watch this Netflix title streaming now in Ultra HD.'}
            </p>

            {/* Cast Starring Text */}
            {details.cast && details.cast.length > 0 && (
              <p className="text-[11px] sm:text-xs text-zinc-400 pt-0 text-left w-full truncate">
                <span className="text-zinc-500 font-semibold">Starring: </span>
                {details.cast.slice(0, 5).map(c => c.name).join(', ')}
              </p>
            )}

            {/* Cast Images Carousel on the Side of the Poster */}
            {details.cast && details.cast.length > 0 && (
              <div className="pt-1.5 sm:pt-2 space-y-1.5 w-full text-left">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-300">
                      Cast
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      • {details.cast.length} Actors
                    </span>
                  </div>
                  {/* Desktop / Tablet Scroll Controls */}
                  <div className="hidden sm:flex items-center space-x-1.5">
                    <button
                      onClick={() => scrollCast('left')}
                      className="w-5 h-5 rounded-full bg-zinc-800/90 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer border border-white/10"
                      title="Scroll Cast left"
                      type="button"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => scrollCast('right')}
                      className="w-5 h-5 rounded-full bg-zinc-800/90 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer border border-white/10"
                      title="Scroll Cast right"
                      type="button"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Horizontal Carousel of Cast Members */}
                <div
                  ref={castRailRef}
                  className="flex space-x-2 sm:space-x-2.5 overflow-x-auto py-1 no-scrollbar w-full scroll-smooth"
                >
                  {details.cast.map((member, idx) => (
                    <CastCard
                      key={`cast-${member.id}-${idx}`}
                      member={member}
                      index={idx}
                      onSelect={onSelectCast ? () => onSelectCast(member.name) : undefined}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Episodic Section (TV Shows Only) */}
        {details.type === 'tv' && (
          <div className="space-y-4 pt-6 border-t border-white/10 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">Episodes</h2>

              {/* Seasons Selector Tabs */}
              {details.seasons && details.seasons.length > 0 && (
                <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar max-w-full pb-1">
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
              <div className="flex space-x-3 sm:space-x-4 overflow-x-auto py-2 sm:py-3 no-scrollbar w-full">
                {episodes.map((ep) => (
                  <EpisodeCard
                    key={`ep-${details.id}-${selectedSeason}-${ep.number}`}
                    episode={ep}
                    seasonNumber={selectedSeason}
                    contentId={details.id}
                    mediaType={details.type}
                    title={details.title}
                    poster={details.poster}
                    backdrop={details.backdrop}
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
      className={`flex items-center space-x-1.5 sm:space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-[4px] text-xs font-bold transition-all tv-focusable cursor-pointer ${
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
      className={`flex items-center justify-center space-x-2.5 px-6 sm:px-8 py-3 sm:py-2.5 rounded-[4px] font-black text-sm sm:text-base tracking-wide transition-all tv-focusable w-full sm:w-auto ${
        isFocused
          ? 'scale-108 bg-white text-black shadow-2xl ring-4 ring-white/50'
          : 'bg-white text-black hover:bg-zinc-200'
      }`}
    >
      <Play className="w-5 h-5 fill-black text-black shrink-0" />
      <span className="truncate">{label}</span>
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
      className={`flex items-center space-x-1.5 sm:space-x-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-[4px] font-bold text-xs sm:text-sm tracking-wide transition-all tv-focusable shrink-0 ${
        isFocused
          ? 'scale-108 bg-white text-black shadow-2xl ring-4 ring-white/50'
          : 'bg-zinc-800 text-white hover:bg-zinc-700 border border-white/20'
      }`}
      title="Start from Beginning"
    >
      <RotateCcw className="w-4 h-4 shrink-0" />
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
      className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all tv-focusable shrink-0 ${
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
      className={`shrink-0 px-3 py-1.5 rounded-[2px] text-xs font-bold transition-all tv-focusable ${
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

const DownloadDetailsButton: React.FC<{
  details: TitleDetails;
  season?: number;
  episode?: number;
  onPlayOffline?: (item: DownloadedItem, blobUrl: string) => void;
}> = ({ details, season, episode, onPlayOffline }) => {
  const [downloadInfo, setDownloadInfo] = useState<DownloadResolution | null>(null);
  const [downloadedItem, setDownloadedItem] = useState<DownloadedItem | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<string>('1080p');
  const [showModal, setShowModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const downloadId = useMemo(
    () => downloadService.getDownloadId(details.id, details.type, season, episode),
    [details.id, details.type, season, episode]
  );

  useEffect(() => {
    let isMounted = true;
    api.resolveDownload(details.id, details.type, {
      title: details.title,
      duration: details.runtime,
      season,
      episode
    }).then((res) => {
      if (isMounted) {
        setDownloadInfo(res);
        if (res.defaultQuality) setSelectedQuality(res.defaultQuality);
      }
    }).catch(() => {});

    downloadService.getDownload(downloadId).then((item) => {
      if (isMounted && item) {
        setDownloadedItem(item);
      }
    });

    const unsub = downloadService.onItemProgress(downloadId, (updated) => {
      if (isMounted) {
        setDownloadedItem({ ...updated });
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, [downloadId, details.id, details.type, details.title, details.runtime, season, episode]);

  const activeQualityOption = useMemo(() => {
    if (!downloadInfo?.qualities) return null;
    return downloadInfo.qualities.find((q) => q.quality === selectedQuality) || downloadInfo.qualities[0];
  }, [downloadInfo, selectedQuality]);

  const handleStartDownload = async (mode: 'offline' | 'disk') => {
    setShowModal(false);
    try {
      setStatusMessage(mode === 'disk' ? 'Preparing file download...' : 'Starting offline download...');
      setTimeout(() => setStatusMessage(null), 3000);
      const res = await downloadService.startDownload({
        contentId: details.id,
        mediaType: details.type,
        title: details.title,
        poster: details.poster,
        backdrop: details.backdrop,
        duration: details.runtime,
        season,
        episode,
        quality: selectedQuality,
        mode
      });
      setDownloadedItem(res);
    } catch (e: any) {
      setStatusMessage(`Download error: ${e?.message || 'failed'}`);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handlePlayOffline = async () => {
    if (!downloadedItem) return;
    try {
      const blobUrl = await downloadService.getOfflinePlaybackUrl(downloadedItem.id);
      if (blobUrl && onPlayOffline) {
        onPlayOffline(downloadedItem, blobUrl);
      } else {
        setStatusMessage('Preparing offline stream...');
      }
    } catch (e: any) {
      setStatusMessage(`Play error: ${e?.message}`);
    }
  };

  const handleSaveToDisk = async () => {
    if (!downloadedItem) return;
    await downloadService.exportToDisk(downloadedItem.id);
    setStatusMessage('Saved to PC Downloads folder!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDelete = async () => {
    if (!downloadedItem) return;
    if (window.confirm(`Delete "${details.title}" from local offline storage?`)) {
      await downloadService.deleteDownload(downloadedItem.id);
      setDownloadedItem(null);
      setShowModal(false);
    }
  };

  const isDownloading = downloadedItem?.status === 'downloading';
  const isCompleted = downloadedItem?.status === 'completed';

  const { ref, isFocused } = useFocusable({
    focusKey: 'detail-download-btn',
    groupId: 'detail-actions',
    onEnter: () => setShowModal((prev) => !prev)
  });

  return (
    <div className="relative inline-block">
      {statusMessage && (
        <div className="absolute -top-10 left-0 z-50 bg-black/90 text-white text-[11px] px-2.5 py-1 rounded border border-white/20 whitespace-nowrap shadow-xl">
          {statusMessage}
        </div>
      )}

      {/* Main Download Action Button Container */}
      <div className="flex items-center rounded-[4px] overflow-hidden bg-zinc-800 border border-white/20 transition-all">
        <button
          ref={ref}
          onClick={
            isCompleted
              ? handlePlayOffline
              : isDownloading
              ? () => setShowModal(true)
              : () => handleStartDownload('offline')
          }
          className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2 sm:py-2.5 font-bold text-xs sm:text-sm transition-all tv-focusable cursor-pointer ${
            isFocused
              ? 'scale-105 bg-white text-black shadow-2xl ring-4 ring-white/50'
              : isCompleted
              ? 'bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300'
              : isDownloading
              ? 'bg-red-950/90 text-red-200'
              : 'hover:bg-zinc-700 text-white'
          }`}
          title={isCompleted ? 'Play offline from local storage' : isDownloading ? `Downloading ${downloadedItem?.progressPercent || 0}%` : 'Download to Local Storage in 1080p'}
        >
          {isDownloading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-red-400" />
              <span>Downloading {downloadedItem?.progressPercent || 0}%</span>
              {downloadedItem?.downloadSpeed && (
                <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
                  {downloadedItem.downloadSpeed}
                </span>
              )}
            </>
          ) : isCompleted ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Downloaded</span>
              <span className="text-[11px] font-mono px-1.5 py-0.2 bg-black/40 rounded text-emerald-300">
                {downloadedItem?.formattedSize || activeQualityOption?.formattedSize}
              </span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-zinc-300" />
              <span>Download</span>
              {activeQualityOption && (
                <span className="text-[11px] font-mono px-1.5 py-0.2 bg-black/50 rounded text-zinc-300 border border-white/10">
                  {activeQualityOption.formattedSize}
                </span>
              )}
            </>
          )}
        </button>

        {/* Dropdown Options Toggle Arrow Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowModal((prev) => !prev);
          }}
          className={`px-2 py-2 sm:py-2.5 border-l border-white/10 transition-colors cursor-pointer ${
            isCompleted
              ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300'
              : isDownloading
              ? 'bg-red-950 text-red-300'
              : 'hover:bg-zinc-700 text-zinc-400 hover:text-white'
          }`}
          title="Download Options & Video Sizes"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showModal ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Download Modal / Dropdown Dialog */}
      {showModal && (
        <div
          className="absolute left-0 sm:left-auto sm:right-0 mt-2 z-50 w-72 sm:w-80 bg-zinc-900/95 backdrop-blur-md border border-zinc-700 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-4 text-white text-left space-y-3.5 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <div className="flex items-center space-x-2">
              <Download className="w-4 h-4 text-red-500" />
              <span className="font-bold text-sm text-white">Video Download</span>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="text-zinc-400 hover:text-white text-xs px-1.5 py-0.5"
            >
              ✕
            </button>
          </div>

          {/* Quality Selector with Visible Pre-Download Video Sizes */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Select Quality & File Size
            </label>
            <div className="space-y-1">
              {(downloadInfo?.qualities || [
                { quality: '1080p', label: '1080p (Full HD)', formattedSize: '~1.4 GB' },
                { quality: '720p', label: '720p (Standard HD)', formattedSize: '~750 MB' },
                { quality: '480p', label: '480p (Data Saver)', formattedSize: '~400 MB' }
              ]).map((q: any) => (
                <button
                  key={q.quality}
                  onClick={() => setSelectedQuality(q.quality)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                    selectedQuality === q.quality
                      ? 'bg-red-600/20 border border-red-500/50 text-white font-bold'
                      : 'bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" style={{ opacity: selectedQuality === q.quality ? 1 : 0.2 }} />
                    <span>{q.label || q.quality}</span>
                  </div>
                  <span className="font-mono text-zinc-300 font-semibold px-1.5 py-0.5 rounded bg-black/40 text-[11px]">
                    {q.formattedSize}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Modalities */}
          <div className="space-y-2 pt-1 border-t border-zinc-800">
            {isCompleted ? (
              <div className="space-y-2">
                <button
                  onClick={handlePlayOffline}
                  className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-lg text-xs transition-all shadow-md cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play from Offline Storage</span>
                </button>
                <button
                  onClick={handleSaveToDisk}
                  className="w-full flex items-center justify-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium py-2 px-3 rounded-lg text-xs transition-all cursor-pointer"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" />
                  <span>Save MP4 to PC Downloads</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center space-x-1.5 text-red-400 hover:text-red-300 text-xs py-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete from Local Storage</span>
                </button>
              </div>
            ) : isDownloading ? (
              <div className="space-y-2 text-center">
                <div className="text-xs text-zinc-300">
                  Downloading {downloadedItem?.progressPercent}%...
                </div>
                <button
                  onClick={() => downloadService.deleteDownload(downloadId)}
                  className="w-full bg-zinc-800 hover:bg-red-900/50 text-red-300 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Cancel Download
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => handleStartDownload('offline')}
                  className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-zinc-200 text-black font-bold py-2.5 px-3 rounded-lg text-xs transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  <HardDrive className="w-3.5 h-3.5 text-red-600" />
                  <span>Download for In-App Offline Play</span>
                </button>
                <button
                  onClick={() => handleStartDownload('disk')}
                  className="w-full flex items-center justify-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium py-2 px-3 rounded-lg text-xs transition-all cursor-pointer"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Save MP4 File to Computer Disk</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const EpisodeCard: React.FC<{
  episode: Episode;
  seasonNumber: number;
  contentId: string;
  mediaType: 'movie' | 'tv' | 'anime';
  title: string;
  poster?: string;
  backdrop?: string;
  onPlay: () => void;
}> = ({ episode, seasonNumber, contentId, mediaType, title, poster, backdrop, onPlay }) => {
  const [downloadedItem, setDownloadedItem] = useState<DownloadedItem | null>(null);

  const downloadId = useMemo(
    () => downloadService.getDownloadId(contentId, mediaType, seasonNumber, episode.number),
    [contentId, mediaType, seasonNumber, episode.number]
  );

  useEffect(() => {
    let isMounted = true;
    downloadService.getDownload(downloadId).then((item) => {
      if (isMounted && item) setDownloadedItem(item);
    });

    const unsub = downloadService.onItemProgress(downloadId, (updated) => {
      if (isMounted) setDownloadedItem({ ...updated });
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, [downloadId]);

  const handleDownloadEpisode = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadService.startDownload({
      contentId,
      mediaType,
      title,
      season: seasonNumber,
      episode: episode.number,
      episodeName: episode.name,
      poster: episode.still || poster,
      backdrop: episode.still || backdrop,
      duration: 45,
      quality: '1080p',
      mode: 'offline'
    });
  };

  const isDownloading = downloadedItem?.status === 'downloading';
  const isCompleted = downloadedItem?.status === 'completed';

  const { ref, isFocused } = useFocusable({
    focusKey: `episode-${seasonNumber}-${episode.number}`,
    groupId: 'episode-rail',
    onEnter: onPlay
  });

  return (
    <div
      ref={ref}
      onClick={onPlay}
      className={`shrink-0 w-60 sm:w-72 rounded-[4px] overflow-hidden bg-zinc-900 border border-zinc-800 cursor-pointer tv-focusable transition-all duration-200 group relative ${
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

        {/* Episode Download Button on top-right */}
        <button
          onClick={handleDownloadEpisode}
          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all z-10 ${
            isCompleted
              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
              : isDownloading
              ? 'bg-red-950/80 text-red-400 border border-red-500/50'
              : 'bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-white border border-white/20'
          }`}
          title={isCompleted ? `Downloaded (${downloadedItem?.formattedSize})` : isDownloading ? `Downloading ${downloadedItem?.progressPercent}%` : 'Download Episode in 1080p (~550 MB)'}
        >
          {isCompleted ? (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          ) : isDownloading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-400" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Info */}
      <div className="p-2.5 sm:p-3 space-y-1">
        <div className="flex items-center justify-between gap-1">
          <p className="text-xs font-bold text-white truncate">{episode.name}</p>
          <span className="text-[10px] font-mono text-zinc-500 shrink-0">1080p • ~550 MB</span>
        </div>
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
      <div className="absolute inset-x-0 bottom-0 p-1.5 sm:p-2 bg-gradient-to-t from-black/95 via-black/60 to-transparent">
        <p className="text-[11px] sm:text-xs font-bold text-white truncate drop-shadow">{rec.title}</p>
        <div className="flex items-center space-x-1.5 text-[9px] sm:text-[10px] text-zinc-300 font-mono">
          {rec.year && <span>{rec.year}</span>}
          {rec.rating && <span className="text-amber-400 font-bold">★ {rec.rating}</span>}
        </div>
      </div>
    </div>
  );
};

const CastCard: React.FC<{
  member: CastMember;
  index: number;
  onSelect?: () => void;
}> = ({ member, index, onSelect }) => {
  const { ref, isFocused } = useFocusable({
    focusKey: `detail-cast-${index}`,
    groupId: 'detail-cast',
    onEnter: onSelect
  });

  return (
    <div
      ref={ref}
      onClick={onSelect}
      className={`flex-shrink-0 w-16 sm:w-18 md:w-20 group select-none transition-all duration-200 tv-focusable ${
        onSelect ? 'cursor-pointer' : ''
      } ${
        isFocused
          ? 'scale-105 z-20 brightness-110'
          : 'hover:scale-103'
      }`}
      title={member.character ? `${member.name} as ${member.character}` : member.name}
    >
      {/* Portrait Photo Container */}
      <div
        className={`relative aspect-[3/4] w-full rounded-md overflow-hidden bg-zinc-800 border transition-all duration-200 shadow-sm ${
          isFocused
            ? 'border-white ring-2 ring-[#E50914] shadow-lg'
            : 'border-white/10 group-hover:border-white/30'
        }`}
      >
        {member.profile ? (
          <img
            src={member.profile}
            alt={member.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className={`w-full h-full flex flex-col items-center justify-center bg-zinc-800/90 text-zinc-400 p-1 text-center ${
            member.profile ? 'hidden' : 'flex'
          }`}
        >
          <User className="w-5 h-5 sm:w-6 sm:h-6 opacity-40 mb-0.5" />
          <span className="text-[9px] font-bold font-mono uppercase truncate max-w-full">
            {member.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </span>
        </div>

        {/* Subtle Bottom Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Actor & Character Labels */}
      <div className="pt-1 px-0.5 space-y-0.5">
        <p className="text-[11px] font-bold text-white truncate leading-tight group-hover:text-red-400 transition-colors">
          {member.name}
        </p>
        <p className="text-[9px] text-zinc-400 truncate leading-tight font-normal">
          {member.character || 'Self'}
        </p>
      </div>
    </div>
  );
};
