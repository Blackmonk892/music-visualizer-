class PopupController {
  constructor() {
    this.fileInput = document.getElementById("audioFile");
    this.visualModeSelect = document.getElementById("visualMode");
    this.colorPicker = document.getElementById("colorPicker");
    this.micButton = document.getElementById("micButton");
    this.launchButton = document.getElementById("launchButton");
    this.status = document.getElementById("status");

    this.audioFile = null;
    this.useMicrophone = false;

    this.init();
  }

  init() {
    this.loadPreferences();
    this.attachEventListeners();
  }

  attachEventListeners() {
    this.fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        this.audioFile = file;
        this.useMicrophone = false;
        this.showStatus(`Audio file loaded: ${file.name}`, "success");
        this.micButton.textContent = "Use Microphone";
      }
    });

    this.micButton.addEventListener("click", () => {
      this.useMicrophone = !this.useMicrophone;
      if (this.useMicrophone) {
        this.audioFile = null;
        this.fileInput.value = "";
        this.micButton.textContent = "Stop Microphone";
        this.showStatus("Microphone selected", "success");
      } else {
        this.micButton.textContent = "Use Microphone";
        this.showStatus("Microphone deselected", "success");
      }
    });

    this.visualModeSelect.addEventListener("change", () => {
      this.savePreferences();
    });

    this.colorPicker.addEventListener("change", () => {
      this.savePreferences();
    });

    this.launchButton.addEventListener("click", () => {
      this.launchVisualizer();
    });
  }

  async launchVisualizer() {
    try {
      if (!this.audioFile && !this.useMicrophone) {
        this.showStatus(
          "Please select an audio file or enable microphone",
          "error"
        );
        return;
      }

      this.savePreferences();

      // Create the visualizer window
      const visualizerUrl = chrome.runtime.getURL("visualizer.html");

      // Store the current settings
      const settings = {
        audioFile: this.audioFile,
        useMicrophone: this.useMicrophone,
        visualMode: this.visualModeSelect.value,
        color: this.colorPicker.value,
      };

      await chrome.storage.local.set({ visualizerSettings: settings });

      // Open visualizer in new tab
      chrome.tabs.create({ url: visualizerUrl });

      this.showStatus("Visualizer launched!", "success");
    } catch (error) {
      console.error("Error launching visualizer:", error);
      this.showStatus("Error launching visualizer", "error");
    }
  }

  loadPreferences() {
    chrome.storage.local.get(["visualMode", "color"], (result) => {
      if (result.visualMode) {
        this.visualModeSelect.value = result.visualMode;
      }
      if (result.color) {
        this.colorPicker.value = result.color;
      }
    });
  }

  savePreferences() {
    chrome.storage.local.set({
      visualMode: this.visualModeSelect.value,
      color: this.colorPicker.value,
    });
  }

  showStatus(message, type) {
    this.status.textContent = message;
    this.status.className = `status ${type}`;
    this.status.style.display = "block";

    setTimeout(() => {
      this.status.style.display = "none";
    }, 3000);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new PopupController();
});
