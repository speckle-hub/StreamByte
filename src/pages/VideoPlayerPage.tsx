import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Hls from 'hls.js';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  RotateCcw, RotateCw, ChevronLeft, Settings, Subtitles
} from 'lucide-react';
import { useHistory } from '../hooks/useHistory';
import { MetaService } from '../services/metaService';
import type { Manifest as AddonManifest } from '../types/stremio';

interface VideoPlayerPageProps {
  installedAddons: { url: string; manifest: AddonManifest }[];
}

const VideoPlayerPage: React.FC<VideoPlayerPageProps> = ({ installedAddons }) => {
  const { type, id, url, title } = useParams<{ type: string; id: string; url: string; title: string }>();
  const navigate = useNavigate();
  const { addToHistory } = useHistory();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [meta, setMeta] = useState<any>(null);
  const [subtitles, setSubtitles] = useState<any[]>([]);
  const [selectedSubtitle, setSelectedSubtitle] = useState<string | null>(null);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);

  const streamUrl = url ? atob(url) : '';
  const decodedTitle = title ? decodeURIComponent(title) : 'Stream';

  // Fetch meta for history
  useEffect(() => {
    if (type && id) {
      MetaService.findMetaAcrossAddons(installedAddons, type, id).then(result => {
        if (result) {
          setMeta(result.meta);
          if (result.meta.subtitles) {
            setSubtitles(result.meta.subtitles);
          }
        }
      });
    }
  }, [type, id, installedAddons]);

  useEffect(() => {
    let hls: Hls | null = null;
    const video = videoRef.current;

    if (!video || !streamUrl) return;

    if (Hls.isSupported()) {
      hls = new Hls({
        capLevelToPlayerSize: true,
        autoStartLoad: true,
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => setIsPlaying(false));
        setIsPlaying(true);
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play();
        setIsPlaying(true);
      });
    }

    const handleTimeUpdate = () => {
      setProgress((video.currentTime / video.duration) * 100);
      setDuration(video.duration);
      
      // Save to history every 10 seconds or so (throttled implicitly by state)
      if (meta && video.currentTime > 0) {
        let season, episode;
        if (id?.includes(':')) {
          const parts = id.split(':');
          season = parseInt(parts[1]);
          episode = parseInt(parts[2]);
        }

        addToHistory({
          id: id!.split(':')[0], // Save base ID for deduplication in history if preferred, or keep full ID
          type: type!,
          name: meta.name || decodedTitle,
          poster: meta.poster,
          background: meta.background,
          progress: video.currentTime,
          duration: video.duration,
          lastPlayed: Date.now(),
          season,
          episode
        });
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', () => setIsPlaying(true));
    video.addEventListener('pause', () => setIsPlaying(false));

    return () => {
      if (hls) hls.destroy();
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [streamUrl, meta, id, type]);

  const togglePlay = () => {
    if (videoRef.current?.paused) {
      videoRef.current.play();
    } else {
      videoRef.current?.pause();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = (parseFloat(e.target.value) / 100) * (videoRef.current?.duration || 0);
    if (videoRef.current) videoRef.current.currentTime = time;
  };

  const skip = (seconds: number) => {
    if (videoRef.current) videoRef.current.currentTime += seconds;
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let timeout: any;
    const resetTimeout = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };

    window.addEventListener('mousemove', resetTimeout);
    window.addEventListener('click', resetTimeout);
    return () => {
      window.removeEventListener('mousemove', resetTimeout);
      window.removeEventListener('click', resetTimeout);
    };
  }, [isPlaying]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black z-[200] flex items-center justify-center cursor-none group-active:cursor-auto"
      onMouseMove={() => setShowControls(true)}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        onClick={togglePlay}
        crossOrigin="anonymous"
        playsInline
      >
        {selectedSubtitle && (
          <track 
            src={selectedSubtitle} 
            kind="subtitles" 
            srcLang="en" 
            label="Selected" 
            default 
          />
        )}
      </video>

      <div className={`absolute inset-0 transition-opacity duration-500 flex flex-col justify-between p-6 md:p-10 bg-gradient-to-t from-black/80 via-transparent to-black/60 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all border border-white/5">
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-xl font-bold italic underline decoration-purple-500/50 decoration-4 tracking-tight">{decodedTitle}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowSubtitleMenu(!showSubtitleMenu)}
                className={`p-3 hover:bg-white/10 rounded-full transition-all ${showSubtitleMenu ? 'bg-purple-600/20 text-purple-500' : ''}`}
              >
                <Subtitles size={24} />
              </button>
              
              {showSubtitleMenu && (
                <div className="absolute bottom-full right-0 mb-4 w-64 bg-black/90 backdrop-blur-3xl rounded-3xl border border-white/10 p-4 shadow-2xl z-[300]">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4 px-2">Subtitles</h3>
                  <div className="space-y-1 max-h-64 overflow-y-auto no-scrollbar">
                    <button 
                      onClick={() => { setSelectedSubtitle(null); setShowSubtitleMenu(false); }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${!selectedSubtitle ? 'bg-purple-600 text-white' : 'hover:bg-white/5 text-gray-400'}`}
                    >
                      Off
                    </button>
                    {subtitles.map((sub, idx) => (
                      <button 
                        key={idx}
                        onClick={() => { setSelectedSubtitle(sub.url); setShowSubtitleMenu(false); }}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${selectedSubtitle === sub.url ? 'bg-purple-600 text-white' : 'hover:bg-white/5 text-gray-400'}`}
                      >
                        {sub.lang || sub.label || `Track ${idx + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button className="p-3 hover:bg-white/10 rounded-full transition-all"><Settings size={24} /></button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-12 md:gap-24">
          <button onClick={() => skip(-10)} className="p-4 hover:bg-white/10 rounded-full transition-all active:scale-90">
            <RotateCcw size={40} />
          </button>
          <button onClick={togglePlay} className="w-24 h-24 bg-white/10 backdrop-blur-3xl hover:bg-white/20 rounded-full flex items-center justify-center transition-all active:scale-90 border border-white/10">
            {isPlaying ? <Pause size={48} fill="white" /> : <Play size={48} fill="white" className="ml-2" />}
          </button>
          <button onClick={() => skip(10)} className="p-4 hover:bg-white/10 rounded-full transition-all active:scale-90">
            <RotateCw size={40} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-gray-400">{formatTime(videoRef.current?.currentTime || 0)}</span>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={progress || 0}
              onChange={handleSeek}
              className="flex-1 accent-purple-600 h-1 bg-white/20 rounded-full cursor-pointer hover:h-2 transition-all"
            />
            <span className="text-xs font-mono text-gray-400">{formatTime(duration || 0)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 group/volume">
                <button onClick={() => setIsMuted(!isMuted)}>
                  {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-0 group-hover/volume:w-24 transition-all accent-white"
                />
              </div>
            </div>
            <button onClick={toggleFullScreen} className="p-3 hover:bg-white/10 rounded-full transition-all">
              {isFullScreen ? <Minimize size={24} /> : <Maximize size={24} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerPage;
