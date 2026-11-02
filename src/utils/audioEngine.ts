/**
 * Web Audio Engine for ClipCraft
 * Generates dynamic royalty-free BGM loops, UI SFX, and real-time Audio Ducking
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isPlayingBgm = false;
  private currentGenre: string = 'none';
  private duckInterval: number | null = null;
  private loopTimer: number | null = null;

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getContext(): AudioContext | null {
    this.init();
    return this.ctx;
  }

  public getDestination(): AudioNode | null {
    this.init();
    return this.masterGain;
  }

  // CapCut-style Real-time Audio Ducking
  public applyAudioDucking(isSpeaking: boolean, duckLevel: number = 0.2, normalVolume: number = 0.5) {
    if (!this.ctx || !this.bgmGain) return;
    const now = this.ctx.currentTime;
    const targetGain = isSpeaking ? Math.max(0.05, duckLevel * normalVolume) : normalVolume;

    // Smooth gain transition (50ms attack, 200ms decay)
    this.bgmGain.gain.cancelScheduledValues(now);
    this.bgmGain.gain.setTargetAtTime(targetGain, now, isSpeaking ? 0.05 : 0.25);
  }

  public setBgmVolume(volume: number) { // 0 - 100
    if (!this.ctx || !this.bgmGain) return;
    const norm = Math.max(0, Math.min(1, volume / 100));
    this.bgmGain.gain.setTargetAtTime(norm, this.ctx.currentTime, 0.05);
  }

  public playSFX(type: 'whoosh' | 'pop' | 'ding' | 'boom' | 'camera' | 'glitch') {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    switch (type) {
      case 'pop': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }

      case 'whoosh': {
        const bufferSize = this.ctx.sampleRate * 0.25;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(2400, now + 0.15);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.25);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start(now);
        break;
      }

      case 'ding': {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(1046.5, now); // C6
        osc2.frequency.setValueAtTime(2093, now);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.masterGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.4);
        osc2.stop(now + 0.4);
        break;
      }

      case 'boom': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);

        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.6);
        break;
      }

      case 'camera': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1800, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }

      case 'glitch': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.setValueAtTime(180, now + 0.03);
        osc.frequency.setValueAtTime(450, now + 0.06);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }
    }
  }

  // Play synthesized thematic BGM loops
  public playBgm(genre: 'energetic-phonk' | 'suspense-drone' | 'lofi-chill' | 'upbeat-tech') {
    this.init();
    if (!this.ctx || !this.bgmGain) return;

    if (this.isPlayingBgm && this.currentGenre === genre) return;
    this.stopBgm();

    this.isPlayingBgm = true;
    this.currentGenre = genre;

    // Pattern scheduler
    const scheduleLoop = () => {
      if (!this.isPlayingBgm || !this.ctx || !this.bgmGain) return;

      const now = this.ctx.currentTime;
      const bpm = genre === 'energetic-phonk' ? 140 : genre === 'upbeat-tech' ? 124 : genre === 'lofi-chill' ? 82 : 90;
      const beatLen = 60 / bpm;

      if (genre === 'energetic-phonk') {
        // Heavy bass 808 glide & punchy percussion
        const notes = [45, 45, 48, 52, 45, 43, 45, 55];
        notes.forEach((midi, idx) => {
          const t = now + idx * (beatLen / 2);
          const osc = this.ctx!.createOscillator();
          const g = this.ctx!.createGain();
          const freq = 440 * Math.pow(2, (midi - 69) / 12);

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq * 1.5, t);
          osc.frequency.exponentialRampToValueAtTime(freq, t + 0.08);

          g.gain.setValueAtTime(0.3, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + beatLen * 0.45);

          osc.connect(g);
          g.connect(this.bgmGain!);
          osc.start(t);
          osc.stop(t + beatLen * 0.45);
        });
      } else if (genre === 'lofi-chill') {
        // Warm Rhodes-style 7th chords
        const chords = [
          [261.63, 329.63, 392.00, 493.88], // Cmaj7
          [220.00, 261.63, 329.63, 392.00], // Am7
        ];
        const chord = chords[Math.floor(Math.random() * chords.length)];
        chord.forEach(freq => {
          const osc = this.ctx!.createOscillator();
          const g = this.ctx!.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          g.gain.setValueAtTime(0.08, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + beatLen * 3.8);

          osc.connect(g);
          g.connect(this.bgmGain!);
          osc.start(now);
          osc.stop(now + beatLen * 4);
        });
      } else if (genre === 'upbeat-tech') {
        // Arpeggiated tech synth
        const arp = [330, 392, 493.88, 587.33, 659.25, 493.88];
        arp.forEach((freq, idx) => {
          const t = now + idx * (beatLen / 2);
          const osc = this.ctx!.createOscillator();
          const g = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);

          g.gain.setValueAtTime(0.12, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

          osc.connect(g);
          g.connect(this.bgmGain!);
          osc.start(t);
          osc.stop(t + 0.18);
        });
      } else {
        // Suspense drone
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(55, now);
        osc.frequency.linearRampToValueAtTime(58, now + 3);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(250, now);

        g.gain.setValueAtTime(0.18, now);
        g.gain.linearRampToValueAtTime(0.01, now + 3.8);

        osc.connect(filter);
        filter.connect(g);
        g.connect(this.bgmGain);
        osc.start(now);
        osc.stop(now + 4);
      }

      const loopTimeMs = genre === 'energetic-phonk' ? (beatLen * 4 * 1000) : (beatLen * 4 * 1000);
      this.loopTimer = window.setTimeout(scheduleLoop, loopTimeMs);
    };

    scheduleLoop();
  }

  public stopBgm() {
    this.isPlayingBgm = false;
    this.currentGenre = 'none';
    if (this.loopTimer) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
  }
}

export const audioEngine = new AudioEngine();
