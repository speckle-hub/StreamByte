import React from 'react';
import { useSettings } from '../hooks/useSettings';
import { useHistory } from '../hooks/useHistory';
import { 
  Key, Shield, HardDrive, Trash2, Save, 
  PlayCircle, Trash 
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { settings, updateSettings, clearCache } = useSettings();
  const { clearHistory } = useHistory();

  const handleDebridKeyChange = (key: 'realDebridKey' | 'premiumizeKey' | 'allDebridKey', value: string) => {
    updateSettings({ [key]: value });
  };

  const Toggle = ({ label, value, onChange, description }: { label: string, value: boolean, onChange: (v: boolean) => void, description?: string }) => (
    <div className="flex items-center justify-between p-6 bg-black/40 rounded-2xl border border-white/5">
      <div>
        <h3 className="font-bold text-white">{label}</h3>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <button 
        onClick={() => onChange(!value)}
        className={`w-14 h-8 rounded-full transition-all relative ${value ? 'bg-purple-600' : 'bg-gray-800'}`}
      >
        <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-all ${value ? 'translate-x-6' : ''}`} />
      </button>
    </div>
  );

  const Select = ({ label, value, options, onChange }: { label: string, value: string, options: string[], onChange: (v: string) => void }) => (
    <div className="flex flex-col gap-2">
      <label className="text-xs uppercase tracking-widest font-bold text-gray-500 ml-2">{label}</label>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 focus:border-purple-500 focus:outline-none transition-all appearance-none text-white"
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#0f0f10] text-white p-8 md:p-16 no-scrollbar pb-32">
      <h1 className="text-4xl font-black mb-12 italic tracking-tighter uppercase">Settings</h1>

      <div className="max-w-4xl space-y-12">
        {/* Debrid Section */}
        <section className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-purple-500/20 rounded-2xl">
              <HardDrive className="text-purple-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Debrid Services</h2>
              <p className="text-sm text-gray-400">Add your API keys for high-quality streaming sources.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-gray-500 ml-2">Real-Debrid API Key</label>
              <div className="relative">
                <input 
                  type="password"
                  value={settings.realDebridKey || ''}
                  onChange={(e) => handleDebridKeyChange('realDebridKey', e.target.value)}
                  placeholder="Paste your Real-Debrid token..."
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 focus:border-purple-500 focus:outline-none transition-all placeholder:text-gray-700 font-mono"
                />
                <Key className="absolute right-6 top-4 text-gray-600" size={20} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-gray-500 ml-2">Premiumize API Key</label>
              <div className="relative">
                <input 
                  type="password"
                  value={settings.premiumizeKey || ''}
                  onChange={(e) => handleDebridKeyChange('premiumizeKey', e.target.value)}
                  placeholder="Paste your Premiumize token..."
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 focus:border-purple-500 focus:outline-none transition-all placeholder:text-gray-700 font-mono"
                />
                <Key className="absolute right-6 top-4 text-gray-600" size={20} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-gray-500 ml-2">AllDebrid API Key</label>
              <div className="relative">
                <input 
                  type="password"
                  value={settings.allDebridKey || ''}
                  onChange={(e) => handleDebridKeyChange('allDebridKey', e.target.value)}
                  placeholder="Paste your AllDebrid token..."
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 focus:border-purple-500 focus:outline-none transition-all placeholder:text-gray-700 font-mono"
                />
                <Key className="absolute right-6 top-4 text-gray-600" size={20} />
              </div>
            </div>
          </div>
        </section>

        {/* Playback Section */}
        <section className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-500/20 rounded-2xl">
              <PlayCircle className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Playback & Quality</h2>
              <p className="text-sm text-gray-400">Customize your viewing experience.</p>
            </div>
          </div>

          <div className="space-y-6">
            <Toggle 
              label="Autoplay Next Episode"
              value={settings.autoplay}
              onChange={(v) => updateSettings({ autoplay: v })}
              description="Automatically start the next episode when the current one ends."
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select 
                label="Preferred Quality"
                value={settings.defaultQuality}
                options={['4K', '1080p', '720p', '480p']}
                onChange={(v) => updateSettings({ defaultQuality: v })}
              />
              <Select 
                label="Default Subtitles"
                value={settings.defaultSubtitles}
                options={['None', 'English', 'Spanish', 'French', 'German']}
                onChange={(v) => updateSettings({ defaultSubtitles: v })}
              />
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-red-500/20 rounded-2xl">
              <Shield className="text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Content & Privacy</h2>
              <p className="text-sm text-gray-400">Manage age-restricted content and preferences.</p>
            </div>
          </div>

          <div className="space-y-4">
            <Toggle 
              label="Enable Adult Content"
              value={settings.isAdultContentEnabled}
              onChange={(v) => updateSettings({ isAdultContentEnabled: v })}
              description="Show 18+ and Hentai categories in the sidebar and search."
            />

            <div className="flex items-center justify-between p-6 bg-black/40 rounded-2xl border border-white/5">
              <div>
                <h3 className="font-bold">Reset Age Verification</h3>
                <p className="text-xs text-gray-500">Force the age gate to appear again on restricted content.</p>
              </div>
              <button 
                onClick={() => updateSettings({ isVerified18: false })}
                className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl border border-red-500/20 transition-all font-bold text-xs"
              >
                RESET GATE
              </button>
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-gray-500/20 rounded-2xl">
              <Trash2 className="text-gray-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Data & Maintenance</h2>
              <p className="text-sm text-gray-400">Clean up your local storage and history.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={clearHistory}
              className="flex items-center gap-3 p-6 bg-black/40 hover:bg-red-500/10 rounded-2xl border border-white/5 hover:border-red-500/20 transition-all group"
            >
              <div className="p-2 bg-white/5 rounded-lg group-hover:bg-red-500/20">
                <Trash className="text-gray-400 group-hover:text-red-500" size={20} />
              </div>
              <div className="text-left">
                <span className="block font-bold">Clear Watch History</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Permanent Action</span>
              </div>
            </button>

            <button 
              onClick={clearCache}
              className="flex items-center gap-3 p-6 bg-black/40 hover:bg-blue-500/10 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-all group"
            >
              <div className="p-2 bg-white/5 rounded-lg group-hover:bg-blue-500/20">
                <Trash2 className="text-gray-400 group-hover:text-blue-500" size={20} />
              </div>
              <div className="text-left">
                <span className="block font-bold">Clear Cache</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Addons & Manifests</span>
              </div>
            </button>
          </div>
        </section>

        <div className="flex justify-end p-4">
          <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 transition-all px-10 py-4 rounded-full font-bold shadow-xl shadow-purple-600/20 active:scale-95">
            <Save size={20} /> Save All Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
