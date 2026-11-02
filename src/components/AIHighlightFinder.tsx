import React, { useState } from 'react';
import { 
  Sparkles, 
  Flame, 
  Play, 
  Upload, 
  Check, 
  Clock, 
  TrendingUp, 
  Music, 
  Type, 
  X, 
  Video,
  Zap,
  ArrowRight
} from 'lucide-react';
import { SAMPLE_VIDEOS } from '../utils/sampleData';
import { HighlightClip, SampleVideoOption } from '../types/editor';

interface AIHighlightFinderProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHighlight: (sample: SampleVideoOption, highlight: HighlightClip) => void;
  onUploadCustomVideo: (file: File) => void;
}

export const AIHighlightFinder: React.FC<AIHighlightFinderProps> = ({
  isOpen,
  onClose,
  onSelectHighlight,
  onUploadCustomVideo,
}) => {
  const [selectedSample, setSelectedSample] = useState<SampleVideoOption>(SAMPLE_VIDEOS[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [discoveredHighlights, setDiscoveredHighlights] = useState<HighlightClip[]>(SAMPLE_VIDEOS[0].highlights);
  const [customFile, setCustomFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSelectSample = (sample: SampleVideoOption) => {
    setSelectedSample(sample);
    setDiscoveredHighlights(sample.highlights);
  };

  const handleRunAiAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisStep('1. Menganalisis gelombang audio dan transkrip percakapan...');

    try {
      setTimeout(() => {
        setAnalysisStep('2. Mendeteksi emosi, hook 3 detik awal, dan retensi penonton...');
      }, 900);

      setTimeout(() => {
        setAnalysisStep('3. Gemini 3.8 Flash menghitung Skor Viralitas & auto-captioning...');
      }, 1800);

      const res = await fetch('/api/ai/analyze-highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedSample.title,
          duration: selectedSample.duration,
          transcript: selectedSample.captions,
          genre: selectedSample.category,
        }),
      });

      const data = await res.json();
      setTimeout(() => {
        if (data.highlights && data.highlights.length > 0) {
          setDiscoveredHighlights(data.highlights);
        } else {
          setDiscoveredHighlights(selectedSample.highlights);
        }
        setIsAnalyzing(false);
      }, 2500);
    } catch (err) {
      setTimeout(() => {
        setDiscoveredHighlights(selectedSample.highlights);
        setIsAnalyzing(false);
      }, 1500);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomFile(file);
      onUploadCustomVideo(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#12141e] border border-[#262a3d] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#212536] flex items-center justify-between bg-[#151825]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                AI Smart Video Clipper & Highlight Finder
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Powered by Gemini 3.8 Flash
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Pilih video contoh atau unggah video Anda. AI akan menemukan momen paling viral dan memotongnya otomatis.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1f2334] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Step 1: Choose Video Source */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Langkah 1: Pilih Video Sumber
              </span>

              {/* Upload Own Video */}
              <label className="flex items-center gap-1.5 px-3 py-1 bg-[#1a1d2d] hover:bg-[#23273b] text-purple-300 hover:text-white rounded-lg text-xs font-medium cursor-pointer border border-purple-500/30 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Unggah Video Sendiri (MP4/WebM)</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Sample Video Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SAMPLE_VIDEOS.map((sample) => {
                const isSelected = selectedSample.id === sample.id;
                return (
                  <div
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className={`group relative rounded-xl p-3 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1c1f30] border-purple-500 ring-2 ring-purple-500/30 shadow-lg'
                        : 'bg-[#151724] border-[#24283b] hover:border-[#353b54] hover:bg-[#181b2a]'
                    }`}
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden mb-2.5 bg-black">
                      <img
                        src={sample.thumbnail}
                        alt={sample.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-mono text-white flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{Math.floor(sample.duration / 60)}:{(sample.duration % 60).toString().padStart(2, '0')}</span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center shadow">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-400">
                        {sample.category}
                      </span>
                      <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-purple-300">
                        {sample.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {sample.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Trigger Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  Temukan Momen Viral Otomatis
                </h4>
                <p className="text-xs text-slate-400">
                  AI memindai punchline, retensi suara, dan hook terbaik untuk klip TikTok & Shorts 15-45 detik.
                </p>
              </div>
            </div>

            <button
              onClick={handleRunAiAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-600/30 disabled:opacity-60 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>{isAnalyzing ? 'Sedang Memindai...' : 'Scan Ulang dengan AI'}</span>
            </button>
          </div>

          {/* Loading Radar */}
          {isAnalyzing && (
            <div className="p-6 rounded-xl bg-[#151726] border border-purple-500/40 flex flex-col items-center justify-center text-center space-y-3">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-ping" />
                <div className="w-10 h-10 rounded-full border-2 border-t-purple-500 border-r-indigo-500 border-b-transparent border-l-transparent animate-spin" />
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-xs font-semibold text-purple-300 animate-pulse">
                {analysisStep}
              </p>
            </div>
          )}

          {/* Step 2: Discovered Highlight Clips */}
          {!isAnalyzing && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-400" />
                  Klip Highlight yang Ditemukan AI ({discoveredHighlights.length} Klip Siap Diedit)
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  🔥 Viral Score &gt; 90%
                </span>
              </div>

              <div className="space-y-3">
                {discoveredHighlights.map((hl, index) => {
                  const clipDuration = Math.round(hl.endTime - hl.startTime);
                  return (
                    <div
                      key={hl.id || index}
                      className="p-4 rounded-xl bg-[#161827] border border-[#262a3f] hover:border-purple-500/50 hover:bg-[#1a1c2e] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          {/* Viral Score Badge */}
                          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold shadow-sm">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>{hl.viralScore}% Viral Score</span>
                          </div>

                          <div className="text-xs font-mono text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              {Math.floor(hl.startTime / 60)}:{(hl.startTime % 60).toString().padStart(2, '0')} - {Math.floor(hl.endTime / 60)}:{(hl.endTime % 60).toString().padStart(2, '0')} ({clipDuration}s)
                            </span>
                          </div>

                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {hl.autoCropReframe || '9:16 Crop'}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                          {hl.title}
                        </h4>

                        <p className="text-xs text-slate-300 bg-[#12131d] p-2 rounded-lg border border-[#212435] italic">
                          "{hl.hookText}"
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                          <span className="text-indigo-300">💡 {hl.rationale}</span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Music className="w-3 h-3 text-pink-400" />
                            {hl.recommendedBgm}
                          </span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Type className="w-3 h-3 text-yellow-400" />
                            {hl.captionStyle}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center md:flex-col justify-end gap-2 shrink-0">
                        <button
                          onClick={() => {
                            onSelectHighlight(selectedSample, hl);
                            onClose();
                          }}
                          className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Buka di Editor CapCut</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#212536] bg-[#141624] flex items-center justify-between text-xs text-slate-400">
          <span>Tip: Anda juga dapat memotong klip lebih lanjut atau mengganti teks subtitle di timeline manual.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1d2030] hover:bg-[#262a40] text-slate-300 rounded-lg font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
