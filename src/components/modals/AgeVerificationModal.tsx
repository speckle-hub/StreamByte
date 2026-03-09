import React from 'react';
import { Shield, Check } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';

interface AgeVerificationModalProps {
  onConfirm: () => void;
}

const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({ onConfirm }) => {
  const { settings, updateSettings } = useSettings();

  if (settings.isVerified18) return null;

  const handleVerify = () => {
    updateSettings({ isVerified18: true });
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/80">
      <div className="max-w-md w-full bg-[#1a1a1c] border border-red-500/20 rounded-[2rem] p-10 text-center shadow-2xl relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
        
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
          <Shield size={40} className="text-red-500" />
        </div>

        <h2 className="text-3xl font-black text-white mb-4 italic uppercase tracking-tighter">
          Age Restricted Content
        </h2>
        
        <p className="text-gray-400 mb-10 leading-relaxed">
          The content you are trying to access is intended for adults only. 
          By proceeding, you confirm that you are at least <span className="text-white font-bold">18 years of age</span> or older.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleVerify}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black text-lg transition-all active:scale-95 flex items-center justify-center gap-2 group"
          >
            <Check size={20} className="group-hover:scale-125 transition-transform" />
            I AM 18+
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="w-full bg-white/5 hover:bg-white/10 text-gray-400 py-4 rounded-2xl font-bold transition-all"
          >
            GO BACK
          </button>
        </div>

        <p className="mt-8 text-[10px] text-gray-600 uppercase tracking-widest font-bold">
          Streaming responsibly • StreamByte Safety Gate
        </p>
      </div>
    </div>
  );
};

export default AgeVerificationModal;
