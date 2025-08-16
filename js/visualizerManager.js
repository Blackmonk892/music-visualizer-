// class VisualizerManager {
//     constructor(canvas, audioEngine) {
//         this.canvas = canvas;
//         this.audioEngine = audioEngine;
//         this.activeVisualizer = null;
//         this.visualizerType = null;
//     }

//     setMode(mode) {
//         // Stop previous visualizer
//         if (this.activeVisualizer && typeof this.activeVisualizer.destroy === 'function') {
//             this.activeVisualizer.destroy();
//         }

//         this.canvas.style.display = 'none';
//         if (document.getElementById('threejs-canvas')) {
//             document.getElementById('threejs-canvas').remove();
//         }

//         if (mode === '3d') {
//             this.activeVisualizer = new window.Visualizer3D(this.audioEngine);
//             this.visualizerType = '3d';
//         } else if (mode === 'fractal') {
//             this.canvas.style.display = 'block';
//             this.activeVisualizer = new window.VisualizerFractal(this.canvas, this.audioEngine);
//             this.visualizerType = 'fractal';
//             this.activeVisualizer.render();
//         } else {
//             this.canvas.style.display = 'block';
//             this.activeVisualizer = new window.Visualizer(this.canvas, this.audioEngine);
//             this.visualizerType = '2d';
//             this.activeVisualizer.setMode(mode);
//             this.activeVisualizer.setColor(this.color);
//             this.activeVisualizer.render();
//         }
//     }

//     setColor(color) {
//         this.color = color;
//         if (this.visualizerType === '2d' && this.activeVisualizer) {
//             this.activeVisualizer.setColor(color);
//         }
//     }

//     set3DSubMode(submode) {
//         if (this.visualizerType === '3d' && this.activeVisualizer?.setMode) {
//             this.activeVisualizer.setMode(submode);
//         }
//     }
// }

// window.VisualizerManager = VisualizerManager;
