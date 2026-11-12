// Speech playback lives in the content script so popup controls and keyboard
// shortcuts operate on the same utterance.
let currentUtterance = null;
let currentStatus = "idle";
let preferences = { rate: 1, voiceName: "" };

chrome.storage.sync.get({ readAloudPreferences: preferences }, (data) => {
  preferences = { ...preferences, ...(data.readAloudPreferences || {}) };
});

function getVoices() {
  return speechSynthesis.getVoices().map((voice) => ({
    name: voice.name,
    lang: voice.lang,
    default: voice.default
  }));
}

function sendStatus() {
  chrome.runtime.sendMessage({
    type: "READ_ALOUD_STATUS",
    status: currentStatus
  }).catch(() => {});
}

function startReading(text) {
  const cleanText = text?.trim();
  if (!cleanText) {
    currentStatus = "no-selection";
    sendStatus();
    return;
  }

  speechSynthesis.cancel();
  currentUtterance = new SpeechSynthesisUtterance(cleanText);
  currentUtterance.rate = Number(preferences.rate) || 1;

  const voice = getVoices().find((item) => item.name === preferences.voiceName);
  if (voice) {
    currentUtterance.voice = speechSynthesis.getVoices()
      .find((item) => item.name === voice.name);
  }

  currentUtterance.onstart = () => { currentStatus = "speaking"; sendStatus(); };
  currentUtterance.onpause = () => { currentStatus = "paused"; sendStatus(); };
  currentUtterance.onresume = () => { currentStatus = "speaking"; sendStatus(); };
  currentUtterance.onend = () => { currentStatus = "idle"; currentUtterance = null; sendStatus(); };
  currentUtterance.onerror = (event) => {
    console.error("Read Aloud speech error:", event.error);
    currentStatus = "error";
    currentUtterance = null;
    sendStatus();
  };

  currentStatus = "loading";
  sendStatus();
  speechSynthesis.speak(currentUtterance);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "readText": {
      const selectedText = window.getSelection()?.toString() || "";
      startReading(selectedText);
      sendResponse({ ok: Boolean(selectedText.trim()) });
      break;
    }
    case "pauseResume":
      if (speechSynthesis.speaking && !speechSynthesis.paused) {
        speechSynthesis.pause();
      } else if (speechSynthesis.paused) {
        speechSynthesis.resume();
      }
      sendResponse({ ok: true });
      break;
    case "pauseReading":
      if (speechSynthesis.speaking && !speechSynthesis.paused) speechSynthesis.pause();
      sendResponse({ ok: true });
      break;
    case "resumeReading":
      if (speechSynthesis.paused) speechSynthesis.resume();
      sendResponse({ ok: true });
      break;
    case "stopReading":
      speechSynthesis.cancel();
      currentUtterance = null;
      currentStatus = "idle";
      sendStatus();
      sendResponse({ ok: true });
      break;
    case "getVoices":
      sendResponse({ voices: getVoices(), status: currentStatus });
      break;
    case "setPreferences":
      preferences = { ...preferences, ...request.preferences };
      sendResponse({ ok: true });
      break;
    default:
      sendResponse({ ok: false });
  }
  return true;
});

speechSynthesis.onvoiceschanged = () => {
  // Voice list is now populated by the browser.
};