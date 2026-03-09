import { useState, useEffect, useCallback } from 'react';
import { CatalogService } from '../services/catalogService';
import type { MetaPreview, Manifest } from '../types/stremio';
import { GENERAL_ADDONS, ANIME_ADDONS, ADULT_ADDONS, HENTAI_ADDONS } from '../services/addonService';

export type CatalogSection = 'home' | 'movies' | 'tv' | 'anime' | 'adult' | 'hentai';

export function useCatalog(
  installedAddons: { url: string; manifest: Manifest }[], 
  section: CatalogSection = 'home'
) {
  const [items, setItems] = useState<Record<string, MetaPreview[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchHomeContent = useCallback(async () => {
    if (installedAddons.length === 0) return;
    setIsLoading(true);

    const results: Record<string, MetaPreview[]> = {};
    
    // 1. Determine which addons to use based on section
    let filteredAddons = installedAddons;
    
    const normalizeUrl = (url: string) => url.replace(/\/$/, '').toLowerCase();
    
    if (section === 'home' || section === 'movies' || section === 'tv') {
      const generalUrls = GENERAL_ADDONS.map(normalizeUrl);
      filteredAddons = installedAddons.filter(a => generalUrls.includes(normalizeUrl(a.url)));
    } else if (section === 'anime') {
      const animeUrls = ANIME_ADDONS.map(normalizeUrl);
      filteredAddons = installedAddons.filter(a => animeUrls.includes(normalizeUrl(a.url)));
    } else if (section === 'adult') {
      const adultUrls = ADULT_ADDONS.map(normalizeUrl);
      filteredAddons = installedAddons.filter(a => adultUrls.includes(normalizeUrl(a.url)));
    } else if (section === 'hentai') {
      const hentaiUrls = HENTAI_ADDONS.map(normalizeUrl);
      filteredAddons = installedAddons.filter(a => hentaiUrls.includes(normalizeUrl(a.url)));
    }

    // 2. Determine meta type based on section
    const metaType = section === 'movies' ? 'movie' : (section === 'tv' || section === 'anime' ? 'series' : undefined);

    for (const addon of filteredAddons) {
      // 3. Strict catalog filtering
      const catalogs = addon.manifest.catalogs.filter(c => {
        // For anime section, allow 'series', 'anime', or 'movie' catalogs if they are in the anime addon list
        if (section === 'anime') {
          return c.type === 'series' || c.type === 'anime' || c.type === 'movie';
        }
        
        // If we have a specific metaType (movies/tv), only show that type
        if (metaType && c.type !== metaType) return false;
        
        // Ensure home doesn't accidentally show adult content if an addon has both (unlikely but safe)
        if (section === 'home' && (c.type === 'adult' || c.id.includes('porn') || c.id.includes('xxx'))) return false;
        
        return true;
      }).slice(0, 3);

      for (const catalog of catalogs) {
        const key = `${catalog.name} (${addon.manifest.name})`;
        try {
          const metas = await CatalogService.fetchCatalog(addon.url, catalog.type, catalog.id);
          if (metas.length > 0) {
            // Further filter metas for strict type matches in Movies/TV/Anime
            const filteredMetas = metaType 
              ? metas.filter(m => m.type === metaType)
              : metas;

            if (filteredMetas.length > 0) {
              results[key] = filteredMetas;
            }
          }
        } catch (e) {
          console.error(`Failed to fetch catalog ${catalog.id} from ${addon.manifest.name}`);
        }
      }
    }

    setItems(results);
    setIsLoading(false);
  }, [installedAddons, section]);

  useEffect(() => {
    fetchHomeContent();
  }, [fetchHomeContent, section]);

  return { items, isLoading, refresh: fetchHomeContent };
}
