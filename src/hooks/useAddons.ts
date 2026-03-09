import { useState, useEffect, useCallback } from 'react';
import { AddonService, DEFAULT_ADDONS } from '../services/addonService';
import type { Manifest } from '../types/stremio';

export interface AddonInstanceState {
  url: string;
  manifest: Manifest | null;
  isLoading: boolean;
  error: string | null;
}

export function useAddons() {
  const [addons, setAddons] = useState<AddonInstanceState[]>(
    DEFAULT_ADDONS.map(url => ({ url, manifest: null, isLoading: true, error: null }))
  );

  const loadAddons = useCallback(async () => {
    const urls = DEFAULT_ADDONS;
    
    // Load each manifest individually for better error tracking
    urls.forEach(async (url, index) => {
      try {
        const manifest = await AddonService.fetchManifest(url);
        setAddons(prev => {
          const next = [...prev];
          next[index] = { url, manifest, isLoading: false, error: null };
          return next;
        });
      } catch (err: any) {
        setAddons(prev => {
          const next = [...prev];
          next[index] = { url, manifest: null, isLoading: false, error: err.message };
          return next;
        });
      }
    });
  }, []);

  useEffect(() => {
    loadAddons();
  }, [loadAddons]);

  const installedAddons = addons.filter(a => a.manifest !== null);

  return { addons, installedAddons, isLoading: addons.some(a => a.isLoading), loadAddons };
}
