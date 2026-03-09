export interface Manifest {
  id: string;
  name: string;
  version: string;
  description: string;
  types: string[];
  catalogs: Catalog[];
  resources: (string | Resource)[];
  background?: string;
  logo?: string;
  idPrefixes?: string[];
}

export interface Catalog {
  type: string;
  id: string;
  name: string;
  extra?: { name: string; isRequired?: boolean; options?: string[] }[];
}

export interface Resource {
  name: string;
  types: string[];
  idPrefixes?: string[];
}

export interface MetaPreview {
  id: string;
  type: string;
  name: string;
  poster?: string;
  background?: string;
  logo?: string;
  description?: string;
  releaseInfo?: string;
  imdbRating?: string;
  year?: string;
  released?: string;
  runtime?: string;
  genre?: string[];
  director?: string[];
  cast?: string[];
}

export interface Stream {
  name: string;
  title: string;
  url?: string;
  infoHash?: string;
  fileIdx?: number;
  behaviorHints?: any;
  subtitles?: Subtitle[];
}

export interface Subtitle {
  id: string;
  url: string;
  lang: string;
}

export interface Settings {
  realDebridKey: string;
  premiumizeKey: string;
  allDebridKey: string;
  isVerified18: boolean;
  isAdultContentEnabled: boolean;
  theme: 'dark' | 'light';
  autoplay: boolean;
  defaultQuality: string;
  defaultSubtitles: string;
}

export interface AddonStatus {
  url: string;
  manifest?: Manifest;
  error?: string;
  isLoading: boolean;
}

export interface HistoryItem {
  id: string;
  type: string;
  name: string;
  poster?: string;
  background?: string;
  progress: number;
  duration: number;
  lastPlayed: number;
  season?: number;
  episode?: number;
}
