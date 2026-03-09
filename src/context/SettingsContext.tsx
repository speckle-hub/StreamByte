import React, { createContext, useContext, useState, useEffect } from 'react';
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

interface SettingsContextType {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  clearCache: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    // Implement if needed
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, clearCache }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
};
