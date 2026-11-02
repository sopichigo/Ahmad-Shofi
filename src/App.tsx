import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { VideoCanvas } from './components/Editor/VideoCanvas';
import { Timeline } from './components/Editor/Timeline';
import { InspectorPanel } from './components/Editor/InspectorPanel';
import { AIHighlightFinder } from './components/AIHighlightFinder';
import { ExportModal } from './components/ExportModal';
import { SAMPLE_VIDEOS } from './utils/sampleData';
import { audioEngine } from './utils/audioEngine';
import { 
  AspectRatio, 
  CaptionSegment, 
  CaptionStyle, 
  FilterPreset, 
  HighlightClip, 
  ProjectSnapshot, 
  ReframeMode, 
  SampleVideoOption, 
  TransitionType, 
  VideoClip,
  AudioTrack
} from './types/editor';

export default function App() {
  const defaultSample = SAMPLE_VIDEOS[0];
  const defaultHighlight = defaultSample.highlights[0];

  // Core Project State
  const [projectTitle, setProjectTitle] = useState('🔥 Kunci Utama Retensi 95%: Hook 3 Detik Pertama');
  const [videoSrc, setVideoSrc] = useState(defaultSample.videoUrl);
  const [sourceDuration, setSourceDuration] = useState(defaultSample.duration);
  const [activeRatio, setActiveRatio] = useState<AspectRatio>('9:16');
  const [reframeMode, setReframeMode] = useState<ReframeMode>('center-speaker');

  // Video Clips Track
  const [clips, setClips] = useState<VideoClip[]>([
    {
      id: 'clip-1',
      name: 'Hook 3 Detik Pembuka',
      src: defaultSample.videoUrl,
      startTime: defaultHighlight.startTime,
      endTime: defaultHighlight.endTime,
      volume: 100,
      speed: 1.0,
      filter: 'none',
      transitionIn: 'flash',
      transitionDuration: 0.3,
      zoomPunch: false,
      reframeMode: 'center-speaker',
      faceTrackOffset: 0,
    },
  ]);

  // Captions Track
  const [captions, setCaptions] = useState<CaptionSegment[]>(defaultSample.captions);
  const [activeCaptionStyle, setActiveCaptionStyle] = useState<CaptionStyle>('hormozi-yellow');
  const [captionColor, setCaptionColor] = useState('#FFDE00');

  // Audio / BGM Track & Audio Ducking
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([
    {
      id: 'track-bgm-1',
      name: 'Energetic Phonk TikTok Beat',
      genre: 'energetic-phonk',
      volume: 40,
      isMuted: false,
      duckingEnabled: true,
      duckingLevel: 0.18,
    },
  ]);
  const [audioDuckingEnabled, setAudioDuckingEnabled] = useState(true);
  const [activeBgmGenre, setActiveBgmGenre] = useState<any>('energetic-phonk');

  // Visual FX & Transitions
  const [activeFilter, setActiveFilter] = useState<FilterPreset>('none');
  const [activeTransition, setActiveTransition] = useState<TransitionType>('flash');

  // Playhead & Selection
  const [currentTime, setCurrentTime] = useState(defaultHighlight.startTime);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeClipId, setActiveClipId] = useState<string | null>('clip-1');
  const [activeCaptionId, setActiveCaptionId] = useState<string | null>(null);

  // Inspector & Modals
  const [inspectorTab, setInspectorTab] = useState('copilot');
  const [isHighlightFinderOpen, setIsHighlightFinderOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Undo / Redo History Stack
  const [history, setHistory] = useState<ProjectSnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Push snapshot to history
  const pushHistory = useCallback((description: string) => {
    const snapshot: ProjectSnapshot = {
      timestamp: Date.now(),
      clips: JSON.parse(JSON.stringify(clips)),
      captions: JSON.parse(JSON.stringify(captions)),
      audioTracks: JSON.parse(JSON.stringify(audioTracks)),
      description,
    };
    setHistory(prev => {
      const updated = prev.slice(0, historyIndex + 1);
      return [...updated, snapshot];
    });
    setHistoryIndex(prev => prev + 1);
  }, [clips, captions, audioTracks, historyIndex]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevSnapshot = history[historyIndex - 1];
      setClips(JSON.parse(JSON.stringify(prevSnapshot.clips)));
      setCaptions(JSON.parse(JSON.stringify(prevSnapshot.captions)));
      setAudioTracks(JSON.parse(JSON.stringify(prevSnapshot.audioTracks)));
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextSnapshot = history[historyIndex + 1];
      setClips(JSON.parse(JSON.stringify(nextSnapshot.clips)));
      setCaptions(JSON.parse(JSON.stringify(nextSnapshot.captions)));
      setAudioTracks(JSON.parse(JSON.stringify(nextSnapshot.audioTracks)));
      setHistoryIndex(historyIndex + 1);
    }
  };

  const activeClip = clips.find(c => c.id === activeClipId) || clips[0] || null;

  // Total clip duration on timeline
  const totalClipDuration = clips.reduce((acc, c) => acc + (c.endTime - c.startTime), 0);

  // Audio Ducking Loop & Sync Video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const t = video.currentTime;
      setCurrentTime(t);

      // Loop current clip if it reaches the end
      if (activeClip && t >= activeClip.endTime) {
        video.currentTime = activeClip.startTime;
        setCurrentTime(activeClip.startTime);
      }

      // Check if current playhead overlaps with speaking subtitles
      if (audioDuckingEnabled) {
        const isSpeaking = captions.some(cap => t >= cap.start && t <= cap.end);
        const activeTrack = audioTracks[0];
        const normalVol = (activeTrack?.volume || 40) / 100;
        audioEngine.applyAudioDucking(isSpeaking, activeTrack?.duckingLevel || 0.2, normalVol);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [activeClip, audioDuckingEnabled, captions, audioTracks]);

  // Handle Play/Pause
  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      audioEngine.stopBgm();
    } else {
      audioEngine.init();
      video.play().catch(console.error);
      setIsPlaying(true);
      if (activeBgmGenre !== 'none') {
        audioEngine.playBgm(activeBgmGenre);
      }
    }
  };

  // Seek playhead
  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // Keyboard Shortcuts (Space to play/pause, Ctrl+Z to undo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key.toLowerCase() === 'b' || e.key.toLowerCase() === 's') {
        handleSplitClip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, historyIndex, history]);

  // CapCut Split Tool (Scissors ✂️)
  const handleSplitClip = () => {
    if (!activeClip) return;
    if (currentTime <= activeClip.startTime + 0.5 || currentTime >= activeClip.endTime - 0.5) {
      return; // Too close to edge to split
    }

    pushHistory('Split klip video');
    audioEngine.playSFX('whoosh');

    const clip1: VideoClip = {
      ...activeClip,
      endTime: currentTime,
    };

    const clip2: VideoClip = {
      ...activeClip,
      id: `clip-${Date.now()}`,
      name: `${activeClip.name} (Bagian 2)`,
      startTime: currentTime,
      transitionIn: 'flash',
    };

    const clipIndex = clips.findIndex(c => c.id === activeClip.id);
    const updated = [...clips];
    updated.splice(clipIndex, 1, clip1, clip2);
    setClips(updated);
    setActiveClipId(clip2.id);
  };

  // Delete Clip
  const handleDeleteClip = (clipId: string) => {
    if (clips.length <= 1) return;
    pushHistory('Hapus klip');
    audioEngine.playSFX('pop');
    const updated = clips.filter(c => c.id !== clipId);
    setClips(updated);
    setActiveClipId(updated[0]?.id || null);
  };

  // Duplicate Clip
  const handleDuplicateClip = (clipId: string) => {
    const target = clips.find(c => c.id === clipId);
    if (!target) return;
    pushHistory('Duplikat klip');
    audioEngine.playSFX('pop');
    const newClip: VideoClip = {
      ...target,
      id: `clip-${Date.now()}`,
      name: `${target.name} (Copy)`,
    };
    setClips([...clips, newClip]);
  };

  // Speed Adjustment
  const handleChangeSpeed = (clipId: string, speed: number) => {
    pushHistory(`Ubah kecepatan ${speed}x`);
    setClips(clips.map(c => c.id === clipId ? { ...c, speed } : c));
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Trim Clip Boundaries
  const handleTrimClip = (clipId: string, newStart: number, newEnd: number) => {
    setClips(clips.map(c => c.id === clipId ? { ...c, startTime: newStart, endTime: newEnd } : c));
  };

  // Change Transition
  const handleChangeTransition = (clipId: string, transition: TransitionType) => {
    pushHistory(`Ganti transisi ke ${transition}`);
    audioEngine.playSFX('ding');
    setClips(clips.map(c => c.id === clipId ? { ...c, transitionIn: transition } : c));
    setActiveTransition(transition);
  };

  // Update Caption Text
  const handleUpdateCaptionText = (captionId: string, newText: string) => {
    setCaptions(captions.map(c => c.id === captionId ? { ...c, text: newText } : c));
  };

  // Update Caption Font Size
  const handleUpdateCaptionFontSize = (size: number) => {
    setCaptions(captions.map(c => ({ ...c, fontSize: size })));
  };

  // Update Caption Position
  const handleUpdateCaptionPosition = (captionIdOrY: string | number, maybeY?: number) => {
    if (typeof captionIdOrY === 'number') {
      const y = captionIdOrY;
      setCaptions(captions.map(c => ({ ...c, positionY: y })));
    } else if (maybeY !== undefined) {
      setCaptions(captions.map(c => c.id === captionIdOrY ? { ...c, positionY: maybeY } : c));
    }
  };

  // Track Audio Volume & Mute
  const handleToggleTrackMute = (trackId: string) => {
    setAudioTracks(audioTracks.map(t => {
      if (t.id === trackId) {
        const nextMuted = !t.isMuted;
        if (nextMuted) {
          audioEngine.setBgmVolume(0);
        } else {
          audioEngine.setBgmVolume(t.volume);
        }
        return { ...t, isMuted: nextMuted };
      }
      return t;
    }));
  };

  const handleChangeTrackVolume = (trackId: string, volume: number) => {
    setAudioTracks(audioTracks.map(t => t.id === trackId ? { ...t, volume } : t));
    audioEngine.setBgmVolume(volume);
  };

  // AI Revision Handler (CapCut AI Copilot)
  const handleApplyAiRevision = async (prompt: string) => {
    try {
      pushHistory(`Revisi AI: ${prompt}`);
      const res = await fetch('/api/ai/revise-clip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          currentClip: activeClip,
          settings: {
            captionStyle: activeCaptionStyle,
            reframeMode,
            filter: activeFilter,
            aspectRatio: activeRatio,
          },
        }),
      });

      const data = await res.json();
      const rev = data.revision;

      if (rev) {
        audioEngine.playSFX('ding');

        // Apply Speed
        if (rev.speedMultiplier && activeClip) {
          handleChangeSpeed(activeClip.id, rev.speedMultiplier);
        }

        // Apply Trim Intro / Outro
        if (rev.trimIntro && activeClip) {
          const newStart = Math.min(activeClip.endTime - 3, activeClip.startTime + rev.trimIntro);
          handleTrimClip(activeClip.id, newStart, activeClip.endTime);
          handleSeek(newStart);
        }

        // Apply Caption Style & Color
        if (rev.captionStyle) {
          setActiveCaptionStyle(rev.captionStyle);
        }
        if (rev.captionColor) {
          setCaptionColor(rev.captionColor);
        }

        // Apply Flash Transition
        if (rev.addWhiteFlashTransition && activeClip) {
          handleChangeTransition(activeClip.id, 'flash');
        }

        // Apply Audio Ducking
        if (rev.audioDucking !== undefined) {
          setAudioDuckingEnabled(rev.audioDucking);
        }

        // Apply Reframe Mode
        if (rev.reframeMode) {
          if (rev.reframeMode === '9:16' || rev.reframeMode === '16:9' || rev.reframeMode === '1:1') {
            setActiveRatio(rev.reframeMode);
          }
        }
      }
    } catch (err) {
      console.error('Failed to apply AI revision:', err);
    }
  };

  // Select Highlight from AI Finder
  const handleSelectHighlight = (sample: SampleVideoOption, highlight: HighlightClip) => {
    setVideoSrc(sample.videoUrl);
    setSourceDuration(sample.duration);
    setProjectTitle(highlight.title);
    setCaptions(sample.captions);

    const newClip: VideoClip = {
      id: `clip-${Date.now()}`,
      name: highlight.title,
      src: sample.videoUrl,
      startTime: highlight.startTime,
      endTime: highlight.endTime,
      volume: 100,
      speed: 1.0,
      filter: 'none',
      transitionIn: 'flash',
      transitionDuration: 0.3,
      zoomPunch: false,
      reframeMode: highlight.autoCropReframe || 'center-speaker',
      faceTrackOffset: 0,
    };

    setClips([newClip]);
    setActiveClipId(newClip.id);
    setActiveCaptionStyle(highlight.captionStyle || 'hormozi-yellow');
    setActiveBgmGenre(highlight.recommendedBgm || 'energetic-phonk');
    setReframeMode(highlight.autoCropReframe || 'center-speaker');
    handleSeek(highlight.startTime);
    audioEngine.playSFX('ding');
  };

  // Upload Custom Video
  const handleUploadCustomVideo = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setVideoSrc(objectUrl);
    setProjectTitle(file.name.replace(/\.[^/.]+$/, ''));

    const newClip: VideoClip = {
      id: `clip-custom-${Date.now()}`,
      name: file.name,
      src: objectUrl,
      startTime: 0,
      endTime: 30, // Default 30s clip
      volume: 100,
      speed: 1.0,
      filter: 'none',
      transitionIn: 'flash',
      transitionDuration: 0.3,
      zoomPunch: false,
      reframeMode: 'center-speaker',
      faceTrackOffset: 0,
    };

    setClips([newClip]);
    setActiveClipId(newClip.id);
    handleSeek(0);
    audioEngine.playSFX('ding');
  };

  return (
    <div className="h-screen w-screen bg-[#0c0d12] text-slate-100 flex flex-col overflow-hidden font-sans select-none">
      {/* Top Navigation Bar */}
      <Navbar
        title={projectTitle}
        setTitle={setProjectTitle}
        activeRatio={activeRatio}
        setActiveRatio={setActiveRatio}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenHighlightFinder={() => setIsHighlightFinderOpen(true)}
        onOpenUpload={() => setIsHighlightFinderOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        audioDuckingEnabled={audioDuckingEnabled}
        onToggleAudioDucking={() => setAudioDuckingEnabled(!audioDuckingEnabled)}
        activeTab={inspectorTab}
        setActiveTab={setInspectorTab}
      />

      {/* Main Studio Viewport: Center Video Canvas + Right Inspector Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center Canvas Viewport */}
        <VideoCanvas
          videoRef={videoRef}
          videoSrc={videoSrc}
          activeClip={activeClip}
          captions={captions}
          currentTime={currentTime}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          aspectRatio={activeRatio}
          reframeMode={reframeMode}
          activeFilter={activeFilter}
          activeCaptionStyle={activeCaptionStyle}
          captionColor={captionColor}
          onUpdateCaptionPosition={(capId, y) => handleUpdateCaptionPosition(capId, y)}
        />

        {/* Right Inspector & Tools Panel */}
        <InspectorPanel
          activeTab={inspectorTab}
          setActiveTab={setInspectorTab}
          activeClip={activeClip}
          captions={captions}
          activeCaptionStyle={activeCaptionStyle}
          setActiveCaptionStyle={setActiveCaptionStyle}
          captionColor={captionColor}
          setCaptionColor={setCaptionColor}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          activeTransition={activeTransition}
          setActiveTransition={(tr) => {
            if (activeClip) handleChangeTransition(activeClip.id, tr);
          }}
          aspectRatio={activeRatio}
          setAspectRatio={setActiveRatio}
          reframeMode={reframeMode}
          setReframeMode={setReframeMode}
          audioDuckingEnabled={audioDuckingEnabled}
          setAudioDuckingEnabled={setAudioDuckingEnabled}
          activeBgmGenre={activeBgmGenre}
          setActiveBgmGenre={setActiveBgmGenre}
          onApplyAiRevision={handleApplyAiRevision}
          onUpdateCaptionText={handleUpdateCaptionText}
          onUpdateCaptionFontSize={handleUpdateCaptionFontSize}
          onUpdateCaptionPosition={handleUpdateCaptionPosition}
        />
      </div>

      {/* Bottom CapCut Multi-Track Timeline */}
      <Timeline
        clips={clips}
        captions={captions}
        audioTracks={audioTracks}
        currentTime={currentTime}
        totalDuration={totalClipDuration}
        isPlaying={isPlaying}
        activeClipId={activeClipId}
        activeCaptionId={activeCaptionId}
        onSeek={handleSeek}
        onTogglePlay={handleTogglePlay}
        onSelectClip={setActiveClipId}
        onSelectCaption={setActiveCaptionId}
        onSplitClip={handleSplitClip}
        onDeleteClip={handleDeleteClip}
        onDuplicateClip={handleDuplicateClip}
        onChangeSpeed={handleChangeSpeed}
        onTrimClip={handleTrimClip}
        onChangeTransition={handleChangeTransition}
        onToggleTrackMute={handleToggleTrackMute}
        onChangeTrackVolume={handleChangeTrackVolume}
      />

      {/* AI Highlight Discovery Modal */}
      <AIHighlightFinder
        isOpen={isHighlightFinderOpen}
        onClose={() => setIsHighlightFinderOpen(false)}
        onSelectHighlight={handleSelectHighlight}
        onUploadCustomVideo={handleUploadCustomVideo}
      />

      {/* Video Export & Download Dialog */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        videoTitle={projectTitle}
        duration={totalClipDuration}
        aspectRatio={activeRatio}
        clips={clips}
        captions={captions}
      />
    </div>
  );
}
