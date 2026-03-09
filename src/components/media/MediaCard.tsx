import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { MetaPreview } from '../../types/stremio';
import { Film, Star } from 'lucide-react';

interface MediaCardProps {
  meta: MetaPreview;
}

const MediaCard: React.FC<MediaCardProps> = ({ meta }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/detail/${meta.type}/${meta.id}`)}
      className="flex-none w-40 md:w-56 group cursor-pointer transition-all duration-300"
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden border border-white/10 shadow-xl group-hover:border-purple-500 group-hover:shadow-purple-500/20 group-hover:-translate-y-1 transition-all">
        {meta.poster ? (
          <img 
            src={meta.poster} 
            alt={meta.name} 
            loading="lazy"
            onLoad={(e) => (e.currentTarget.style.opacity = '1')}
            style={{ opacity: 0 }}
            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" 
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <Film className="text-gray-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <p className="text-sm font-semibold line-clamp-2 mb-1">{meta.name}</p>
          <div className="flex items-center justify-between">
            {meta.imdbRating && (
              <span className="text-xs text-yellow-500 flex items-center gap-1">
                <Star size={10} fill="currentColor" /> {meta.imdbRating}
              </span>
            )}
            <span className="text-[10px] uppercase tracking-wider text-gray-400">{meta.type}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaCard;
