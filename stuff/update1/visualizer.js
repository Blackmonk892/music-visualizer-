class Visualizer {
  constructor(canvas, audioEngine) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.audioEngine = audioEngine;
    this.mode = "bars";
    this.color = "#00ffcc";
    this.particles = [];
    this.energy = 0;

    // ===================
    // Gradient transition
    // ===================
    this.gradientColors = ["#00ffcc", "#ff0066", "#6600ff", "#ffcc00"];
    this.colorIndex = 0;
    this.nextColorIndex = 1;
    this.colorTransitionTime = 5000;
    this.lastColorChange = Date.now();

    this.resize();

    this.entity = {
      x: this.centerX,
      y: this.centerY,
      vx: 0,
      vy: 0,
      radius: 60,
      trail: [],
      angleOffset: 0,
      blinkTimer: 0,
      isBlinking: false,
      auraParticles: [],
      emotionLevel: 0,
    };

    this.mouse = null;

    window.addEventListener("resize", () => this.resize());
    this.canvas.addEventListener("click", () => this.feedEnergy());
    this.canvas.addEventListener("mousemove", (e) => {
      this.mouse = { x: e.clientX, y: e.clientY };
    });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2;
    if (this.entity) {
      this.entity.x = this.centerX;
      this.entity.y = this.centerY;
    }
  }

  setMode(mode) {
    this.mode = mode;
  }

  setColor(color) {
    this.color = color;
  }

  feedEnergy() {
    this.energy = 1;
  }

  _interpolateColor(a, b, t) {
    const c1 = this._hexToRgb(a);
    const c2 = this._hexToRgb(b);
    const r = Math.round(c1.r + (c2.r - c1.r) * t);
    const g = Math.round(c1.g + (c2.g - c1.g) * t);
    const bVal = Math.round(c1.b + (c2.b - c1.b) * t);
    return `rgb(${r}, ${g}, ${bVal})`;
  }

  _hexToRgb(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3)
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    const bigint = parseInt(hex, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  }

  render() {
    requestAnimationFrame(() => this.render());

    const freqData = this.audioEngine.getFrequencyData();
    const waveform = this.audioEngine.getWaveformData();
    if (!freqData || !waveform) return;

    // === Gradient color update ===
    const now = Date.now();
    const elapsed = now - this.lastColorChange;
    if (elapsed >= this.colorTransitionTime) {
      this.colorIndex = this.nextColorIndex;
      this.nextColorIndex =
        (this.nextColorIndex + 1) % this.gradientColors.length;
      this.lastColorChange = now;
    }
    const t = Math.min(elapsed / this.colorTransitionTime, 1);
    this.color = this._interpolateColor(
      this.gradientColors[this.colorIndex],
      this.gradientColors[this.nextColorIndex],
      t
    );

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    switch (this.mode) {
      case "bars":
        this.drawBars(freqData);
        break;
      case "circle":
        this.drawCircle(freqData);
        break;
      case "particles":
        this.drawParticles(freqData);
        break;
      case "landscape":
        this.drawLandscape(freqData);
        break;
      case "waveform":
        this.drawWaveform(waveform);
        break;
      case "entity":
        this.drawEntity(freqData);
        break;
    }

    if (this.audioEngine.detectBeat && this.audioEngine.detectBeat()) {
      this.flashScreen();
    }
  }

  drawBars(data) {
    const w = (this.canvas.width / data.length) * 2.5;
    let x = 0;
    this.ctx.fillStyle = this.color;
    for (let i = 0; i < data.length; i++) {
      this.ctx.fillRect(x, this.canvas.height - data[i], w, data[i]);
      x += w + 1;
    }
  }

  drawCircle(data) {
    const radius = 150;
    const step = (Math.PI * 2) / data.length;
    this.ctx.save();
    this.ctx.translate(this.centerX, this.centerY);
    this.ctx.strokeStyle = this.color;
    for (let i = 0; i < data.length; i++) {
      const len = data[i] / 2;
      this.ctx.beginPath();
      this.ctx.moveTo(Math.cos(i * step) * radius, Math.sin(i * step) * radius);
      this.ctx.lineTo(
        Math.cos(i * step) * (radius + len),
        Math.sin(i * step) * (radius + len)
      );
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawParticles(data) {
    if (this.particles.length < 200) {
      this.particles.push({
        x: this.centerX,
        y: this.centerY,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 100 + Math.random() * 100,
      });
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 1;
      const e = data[Math.floor(Math.random() * data.length)] / 255;
      this.ctx.beginPath();
      this.ctx.fillStyle = this.color;
      this.ctx.arc(p.x, p.y, e * 10, 0, Math.PI * 2);
      this.ctx.fill();
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  drawLandscape(data) {
    this.ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = (i / data.length) * this.canvas.width;
      const y = this.centerY + (data[i] - 128);
      i === 0 ? this.ctx.moveTo(x, y) : this.ctx.lineTo(x, y);
    }
    this.ctx.strokeStyle = this.color;
    this.ctx.stroke();
  }

  drawWaveform(waveform) {
    this.ctx.beginPath();
    for (let i = 0; i < waveform.length; i++) {
      const x = (i / waveform.length) * this.canvas.width;
      const y = this.centerY + (waveform[i] - 128);
      i === 0 ? this.ctx.moveTo(x, y) : this.ctx.lineTo(x, y);
    }
    this.ctx.strokeStyle = this.color;
    this.ctx.stroke();
  }

  drawEntity(freqData) {
    // unchanged entity visualization logic — uses its dynamic RGB
    const ctx = this.ctx,
      entity = this.entity,
      mouse = this.mouse;
    // ... (paste your full drawEntity code here) ...
  }

  flashScreen() {
    this.ctx.fillStyle = "rgba(255,255,255,0.1)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

window.Visualizer = Visualizer;
