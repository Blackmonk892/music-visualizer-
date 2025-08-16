// ui.js
class UIController {
  constructor(audioEngine, visualizer) {
    this.audioEngine = audioEngine;
    this.visualizer = visualizer;

    // UI elements
    this.fileInput = document.getElementById("audioFile");
    this.micButton = document.getElementById("micButton");
    this.visualModeSelect = document.getElementById("visualMode");
    this.colorPicker = document.getElementById("colorPicker");
    this.fullscreenButton = document.getElementById("fullscreen");

    this._addEventListeners();
    this._loadPreferences();
  }

  _addEventListeners() {
    // File upload
    this.fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        this.audioEngine.loadAudio(file);
      }
    });

    // Microphone
    this.micButton.addEventListener("click", () => {
      this.audioEngine.useMic();
    });

    // Change visualization mode
    this.visualModeSelect.addEventListener("change", (e) => {
      this.visualizer.setMode(e.target.value);
      localStorage.setItem("visualMode", e.target.value);
    });

    // Color picker
    this.colorPicker.addEventListener("input", (e) => {
      this.visualizer.setColor(e.target.value);
      localStorage.setItem("color", e.target.value);
    });

    // Fullscreen toggle
    this.fullscreenButton.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });
  }

  _loadPreferences() {
    const savedMode = localStorage.getItem("visualMode");
    const savedColor = localStorage.getItem("color");

    if (savedMode) {
      this.visualModeSelect.value = savedMode;
      this.visualizer.setMode(savedMode);
    }

    if (savedColor) {
      this.colorPicker.value = savedColor;
      this.visualizer.setColor(savedColor);
    }
  }
}

window.UIController = UIController;
