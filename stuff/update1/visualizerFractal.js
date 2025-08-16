class VisualizerFractal {
    constructor(canvas, audioEngine) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioEngine = audioEngine;

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        this.zoom = 200;
        this.offsetX = -0.5;
        this.offsetY = 0;

        window.addEventListener('resize', () => this.resize());
        this.resize();
        this.render();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
    }

    render() {
        this._animationFrame = requestAnimationFrame(() => this.render());
        const freqData = this.audioEngine.getFrequencyData();
        if (!freqData) return;

        const bass = freqData[1] / 255;
        const treble = freqData[100] / 255;

        this.zoom *= 1 + bass * 0.01; // zoom in/out with bass
        this.offsetX += (Math.random() - 0.5) * treble * 0.01;
        this.offsetY += (Math.random() - 0.5) * treble * 0.01;

        this.drawFractal(freqData);
    }

    drawFractal(freqData) {
        const image = this.ctx.createImageData(this.width, this.height);
        const data = image.data;

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                let a = (x - this.centerX) / this.zoom + this.offsetX;
                let b = (y - this.centerY) / this.zoom + this.offsetY;
                let ca = a;
                let cb = b;
                let n = 0;

                while (n < 50) {
                    let aa = a * a - b * b;
                    let bb = 2 * a * b;
                    a = aa + ca;
                    b = bb + cb;
                    if (Math.abs(a + b) > 16) break;
                    n++;
                }

                const colorIndex = Math.floor((n / 50) * freqData.length);
                const hue = freqData[colorIndex % freqData.length];
                const brightness = n === 50 ? 0 : 255;

                const pixelIndex = (x + y * this.width) * 4;
                data[pixelIndex] = hue;        // red
                data[pixelIndex + 1] = 255 - hue; // green
                data[pixelIndex + 2] = brightness; // blue
                data[pixelIndex + 3] = 255; // alpha
            }
        }

        this.ctx.putImageData(image, 0, 0);
    }

    destroy() {
        cancelAnimationFrame(this._animationFrame);
        this.canvas.style.display = 'none';
    }
}

window.VisualizerFractal = VisualizerFractal;
