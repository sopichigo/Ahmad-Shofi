import React from 'react';
import { 
  Sparkles, 
  Smartphone, 
  Tv, 
  Square, 
  RotateCcw, 
  RotateCw, 
  Download, 
  Upload, 
  Layers,
  Volume2,
  VolumeX,
  Bot
} from 'lucide-react';
import { AspectRatio } from '../types/editor';

interface NavbarProps {
  title: string;
  setTitle: (title: string) => void;
  activeRatio: AspectRatio;
  setActiveRatio: (ratio: AspectRatio) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenHighlightFinder: () => void;
  onOpenUpload: () => void;
  onOpenExport: () => void;
  audioDuckingEnabled: boolean;
  onToggleAudioDucking: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  title,
  setTitle,
  activeRatio,
  setActiveRatio,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenHighlightFinder,
  onOpenUpload,
  onOpenExport,
  audioDuckingEnabled,
  onToggleAudioDucking,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="h-14 border-b border-[#212433] bg-[#0f1118]/95 backdrop-blur px-4 flex items-center justify-between z-30 select-none">
      {/* Left: Branding & Project Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
              ClipCraft <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">AI Pro</span>
            </span>
          </div>
        </div>

        <div className="h-4 w-px bg-[#262a3d] mx-1" />

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-transparent hover:bg-[#1a1d2c] focus:bg-[#1a1d2c] text-xs font-medium text-slate-200 px-2 py-1 rounded transition-colors border border-transparent focus:border-[#383d58] outline-none max-w-[220px] truncate"
          title="Klik untuk mengubah judul klip"
        />
      </div>

      {/* Center: Aspect Ratio & Mode Controls */}
      <div className="flex items-center gap-2">
        {/* Aspect Ratio Switcher */}
        <div className="flex items-center bg-[#151722] p-0.5 rounded-lg border border-[#232739]">
          <button
            onClick={() => setActiveRatio('9:16')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              activeRatio === '9:16'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e2233]'
            }`}
            title="9:16 Vertikal (TikTok / Shorts / Reels)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>9:16</span>
          </button>

          <button
            onClick={() => setActiveRatio('16:9')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              activeRatio === '16:9'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e2233]'
            }`}
            title="16:9 Horizontal (YouTube Landscape)"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>16:9</span>
          </button>

          <button
            onClick={() => setActiveRatio('1:1')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              activeRatio === '1:1'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e2233]'
            }`}
            title="1:1 Kotak (Feed Instagram / LinkedIn)"
          >
            <Square className="w-3.5 h-3.5" />
            <span>1:1</span>
          </button>
        </div>

        {/* AI Highlight Drawer Button */}
        <button
          onClick={onOpenHighlightFinder}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-900/60 to-purple-900/60 hover:from-indigo-800 hover:to-purple-800 text-indigo-200 hover:text-white rounded-lg text-xs font-bold border border-indigo-500/40 shadow-sm transition-all animate-pulse-glow"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>Cari Highlight AI</span>
        </button>

        {/* Audio Ducking Indicator */}
        <button
          onClick={onToggleAudioDucking}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            audioDuckingEnabled
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-[#151722] border-[#25283a] text-slate-400 hover:text-slate-300'
          }`}
          title="Audio Ducking: Menurunkan volume BGM saat ada suara narasi"
        >
          <span>🦆</span>
          <span>Ducking: {audioDuckingEnabled ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Right: History, Upload, and Export Action */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center bg-[#151722] rounded-lg border border-[#232739] p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 rounded transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 rounded transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Change Video / Upload */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#171a26] hover:bg-[#202436] text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-[#272b3e] transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Ganti Video</span>
        </button>

        {/* Export Button */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-500/25 border border-purple-400/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Ekspor Video</span>
        </button>
      </div>
    </header>
  );
};
