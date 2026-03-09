import axios from 'axios';

const PROXY_URL = '/api-proxy';

export class MetaService {
  static async getMeta(addonUrl: string, type: string, id: string): Promise<any> {
    try {
      const baseUrl = addonUrl.replace('/manifest.json', '');
      const url = `${baseUrl}/meta/${type}/${encodeURIComponent(id)}.json`;
      const encodedUrl = encodeURIComponent(url);
      const response = await axios.get(`${PROXY_URL}?url=${encodedUrl}`);
      return response.data.meta;
    } catch (error) {
      console.error(`Failed to fetch meta for ${id} from ${addonUrl}:`, error);
      return null;
    }
  }

  // Helper to find the best addon for a specific ID
  static async findMetaAcrossAddons(addons: { url: string; manifest: any }[], type: string, id: string) {
    // Try addons that claim to support this type/prefix
    const candidateAddons = addons.filter(addon => 
      addon.manifest.types.includes(type) &&
      (!addon.manifest.idPrefixes || addon.manifest.idPrefixes.some((p: string) => id.startsWith(p)))
    );

    for (const addon of candidateAddons) {
      const meta = await this.getMeta(addon.url, type, id);
      if (meta) return { meta, addonUrl: addon.url };
    }
    return null;
  }
}
