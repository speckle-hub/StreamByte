import { useState, useEffect, useCallback } from 'react';
import { CatalogService } from '../services/catalogService';
import type { MetaPreview, Manifest } from '../types/stremio';

export function useCatalog(installedAddons: { url: string; manifest: Manifest }[], type?: string) {
  const [items, setItems] = useState<Record<string, MetaPreview[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchHomeContent = useCallback(async () => {
    if (installedAddons.length === 0) return;
    setIsLoading(true);

    const results: Record<string, MetaPreview[]> = {};
    
    // For "Home", we fetch a mix. For others, we filter by type.
    const filteredAddons = type 
      ? installedAddons.filter(addon => addon.manifest.types.includes(type))
      : installedAddons.slice(0, 8);

    for (const addon of filteredAddons) {
      const catalogs = addon.manifest.catalogs.filter(c => !type || c.type === type).slice(0, 3);
      for (const catalog of catalogs) {
        const key = `${catalog.name} (${addon.manifest.name})`;
        try {
          const metas = await CatalogService.fetchCatalog(addon.url, catalog.type, catalog.id);
          if (metas.length > 0) {
            results[key] = metas;
          }
        } catch (e) {
          console.error(`Failed to fetch catalog ${catalog.id} from ${addon.manifest.name}`);
        }
      }
    }

    setItems(results);
    setIsLoading(false);
  }, [installedAddons, type]);

  useEffect(() => {
    fetchHomeContent();
  }, [fetchHomeContent, type]);

  return { items, isLoading, refresh: fetchHomeContent };
}
