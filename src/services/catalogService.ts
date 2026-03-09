import axios from 'axios';
import type { MetaPreview, Manifest } from '../types/stremio';

const PROXY_URL = '/api-proxy';

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class CatalogService {
  private static async fetchWithRetry(url: string, retries = 2): Promise<any> {
    for (let i = 0; i <= retries; i++) {
      try {
        const encodedUrl = encodeURIComponent(url);
        const response = await axios.get(`${PROXY_URL}?url=${encodedUrl}`, {
          timeout: 10000 // 10s timeout
        });
        return response.data;
      } catch (error) {
        if (i === retries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      }
    }
  }

  static async fetchCatalog(
    addonUrl: string, 
    type: string, 
    id: string, 
    extra: Record<string, string> = {}
  ): Promise<MetaPreview[]> {
    try {
      const baseUrl = addonUrl.replace('/manifest.json', '');
      let url = `${baseUrl}/catalog/${type}/${id}`;
      
      const extraParams = Object.entries(extra)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&');
        
      if (extraParams) {
        url += `/${extraParams}`;
      }
      
      url += '.json';
      
      const cacheKey = `catalog_${url}`;
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data.metas || [];
      }
      
      const data = await this.fetchWithRetry(url);
      
      cache.set(cacheKey, { data, timestamp: Date.now() });
      return data.metas || [];
    } catch (error) {
      console.error(`Failed to fetch catalog ${id} from ${addonUrl}:`, error);
      return [];
    }
  }

  static async search(addons: { url: string; manifest: Manifest }[], query: string): Promise<MetaPreview[]> {
    const searchPromises = addons.flatMap(addon => {
      const searchCatalogs = addon.manifest.catalogs.filter(c => 
        c.extra?.some(e => e.name === 'search')
      );
      
      return searchCatalogs.map(catalog => 
        this.fetchCatalog(addon.url, catalog.type, catalog.id, { search: query })
      );
    });

    const results = await Promise.all(searchPromises);
    // Deduplicate by ID
    const flattened = results.flat();
    const seen = new Set();
    return flattened.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }
}
