class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.source = null;
    this.bufferSource = null;
    this.audioBuffer = null;
    this.analyser = null;
    this.gainNode = null;

    this.dataArray = null;
    this.timeArray = null;
    this.bufferLength = 0;

    this.smoothing = 0.8;
    this.fftSize = 2048;

    this.lastBeatTime = 0;
    this.beatHoldTime = 300;
    this.beatThreshold = 0.25;

    this.startTime = 0;
    this.pauseTime = 0;
    this.isPlayingFlag = false;
    this.isMic = false;
  }

  async init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
    }
    if (!this.gainNode) {
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
    }
  }

  async loadAudio(file) {
    await this.init();

    this.stop(); // stop existing audio

    const arrayBuffer = await file.arrayBuffer();
    this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    this.pauseTime = 0;

    this._setupAnalyser();

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    this.play();
    this.isMic = false;
  }

  play() {
    if (!this.audioBuffer) return;

    this.stop(); // stop previous source if any

    this.bufferSource = this.audioContext.createBufferSource();
    this.bufferSource.buffer = this.audioBuffer;

    this.bufferSource.connect(this.analyser);
    this.analyser.connect(this.gainNode);

    this.startTime = this.audioContext.currentTime - this.pauseTime;
    this.bufferSource.start(0, this.pauseTime);

    this.bufferSource.onended = () => {
      this.isPlayingFlag = false;
    };

    this.isPlayingFlag = true;
  }

  pause() {
    if (this.bufferSource) {
      this.bufferSource.stop(0);
      this.pauseTime = this.audioContext.currentTime - this.startTime;
      this.bufferSource.disconnect();
      this.bufferSource = null;
      this.isPlayingFlag = false;
    }
  }

  stop() {
    if (this.bufferSource) {
      this.bufferSource.stop(0);
      this.bufferSource.disconnect();
      this.bufferSource = null;
    }
    this.isPlayingFlag = false;
    this.pauseTime = 0;
  }

  isPlaying() {
    return this.isPlayingFlag;
  }

  setVolume(value) {
    if (this.gainNode) {
      this.gainNode.gain.value = value;
    }
  }

  async useMic() {
    await this.init();

    this.stop();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.source = this.audioContext.createMediaStreamSource(stream);

    this._setupAnalyser();

    this.source.connect(this.analyser);
    this.analyser.connect(this.gainNode);

    this.isMic = true;
  }

  _setupAnalyser() {
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = this.fftSize;
    this.analyser.smoothingTimeConstant = this.smoothing;

    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    this.timeArray = new Uint8Array(this.bufferLength);
  }

  getFrequencyData() {
    if (!this.analyser) return null;
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  getWaveformData() {
    if (!this.analyser) return null;
    this.analyser.getByteTimeDomainData(this.timeArray);
    return this.timeArray;
  }

  detectBeat() {
    if (!this.dataArray) return false;

    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }

    const average = sum / this.dataArray.length / 255;
    const now = Date.now();

    if (
      average > this.beatThreshold &&
      now - this.lastBeatTime > this.beatHoldTime
    ) {
      this.lastBeatTime = now;
      return true;
    }

    return false;
  }
}

window.AudioEngine = AudioEngine;
