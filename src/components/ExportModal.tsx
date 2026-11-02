import React, { useState, useEffect } from 'react';
import { 
  Download, 
  X, 
  CheckCircle2, 
  Sparkles, 
  Film, 
  Share2, 
  Copy, 
  Settings2, 
  Clock, 
  FileVideo,
  Play
} from 'lucide-react';
import { AspectRatio, CaptionSegment, VideoClip } from '../types/editor';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle: string;
  duration: number;
  aspectRatio: AspectRatio;
  clips: VideoClip[];
  captions: CaptionSegment[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  videoTitle,
  duration,
  aspectRatio,
  clips,
  captions,
}) => {
  const [resolution, setResolution] = useState<'1080p' | '720p' | '4k'>('1080p');
  const [fps, setFps] = useState<60 | 30>(60);
  const [burnCaptions, setBurnCaptions] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentRenderFrame, setCurrentRenderFrame] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [downloadBlobUrl, setDownloadBlobUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsExporting(false);
      setProgress(0);
      setIsCompleted(false);
      setDownloadBlobUrl(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalFrames = Math.floor(duration * fps);

  const handleStartExport = () => {
    setIsExporting(true);
    setProgress(0);
    setCurrentRenderFrame(0);
    setIsCompleted(false);

    // Fast, progressive rendering pipeline
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 8) + 4;
        if (next >= 100) {
          clearInterval(interval);
          setCurrentRenderFrame(totalFrames);
          setIsCompleted(true);
          setIsExporting(false);

          // Generate simulated downloadable file
          const dummyVideoContent = `data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAACxtZGF0...`;
          setDownloadBlobUrl(dummyVideoContent);
          return 100;
        }
        setCurrentRenderFrame(Math.floor((next / 100) * totalFrames));
        return next;
      });
    }, 120);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = downloadBlobUrl || '#';
    a.download = `${videoTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_${resolution}_${aspectRatio}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#12141f] border border-[#272b3f] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#212536] flex items-center justify-between bg-[#151725]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Ekspor Video CapCut Pro</h3>
              <p className="text-[11px] text-slate-400">Siap posting ke TikTok, Shorts, dan Instagram Reels</p>
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
        <div className="p-5 space-y-4">
          {!isExporting && !isCompleted ? (
            <>
              {/* Clip Summary Card */}
              <div className="p-3.5 rounded-xl bg-[#171a29] border border-[#262a3f] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white truncate max-w-[260px]">{videoTitle}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                    <span>Durasi: {Math.floor(duration)} detik</span>
                    <span>•</span>
                    <span>Rasio: {aspectRatio}</span>
                    <span>•</span>
                    <span>{captions.length} Subtitle Terpasang</span>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold">
                  MP4
                </div>
              </div>

              {/* Resolution Setting */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Resolusi Output:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '720p', name: '720p HD', desc: 'Ukuran Ringan' },
                    { id: '1080p', name: '1080p FHD', desc: 'Rekomendasi' },
                    { id: '4k', name: '4K Ultra', desc: 'Kualitas Maksimal' },
                  ].map((res) => (
                    <button
                      key={res.id}
                      onClick={() => setResolution(res.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        resolution === res.id
                          ? 'bg-purple-600/20 border-purple-500 text-white shadow-md'
                          : 'bg-[#161827] border-[#25283c] text-slate-300 hover:bg-[#1c1f32]'
                      }`}
                    >
                      <div className="text-xs font-bold">{res.name}</div>
                      <div className="text-[10px] text-slate-400">{res.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* FPS & Captions Burn-In */}
              <div className="grid grid-cols-2 gap-3 bg-[#161827] p-3 rounded-xl border border-[#25283c]">
                {/* Frame Rate */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Frame Rate:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[30, 60].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFps(f as any)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                          fps === f
                            ? 'bg-purple-600 border-purple-400 text-white'
                            : 'bg-[#11131e] border-[#262a3f] text-slate-400 hover:text-white'
                        }`}
                      >
                        {f} FPS
                      </button>
                    ))}
                  </div>
                </div>

                {/* Burn Captions */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Render Subtitle:
                  </span>
                  <button
                    onClick={() => setBurnCaptions(!burnCaptions)}
                    className={`w-full py-1.5 px-2 rounded-lg text-xs font-semibold border flex items-center justify-between transition-colors ${
                      burnCaptions
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-[#11131e] border-[#262a3f] text-slate-400'
                    }`}
                  >
                    <span>Burn-In Teks</span>
                    <span>{burnCaptions ? 'YA' : 'TIDAK'}</span>
                  </button>
                </div>
              </div>

              {/* Estimated File Size */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Estimasi Ukuran File:</span>
                <span className="font-mono text-purple-300 font-bold">
                  {resolution === '4k' ? '~42.5 MB' : resolution === '1080p' ? '~14.8 MB' : '~7.2 MB'}
                </span>
              </div>
            </>
          ) : isExporting ? (
            /* Rendering Progress Bar */
            <div className="py-8 space-y-4 text-center">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
                <div
                  className="w-16 h-16 rounded-full border-4 border-t-purple-500 border-r-indigo-400 border-b-transparent border-l-transparent animate-spin"
                />
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </div>

              <div>
                <h4 className="text-base font-bold text-white">Merender Klip Video...</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Menerapkan subtitle animasi, transisi visual, dan penyesuaian audio ducking.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 max-w-sm mx-auto">
                <div className="h-2 w-full bg-[#1e2236] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 transition-all duration-150 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>{progress}% Selesai</span>
                  <span>Frame {currentRenderFrame} / {totalFrames}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Success / Completed Screen */
            <div className="py-6 space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base font-bold text-white">Video Berhasil Diekspor!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Format {aspectRatio} siap dipublikasikan ke TikTok, YouTube Shorts, atau Reels.
                </p>
              </div>

              <div className="flex flex-col gap-2 max-w-sm mx-auto pt-2">
                <button
                  onClick={handleDownload}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Video Sekarang (MP4)</span>
                </button>

                <button
                  onClick={handleCopyShareLink}
                  className="w-full py-2.5 bg-[#171a2a] hover:bg-[#20243b] text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-[#272b40] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedLink ? '✅ Tautan Berhasil Disalin!' : 'Bagikan Klip / Salin Tautan'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isExporting && !isCompleted && (
          <div className="px-5 py-3 border-t border-[#212536] bg-[#141624] flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#1b1e2f] hover:bg-[#24283e] text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleStartExport}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
            >
              Mulai Ekspor
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
