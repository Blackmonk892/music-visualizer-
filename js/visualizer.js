class Visualizer {
  constructor(canvas, audioEngine) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.audioEngine = audioEngine;
    this.mode = "bars";
    this.color = "#00ffcc";
    this.particles = [];
    this.mouse = { x: 0, y: 0 };
    this.time = 0;

    this.neuralNodes = [];
    this.initNeuralNodes();

    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.canvas.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    this.canvas.addEventListener("click", () => this.explodeAtMouse());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2;
  }

  setMode(mode) {
    this.mode = mode;
  }

  setColor(color) {
    this.color = color;
  }

  render() {
    requestAnimationFrame(() => this.render());
    const freqData = this.audioEngine.getFrequencyData();
    const waveform = this.audioEngine.getWaveformData();
    if (!freqData || !waveform) return;

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
      case "fluid":
        this.drawFluid(freqData);
        break;
      case "neural":
        this.drawNeural(freqData);
        break;
    }

    if (this.audioEngine.detectBeat && this.audioEngine.detectBeat()) {
      this.flashScreen();
    }
  }

  drawBars(data) {
    const barwidth = (this.canvas.width / data.length) * 2.5;
    let x = 0;
    this.ctx.fillStyle = this.color;
    for (let i = 0; i < data.length; i++) {
      const barHeight = data[i];
      this.ctx.fillRect(x, this.canvas.height - barHeight, barwidth, barHeight);
      x += barwidth + 1;
    }
  }

  drawCircle(data) {
    const radius = 150;
    const step = (Math.PI * 2) / data.length;
    this.ctx.save();
    this.ctx.translate(this.centerX, this.centerY);
    this.ctx.strokeStyle = this.color;
    for (let i = 0; i < data.length; i++) {
      const length = data[i] / 2;
      const x = Math.cos(i * step) * (radius + length);
      const y = Math.sin(i * step) * (radius + length);
      this.ctx.beginPath();
      this.ctx.moveTo(Math.cos(i * step) * radius, Math.sin(i * step) * radius);
      this.ctx.lineTo(x, y);
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

    this.ctx.fillStyle = this.color;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 1;

      const energy = data[Math.floor(Math.random() * data.length)] / 255;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, energy * 10, 0, Math.PI * 2);
      this.ctx.fill();

      if (p.life < 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  drawLandscape(data) {
    this.ctx.strokeStyle = this.color;
    this.ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = (i / data.length) * this.canvas.width;
      const y = this.centerY + (data[i] - 128);
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.stroke();
  }

  drawWaveform(waveform) {
    this.ctx.strokeStyle = this.color;
    this.ctx.beginPath();
    for (let i = 0; i < waveform.length; i++) {
      const x = (i / waveform.length) * this.canvas.width;
      const y = this.centerY + (waveform[i] - 128);
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.stroke();
  }

  drawFluid(data) {
    const ctx = this.ctx;
    const time = (this.time += 0.01);
    const bass = data.slice(0, 10).reduce((a, b) => a + b, 0) / 10;

    const spacing = 30;
    for (let x = 0; x < this.canvas.width; x += spacing) {
      for (let y = 0; y < this.canvas.height; y += spacing) {
        const dx = Math.sin((x + time * 100) * 0.01) * 15;
        const dy = Math.cos((y + time * 100) * 0.01) * 15;

        const mx = this.mouse.x - x;
        const my = this.mouse.y - y;
        const dist = Math.sqrt(mx * mx + my * my);
        const ripple = Math.sin(dist * 0.03 - time * 5) * (100 / (dist + 50));

        const size = 10 + ripple + bass / 30;

        ctx.beginPath();
        ctx.arc(x + dx, y + dy, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${100 + bass},${180},255,0.07)`;
        ctx.fill();
      }
    }
  }

  initNeuralNodes() {
    this.neuralNodes = [];
    const nodeCount = 80;
    for (let i = 0; i < nodeCount; i++) {
      this.neuralNodes.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
      });
    }
  }

  drawNeural(data) {
    const ctx = this.ctx;
    const nodes = this.neuralNodes;

    const bass = data.slice(0, 10).reduce((a, b) => a + b, 0) / 10;

    // move nodes
    for (const node of nodes) {
      node.vx += (Math.random() - 0.5) * 0.1;
      node.vy += (Math.random() - 0.5) * 0.1;

      node.x += node.vx;
      node.y += node.vy;

      if (node.x < 0 || node.x > this.canvas.width) node.vx *= -1;
      if (node.y < 0 || node.y > this.canvas.height) node.vy *= -1;
    }

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1;

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140 + bass / 2) {
          ctx.globalAlpha = 1 - dist / (140 + bass / 2);
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
    for (const node of nodes) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 3 + bass / 50, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }

    // explosion ring
    ctx.beginPath();
    ctx.arc(this.mouse.x, this.mouse.y, 8 + bass / 20, 0, Math.PI * 2);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  explodeAtMouse() {
    for (const node of this.neuralNodes) {
      const dx = node.x - this.mouse.x;
      const dy = node.y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        const angle = Math.atan2(dy, dx);
        const force = (200 - dist) / 10;
        node.vx += Math.cos(angle) * force;
        node.vy += Math.sin(angle) * force;
      }
    }
  }

  flashScreen() {
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

window.Visualizer = Visualizer;
