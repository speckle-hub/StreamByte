import React from 'react';
import HomePage from './HomePage';
import type { Manifest } from '../types/stremio';

interface HentaiPageProps {
  installedAddons: { url: string; manifest: Manifest }[];
}

const HentaiPage: React.FC<HentaiPageProps> = ({ installedAddons }) => {
  return <HomePage installedAddons={installedAddons} />;
};

export default HentaiPage;
