/**
 * Procedural Web Audio Sound Engine for Dream League 3D
 * Generates realistic referee whistles, ball kicks, net swishes, post pings,
 * and dynamic stadium crowd chants without any external audio files.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private crowdNode: AudioNode | null = null;
  private crowdGain: GainNode | null = null;
  private crowdFilter: BiquadFilterNode | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isCrowdActive: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.isMuted = !enabled;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(enabled ? 0.8 : 0, this.ctx.currentTime, 0.05);
    }
  }

  public setVolumes(sfxVol: number, crowdVol: number) {
    this.initContext();
    if (!this.ctx) return;
    if (this.sfxGain) {
      this.sfxGain.gain.setTargetAtTime(Math.max(0, Math.min(1, sfxVol)), this.ctx.currentTime, 0.05);
    }
    if (this.crowdGain) {
      this.crowdGain.gain.setTargetAtTime(Math.max(0, Math.min(1, crowdVol * 0.4)), this.ctx.currentTime, 0.1);
    }
  }

  public startCrowdAmbience() {
    this.initContext();
    if (!this.ctx || this.isCrowdActive) return;

    try {
      // Procedural pink noise generator for authentic stadium roar/murmur
      const bufferSize = this.ctx.sampleRate * 3;
      const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
      
      for (let channel = 0; channel < 2; channel++) {
        const data = buffer.getChannelData(channel);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
          b6 = white * 0.115926;
        }
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      this.crowdFilter = this.ctx.createBiquadFilter();
      this.crowdFilter.type = 'lowpass';
      this.crowdFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
      this.crowdFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

      this.crowdGain = this.ctx.createGain();
      this.crowdGain.gain.setValueAtTime(0.22, this.ctx.currentTime);

      noiseSource.connect(this.crowdFilter);
      this.crowdFilter.connect(this.crowdGain);
      if (this.masterGain) {
        this.crowdGain.connect(this.masterGain);
      }

      noiseSource.start();
      this.crowdNode = noiseSource;
      this.isCrowdActive = true;
    } catch {
      // Audio context may require user interaction
    }
  }

  public modulateCrowdExcitement(dangerLevel: number) {
    // 0 = calm midfield, 1 = in penalty area about to shoot
    if (!this.ctx || !this.crowdFilter || !this.crowdGain) return;
    const clamped = Math.max(0, Math.min(1, dangerLevel));
    const targetFreq = 400 + clamped * 850;
    const targetGain = 0.2 + clamped * 0.25;

    this.crowdFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.25);
    this.crowdGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.25);
  }

  public playWhistle(type: 'single' | 'double' | 'triple' = 'single') {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const playBurst = (startTime: number, duration: number) => {
      if (!this.ctx) return;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      // Dual resonant frequencies matching traditional metal pea whistle
      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(2850, startTime);
      osc2.frequency.setValueAtTime(3200, startTime);

      // Rapid tremolo flutter
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(26, startTime);
      lfoGain.gain.setValueAtTime(120, startTime);
      lfo.connect(osc1.frequency);
      lfo.connect(osc2.frequency);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.25, startTime + 0.03);
      gain.gain.setValueAtTime(0.25, startTime + duration - 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      if (this.sfxGain) gain.connect(this.sfxGain);

      lfo.start(startTime);
      osc1.start(startTime);
      osc2.start(startTime);
      lfo.stop(startTime + duration);
      osc1.stop(startTime + duration);
      osc2.stop(startTime + duration);
    };

    const now = this.ctx.currentTime;
    if (type === 'single') {
      playBurst(now, 0.45);
    } else if (type === 'double') {
      playBurst(now, 0.25);
      playBurst(now + 0.32, 0.4);
    } else {
      playBurst(now, 0.22);
      playBurst(now + 0.28, 0.22);
      playBurst(now + 0.56, 0.65);
    }
  }

  public playKick(power: number = 0.5) {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Fast downward pitch thud characteristic of striking leather football
    const baseFreq = 160 + power * 60;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.12);

    const hitGain = 0.3 + power * 0.45;
    gain.gain.setValueAtTime(hitGain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    if (this.sfxGain) gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);

    // Subtle grass contact noise click
    const noiseLen = 0.03;
    const noiseBuf = this.ctx.createBuffer(1, this.ctx.sampleRate * noiseLen, this.ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuf;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.15, now);
    noise.connect(noiseGain);
    if (this.sfxGain) noiseGain.connect(this.sfxGain);
    noise.start(now);
  }

  public playGoalNet() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Multi-staged white noise burst through bandpass filter for authentic net swish
    const dur = 0.35;
    const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * dur), this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / data.length) * Math.PI);
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(650, now + dur);
    filter.Q.setValueAtTime(2.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    src.connect(filter);
    filter.connect(gain);
    if (this.sfxGain) gain.connect(this.sfxGain);

    src.start(now);
  }

  public playPostHit() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(940, now);
    osc2.frequency.setValueAtTime(1420, now);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc1.connect(gain);
    osc2.connect(gain);
    if (this.sfxGain) gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.7);
    osc2.stop(now + 0.7);
  }

  public playGoalCelebration() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Huge crowd explosion + stadium air horn / celebratory fan chords
    if (this.crowdGain && this.crowdFilter) {
      this.crowdFilter.frequency.setValueAtTime(1800, now);
      this.crowdGain.gain.setValueAtTime(0.65, now);
      this.crowdGain.gain.exponentialRampToValueAtTime(0.25, now + 4.5);
    }

    // Celebratory brass-like triad chords (F major: F4, A4, C5, F5)
    const notes = [349.23, 440.0, 523.25, 698.46];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);

      g.gain.setValueAtTime(0.001, now + idx * 0.08);
      g.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      osc.connect(filter);
      filter.connect(g);
      if (this.sfxGain) g.connect(this.sfxGain);

      osc.start(now + idx * 0.08);
      osc.stop(now + 2.0);
    });
  }

  public playUiClick() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(750, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.04);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    if (this.sfxGain) gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export const soundEngine = new SoundEngine();
