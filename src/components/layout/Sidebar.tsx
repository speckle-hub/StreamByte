import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';
import { Film, Tv, MonitorPlay, ShieldAlert, Settings as SettingsIcon, MonitorPlay as LogoIcon, Ghost } from 'lucide-react';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSettings();

  const menuItems = [
    { id: 'home', label: 'Home', icon: <Film size={20} />, path: '/' },
    { id: 'movies', label: 'Movies', icon: <Film size={20} />, path: '/movies' },
    { id: 'tv', label: 'TV Shows', icon: <Tv size={20} />, path: '/tv' },
    { id: 'anime', label: 'Anime', icon: <MonitorPlay size={20} />, path: '/anime' },
    ...(settings.isVerified18 ? [
      { id: 'adult', label: '18+', icon: <ShieldAlert size={20} />, path: '/adult' },
      { id: 'hentai', label: 'Hentai', icon: <Ghost size={20} />, path: '/hentai' }
    ] : [])
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex w-64 bg-black/40 backdrop-blur-3xl border-r border-white/5 flex-col items-center py-10 px-6 gap-10 h-screen sticky top-0">
      <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
          <LogoIcon size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 hidden md:block">
          StreamByte
        </h1>
      </div>

      <div className="flex flex-col gap-2 w-full">
        {menuItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all ${
              location.pathname === item.path ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {item.icon}
            <span className="font-medium hidden md:block">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-auto w-full">
        <button 
          onClick={() => navigate('/settings')}
          className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all ${
            location.pathname === '/settings' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <SettingsIcon size={20} />
          <span className="font-medium hidden md:block">Settings</span>
        </button>
      </div>
    </nav>

    {/* Mobile Bottom Navigation */}
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-3xl border-t border-white/5 flex items-center justify-around px-4 z-[100] safe-area-bottom">
      {menuItems.slice(0, 4).map((item) => (
        <button 
          key={item.id}
          onClick={() => navigate(item.path)}
          className={`flex flex-col items-center gap-1 p-2 transition-all ${
            location.pathname === item.path ? 'text-purple-500' : 'text-gray-500'
          }`}
        >
          {React.cloneElement(item.icon as React.ReactElement<{ size: number }> , { size: 24 })}
          <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
        </button>
      ))}
      <button 
        onClick={() => navigate('/settings')}
        className={`flex flex-col items-center gap-1 p-2 transition-all ${
          location.pathname === '/settings' ? 'text-purple-500' : 'text-gray-500'
        }`}
      >
        <SettingsIcon size={24} />
        <span className="text-[10px] font-black uppercase tracking-widest">Settings</span>
      </button>
    </nav>
  </>
  );
};

export default Sidebar;
