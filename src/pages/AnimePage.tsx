import React from 'react';
import HomePage from './HomePage';
import type { Manifest } from '../types/stremio';

interface AnimePageProps {
  installedAddons: { url: string; manifest: Manifest }[];
}

const AnimePage: React.FC<AnimePageProps> = ({ installedAddons }) => {
  return <HomePage installedAddons={installedAddons} />;
};

export default AnimePage;
