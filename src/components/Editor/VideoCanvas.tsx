import React, { useRef, useEffect, useState } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Smartphone, 
  Eye, 
  EyeOff,
  Move,
  Sparkles,
  Layers
} from 'lucide-react';
import { 
  AspectRatio, 
  CaptionSegment, 
  CaptionStyle, 
  FilterPreset, 
  ReframeMode, 
  VideoClip 
} from '../../types/editor';

interface VideoCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  videoSrc: string;
  activeClip: VideoClip | null;
  captions: CaptionSegment[];
  currentTime: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  aspectRatio: AspectRatio;
  reframeMode: ReframeMode;
  activeFilter: FilterPreset;
  activeCaptionStyle: CaptionStyle;
  captionColor: string;
  onUpdateCaptionPosition?: (captionId: string, yPercent: number) => void;
}

export const VideoCanvas: React.FC<VideoCanvasProps> = ({
  videoRef,
  videoSrc,
  activeClip,
  captions,
  currentTime,
  isPlaying,
  onTogglePlay,
  aspectRatio,
  reframeMode,
  activeFilter,
  activeCaptionStyle,
  captionColor,
  onUpdateCaptionPosition,
}) => {
  const [showSafeZones, setShowSafeZones] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDraggingCaption, setIsDraggingCaption] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Trigger flash transition when playhead resets to start of clip if transitionIn === 'flash'
  useEffect(() => {
    if (activeClip?.transitionIn === 'flash' && Math.abs(currentTime - activeClip.startTime) < 0.25) {
      setFlashActive(true);
      const timer = setTimeout(() => setFlashActive(false), 250);
      return () => clearTimeout(timer);
    }
  }, [currentTime, activeClip]);

  // Find active caption segment at current playhead
  const currentCaption = captions.find(
    (cap) => currentTime >= cap.start && currentTime <= cap.end
  );

  // Filter CSS style string
  const getFilterStyle = (preset: FilterPreset): string => {
    switch (preset) {
      case 'cinematic':
        return 'contrast(1.1) brightness(0.95) saturate(1.15)';
      case 'teal-orange':
        return 'contrast(1.2) saturate(1.3) hue-rotate(-8deg)';
      case 'vibrant':
        return 'saturate(1.45) contrast(1.1)';
      case 'noir':
        return 'grayscale(100%) contrast(1.3) brightness(0.9)';
      case 'warm-sunset':
        return 'sepia(0.25) saturate(1.25) contrast(1.05)';
      default:
        return 'none';
    }
  };

  // Dimension styling based on Aspect Ratio
  const getCanvasDimensions = () => {
    switch (aspectRatio) {
      case '9:16':
        return 'w-[300px] h-[533px] sm:w-[330px] sm:h-[586px]';
      case '1:1':
        return 'w-[420px] h-[420px]';
      case '4:5':
        return 'w-[360px] h-[450px]';
      case '16:9':
      default:
        return 'w-full max-w-[760px] aspect-video';
    }
  };

  // Drag caption vertically
  const handleCaptionMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingCaption(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCaption || !containerRef.current || !currentCaption) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const percentY = Math.max(15, Math.min(88, Math.round((offsetY / rect.height) * 100)));
    if (onUpdateCaptionPosition) {
      onUpdateCaptionPosition(currentCaption.id, percentY);
    }
  };

  const handleMouseUp = () => {
    setIsDraggingCaption(false);
  };

  // Calculate clip progress for story-style progress bar
  const clipProgress = activeClip
    ? Math.max(
        0,
        Math.min(
          100,
          ((currentTime - activeClip.startTime) /
            Math.max(1, activeClip.endTime - activeClip.startTime)) *
            100
        )
      )
    : 0;

  return (
    <div 
      className="flex-1 flex flex-col items-center justify-center p-3 relative overflow-hidden bg-[#0c0d13]"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Viewport Frame with Aspect Ratio */}
      <div
        ref={containerRef}
        onClick={onTogglePlay}
        className={`relative rounded-2xl overflow-hidden shadow-2xl bg-black border border-[#262a3f] flex items-center justify-center group cursor-pointer transition-all duration-300 ${getCanvasDimensions()}`}
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px -10px rgba(139, 92, 246, 0.15)',
        }}
      >
        {/* Background Blur for 'fit-blur' Reframe Mode */}
        {reframeMode === 'fit-blur' && aspectRatio === '9:16' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50 scale-125 blur-xl">
            <video
              src={videoSrc}
              className="w-full h-full object-cover"
              muted
            />
          </div>
        )}

        {/* Main Video Element */}
        <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
          <video
            ref={videoRef}
            src={videoSrc}
            playsInline
            muted={isMuted}
            style={{
              filter: getFilterStyle(activeFilter),
              transform: `scale(${activeClip?.zoomPunch ? 1.08 : 1.0})`,
              transition: 'transform 0.2s ease-out',
            }}
            className={`w-full h-full ${
              aspectRatio === '9:16'
                ? reframeMode === 'fit-blur'
                  ? 'object-contain relative z-10'
                  : 'object-cover'
                : 'object-contain'
            }`}
          />

          {/* White Flash Transition Overlay */}
          {flashActive && (
            <div className="absolute inset-0 bg-white z-20 pointer-events-none animate-out fade-out duration-300" />
          )}

          {/* Glitch Overlay if active transition */}
          {activeClip?.transitionIn === 'glitch' && (
            <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-20 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 animate-pulse" />
          )}
        </div>

        {/* Top Story / Shorts Progress Bar */}
        <div className="absolute top-2 left-3 right-3 h-1 bg-white/20 rounded-full overflow-hidden z-25 backdrop-blur-sm pointer-events-none">
          <div
            className="h-full bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-300 transition-all duration-100 ease-linear rounded-full"
            style={{ width: `${clipProgress}%` }}
          />
        </div>

        {/* Animated Subtitles / Captions (CapCut / Hormozi Style) */}
        {currentCaption && (
          <div
            onMouseDown={handleCaptionMouseDown}
            style={{
              top: `${currentCaption.positionY || 75}%`,
            }}
            className="absolute left-4 right-4 z-25 text-center transform -translate-y-1/2 cursor-grab active:cursor-grabbing hover:ring-1 hover:ring-purple-400/50 rounded-lg p-1.5 transition-shadow"
          >
            {/* Style: Hormozi Bold Yellow Pop */}
            {activeCaptionStyle === 'hormozi-yellow' && (
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-black uppercase tracking-tight text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
                {currentCaption.words.map((w, idx) => {
                  const isActive = currentTime >= w.start && currentTime <= w.end;
                  return (
                    <span
                      key={idx}
                      className={`inline-block px-1.5 py-0.5 rounded transition-transform duration-100 ${
                        isActive
                          ? 'scale-115 text-black font-extrabold shadow-lg rounded-md'
                          : 'text-white'
                      }`}
                      style={{
                        backgroundColor: isActive ? (captionColor || '#FFDE00') : 'transparent',
                        fontSize: `${currentCaption.fontSize || 30}px`,
                        textShadow: isActive ? 'none' : '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 0px 4px 6px rgba(0,0,0,0.8)',
                      }}
                    >
                      {w.word}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Style: Karaoke Glow Pop */}
            {activeCaptionStyle === 'karaoke-pop' && (
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-extrabold tracking-wide text-white">
                {currentCaption.words.map((w, idx) => {
                  const isActive = currentTime >= w.start && currentTime <= w.end;
                  const isPast = currentTime > w.end;
                  return (
                    <span
                      key={idx}
                      className={`inline-block transition-all duration-150 ${
                        isActive
                          ? 'scale-120 text-yellow-300 drop-shadow-[0_0_12px_rgba(253,224,71,0.8)]'
                          : isPast
                          ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                          : 'text-white/60 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                      }`}
                      style={{
                        fontSize: `${currentCaption.fontSize || 28}px`,
                        textShadow: '0 2px 4px rgba(0,0,0,0.9)',
                      }}
                    >
                      {w.word}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Style: Cyberpunk Neon */}
            {activeCaptionStyle === 'neon-cyber' && (
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-black uppercase tracking-wider text-cyan-300">
                {currentCaption.words.map((w, idx) => {
                  const isActive = currentTime >= w.start && currentTime <= w.end;
                  return (
                    <span
                      key={idx}
                      className={`inline-block px-1 rounded transition-all duration-100 ${
                        isActive
                          ? 'scale-115 text-pink-400 drop-shadow-[0_0_15px_rgba(244,114,182,1)] bg-black/60 border border-pink-500/50'
                          : 'text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.8)]'
                      }`}
                      style={{
                        fontSize: `${currentCaption.fontSize || 28}px`,
                      }}
                    >
                      {w.word}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Style: Cinematic Minimalist Pill */}
            {activeCaptionStyle === 'cinematic-minimal' && (
              <div className="inline-block bg-black/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white font-medium shadow-xl">
                <span style={{ fontSize: `${currentCaption.fontSize || 24}px` }}>
                  {currentCaption.text}
                </span>
              </div>
            )}

            {/* Style: Red Marker Hand-drawn Box */}
            {activeCaptionStyle === 'red-marker' && (
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-black text-white">
                {currentCaption.words.map((w, idx) => {
                  const isActive = currentTime >= w.start && currentTime <= w.end;
                  return (
                    <span
                      key={idx}
                      className={`inline-block px-1.5 py-0.5 rounded transition-all ${
                        isActive ? 'bg-red-600 text-white shadow-md' : 'text-white'
                      }`}
                      style={{
                        fontSize: `${currentCaption.fontSize || 28}px`,
                        textShadow: '2px 2px 2px rgba(0,0,0,0.9)',
                      }}
                    >
                      {w.word}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TikTok / Shorts UI Safe Zone Overlay Guide */}
        {showSafeZones && aspectRatio === '9:16' && (
          <div className="absolute inset-0 pointer-events-none z-20 border-2 border-dashed border-red-500/40">
            {/* Top Bar Safe Zone */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-red-500/10 border-b border-red-500/30 flex items-center justify-center text-[10px] text-red-300 font-mono">
              [Top Safe Area: Status Bar / Sound Name]
            </div>

            {/* Right Action Buttons Safe Zone */}
            <div className="absolute right-0 top-20 bottom-24 w-16 bg-red-500/10 border-l border-red-500/30 flex flex-col items-center justify-center gap-4 text-[9px] text-red-300 font-mono">
              <div className="w-8 h-8 rounded-full border border-red-400/50 flex items-center justify-center">Like</div>
              <div className="w-8 h-8 rounded-full border border-red-400/50 flex items-center justify-center">Komen</div>
              <div className="w-8 h-8 rounded-full border border-red-400/50 flex items-center justify-center">Share</div>
            </div>

            {/* Bottom Caption Safe Zone */}
            <div className="absolute bottom-0 left-0 right-16 h-24 bg-red-500/10 border-t border-red-500/30 flex items-center justify-center text-[10px] text-red-300 font-mono">
              [Bottom Safe Area: Username & Description]
            </div>
          </div>
        )}

        {/* Center Big Play / Pause Overlay Icon */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/35 flex items-center justify-center z-30 transition-opacity">
            <div className="w-14 h-14 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-xl shadow-purple-600/40 transform group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 fill-current translate-x-0.5" />
            </div>
          </div>
        )}
      </div>

      {/* Floating Canvas Quick Controls Toolbar */}
      <div className="mt-3 flex items-center gap-3 bg-[#131520]/90 backdrop-blur px-3 py-1.5 rounded-xl border border-[#23273a] shadow-lg">
        {/* Play / Pause Button */}
        <button
          onClick={onTogglePlay}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-[#202436] rounded-lg transition-colors"
          title="Play / Pause (Spasi)"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
        </button>

        {/* Timecode */}
        <div className="text-xs font-mono text-purple-300 bg-[#1c1f2e] px-2.5 py-1 rounded-md border border-[#2a2e45]">
          {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(1).padStart(4, '0')}s
        </div>

        <div className="h-4 w-px bg-[#262a3d]" />

        {/* Mute Video Sound */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-1.5 rounded-lg transition-colors ${
            isMuted ? 'text-red-400 bg-red-500/10' : 'text-slate-300 hover:text-white hover:bg-[#202436]'
          }`}
          title="Mute / Unmute Video"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Toggle TikTok Safe Zones */}
        {aspectRatio === '9:16' && (
          <button
            onClick={() => setShowSafeZones(!showSafeZones)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${
              showSafeZones
                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                : 'text-slate-400 border-transparent hover:bg-[#202436] hover:text-slate-200'
            }`}
            title="Tampilkan Panduan Safe Zone TikTok / Reels"
          >
            {showSafeZones ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Safe Zones</span>
          </button>
        )}

        {/* Drag Hint */}
        <span className="text-[11px] text-slate-400 hidden sm:inline-flex items-center gap-1">
          <Move className="w-3 h-3 text-purple-400" />
          <span>Geser subtitle untuk ubah posisi</span>
        </span>
      </div>
    </div>
  );
};
