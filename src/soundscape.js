class SoundscapeEngine {
  constructor() {
    this.ctx = null;
    this.active = false;
    this.mode = "off";
    this.volume = 0.3;
    this.nodes = {};
    this.audioEl = null;
    this.loading = false;
    this.statusCallbacks = [];
    this.stations = [
      { name: "REYFM #LOFI", url: "https://listen.reyfm.de/lofi_320kbps.mp3", codec: "mp3" },
      { name: "Chillhop", url: "https://streams.ilovemusic.de/iloveradio17.mp3", codec: "mp3" },
      { name: "NIA Lo-Fi", url: "https://radio.nia.nc/radio/8020/lofi-hq-stream.aac", codec: "aac" },
    ];
    this.currentStationIdx = 0;
    this.retryTimer = null;
  }

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.volume;
    this.masterGain.connect(this.ctx.destination);
  }

  onStatusChange(cb) {
    this.statusCallbacks.push(cb);
  }

  _emitStatus() {
    const state = { loading: this.loading, mode: this.mode, active: this.active };
    this.statusCallbacks.forEach(cb => cb(state));
  }

  isLoading() {
    return this.loading;
  }

  async start(mode = "lofi") {
    this.stop();
    this.mode = mode;
    if (mode === "lofi") this._startLofi();
    else if (mode === "weather") await this._startWeather();
    else { this.mode = "off"; this._emitStatus(); }
  }

  _startLofi() {
    this.init();
    if (this.ctx.state === "suspended") this.ctx.resume();
    this.active = true;
    this.loading = true;
    this._emitStatus();
    this._playStation(this.currentStationIdx);
  }

  _playStation(idx) {
    if (!this.active || this.mode !== "lofi") return;
    if (this.audioEl) { this.audioEl.pause(); this.audioEl = null; }
    const station = this.stations[idx % this.stations.length];
    this.currentStationIdx = idx % this.stations.length;
    const audio = new Audio(station.url);
    audio.volume = this.volume;
    audio.crossOrigin = "anonymous";
    audio.preload = "none";
    audio.addEventListener("canplay", () => {
      this.loading = false;
      this._emitStatus();
    }, { once: true });
    audio.addEventListener("error", () => {
      console.warn(`[Soundscape] Station ${station.name} failed, trying next...`);
      this.loading = false;
      this._emitStatus();
      this.retryTimer = setTimeout(() => this._playStation(this.currentStationIdx + 1), 2000);
    });
    audio.addEventListener("pause", () => {
      if (this.active && this.mode === "lofi" && audio.ended) {
        this.retryTimer = setTimeout(() => this._playStation(this.currentStationIdx + 1), 1000);
      }
    });
    audio.play().catch(() => {
      this.loading = false;
      this._emitStatus();
      this.retryTimer = setTimeout(() => this._playStation(this.currentStationIdx + 1), 3000);
    });
    this.audioEl = audio;
  }

  async _startWeather(type) {
    this.init();
    if (this.ctx.state === "suspended") await this.ctx.resume();
    this.active = true;
    switch (type) {
      case "rainy": this._createRain(); this._createWind(); break;
      case "stormy": this._createRain(); this._createWind(); this._createThunder(); break;
      case "snowy": this._createWind(0.15); break;
      case "clear": this._createAmbient(0.08); break;
      case "foggy": this._createWind(0.2); this._createAmbient(0.12); break;
      default: this._createWind(0.1); break;
    }
  }

  stop() {
    this.active = false;
    this.mode = "off";
    this.loading = false;
    if (this.audioEl) { this.audioEl.pause(); this.audioEl = null; }
    if (this.retryTimer) { clearTimeout(this.retryTimer); this.retryTimer = null; }
    Object.values(this.nodes).forEach(arr => {
      if (Array.isArray(arr)) arr.forEach(n => { try { n.stop?.(); n.disconnect(); } catch {} });
    });
    this.nodes = {};
    this._emitStatus();
  }

  setVolume(v) {
    this.volume = v;
    if (this.masterGain) this.masterGain.gain.value = v;
    if (this.audioEl) this.audioEl.volume = v;
  }

  skipStation() {
    if (this.mode !== "lofi" || !this.active) return;
    this._playStation(this.currentStationIdx + 1);
  }

  getCurrentStation() {
    return this.stations[this.currentStationIdx % this.stations.length];
  }

  _createNoise() {
    const bufSize = this.ctx.sampleRate * 2;
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const source = this.ctx.createBufferSource();
    source.buffer = buf;
    source.loop = true;
    return source;
  }

  _createRain(intensity = 0.4) {
    const noise = this._createNoise();
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 4000;
    filter.Q.value = 0.5;
    const gain = this.ctx.createGain();
    gain.gain.value = intensity;
    noise.connect(filter).connect(gain).connect(this.masterGain);
    noise.start();
    this.nodes.rain = [noise, filter, gain];
  }

  _createWind(intensity = 0.25) {
    const noise = this._createNoise();
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 400;
    filter.Q.value = 1;
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.1;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain).connect(filter.frequency);
    const gain = this.ctx.createGain();
    gain.gain.value = intensity;
    noise.connect(filter).connect(gain).connect(this.masterGain);
    noise.start();
    lfo.start();
    this.nodes.wind = [noise, filter, lfo, lfoGain, gain];
  }

  _createThunder() {
    const scheduleThunder = () => {
      if (!this.active) return;
      const bufSize = this.ctx.sampleRate * 1.5;
      const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        const env = Math.exp(-i / (bufSize * 0.1));
        data[i] = (Math.random() * 2 - 1) * env;
      }
      const source = this.ctx.createBufferSource();
      source.buffer = buf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 200;
      const gain = this.ctx.createGain();
      gain.gain.value = 0.6;
      source.connect(filter).connect(gain).connect(this.masterGain);
      source.start();
      this.nodes.thunder = [...(this.nodes.thunder || []), source, filter, gain];
      setTimeout(scheduleThunder, 3000 + Math.random() * 8000);
    };
    scheduleThunder();
  }

  _createAmbient(intensity = 0.1) {
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 220;
    const gain = this.ctx.createGain();
    gain.gain.value = intensity;
    osc.connect(gain).connect(this.masterGain);
    osc.start();
    this.nodes.ambient = [osc, gain];
  }
}

export const soundscape = new SoundscapeEngine();
