export type AspectRatio = '9:16' | '16:9' | '1:1' | '4:5';

export type ReframeMode = 'center-speaker' | 'split-podcast' | 'fit-blur' | 'fill-crop';

export type CaptionStyle = 'hormozi-yellow' | 'karaoke-pop' | 'neon-cyber' | 'cinematic-minimal' | 'red-marker';

export type TransitionType = 'none' | 'dissolve' | 'flash' | 'zoom' | 'whip-left' | 'glitch';

export type FilterPreset = 'none' | 'cinematic' | 'vibrant' | 'teal-orange' | 'noir' | 'warm-sunset';

export interface SubtitleWord {
  word: string;
  start: number; // in seconds
  end: number;
}

export interface CaptionSegment {
  id: string;
  start: number;
  end: number;
  text: string;
  words: SubtitleWord[];
  style: CaptionStyle;
  positionY: number; // percentage from top (e.g., 75)
  fontSize: number; // px (e.g., 28)
  isUppercase: boolean;
  highlightColor: string; // e.g. '#FFDE00'
}

export interface VideoClip {
  id: string;
  name: string;
  src: string;
  startTime: number; // in source video (seconds)
  endTime: number; // in source video (seconds)
  volume: number; // 0 - 100
  speed: number; // 0.5 - 2.0
  filter: FilterPreset;
  transitionIn: TransitionType;
  transitionDuration: number; // seconds
  zoomPunch: boolean;
  reframeMode: ReframeMode;
  faceTrackOffset: number; // -50% to +50% horizontal center
}

export interface AudioTrack {
  id: string;
  name: string;
  genre: 'energetic-phonk' | 'suspense-drone' | 'lofi-chill' | 'upbeat-tech' | 'custom';
  volume: number; // 0 - 100
  isMuted: boolean;
  duckingEnabled: boolean; // Auto ducks when speech is active!
  duckingLevel: number; // 0.1 to 0.4 volume during voice
}

export interface OverlayElement {
  id: string;
  type: 'progress-bar' | 'sticker' | 'watermark' | 'lower-third';
  text?: string;
  icon?: string;
  x: number; // %
  y: number; // %
  width: number; // %
  height: number; // %
  start: number;
  end: number;
  color?: string;
}

export interface HighlightClip {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  viralScore: number; // 80 - 100
  hookText: string;
  rationale: string;
  recommendedBgm: 'energetic-phonk' | 'suspense-drone' | 'lofi-chill' | 'upbeat-tech';
  captionStyle: CaptionStyle;
  autoCropReframe: ReframeMode;
}

export interface ProjectState {
  title: string;
  sourceVideoUrl: string;
  sourceVideoDuration: number;
  activeRatio: AspectRatio;
  reframeMode: ReframeMode;
  clips: VideoClip[];
  captions: CaptionSegment[];
  audioTracks: AudioTrack[];
  overlays: OverlayElement[];
  currentTime: number; // current timeline playhead (seconds)
  isPlaying: boolean;
  activeClipId: string | null;
  activeCaptionId: string | null;
  zoomLevel: number; // pixels per second on timeline
  history: ProjectSnapshot[];
  historyIndex: number;
}

export interface ProjectSnapshot {
  timestamp: number;
  clips: VideoClip[];
  captions: CaptionSegment[];
  audioTracks: AudioTrack[];
  description: string;
}

export interface SampleVideoOption {
  id: string;
  title: string;
  category: string;
  duration: number;
  thumbnail: string;
  videoUrl: string;
  description: string;
  highlights: HighlightClip[];
  captions: CaptionSegment[];
}
