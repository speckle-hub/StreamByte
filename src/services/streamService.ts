import axios from 'axios';
import type { Stream, Manifest } from '../types/stremio';

const PROXY_URL = '/api-proxy';

export class StreamService {
  static async getStreams(
    addons: { url: string; manifest: Manifest }[], 
    type: string, 
    id: string
  ): Promise<Stream[]> {
    // Some IDs are formatted as "tt1234567:1:1" for TV shows
    const streamPromises = addons
      .filter(addon => addon.manifest.resources.some(r => 
        (typeof r === 'string' ? r === 'stream' : r.name === 'stream') &&
        addon.manifest.types.includes(type)
      ))
      .map(async (addon) => {
        try {
          const baseUrl = addon.url.replace('/manifest.json', '');
          const url = `${baseUrl}/stream/${type}/${encodeURIComponent(id)}.json`;
          const encodedUrl = encodeURIComponent(url);
          const response = await axios.get(`${PROXY_URL}?url=${encodedUrl}`);
          return response.data.streams || [];
        } catch (error) {
          console.error(`Failed to fetch streams from ${addon.url}:`, error);
          return [];
        }
      });

    const results = await Promise.all(streamPromises);
    return results.flat();
  }
}
