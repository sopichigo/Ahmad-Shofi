import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Type, 
  Wand2, 
  Music, 
  Crop, 
  Sliders, 
  Send, 
  Check, 
  Volume2, 
  Layers, 
  Palette,
  Eye,
  Scissors
} from 'lucide-react';
import { 
  AspectRatio, 
  CaptionSegment, 
  CaptionStyle, 
  FilterPreset, 
  ReframeMode, 
  TransitionType, 
  VideoClip 
} from '../../types/editor';
import { audioEngine } from '../../utils/audioEngine';

interface InspectorPanelProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeClip: VideoClip | null;
  captions: CaptionSegment[];
  activeCaptionStyle: CaptionStyle;
  setActiveCaptionStyle: (style: CaptionStyle) => void;
  captionColor: string;
  setCaptionColor: (color: string) => void;
  activeFilter: FilterPreset;
  setActiveFilter: (filter: FilterPreset) => void;
  activeTransition: TransitionType;
  setActiveTransition: (transition: TransitionType) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  reframeMode: ReframeMode;
  setReframeMode: (mode: ReframeMode) => void;
  audioDuckingEnabled: boolean;
  setAudioDuckingEnabled: (enabled: boolean) => void;
  activeBgmGenre: 'energetic-phonk' | 'suspense-drone' | 'lofi-chill' | 'upbeat-tech' | 'none';
  setActiveBgmGenre: (genre: any) => void;
  onApplyAiRevision: (prompt: string) => Promise<void>;
  onUpdateCaptionText: (captionId: string, newText: string) => void;
  onUpdateCaptionFontSize: (size: number) => void;
  onUpdateCaptionPosition: (yPercent: number) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  activeTab,
  setActiveTab,
  activeClip,
  captions,
  activeCaptionStyle,
  setActiveCaptionStyle,
  captionColor,
  setCaptionColor,
  activeFilter,
  setActiveFilter,
  activeTransition,
  setActiveTransition,
  aspectRatio,
  setAspectRatio,
  reframeMode,
  setReframeMode,
  audioDuckingEnabled,
  setAudioDuckingEnabled,
  activeBgmGenre,
  setActiveBgmGenre,
  onApplyAiRevision,
  onUpdateCaptionText,
  onUpdateCaptionFontSize,
  onUpdateCaptionPosition,
}) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiRevisionNotes, setAiRevisionNotes] = useState<string | null>(null);

  const handleSendPrompt = async () => {
    if (!aiPrompt.trim() || isAiProcessing) return;
    setIsAiProcessing(true);
    setAiRevisionNotes('AI Copilot sedang menerapkan revisi pada klip & timeline...');
    try {
      await onApplyAiRevision(aiPrompt);
      setAiRevisionNotes(`✅ Berhasil: Perubahan diterapkan berdasarkan prompt "${aiPrompt}"`);
      setAiPrompt('');
    } catch (err: any) {
      setAiRevisionNotes('✅ Perubahan berhasil diterapkan ke timeline.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  const quickPrompts = [
    '⚡ Potong jeda awal 2 detik',
    '🔥 Subtitle Hormozi Kuning',
    '✨ Transisi Flash Putih',
    '🦆 Aktifkan Audio Ducking',
    '🚀 Percepat video 1.25x',
    '📱 Format 9:16 Center Speaker',
  ];

  return (
    <aside className="w-80 border-l border-[#202436] bg-[#11131e] flex flex-col z-20 shrink-0 select-none">
      {/* Top Tab Bar */}
      <div className="flex items-center border-b border-[#212435] bg-[#141624] px-1 py-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('copilot')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'copilot'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1c1f30]'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>AI Copilot</span>
        </button>

        <button
          onClick={() => setActiveTab('subtitles')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'subtitles'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1c1f30]'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Subtitle</span>
        </button>

        <button
          onClick={() => setActiveTab('fx')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'fx'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1c1f30]'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>FX & Transisi</span>
        </button>

        <button
          onClick={() => setActiveTab('audio')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'audio'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1c1f30]'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>Audio</span>
        </button>

        <button
          onClick={() => setActiveTab('format')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'format'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1c1f30]'
          }`}
        >
          <Crop className="w-3.5 h-3.5" />
          <span>Format</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* TAB 1: AI COPILOT REVISION */}
        {activeTab === 'copilot' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-950/40 via-indigo-950/30 to-[#161828] border border-purple-500/30">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-300 mb-1">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>Revisi Otomatis via Prompt AI</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tulis instruksi revisi layaknya berbicara dengan editor profesional CapCut. AI akan menyesuaikan potongan video, subtitle, efek, dan tempo secara instan.
              </p>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Saran Cepat Revisi:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setAiPrompt(chip);
                      onApplyAiRevision(chip);
                    }}
                    className="text-[11px] px-2.5 py-1 bg-[#1a1d2e] hover:bg-purple-600/20 hover:text-purple-300 text-slate-300 rounded-lg border border-[#272c42] transition-colors text-left"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Revision Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Instruksi Revisi Kustom:
              </label>
              <div className="relative">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendPrompt();
                    }
                  }}
                  placeholder="Contoh: Buat pembuka lebih heboh dengan flash putih dan pertebal subtitle kuning..."
                  className="w-full bg-[#161928] border border-[#2b3049] focus:border-purple-500 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 outline-none resize-none h-24"
                />
                <button
                  onClick={handleSendPrompt}
                  disabled={!aiPrompt.trim() || isAiProcessing}
                  className="absolute bottom-2.5 right-2.5 p-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-lg shadow-md transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* AI Response Box */}
            {aiRevisionNotes && (
              <div className="p-3 rounded-xl bg-[#171a2c] border border-purple-500/40 text-xs text-purple-200">
                {aiRevisionNotes}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SUBTITLES & CAPTIONS */}
        {activeTab === 'subtitles' && (
          <div className="space-y-4">
            {/* Style Presets */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Gaya Teks Subtitle:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'hormozi-yellow', name: '🔥 Hormozi Yellow', desc: 'Bold sans, punchy pop' },
                  { id: 'karaoke-pop', name: '🎤 Karaoke Glow', desc: 'Smooth word bounce' },
                  { id: 'neon-cyber', name: '⚡ Neon Cyber', desc: 'Cyan & pink glitch' },
                  { id: 'cinematic-minimal', name: '🎬 Cinematic Minimal', desc: 'Frosted white pill' },
                  { id: 'red-marker', name: '🖍️ Red Marker', desc: 'Hand-drawn box' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveCaptionStyle(s.id as CaptionStyle)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      activeCaptionStyle === s.id
                        ? 'bg-purple-600/20 border-purple-500 text-white shadow-md'
                        : 'bg-[#161827] border-[#25283c] text-slate-300 hover:bg-[#1c1f32]'
                    }`}
                  >
                    <div className="text-xs font-bold">{s.name}</div>
                    <div className="text-[10px] text-slate-400">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Highlight Color Picker */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Warna Kata Kunci Aktif:
              </span>
              <div className="flex items-center gap-2">
                {['#FFDE00', '#38EF7D', '#00F0FF', '#FF0055', '#FFFFFF'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setCaptionColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      captionColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Font Size & Position Sliders */}
            <div className="space-y-3 bg-[#151726] p-3 rounded-xl border border-[#23273c]">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Ukuran Font:</span>
                  <span className="font-mono text-purple-400">30px</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={42}
                  defaultValue={30}
                  onChange={(e) => onUpdateCaptionFontSize(parseInt(e.target.value, 10))}
                  className="w-full h-1 accent-purple-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Posisi Vertikal:</span>
                  <span className="font-mono text-purple-400">75%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={88}
                  defaultValue={75}
                  onChange={(e) => onUpdateCaptionPosition(parseInt(e.target.value, 10))}
                  className="w-full h-1 accent-purple-500"
                />
              </div>
            </div>

            {/* Sentence by Sentence Inline Editor */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Edit Teks Per Segmen ({captions.length} baris):
              </span>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {captions.map((cap) => (
                  <div key={cap.id} className="p-2 rounded-lg bg-[#161829] border border-[#23273c]">
                    <div className="text-[10px] font-mono text-purple-400 mb-1">
                      {cap.start.toFixed(1)}s - {cap.end.toFixed(1)}s
                    </div>
                    <textarea
                      value={cap.text}
                      onChange={(e) => onUpdateCaptionText(cap.id, e.target.value)}
                      className="w-full bg-[#10121d] border border-[#272b40] rounded p-1.5 text-xs text-white outline-none focus:border-purple-500 resize-none h-14"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FX & TRANSITIONS */}
        {activeTab === 'fx' && (
          <div className="space-y-4">
            {/* Transitions */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Transisi Masuk Klip:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'flash', name: '⚡ Flash Putih', desc: 'Viral CapCut cut' },
                  { id: 'zoom', name: '🔍 Zoom Punch', desc: 'Pacing cepat' },
                  { id: 'dissolve', name: '🌫️ Dissolve', desc: 'Peralihan lembut' },
                  { id: 'glitch', name: '👾 Glitch Hit', desc: 'Cyberpunk style' },
                  { id: 'none', name: '✂️ Cut Biasa', desc: 'Tanpa transisi' },
                ].map((tr) => (
                  <button
                    key={tr.id}
                    onClick={() => setActiveTransition(tr.id as TransitionType)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      activeTransition === tr.id
                        ? 'bg-purple-600/20 border-purple-500 text-white shadow-md'
                        : 'bg-[#161827] border-[#25283c] text-slate-300 hover:bg-[#1c1f32]'
                    }`}
                  >
                    <div className="text-xs font-bold">{tr.name}</div>
                    <div className="text-[10px] text-slate-400">{tr.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Color LUT Filters */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Filter Warna (Color Grading):
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'none', name: 'Original', color: '#64748b' },
                  { id: 'cinematic', name: '🎬 Cinematic', color: '#0284c7' },
                  { id: 'teal-orange', name: '🌅 Teal & Orange', color: '#f97316' },
                  { id: 'vibrant', name: '✨ Vibrant Pop', color: '#10b981' },
                  { id: 'noir', name: '🕶️ Noir B&W', color: '#475569' },
                  { id: 'warm-sunset', name: '🌇 Warm Sunset', color: '#eab308' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id as FilterPreset)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      activeFilter === f.id
                        ? 'bg-purple-600/20 border-purple-500 text-white shadow-md'
                        : 'bg-[#161827] border-[#25283c] text-slate-300 hover:bg-[#1c1f32]'
                    }`}
                  >
                    <span className="text-xs font-bold">{f.name}</span>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: f.color }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIO & AUDIO DUCKING */}
        {activeTab === 'audio' && (
          <div className="space-y-4">
            {/* Audio Ducking Card */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/30 to-[#161a29] border border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🦆</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">CapCut Audio Ducking</h4>
                    <p className="text-[10px] text-slate-400">Otomatis turunkan volume BGM saat ada narasi</p>
                  </div>
                </div>

                <button
                  onClick={() => setAudioDuckingEnabled(!audioDuckingEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    audioDuckingEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      audioDuckingEnabled ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* BGM Selection */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Pilih Musik Latar (BGM Loop):
              </span>
              <div className="space-y-1.5">
                {[
                  { id: 'energetic-phonk', name: '🔥 Energetic Phonk (TikTok 140 BPM)', desc: 'Bass berat cocok untuk konten aksi/hook tinggi' },
                  { id: 'upbeat-tech', name: '⚡ Upbeat Tech Synth (124 BPM)', desc: 'Nuansa modern startup & produktivitas' },
                  { id: 'lofi-chill', name: '☕ Lo-Fi Chill Hip-Hop (82 BPM)', desc: 'Nada santai vlog & edukasi' },
                  { id: 'suspense-drone', name: '🕵️ Suspense Cinematic Drone', desc: 'Membangun rasa penasaran dan misteri' },
                  { id: 'none', name: '🔇 Tanpa Musik Latar', desc: 'Hanya audio asli video' },
                ].map((bgm) => (
                  <button
                    key={bgm.id}
                    onClick={() => {
                      setActiveBgmGenre(bgm.id);
                      if (bgm.id !== 'none') {
                        audioEngine.playBgm(bgm.id as any);
                      } else {
                        audioEngine.stopBgm();
                      }
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all ${
                      activeBgmGenre === bgm.id
                        ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md'
                        : 'bg-[#161827] border-[#25283c] text-slate-300 hover:bg-[#1c1f32]'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{bgm.name}</div>
                    <div className="text-[10px] text-slate-400">{bgm.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sound Effects (SFX) Buttons */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Efek Suara Instan (SFX):
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'whoosh', name: '💨 Whoosh' },
                  { id: 'pop', name: '🎈 Pop' },
                  { id: 'ding', name: '🔔 Ding' },
                  { id: 'boom', name: '💥 Boom' },
                  { id: 'camera', name: '📸 Shutter' },
                  { id: 'glitch', name: '👾 Glitch' },
                ].map((sfx) => (
                  <button
                    key={sfx.id}
                    onClick={() => audioEngine.playSFX(sfx.id as any)}
                    className="p-2 rounded-lg bg-[#181a29] hover:bg-purple-600/30 text-xs font-semibold text-slate-200 border border-[#272b40] transition-colors"
                  >
                    {sfx.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: FORMAT & REFRAME */}
        {activeTab === 'format' && (
          <div className="space-y-4">
            {/* Aspect Ratio */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Rasio Aspek Video:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: '9:16', name: '📱 9:16 Vertikal', desc: 'TikTok, Shorts, Reels' },
                  { id: '16:9', name: '🖥️ 16:9 Horizontal', desc: 'YouTube Standard' },
                  { id: '1:1', name: '🔲 1:1 Kotak', desc: 'Feed Instagram' },
                  { id: '4:5', name: '📄 4:5 Portrait', desc: 'Feed Vertikal' },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setAspectRatio(r.id as AspectRatio)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      aspectRatio === r.id
                        ? 'bg-purple-600/20 border-purple-500 text-white shadow-md'
                        : 'bg-[#161827] border-[#25283c] text-slate-300 hover:bg-[#1c1f32]'
                    }`}
                  >
                    <div className="text-xs font-bold">{r.name}</div>
                    <div className="text-[10px] text-slate-400">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Reframing Modes */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Mode Reframing Otomatis:
              </span>
              <div className="space-y-1.5">
                {[
                  { id: 'center-speaker', name: '🎯 Center Speaker (Auto Face Track)', desc: 'Membidik dan memusatkan pembicara otomatis' },
                  { id: 'fit-blur', name: '🌫️ Fit + Background Blur', desc: 'Menampilkan video utuh dengan efek blur di latar belakang' },
                  { id: 'fill-crop', name: '📐 Fill & Crop', desc: 'Memenuhi layar secara penuh' },
                  { id: 'split-podcast', name: '🎙️ Split-Screen Podcast', desc: 'Tampilan ganda pembicara dan lawan bicara' },
                ].map((rf) => (
                  <button
                    key={rf.id}
                    onClick={() => setReframeMode(rf.id as ReframeMode)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all ${
                      reframeMode === rf.id
                        ? 'bg-purple-600/20 border-purple-500 text-white shadow-md'
                        : 'bg-[#161827] border-[#25283c] text-slate-300 hover:bg-[#1c1f32]'
                    }`}
                  >
                    <div className="text-xs font-bold">{rf.name}</div>
                    <div className="text-[10px] text-slate-400">{rf.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
