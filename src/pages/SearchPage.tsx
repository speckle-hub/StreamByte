import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CatalogService } from '../services/catalogService';
import MediaCard from '../components/media/MediaCard';
import type { MetaPreview, Manifest } from '../types/stremio';
import { Search, Filter, Loader2 } from 'lucide-react';

interface SearchPageProps {
  installedAddons: { url: string; manifest: Manifest }[];
}

const SearchPage: React.FC<SearchPageProps> = ({ installedAddons }) => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<MetaPreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'movie' | 'series' | 'anime'>('all');

  useEffect(() => {
    const handleSearch = async () => {
      if (!query.trim()) return;
      setIsLoading(true);
      const searchResults = await CatalogService.search(installedAddons, query);
      setResults(searchResults);
      setIsLoading(false);
    };

    handleSearch();
  }, [query, installedAddons]);

  const filteredResults = results.filter(item => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'movie') return item.type === 'movie';
    if (activeCategory === 'series') return item.type === 'series' && !item.id.includes('anime'); // Basic filter
    if (activeCategory === 'anime') return item.type === 'series' && (item.id.includes('anime') || item.genre?.includes('Anime'));
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-[#0f0f10] text-white p-8 md:p-16 no-scrollbar pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase flex items-center gap-4">
            <Search size={48} className="text-purple-500" /> Search Results
          </h1>
          <p className="text-gray-400 mt-2 uppercase tracking-widest text-xs font-black">
            Showing results for: <span className="text-purple-400">"{query}"</span>
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
          {['all', 'movie', 'series', 'anime'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat as any)}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeCategory === cat 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
                : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <Loader2 className="w-16 h-16 text-purple-600 animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-gray-500 animate-pulse">Scouring the multiverse...</p>
        </div>
      ) : filteredResults.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filteredResults.map(meta => (
            <MediaCard key={meta.id} meta={meta} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-32 h-32 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-8 border border-white/5">
             <Filter size={64} className="text-gray-700" />
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-gray-600 mb-2">No Clusters Found</h2>
          <p className="text-gray-500 text-xs uppercase tracking-widest font-black max-w-xs leading-loose">
            We couldn't find any matches across your installed clusters. Try refining your search or adding more addons.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
