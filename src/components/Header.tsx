import { useEffect, useState } from 'react';
import { Sparkles, Cpu, Layers, HelpCircle, CheckCircle2 } from 'lucide-react';
import { isWebCodecsSupported } from '../engine/videoExporter';

interface HeaderProps {
  queueCount: number;
  onOpenHelp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ queueCount, onOpenHelp }) => {
  const [hasWebCodecs, setHasWebCodecs] = useState(true);

  useEffect(() => {
    setHasWebCodecs(isWebCodecsSupported());
  }, []);

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              MotionForge Studio
            </h1>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
              Microstock PRO
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Akselerasi Hardware GPU WebCodecs • Deterministik MP4 & MOV Alpha 32-bit
          </p>
        </div>
      </div>

      {/* Badges & Actions */}
      <div className="flex items-center gap-3">
        {/* Hardware GPU acceleration status */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${
            hasWebCodecs
              ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300'
              : 'bg-amber-950/50 border-amber-800/60 text-amber-300'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>{hasWebCodecs ? 'WebCodecs GPU Aktif' : 'WebCodecs Tidak Terdeteksi'}</span>
          {hasWebCodecs && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
        </div>

        {/* Bulk Queue counter */}
        {queueCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 text-xs font-medium">
            <Layers className="w-3.5 h-3.5" />
            <span>Antrean Render: {queueCount}</span>
          </div>
        )}

        {onOpenHelp && (
          <button
            onClick={onOpenHelp}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors text-xs flex items-center gap-1.5"
            title="Panduan Panduan Microstock"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Panduan</span>
          </button>
        )}
      </div>
    </header>
  );
};
