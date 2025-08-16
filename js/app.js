// app.js

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('visualizer');

    // Initialize Audio Engine
    const audioEngine = window.audioEngine;

    // Initialize Visualizer
    const visualizer = new window.Visualizer(canvas, audioEngine);

    // Initialize UI Controller
    const ui = new window.UIController(audioEngine, visualizer);

    // Start the visualization render loop
    visualizer.render();

    console.log('Music Visualizer initialized');
});
