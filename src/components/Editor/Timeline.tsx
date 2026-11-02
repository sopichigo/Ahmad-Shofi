import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Scissors, 
  Trash2, 
  Copy, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Volume2, 
  VolumeX, 
  Music, 
  Type, 
  Film, 
  Sparkles, 
  Layers,
  ChevronLeft,
  ChevronRight,
  Gauge
} from 'lucide-react';
import { 
  CaptionSegment, 
  VideoClip, 
  AudioTrack, 
  TransitionType 
} from '../../types/editor';

interface TimelineProps {
  clips: VideoClip[];
  captions: CaptionSegment[];
  audioTracks: AudioTrack[];
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  activeClipId: string | null;
  activeCaptionId: string | null;
  onSeek: (time: number) => void;
  onTogglePlay: () => void;
  onSelectClip: (clipId: string) => void;
  onSelectCaption: (captionId: string) => void;
  onSplitClip: () => void;
  onDeleteClip: (clipId: string) => void;
  onDuplicateClip: (clipId: string) => void;
  onChangeSpeed: (clipId: string, speed: number) => void;
  onTrimClip: (clipId: string, newStart: number, newEnd: number) => void;
  onChangeTransition: (clipId: string, transition: TransitionType) => void;
  onToggleTrackMute: (trackId: string) => void;
  onChangeTrackVolume: (trackId: string, volume: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  clips,
  captions,
  audioTracks,
  currentTime,
  totalDuration,
  isPlaying,
  activeClipId,
  activeCaptionId,
  onSeek,
  onTogglePlay,
  onSelectClip,
  onSelectCaption,
  onSplitClip,
  onDeleteClip,
  onDuplicateClip,
  onChangeSpeed,
  onTrimClip,
  onChangeTransition,
  onToggleTrackMute,
  onChangeTrackVolume,
}) => {
  const [pixelsPerSecond, setPixelsPerSecond] = useState(24); // Timeline zoom
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [trimmingState, setTrimmingState] = useState<{
    clipId: string;
    edge: 'start' | 'end';
    startX: number;
    initialVal: number;
  } | null>(null);

  const timelineContainerRef = useRef<HTMLDivElement>(null);

  // Compute maximum timeline length
  const maxTime = Math.max(totalDuration, 45);
  const timelineWidth = Math.max(800, maxTime * pixelsPerSecond);

  // Handle Scrubbing on Ruler
  const handleRulerMouseDown = (e: React.MouseEvent) => {
    setIsScrubbing(true);
    handleSeekFromEvent(e);
  };

  const handleSeekFromEvent = (e: React.MouseEvent | MouseEvent) => {
    if (!timelineContainerRef.current) return;
    const rect = timelineContainerRef.current.getBoundingClientRect();
    const scrollLeft = timelineContainerRef.current.scrollLeft;
    const clickX = e.clientX - rect.left + scrollLeft - 180; // 180px track label width
    const time = Math.max(0, Math.min(maxTime, clickX / pixelsPerSecond));
    onSeek(time);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isScrubbing) {
        handleSeekFromEvent(e);
      } else if (trimmingState) {
        const deltaX = e.clientX - trimmingState.startX;
        const deltaTime = deltaX / pixelsPerSecond;
        const targetClip = clips.find(c => c.id === trimmingState.clipId);
        if (!targetClip) return;

        if (trimmingState.edge === 'start') {
          const newStart = Math.max(0, Math.min(targetClip.endTime - 1, trimmingState.initialVal + deltaTime));
          onTrimClip(targetClip.id, newStart, targetClip.endTime);
        } else {
          const newEnd = Math.max(targetClip.startTime + 1, trimmingState.initialVal + deltaTime);
          onTrimClip(targetClip.id, targetClip.startTime, newEnd);
        }
      }
    };

    const handleGlobalMouseUp = () => {
      setIsScrubbing(false);
      setTrimmingState(null);
    };

    if (isScrubbing || trimmingState) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isScrubbing, trimmingState, pixelsPerSecond, clips]);

  const activeClip = clips.find(c => c.id === activeClipId);

  // Format timecode
  const formatTimecode = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-64 border-t border-[#202436] bg-[#0f111a] flex flex-col select-none">
      {/* Top Toolbar */}
      <div className="h-10 px-4 border-b border-[#1c1f2e] bg-[#121420] flex items-center justify-between">
        {/* Left: Playback controls & Timecode */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onSeek(Math.max(0, currentTime - 1))}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1f2334] transition-colors"
              title="Mundur 1 detik"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onTogglePlay}
              className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition-colors"
              title="Play / Pause (Spasi)"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button
              onClick={() => onSeek(Math.min(maxTime, currentTime + 1))}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1f2334] transition-colors"
              title="Maju 1 detik"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Timecode display */}
          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-300 bg-[#171a28] px-2.5 py-1 rounded-md border border-[#23273c]">
            <span className="text-purple-400 font-bold">{formatTimecode(currentTime)}</span>
            <span className="text-slate-400">/</span>
            <span>{formatTimecode(totalDuration)}</span>
          </div>

          <div className="h-4 w-px bg-[#262a3d] mx-1" />

          {/* CapCut Tools: Split, Delete, Duplicate */}
          <div className="flex items-center gap-1">
            <button
              onClick={onSplitClip}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#191c2b] hover:bg-purple-600/30 hover:text-purple-300 text-slate-300 text-xs font-medium border border-[#272b3e] transition-colors"
              title="Bagi Klip di Posisi Playhead (Split ✂️)"
            >
              <Scissors className="w-3.5 h-3.5 text-purple-400" />
              <span>Bagi (Split)</span>
            </button>

            <button
              onClick={() => activeClipId && onDeleteClip(activeClipId)}
              disabled={!activeClipId || clips.length <= 1}
              className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 transition-colors"
              title="Hapus Klip Terpilih"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => activeClipId && onDuplicateClip(activeClipId)}
              disabled={!activeClipId}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#202436] disabled:opacity-30 transition-colors"
              title="Duplikat Klip"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Speed Presets */}
          {activeClip && (
            <div className="flex items-center gap-1 bg-[#171a28] px-2 py-0.5 rounded-md border border-[#25293d]">
              <Gauge className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] text-slate-400 font-semibold mr-1">Kecepatan:</span>
              {[0.75, 1.0, 1.25, 1.5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => onChangeSpeed(activeClip.id, spd)}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold transition-colors ${
                    activeClip.speed === spd
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-[#202436]'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Timeline Zoom */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPixelsPerSecond(prev => Math.max(12, prev - 4))}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1f2334] transition-colors"
            title="Zoom Out Timeline"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-slate-400">{pixelsPerSecond}px/s</span>
          <button
            onClick={() => setPixelsPerSecond(prev => Math.min(60, prev + 6))}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1f2334] transition-colors"
            title="Zoom In Timeline"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setPixelsPerSecond(24)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1f2334] transition-colors"
            title="Reset Zoom"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Multi-Track Workspace with Horizontal Scroll */}
      <div 
        ref={timelineContainerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden relative flex"
      >
        {/* Track Headers (Fixed Left 180px) */}
        <div className="w-[180px] shrink-0 border-r border-[#1c1f2e] bg-[#10121d] z-20 flex flex-col shadow-md">
          {/* Ruler Label Header */}
          <div className="h-7 border-b border-[#1c1f2e] flex items-center px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Jalur / Tracks
          </div>

          {/* Track 1: Video Label */}
          <div className="h-14 border-b border-[#1c1f2e] px-3 flex items-center justify-between text-xs font-semibold text-slate-300 bg-[#121422]">
            <span className="flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-purple-400" />
              <span>Video Utama</span>
            </span>
            <span className="text-[10px] font-mono text-purple-400/80 bg-purple-500/10 px-1 rounded">
              {clips.length} Klip
            </span>
          </div>

          {/* Track 2: Subtitle Label */}
          <div className="h-12 border-b border-[#1c1f2e] px-3 flex items-center justify-between text-xs font-semibold text-slate-300 bg-[#121422]">
            <span className="flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-yellow-400" />
              <span>Auto Captions</span>
            </span>
            <span className="text-[10px] font-mono text-yellow-400/80 bg-yellow-500/10 px-1 rounded">
              {captions.length} Teks
            </span>
          </div>

          {/* Track 3: BGM & Audio Label */}
          <div className="h-14 border-b border-[#1c1f2e] px-3 flex items-center justify-between text-xs font-semibold text-slate-300 bg-[#121422]">
            <span className="flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-emerald-400" />
              <span>BGM & SFX</span>
            </span>
            {audioTracks[0] && (
              <button
                onClick={() => onToggleTrackMute(audioTracks[0].id)}
                className={`p-1 rounded ${audioTracks[0].isMuted ? 'text-red-400 bg-red-500/10' : 'text-slate-400 hover:text-white'}`}
                title="Mute / Unmute BGM"
              >
                {audioTracks[0].isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>

        {/* Timeline Tracks Area */}
        <div 
          className="relative flex-1 bg-[#0c0d14]"
          style={{ width: `${timelineWidth}px` }}
        >
          {/* Time Ruler (Seconds markers & click to seek) */}
          <div 
            onMouseDown={handleRulerMouseDown}
            className="h-7 border-b border-[#1c1f2e] relative cursor-pointer timeline-second-markers bg-[#10121d]"
          >
            {Array.from({ length: Math.ceil(maxTime / 2) }).map((_, idx) => {
              const sec = idx * 2;
              const leftPx = sec * pixelsPerSecond;
              return (
                <div
                  key={sec}
                  style={{ left: `${leftPx}px` }}
                  className="absolute top-0 bottom-0 flex flex-col justify-between pointer-events-none"
                >
                  <span className="text-[9px] font-mono text-slate-400 pl-1">
                    {sec % 60 === 0 && sec > 0 ? `${sec / 60}m` : `${sec}s`}
                  </span>
                  <div className="h-1.5 w-px bg-slate-600" />
                </div>
              );
            })}
          </div>

          {/* Red Playhead Indicator with Diamond Scrubber */}
          <div
            style={{
              left: `${currentTime * pixelsPerSecond}px`,
            }}
            className="absolute top-0 bottom-0 w-px bg-red-500 z-30 pointer-events-none"
          >
            <div className="w-3.5 h-3.5 -ml-[6px] -mt-0.5 bg-red-500 rotate-45 rounded-xs shadow-md shadow-red-500/50" />
          </div>

          {/* Track 1: Main Video Clips Container */}
          <div className="h-14 border-b border-[#1c1f2e] relative timeline-track-grid flex items-center p-1">
            {clips.map((clip, index) => {
              const clipDuration = clip.endTime - clip.startTime;
              const clipWidth = Math.max(30, clipDuration * pixelsPerSecond);
              const isSelected = activeClipId === clip.id;

              return (
                <React.Fragment key={clip.id}>
                  {/* Clip Block */}
                  <div
                    onClick={() => onSelectClip(clip.id)}
                    style={{ width: `${clipWidth}px` }}
                    className={`h-full relative rounded-lg border flex flex-col justify-between p-1.5 cursor-pointer transition-all overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-900/80 to-indigo-900/80 border-purple-400 ring-2 ring-purple-500/40 shadow-lg'
                        : 'bg-[#181b2a] hover:bg-[#1d2134] border-[#292e45]'
                    }`}
                  >
                    {/* Left Trim Handle */}
                    <div
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setTrimmingState({
                          clipId: clip.id,
                          edge: 'start',
                          startX: e.clientX,
                          initialVal: clip.startTime,
                        });
                      }}
                      className="absolute top-0 bottom-0 left-0 w-2 hover:w-3 bg-purple-500/50 hover:bg-purple-400 cursor-ew-resize transition-all z-10"
                      title="Tarik untuk memotong awal klip"
                    />

                    {/* Clip Info */}
                    <div className="flex items-center justify-between text-[11px] font-bold text-white z-0 pl-1.5 pr-1.5">
                      <span className="truncate">{clip.name}</span>
                      <span className="text-[9px] font-mono font-normal text-purple-300 bg-purple-500/20 px-1 rounded">
                        {clipDuration.toFixed(1)}s
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[9px] text-slate-400 z-0 pl-1.5">
                      {clip.speed !== 1.0 && (
                        <span className="text-cyan-400 font-mono font-bold">{clip.speed}x</span>
                      )}
                      {clip.filter !== 'none' && (
                        <span className="text-amber-400">FX: {clip.filter}</span>
                      )}
                    </div>

                    {/* Right Trim Handle */}
                    <div
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setTrimmingState({
                          clipId: clip.id,
                          edge: 'end',
                          startX: e.clientX,
                          initialVal: clip.endTime,
                        });
                      }}
                      className="absolute top-0 bottom-0 right-0 w-2 hover:w-3 bg-purple-500/50 hover:bg-purple-400 cursor-ew-resize transition-all z-10"
                      title="Tarik untuk memotong akhir klip"
                    />
                  </div>

                  {/* Transition Icon between clips */}
                  {index < clips.length - 1 && (
                    <button
                      onClick={() => {
                        const nextTrans = clip.transitionIn === 'flash' ? 'dissolve' : clip.transitionIn === 'dissolve' ? 'zoom' : 'flash';
                        onChangeTransition(clip.id, nextTrans);
                      }}
                      className="mx-0.5 z-10 w-4 h-6 rounded bg-purple-600/80 hover:bg-purple-500 text-[9px] text-white flex items-center justify-center shadow transition-colors"
                      title={`Transisi: ${clip.transitionIn || 'none'}. Klik untuk ubah`}
                    >
                      ⚡
                    </button>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Track 2: Subtitles & Captions Track */}
          <div className="h-12 border-b border-[#1c1f2e] relative timeline-track-grid flex items-center p-1">
            {captions.map((cap) => {
              const capStart = cap.start;
              const capDur = cap.end - cap.start;
              const leftPx = capStart * pixelsPerSecond;
              const widthPx = Math.max(30, capDur * pixelsPerSecond);
              const isSelected = activeCaptionId === cap.id;

              return (
                <div
                  key={cap.id}
                  onClick={() => {
                    onSelectCaption(cap.id);
                    onSeek(cap.start);
                  }}
                  style={{
                    left: `${leftPx}px`,
                    width: `${widthPx}px`,
                  }}
                  className={`absolute h-8 rounded-md border flex items-center px-2 cursor-pointer transition-all overflow-hidden ${
                    isSelected
                      ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 ring-1 ring-yellow-400/50 shadow-md'
                      : 'bg-[#1e1b12] hover:bg-[#282315] border-yellow-500/40 text-yellow-100'
                  }`}
                  title={cap.text}
                >
                  <span className="text-[10px] font-medium truncate flex-1">
                    "{cap.text}"
                  </span>
                </div>
              );
            })}
          </div>

          {/* Track 3: BGM & SFX Waveform Track */}
          <div className="h-14 border-b border-[#1c1f2e] relative timeline-track-grid flex items-center p-1">
            {audioTracks.map((track) => {
              return (
                <div
                  key={track.id}
                  style={{ width: `${timelineWidth}px` }}
                  className="h-full relative rounded-lg border border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between px-3 overflow-hidden"
                >
                  {/* Simulated Waveform Visual */}
                  <div className="absolute inset-0 flex items-center justify-around opacity-30 pointer-events-none">
                    {Array.from({ length: 48 }).map((_, idx) => (
                      <div
                        key={idx}
                        style={{ height: `${20 + (idx % 7) * 8}%` }}
                        className="w-1 bg-emerald-400 rounded-full"
                      />
                    ))}
                  </div>

                  <div className="relative z-10 flex items-center gap-2">
                    <span className="text-[11px] font-bold text-emerald-300">
                      🎵 {track.name}
                    </span>
                    {track.duckingEnabled && (
                      <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        🦆 Audio Ducking ON
                      </span>
                    )}
                  </div>

                  {/* Volume Slider */}
                  <div className="relative z-10 flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">{track.volume}%</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={track.volume}
                      onChange={(e) => onChangeTrackVolume(track.id, parseInt(e.target.value, 10))}
                      className="w-16 h-1 accent-emerald-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
