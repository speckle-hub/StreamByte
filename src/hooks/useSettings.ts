import { useState, useEffect } from 'react';
import type { Settings } from '../types/stremio';

const DEFAULT_SETTINGS: Settings = {
  realDebridKey: '',
  allDebridKey: '',
  premiumizeKey: '',
  isVerified18: false,
  isAdultContentEnabled: false,
  theme: 'dark',
  autoplay: true,
  defaultQuality: '1080p',
  defaultSubtitles: 'English',
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('streambyte_settings');
    if (!saved) return DEFAULT_SETTINGS;
    try {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem('streambyte_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const clearCache = () => {
    // For now, just clear specific keys or items if we added more
    // localStorage.removeItem(...)
  };

  return { settings, updateSettings, clearCache };
}
