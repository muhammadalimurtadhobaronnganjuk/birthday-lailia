// Audio Manager for Birthday Microsite
// Background Music: Shape of My Heart (Westlife)
// Autoplay with seamless user gesture fallback
// Interactive sound effects via Web Audio API

class AudioManager {
  constructor() {
    this.bgm = new Audio('/assets/reff-shape-of-myheart.mpeg');
    this.bgm.loop = true;
    this.bgm.volume = 0.55;
    this.bgm.preload = 'auto';

    this.ctx = null;
    this.sfxGain = null;
    this.hasUserInteracted = false;
    this.isBgmStarted = false;

    this.setupAutoplay();
  }

  initSfxContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
        this.sfxGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setupAutoplay() {
    const startAudio = () => {
      this.initSfxContext();
      if (!this.isBgmStarted) {
        const promise = this.bgm.play();
        if (promise !== undefined) {
          promise
            .then(() => {
              this.isBgmStarted = true;
              this.cleanupListeners();
            })
            .catch(() => {
              // Autoplay policy prevented immediate playback; listeners will retry on first touch/click/scroll
            });
        }
      }
    };

    this.gestureHandler = () => {
      startAudio();
    };

    // Try immediately on load
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      startAudio();
    } else {
      window.addEventListener('DOMContentLoaded', startAudio);
      window.addEventListener('load', startAudio);
    }

    // Attach one-time listeners for first user gesture if blocked initially
    const events = ['click', 'touchstart', 'scroll', 'keydown', 'pointerdown'];
    events.forEach(evt => {
      window.addEventListener(evt, this.gestureHandler, { passive: true });
      document.addEventListener(evt, this.gestureHandler, { passive: true });
    });
  }

  cleanupListeners() {
    if (this.gestureHandler) {
      const events = ['click', 'touchstart', 'scroll', 'keydown', 'pointerdown'];
      events.forEach(evt => {
        window.removeEventListener(evt, this.gestureHandler);
        document.removeEventListener(evt, this.gestureHandler);
      });
    }
  }

  // SFX: Candle blow (whoosh breath sound)
  playCandleBlow() {
    this.initSfxContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.6);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.6);
  }

  // SFX: Celebratory fanfare & chime
  playCelebration() {
    this.initSfxContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.07);

      gain.gain.setValueAtTime(0.01, now + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.25, now + i * 0.07 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.9);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 1.0);
    });
  }

  // SFX: Cute pop sound for cards & buttons
  playPop() {
    this.initSfxContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }
}

window.soundEngine = new AudioManager();
