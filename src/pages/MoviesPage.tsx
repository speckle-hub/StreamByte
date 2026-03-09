import React from 'react';
import HomePage from './HomePage';
import type { Manifest } from '../types/stremio';

interface MoviesPageProps {
  installedAddons: { url: string; manifest: Manifest }[];
}

const MoviesPage: React.FC<MoviesPageProps> = ({ installedAddons }) => {
  return <HomePage installedAddons={installedAddons} />;
};

export default MoviesPage;
