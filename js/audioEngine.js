// audioEngine.js
class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.source = null;
        this.analyser = null;
        this.dataArray = null;
        this.timeArray = null;
        this.bufferLength = 0;
        this.beatDetected = false;

        this.isMic = false;
        this.smoothing = 0.8;
        this.fftSize = 2048;

        this.lastBeatTime = 0;
        this.beatHoldTime = 300; // ms
        this.beatThreshold = 0.25; // normalized amplitude
    }

    async init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    async loadAudio(file) {
        await this.init();

        if (this.source) {
            this.source.disconnect();
        }

        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

        this.source = this.audioContext.createBufferSource();
        this.source.buffer = audioBuffer;

        this._setupAnalyser();
        this.source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        // Resume audio context on user interaction
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        this.source.start(0);
        this.isMic = false;
    }

    async useMic() {
        await this.init();

        if (this.source) {
            this.source.disconnect();
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.source = this.audioContext.createMediaStreamSource(stream);
        this._setupAnalyser();
        this.source.connect(this.analyser);
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
        if (average > this.beatThreshold && now - this.lastBeatTime > this.beatHoldTime) {
            this.lastBeatTime = now;
            this.beatDetected = true;
            return true;
        }
        this.beatDetected = false;
        return false;
    }
}

window.audioEngine = new AudioEngine();
