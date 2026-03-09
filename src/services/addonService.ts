import axios from 'axios';
import type { Manifest } from '../types/stremio';

const PROXY_URL = '/api-proxy';

export const GENERAL_ADDONS = [
  "https://mediafusion.elfhosted.com/manifest.json",
  "https://webstreamr.hayd.uk/manifest.json",
  "https://autostreamtest.onrender.com/manifest.json",
  "https://streamvix.hayd.uk/%7B%22tmdbApiKey%22:%22%22,%22mediaFlowProxyUrl%22:%22%22,%22mediaFlowProxyPassword%22:%22%22,%22animeunityEnabled%22:%22on%22,%22animesaturnEnabled%22:%22on%22,%22animeworldEnabled%22:%22on%22%7D/manifest.json",
  "https://addon-osvh.onrender.com/manifest.json",
  "https://tstrm.org/manifest.json",
  "https://stremify.elfhosted.com/manifest.json",
  "https://nodebrid.fly.dev/manifest.json"
];

export const ANIME_ADDONS = [
  "https://animestream-addon.keypop3750.workers.dev/manifest.json",
  "https://streamvix.hayd.uk/%7B%22tmdbApiKey%22:%22%22,%22mediaFlowProxyUrl%22:%22%22,%22mediaFlowProxyPassword%22:%22%22,%22animeunityEnabled%22:%22on%22,%22animesaturnEnabled%22:%22on%22,%22animeworldEnabled%22:%22on%22%7D/manifest.json"
];

export const ADULT_ADDONS = [
  "https://dirty-pink.ers.pw/manifest.json",
  "https://07b88951aaab-jaxxx-v2.baby-beamup.club/manifest.json",
  "https://xclub-stremio.vercel.app/manifest.json"
];

export const HENTAI_ADDONS = [
  "https://streamio-hianime.onrender.com/manifest.json",
  "https://hentaistream-addon.keypop3750.workers.dev/manifest.json",
  "https://hanime-stremio.fly.dev/manifest.json"
];

export const DEFAULT_ADDONS = [
  ...GENERAL_ADDONS,
  ...ANIME_ADDONS,
  ...ADULT_ADDONS,
  ...HENTAI_ADDONS
];

export class AddonService {
  static async fetchManifest(url: string): Promise<Manifest> {
    try {
      // Use proxy to avoid CORS
      const encodedUrl = encodeURIComponent(url);
      const response = await axios.get(`${PROXY_URL}?url=${encodedUrl}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch manifest for ${url}:`, error);
      throw error;
    }
  }

  static async loadAllManifests(urls: string[] = DEFAULT_ADDONS) {
    const results = await Promise.allSettled(
      urls.map(async (url) => {
        const manifest = await this.fetchManifest(url);
        return { url, manifest };
      })
    );

    return results
      .filter((r): r is PromiseFulfilledResult<{ url: string; manifest: Manifest }> => r.status === 'fulfilled')
      .map(r => r.value);
  }
}
