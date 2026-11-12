const readBtn = document.getElementById("readBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const stopBtn = document.getElementById("stopBtn");
const voiceSelect = document.getElementById("voiceSelect");
const rateSlider = document.getElementById("rateSlider");
const rateValue = document.getElementById("rateValue");
const statusEl = document.getElementById("status");

let activeTabId;

function setStatus(message) {
  statusEl.textContent = message;
}

function sendToTab(action, extra = {}) {
  if (!activeTabId) return;
  chrome.tabs.sendMessage(activeTabId, { action, ...extra }).catch(() => {
    setStatus("This page does not allow Read Aloud. Try a regular webpage.");
  });
}

function savePreferences() {
  const preferences = {
    rate: Number(rateSlider.value),
    voiceName: voiceSelect.value
  };
  chrome.storage.sync.set({ readAloudPreferences: preferences });
  sendToTab("setPreferences", { preferences });
}

function loadVoices() {
  if (!activeTabId) return;
  chrome.tabs.sendMessage(activeTabId, { action: "getVoices" }, (response) => {
    if (chrome.runtime.lastError || !response?.voices) {
      voiceSelect.innerHTML = '<option value="">Browser default</option>';
      return;
    }
    const selected = voiceSelect.value;
    voiceSelect.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Browser default";
    voiceSelect.append(defaultOption);

    response.voices.forEach((voice) => {
      const option = document.createElement("option");
      option.value = voice.name;
      option.textContent = `${voice.name} (${voice.lang})`;
      voiceSelect.append(option);
    });
    voiceSelect.value = selected;
    if (response.status) setStatus(response.status === "speaking" ? "Reading aloud…" : "Ready");
  });
}

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  activeTabId = tab?.id;
  chrome.storage.sync.get({ readAloudPreferences: { rate: 1, voiceName: "" } }, (data) => {
    const preferences = data.readAloudPreferences || {};
    rateSlider.value = preferences.rate || 1;
    rateValue.textContent = `${Number(rateSlider.value).toFixed(1)}×`;
    loadVoices();
    sendToTab("setPreferences", { preferences });
    if (preferences.voiceName) {
      const timer = setInterval(() => {
        if ([...voiceSelect.options].some((option) => option.value === preferences.voiceName)) {
          voiceSelect.value = preferences.voiceName;
          clearInterval(timer);
        }
      }, 100);
      setTimeout(() => clearInterval(timer), 2000);
    }
  });
});

readBtn.addEventListener("click", () => sendToTab("readText"));
pauseBtn.addEventListener("click", () => sendToTab("pauseReading"));
resumeBtn.addEventListener("click", () => sendToTab("resumeReading"));
stopBtn.addEventListener("click", () => sendToTab("stopReading"));
voiceSelect.addEventListener("change", savePreferences);
rateSlider.addEventListener("input", () => {
  rateValue.textContent = `${Number(rateSlider.value).toFixed(1)}×`;
  savePreferences();
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "READ_ALOUD_STATUS") {
    const labels = {
      speaking: "Reading aloud…",
      paused: "Playback paused",
      idle: "Ready",
      loading: "Starting playback…",
      "no-selection": "No text selected. Highlight some text first.",
      error: "Speech playback failed. Try another voice."
    };
    setStatus(labels[message.status] || "Ready");
  }
});