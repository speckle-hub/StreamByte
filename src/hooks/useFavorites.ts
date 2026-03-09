import { useState, useEffect } from 'react';
import type { MetaPreview } from '../types/stremio';

export function useFavorites() {
  const [favorites, setFavorites] = useState<MetaPreview[]>(() => {
    const saved = localStorage.getItem('streambyte_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('streambyte_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (item: MetaPreview) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.id === item.id);
      if (exists) {
        return prev.filter(f => f.id !== item.id);
      } else {
        return [item, ...prev];
      }
    });
  };

  const isFavorite = (id: string) => {
    return favorites.some(f => f.id === id);
  };

  return { favorites, toggleFavorite, isFavorite };
}
