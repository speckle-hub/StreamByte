import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MetaService } from '../services/metaService';
import { StreamService } from '../services/streamService';
import { useFavorites } from '../hooks/useFavorites';
import type { Manifest, Stream } from '../types/stremio';
import { Play, Calendar, Star, Clock, ChevronLeft, List, Plus, Check, MonitorPlay } from 'lucide-react';

interface DetailPageProps {
  installedAddons: { url: string; manifest: Manifest }[];
}

const DetailPage: React.FC<DetailPageProps> = ({ installedAddons }) => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [meta, setMeta] = useState<any>(null);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingStreams, setFetchingStreams] = useState(false);
  
  // TV Show State
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<any>(null);

  const favorited = meta ? isFavorite(meta.id) : false;

  useEffect(() => {
    const fetchData = async () => {
      if (!type || !id) return;
      setLoading(true);
      const result = await MetaService.findMetaAcrossAddons(installedAddons, type, id);
      if (result) {
        setMeta(result.meta);
        if (type === 'movie') {
          fetchStreams(type, id);
        } else if (type === 'series' && result.meta.videos && result.meta.videos.length > 0) {
          // Default to first available episode
          const firstEp = result.meta.videos[0];
          setSelectedSeason(firstEp.season);
          setSelectedEpisode(firstEp);
          fetchStreams(type, `${id}:${firstEp.season}:${firstEp.episode || firstEp.number}`);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [type, id, installedAddons]);

  const fetchStreams = async (streamType: string, streamId: string) => {
    setFetchingStreams(true);
    setStreams([]);
    const results = await StreamService.getStreams(installedAddons, streamType, streamId);
    setStreams(results);
    setFetchingStreams(false);
  };

  const handleEpisodeSelect = (ep: any) => {
    setSelectedEpisode(ep);
    fetchStreams(type!, `${id}:${ep.season}:${ep.episode || ep.number}`);
  };

  const handlePlay = (stream: Stream) => {
    const streamUrl = btoa(stream.url || '');
    const playTitle = type === 'series' 
      ? `${meta.name} - S${selectedEpisode.season}E${selectedEpisode.episode || selectedEpisode.number}`
      : meta.name;
    const playId = type === 'series' 
      ? `${id}:${selectedEpisode.season}:${selectedEpisode.episode || selectedEpisode.number}`
      : id;
      
    navigate(`/player/${type}/${playId}/${streamUrl}/${encodeURIComponent(playTitle)}`);
  };

  const seasons = useMemo(() => {
    if (!meta?.videos) return [];
    const s = new Set<number>();
    meta.videos.forEach((v: any) => s.add(v.season));
    return Array.from(s).sort((a, b) => a - b);
  }, [meta]);

  const episodesInSeason = useMemo(() => {
    if (!meta?.videos) return [];
    return meta.videos
      .filter((v: any) => v.season === selectedSeason)
      .sort((a: any, b: any) => (a.episode || a.number) - (b.episode || b.number));
  }, [meta, selectedSeason]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0f0f10]">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0f0f10] text-white">
        <p className="text-xl mb-4 text-purple-200">Metadata not found</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-purple-600 rounded-full font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#0f0f10] text-white no-scrollbar">
      {/* Backdrop */}
      <div className="relative h-[65vh] w-full">
        <img 
          src={meta.background || meta.poster} 
          className="w-full h-full object-cover opacity-30 scale-105 blur-sm" 
          alt="Backdrop"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f10] via-transparent to-black/60" />
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-8 left-8 p-3 bg-black/40 backdrop-blur-md rounded-full hover:bg-white/10 transition-all border border-white/5 z-50 group"
        >
          <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-8 md:px-16 -mt-64 relative z-10 pb-32">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Poster & Actions */}
          <div className="flex-none w-64 space-y-6">
            <div className="relative group overflow-hidden rounded-[2rem] shadow-2xl border border-white/10">
              <img src={meta.poster} className="w-full transform group-hover:scale-110 transition-transform duration-700" alt={meta.name} />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all" />
            </div>
            
            <button 
              onClick={() => toggleFavorite(meta)}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border transition-all ${
                favorited 
                ? 'bg-pink-500/10 border-pink-500/50 text-pink-500 hover:bg-pink-500/20' 
                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              }`}
            >
              {favorited ? <Check size={20} /> : <Plus size={20} />}
              {favorited ? 'In Watchlist' : 'Add to Watchlist'}
            </button>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-5xl md:text-8xl font-black mb-6 italic tracking-tighter uppercase leading-[0.85] text-white drop-shadow-2xl">
              {meta.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 mb-8">
              <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-xl border border-yellow-500/20 font-bold">
                <Star size={18} fill="currentColor" /> {meta.imdbRating || 'N/A'}
              </div>
              <span className="flex items-center gap-2 font-medium">
                <Calendar size={18} className="text-purple-500" /> {meta.year || meta.released?.split('-')[0]}
              </span>
              {meta.runtime && (
                <span className="flex items-center gap-2 font-medium">
                  <Clock size={18} className="text-purple-500" /> {meta.runtime}
                </span>
              )}
              <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-lg text-[10px] uppercase font-black tracking-widest border border-purple-500/20">
                {meta.type}
              </span>
            </div>

            <p className="text-xl text-gray-300 leading-relaxed mb-12 max-w-4xl font-medium opacity-80">
              {meta.description}
            </p>

            {/* Cast Section */}
            {meta.cast && meta.cast.length > 0 && (
              <section className="mb-12">
                <h2 className="text-xl font-black mb-6 italic uppercase tracking-tighter flex items-center gap-2 opacity-60">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" /> Starring
                </h2>
                <div className="flex flex-wrap gap-2">
                  {meta.cast.map((actor: string) => (
                    <span key={actor} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:border-purple-500/50 transition-all cursor-default">
                      {actor}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* TV Show Specific UI */}
            {type === 'series' && (
              <div className="space-y-12 mb-12">
                {/* Season Picker */}
                <div className="flex flex-wrap gap-3">
                  {seasons.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSeason(s)}
                      className={`px-8 py-3 rounded-2xl font-black transition-all border ${
                        selectedSeason === s 
                        ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/30 grow' 
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      SEASON {s}
                    </button>
                  ))}
                </div>

                {/* Episode List */}
                <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                     <MonitorPlay size={120} />
                  </div>
                  <h2 className="text-2xl font-black mb-8 italic uppercase tracking-tighter flex items-center gap-3">
                    <List size={28} className="text-purple-500" /> Episodes in Season {selectedSeason}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-[400px] overflow-y-auto pr-4 no-scrollbar">
                    {episodesInSeason.map((ep: any) => (
                      <button
                        key={ep.id}
                        onClick={() => handleEpisodeSelect(ep)}
                        className={`p-5 rounded-2xl text-left transition-all border relative overflow-hidden group ${
                          selectedEpisode?.id === ep.id 
                          ? 'bg-purple-600/20 border-purple-500/50 ring-2 ring-purple-600/20' 
                          : 'bg-black/40 border-white/5 hover:border-purple-500/30'
                        }`}
                      >
                        <span className="block text-[10px] font-black uppercase tracking-widest text-purple-500 mb-1">Episode {ep.episode || ep.number}</span>
                        <span className="block font-bold text-gray-100 line-clamp-1 group-hover:text-white transition-all">{ep.title || `Episode ${ep.episode || ep.number}`}</span>
                        {ep.released && <span className="text-[10px] text-gray-500 uppercase mt-2 block">{new Date(ep.released).toLocaleDateString()}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Streams Section */}
            {(type === 'movie' || (type === 'series' && selectedEpisode)) && (
              <section className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex flex-col">
                    <h2 className="text-3xl font-black flex items-center gap-4 italic uppercase tracking-tighter">
                      <List size={32} className="text-purple-500" /> Available Streams
                    </h2>
                    {type === 'series' && selectedEpisode && (
                       <p className="text-xs text-gray-500 uppercase tracking-widest font-black mt-2">
                         Streaming S{selectedEpisode.season} E{selectedEpisode.episode || selectedEpisode.number}: {selectedEpisode.title}
                       </p>
                    )}
                  </div>
                  {fetchingStreams && (
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] text-purple-500 font-black animate-pulse uppercase">Fetching sources</span>
                       <div className="w-6 h-6 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <div className="grid gap-4">
                  {streams.length > 0 ? (
                    streams.map((stream, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePlay(stream)}
                        className="w-full flex items-center justify-between p-6 bg-black/40 hover:bg-purple-600/20 border border-white/5 hover:border-purple-500/40 rounded-[1.5rem] transition-all group scale-100 hover:scale-[1.01]"
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-purple-500/20 transition-all">
                            <Play fill="white" size={24} className="ml-1 text-purple-600" />
                          </div>
                          <div className="flex flex-col items-start text-left">
                            <span className="text-lg font-black text-white group-hover:text-purple-400 transition-all uppercase tracking-tighter italic">
                              {stream.title?.split('\n')[0] || `Stream ${idx + 1}`}
                            </span>
                            <span className="text-xs text-gray-500 uppercase tracking-widest font-black opacity-60">
                              {stream.name || 'Unknown Provider'} • {stream.title?.split('\n')[1] || 'Direct Stream'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                           {stream.title?.toLowerCase().includes('4k') && (
                             <span className="text-[10px] font-black bg-purple-600 px-3 py-1 rounded text-white italic shadow-lg shadow-purple-600/30">4K</span>
                           )}
                           {stream.title?.toLowerCase().includes('1080p') && (
                             <span className="text-[10px] font-black bg-gray-800 px-3 py-1 rounded text-gray-300 border border-white/5">FULL HD</span>
                           )}
                        </div>
                      </button>
                    ))
                  ) : !fetchingStreams && (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-500 bg-black/40 rounded-[2rem] border border-dashed border-white/10">
                      <List size={64} className="mb-6 opacity-10" />
                      <p className="italic font-black uppercase text-xl text-gray-700 tracking-tighter">No clusters found</p>
                      <p className="text-[10px] uppercase tracking-widest mt-3 opacity-40 font-black">Verify addon manifests in global settings</p>
                    </div>
                  )}
                </div>
              </section>
            )}
            {/* Recommended Section (Simple approach: find by same genre if recommendations not present) */}
            <section className="mt-20">
              <h2 className="text-2xl font-black mb-8 italic uppercase tracking-tighter flex items-center gap-3">
                 <div className="w-2 h-2 bg-pink-500 rounded-full" /> More Like This
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar">
                {/* For now, just showing a few placeholder-ish items or the same genre items if we had a way to fetch them. 
                    Since we don't have a dedicated "similar" endpoint easily, we'll wait for the addon's own recommendations if available. */}
                {meta.recommendations ? (
                  meta.recommendations.map((rec: any) => (
                    <div key={rec.id} onClick={() => navigate(`/detail/${rec.type}/${rec.id}`)} className="flex-none w-44 space-y-3 cursor-pointer group">
                      <div className="aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 group-hover:border-purple-500 transition-all shadow-xl">
                        <img src={rec.poster} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={rec.name} />
                      </div>
                      <h4 className="text-xs font-bold text-gray-400 group-hover:text-white transition-all line-clamp-1 truncate">{rec.name}</h4>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-600 uppercase tracking-widest font-black italic ml-2">Loading clusters of similar signals...</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPage;
