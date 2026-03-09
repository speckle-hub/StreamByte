import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import AgeVerificationModal from './components/modals/AgeVerificationModal';
import { SettingsProvider } from './context/SettingsContext';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const MoviesPage = lazy(() => import('./pages/MoviesPage'));
const AnimePage = lazy(() => import('./pages/AnimePage'));
const AdultPage = lazy(() => import('./pages/AdultPage'));
const HentaiPage = lazy(() => import('./pages/HentaiPage'));
const DetailPage = lazy(() => import('./pages/DetailPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const VideoPlayerPage = lazy(() => import('./pages/VideoPlayerPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
import { useAddons } from './hooks/useAddons';
import { useSettings } from './hooks/useSettings';
import { AnimatePresence, motion } from 'framer-motion';
import './index.css';

const AppContent: React.FC = () => {
  const { installedAddons, isLoading: addonsLoading } = useAddons();
  const { settings } = useSettings();
  const [showAgeGate, setShowAgeGate] = useState(false);
  const location = useLocation();

  // Handle age verification gate
  useEffect(() => {
    const restrictedPaths = ['/adult', '/hentai'];
    if (restrictedPaths.includes(location.pathname)) {
      if (!settings.isVerified18) {
        setShowAgeGate(true);
      }
    } else {
      setShowAgeGate(false);
    }
  }, [location.pathname, settings.isVerified18]);

  // Hide sidebar/header in player
  const isPlayer = location.pathname.startsWith('/player');

  if (addonsLoading && installedAddons.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f0f10] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-mono uppercase tracking-widest text-xs animate-pulse">Initializing StreamByte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0f0f10] text-[#f4f4f5] font-sans selection:bg-purple-500/30">
      {!isPlayer && <Sidebar />}
      
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {!isPlayer && <Header />}
        
        <AnimatePresence mode="wait">
          <Suspense fallback={<RouteLoader />}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<MotionPage><HomePage installedAddons={installedAddons as any} /></MotionPage>} />
              <Route path="/movies" element={<MotionPage><MoviesPage installedAddons={installedAddons as any} /></MotionPage>} />
              <Route path="/tv" element={<MotionPage><HomePage installedAddons={installedAddons as any} /></MotionPage>} />
              <Route path="/anime" element={<MotionPage><AnimePage installedAddons={installedAddons as any} /></MotionPage>} />
              <Route path="/adult" element={<MotionPage><AdultPage installedAddons={installedAddons as any} /></MotionPage>} />
              <Route path="/hentai" element={<MotionPage><HentaiPage installedAddons={installedAddons as any} /></MotionPage>} />
              <Route path="/search" element={<MotionPage><SearchPage installedAddons={installedAddons as any} /></MotionPage>} />
              <Route path="/detail/:type/:id" element={<MotionPage><DetailPage installedAddons={installedAddons as any} /></MotionPage>} />
              <Route path="/player/:type/:id/:url/:title" element={<MotionPage><VideoPlayerPage installedAddons={installedAddons as any} /></MotionPage>} />
              <Route path="/settings" element={<MotionPage><SettingsPage /></MotionPage>} />
              <Route path="*" element={<MotionPage><HomePage installedAddons={installedAddons as any} /></MotionPage>} />
            </Routes>
          </Suspense>
        </AnimatePresence>

        {showAgeGate && (
          <AgeVerificationModal onConfirm={() => setShowAgeGate(false)} />
        )}
      </main>
    </div>
  );
};

const RouteLoader = () => (
  <div className="flex-1 flex items-center justify-center bg-[#0f0f10]">
    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const MotionPage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.02 }}
    transition={{ duration: 0.25, ease: "easeOut" }}
    className="flex-1 flex flex-col overflow-hidden h-full"
  >
    {children}
  </motion.div>
);

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <Router>
        <AppContent />
      </Router>
    </SettingsProvider>
  );
};

export default App;
