// Web Audio API sound synthesizer for hyper-realistic tactile page turns, paper friction, and cozy ambient soundscapes

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientSourceNodes: { [key: string]: { stop: () => void; gainNode: GainNode } } = {};
  private currentAmbient: string = 'none';
  private masterAmbientGain: GainNode | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Realistic paper peel sound when user starts lifting a page corner
  public playPagePeelSound() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Filtered fibrous friction tick
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.09);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(2800, now);
      bandpass.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
      bandpass.Q.value = 3.5;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

      noiseSource.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(this.ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + 0.09);
    } catch {}
  }

  // Realistic organic paper turn swoosh & leaf flutter
  public playPageTurnSound(intensity: number = 1) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const clampedIntensity = Math.max(0.3, Math.min(1.5, intensity));

      // 1. Aerodynamic Airy Page Whoosh
      const duration = 0.22 * clampedIntensity;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        // Modulated brownian-pink noise
        const progress = i / bufferSize;
        const envelope = Math.sin(progress * Math.PI);
        data[i] = (Math.random() * 2 - 1) * envelope;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.14 * clampedIntensity, now + duration * 0.35);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + duration);

      // 2. High-frequency paper friction / fiber rustle
      const rustleDur = 0.14;
      const rustleBuf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * rustleDur), this.ctx.sampleRate);
      const rData = rustleBuf.getChannelData(0);
      for (let i = 0; i < rData.length; i++) {
        rData[i] = (Math.random() * 2 - 1) * 0.04;
      }

      const rSource = this.ctx.createBufferSource();
      rSource.buffer = rustleBuf;

      const rFilter = this.ctx.createBiquadFilter();
      rFilter.type = 'bandpass';
      rFilter.frequency.setValueAtTime(3200, now);
      rFilter.frequency.linearRampToValueAtTime(2400, now + rustleDur);
      rFilter.Q.value = 2.0;

      const rGain = this.ctx.createGain();
      rGain.gain.setValueAtTime(0.001, now);
      rGain.gain.linearRampToValueAtTime(0.07 * clampedIntensity, now + 0.04);
      rGain.gain.exponentialRampToValueAtTime(0.001, now + rustleDur);

      rSource.connect(rFilter);
      rFilter.connect(rGain);
      rGain.connect(this.ctx.destination);

      rSource.start(now);
      rSource.stop(now + rustleDur);
    } catch {}
  }

  // Soft page landing and settling sound as page rests against opposite stack
  public playPageSettleSound() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Low frequency soft impact
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.08);

      oscGain.gain.setValueAtTime(0.08, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);

      // Light settling flutter
      const flutterDur = 0.07;
      const flutterBuf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * flutterDur), this.ctx.sampleRate);
      const fData = flutterBuf.getChannelData(0);
      for (let i = 0; i < fData.length; i++) {
        fData[i] = (Math.random() * 2 - 1) * 0.03;
      }
      const fSource = this.ctx.createBufferSource();
      fSource.buffer = flutterBuf;
      const fFilter = this.ctx.createBiquadFilter();
      fFilter.type = 'bandpass';
      fFilter.frequency.setValueAtTime(2200, now);
      fFilter.Q.value = 1.5;

      const fGain = this.ctx.createGain();
      fGain.gain.setValueAtTime(0.05, now);
      fGain.gain.exponentialRampToValueAtTime(0.001, now + flutterDur);

      fSource.connect(fFilter);
      fFilter.connect(fGain);
      fGain.connect(this.ctx.destination);
      fSource.start(now);
      fSource.stop(now + flutterDur);
    } catch {}
  }

  // Rapid leaf tick for scrubber sliding
  public playFastFlipTick() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900 + Math.random() * 300, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.025);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch {}
  }

  // Soft satin ribbon bookmark slide / flutter sound
  public playBookmarkSound() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(740, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);

      oscGain.gain.setValueAtTime(0.12, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } catch {}
  }

  // Marker highlight stroke sound
  public playHighlightSound() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.14);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.05;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.frequency.linearRampToValueAtTime(2200, now + 0.12);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + 0.14);
    } catch {}
  }

  // Deep resonant leather book opening sound
  public playBookOpenSound() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Low frequency resonant thump
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.25);

      oscGain.gain.setValueAtTime(0.2, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);

      // Followed by gentle page swoosh
      this.playPageTurnSound(0.8);
    } catch {}
  }

  // Set ambient background soundscape
  public setAmbientSound(type: 'none' | 'fireplace' | 'rain' | 'library' | 'cafe', volume: number = 0.5) {
    this.initContext();
    if (!this.ctx) return;

    this.stopAllAmbient();
    this.currentAmbient = type;

    if (type === 'none' || volume <= 0) {
      return;
    }

    if (!this.masterAmbientGain) {
      this.masterAmbientGain = this.ctx.createGain();
      this.masterAmbientGain.connect(this.ctx.destination);
    }
    this.masterAmbientGain.gain.setValueAtTime(Math.min(Math.max(volume, 0), 1), this.ctx.currentTime);

    if (type === 'rain') {
      this.startRainAmbient();
    } else if (type === 'fireplace') {
      this.startFireplaceAmbient();
    } else if (type === 'library') {
      this.startLibraryAmbient();
    } else if (type === 'cafe') {
      this.startCafeAmbient();
    }
  }

  public setAmbientVolume(volume: number) {
    if (this.masterAmbientGain && this.ctx) {
      this.masterAmbientGain.gain.setValueAtTime(Math.min(Math.max(volume, 0), 1), this.ctx.currentTime);
    }
  }

  private stopAllAmbient() {
    Object.keys(this.ambientSourceNodes).forEach((k) => {
      try {
        this.ambientSourceNodes[k].stop();
      } catch {}
    });
    this.ambientSourceNodes = {};
  }

  private createNoiseBuffer(seconds: number = 3): AudioBuffer {
    if (!this.ctx) throw new Error('No context');
    const bufferSize = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  private startRainAmbient() {
    if (!this.ctx || !this.masterAmbientGain) return;
    const noiseBuffer = this.createNoiseBuffer(4);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 1000;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.25;

    noiseSource.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(this.masterAmbientGain);

    noiseSource.start();
    this.ambientSourceNodes['rain'] = {
      stop: () => {
        noiseSource.stop();
        noiseSource.disconnect();
      },
      gainNode: gain,
    };
  }

  private startFireplaceAmbient() {
    if (!this.ctx || !this.masterAmbientGain) return;
    const noiseBuffer = this.createNoiseBuffer(3);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 450;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.3;

    noiseSource.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(this.masterAmbientGain);

    noiseSource.start();

    // Crackle interval generator
    const crackleInterval = window.setInterval(() => {
      if (!this.ctx || this.currentAmbient !== 'fireplace') {
        clearInterval(crackleInterval);
        return;
      }
      if (Math.random() > 0.4) {
        try {
          const osc = this.ctx.createOscillator();
          const popGain = this.ctx.createGain();
          const t = this.ctx.currentTime;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1200 + Math.random() * 2400, t);
          popGain.gain.setValueAtTime(0.08 + Math.random() * 0.08, t);
          popGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03 + Math.random() * 0.04);
          osc.connect(popGain);
          popGain.connect(this.masterAmbientGain!);
          osc.start(t);
          osc.stop(t + 0.08);
        } catch {}
      }
    }, 180);

    this.ambientSourceNodes['fireplace'] = {
      stop: () => {
        clearInterval(crackleInterval);
        noiseSource.stop();
        noiseSource.disconnect();
      },
      gainNode: gain,
    };
  }

  private startLibraryAmbient() {
    if (!this.ctx || !this.masterAmbientGain) return;
    const noiseBuffer = this.createNoiseBuffer(4);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 320;
    bandpass.Q.value = 0.8;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.18;

    noiseSource.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.masterAmbientGain);

    noiseSource.start();
    this.ambientSourceNodes['library'] = {
      stop: () => {
        noiseSource.stop();
        noiseSource.disconnect();
      },
      gainNode: gain,
    };
  }

  private startCafeAmbient() {
    if (!this.ctx || !this.masterAmbientGain) return;
    const noiseBuffer = this.createNoiseBuffer(4);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 650;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.22;

    noiseSource.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(this.masterAmbientGain);

    noiseSource.start();
    this.ambientSourceNodes['cafe'] = {
      stop: () => {
        noiseSource.stop();
        noiseSource.disconnect();
      },
      gainNode: gain,
    };
  }
}

export const soundEngine = new SoundEngine();

