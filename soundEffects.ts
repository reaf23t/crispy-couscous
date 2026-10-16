/**
 * Sound Manager for 3D Chess Game
 * Features:
 * - Victory track: /sounds/intro-uefa.mp3
 * - Defeat track: /sounds/pegue-seu-banquinho.mp3
 * - Web Audio procedural sound effects for piece moves, captures, and checks
 */

class SoundManager {
  private victoryAudio: HTMLAudioElement | null = null;
  private defeatAudio: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  public isMuted: boolean = false;
  public volume: number = 0.8;

  constructor() {
    // Lazily initialized upon first user interaction to comply with browser autoplay policies
  }

  private initAudio() {
    if (!this.victoryAudio && typeof window !== 'undefined') {
      this.victoryAudio = new Audio('/sounds/intro-uefa.mp3');
      this.victoryAudio.preload = 'auto';
    }
    if (!this.defeatAudio && typeof window !== 'undefined') {
      this.defeatAudio = new Audio('/sounds/pegue-seu-banquinho.mp3');
      this.defeatAudio.preload = 'auto';
    }
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.victoryAudio) this.victoryAudio.volume = this.volume;
    if (this.defeatAudio) this.defeatAudio.volume = this.volume;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.victoryAudio) this.victoryAudio.muted = muted;
    if (this.defeatAudio) this.defeatAudio.muted = muted;
    if (muted) {
      this.stopCelebrations();
    }
  }

  public stopCelebrations() {
    if (this.victoryAudio) {
      this.victoryAudio.pause();
      this.victoryAudio.currentTime = 0;
    }
    if (this.defeatAudio) {
      this.defeatAudio.pause();
      this.defeatAudio.currentTime = 0;
    }
  }

  /**
   * Plays the Champions League anthem intro when winning
   */
  public playVictorySound(): Promise<void> {
    if (this.isMuted) return Promise.resolve();
    this.initAudio();
    this.stopCelebrations();

    if (this.victoryAudio) {
      this.victoryAudio.volume = this.volume;
      this.victoryAudio.currentTime = 0;
      return this.victoryAudio.play().catch(err => {
        console.warn('Victory audio play error (fallback to synth):', err);
        this.playVictorySynth();
      });
    } else {
      this.playVictorySynth();
      return Promise.resolve();
    }
  }

  /**
   * Plays "Pegue seu banquinho e saia de mansinho" when losing
   */
  public playDefeatSound(): Promise<void> {
    if (this.isMuted) return Promise.resolve();
    this.initAudio();
    this.stopCelebrations();

    if (this.defeatAudio) {
      this.defeatAudio.volume = this.volume;
      this.defeatAudio.currentTime = 0;
      return this.defeatAudio.play().catch(err => {
        console.warn('Defeat audio play error (fallback to synth):', err);
        this.playDefeatSynth();
      });
    } else {
      this.playDefeatSynth();
      return Promise.resolve();
    }
  }

  /**
   * Procedural crisp wooden/marble chess move sound
   */
  public playMoveSound() {
    if (this.isMuted) return;
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

      gain.gain.setValueAtTime(0.25 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Ignore
    }
  }

  /**
   * Procedural resonant piece capture sound
   */
  public playCaptureSound() {
    if (this.isMuted) return;
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const now = this.audioCtx.currentTime;
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(440, now);
      osc1.frequency.exponentialRampToValueAtTime(110, now + 0.14);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(220, now);
      osc2.frequency.exponentialRampToValueAtTime(60, now + 0.14);

      gain.gain.setValueAtTime(0.35 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.15);
      osc2.stop(now + 0.15);
    } catch {
      // Ignore
    }
  }

  /**
   * Procedural check warning sound
   */
  public playCheckSound() {
    if (this.isMuted) return;
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5

      gain.gain.setValueAtTime(0.3 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch {
      // Ignore
    }
  }

  /**
   * Fallback synth for Victory
   */
  private playVictorySynth() {
    if (!this.audioCtx) return;
    try {
      const notes = [
        { f: 523.25, d: 0.25 },
        { f: 659.25, d: 0.25 },
        { f: 783.99, d: 0.35 },
        { f: 1046.50, d: 0.7 }
      ];
      let t = this.audioCtx.currentTime + 0.05;
      notes.forEach(n => {
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = n.f;
        gain.gain.setValueAtTime(0.2 * this.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);
        osc.connect(gain);
        gain.connect(this.audioCtx!.destination);
        osc.start(t);
        osc.stop(t + n.d);
        t += n.d + 0.05;
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Fallback synth for Defeat
   */
  private playDefeatSynth() {
    if (!this.audioCtx) return;
    try {
      const notes = [
        { f: 440.00, d: 0.3 },
        { f: 415.30, d: 0.3 },
        { f: 392.00, d: 0.4 },
        { f: 349.23, d: 0.8 }
      ];
      let t = this.audioCtx.currentTime + 0.05;
      notes.forEach(n => {
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();
        osc.type = 'triangle';
        osc.frequency.value = n.f;
        gain.gain.setValueAtTime(0.25 * this.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);
        osc.connect(gain);
        gain.connect(this.audioCtx!.destination);
        osc.start(t);
        osc.stop(t + n.d);
        t += n.d + 0.04;
      });
    } catch {
      // Ignore
    }
  }
}

export const soundManager = new SoundManager();
