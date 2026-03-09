import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCatalog } from '../hooks/useCatalog';
import { useHistory } from '../hooks/useHistory';
import { useFavorites } from '../hooks/useFavorites';
import MediaCard from '../components/media/MediaCard';
import type { Manifest, MetaPreview } from '../types/stremio';
import { Play, Info, Clock, Heart } from 'lucide-react';
import Skeleton from '../components/ui/Skeleton';

interface HomePageProps {
  installedAddons: { url: string; manifest: Manifest }[];
}

const HomePage: React.FC<HomePageProps> = ({ installedAddons }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { history } = useHistory();
  const { favorites } = useFavorites();
  
  const getSection = (): 'home' | 'movies' | 'tv' | 'anime' | 'adult' | 'hentai' => {
    if (location.pathname === '/movies') return 'movies';
    if (location.pathname === '/tv') return 'tv';
    if (location.pathname === '/anime') return 'anime';
    if (location.pathname === '/adult') return 'adult';
    if (location.pathname === '/hentai') return 'hentai';
    return 'home';
  };

  const section = getSection();
  const { items, isLoading } = useCatalog(installedAddons, section);

  const allMetas = Object.values(items).flat() as MetaPreview[];
  const heroMeta = allMetas[0];

  const handlePlayHero = () => {
    if (heroMeta) {
      navigate(`/detail/${heroMeta.type}/${heroMeta.id}`);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0f0f10] text-white pb-32 no-scrollbar">
      {heroMeta && location.pathname === '/' && (
        <div className="relative h-[70vh] w-full overflow-hidden mb-12">
          <img 
            src={heroMeta.background || heroMeta.poster} 
            className="w-full h-full object-cover opacity-60" 
            alt="Hero"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f10] via-transparent to-black/40" />
          <div className="absolute bottom-0 left-0 p-8 md:p-16 max-w-3xl">
            <h1 className="text-4xl md:text-7xl font-black mb-4 tracking-tighter italic uppercase text-white drop-shadow-2xl">
              {heroMeta.name}
            </h1>
            <p className="text-gray-300 text-lg mb-8 line-clamp-3 leading-relaxed max-w-2xl">
              {heroMeta.description || 'Experience high-quality streaming from your favorite Stremio addons in one sleek interface.'}
            </p>
            <div className="flex items-center gap-4">
              <button 
                onClick={handlePlayHero}
                className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-full font-bold flex items-center gap-2 transition-all active:scale-95 shadow-xl shadow-purple-600/20"
              >
                <Play fill="white" size={20} /> Play Now
              </button>
              <button 
                onClick={() => navigate(`/detail/${heroMeta.type}/${heroMeta.id}`)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-10 py-4 rounded-full font-bold flex items-center gap-2 transition-all border border-white/5"
              >
                <Info size={20} /> More Info
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`px-8 md:px-16 space-y-16 ${location.pathname !== '/' ? 'pt-24' : ''}`}>
        
        {/* Continue Watching (Only on Home) */}
        {location.pathname === '/' && history.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 tracking-wide uppercase text-purple-400">
              <Clock size={20} /> Continue Watching
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar">
              {history.map(item => (
                <div key={item.id} className="relative group flex-none cursor-pointer" 
                  onClick={() => navigate(`/detail/${item.type}/${item.id}`)}
                >
                  <div className="w-64 h-36 rounded-2xl overflow-hidden border border-white/10 group-hover:border-purple-500/50 transition-all shadow-lg group-hover:shadow-purple-500/20">
                    <img src={item.background || item.poster} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" alt={item.name} />
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                      <div 
                        className="h-full bg-purple-600" 
                        style={{ width: `${(item.progress / item.duration) * 100}%` }} 
                      />
                    </div>
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-gray-300 group-hover:text-white transition-all">{item.name}</h3>
                  {item.episode && <p className="text-[10px] text-gray-500 uppercase tracking-widest">S{item.season} E{item.episode}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Watchlist (Only on Home) */}
        {location.pathname === '/' && favorites.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 tracking-wide uppercase text-pink-400">
              <Heart size={20} /> Your Watchlist
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar">
              {favorites.map(meta => <MediaCard key={meta.id} meta={meta} />)}
            </div>
          </section>
        )}

        {/* Catalog Items */}
        {isLoading && Object.keys(items).length === 0 ? (
          <div className="space-y-12">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-6">
                <Skeleton className="h-8 w-48 rounded-lg" />
                <div className="flex gap-4 overflow-x-hidden">
                  {[1, 2, 3, 4, 5, 6].map(j => (
                    <Skeleton key={j} className="flex-none w-48 aspect-[2/3] rounded-[2rem]" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          Object.entries(items).map(([title, metas]) => (
            <section key={title}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 tracking-wide uppercase text-gray-400">
                <span className="w-2 h-2 bg-purple-500 rounded-full" /> {title}
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar">
                {(metas as MetaPreview[]).map(meta => <MediaCard key={meta.id} meta={meta} />)}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
};

export default HomePage;
