// Routes Chrome keyboard commands to the active tab's content script.
async function sendCommand(action) {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab?.id) return;

  try {
    await chrome.tabs.sendMessage(tab.id, { action });
  } catch (error) {
    // Restricted browser pages (for example chrome:// URLs) do not allow content scripts.
    console.warn("Read Aloud could not reach this tab:", error.message);
  }
}

chrome.commands.onCommand.addListener((command) => {
  const actions = {
    "read-selection": "readText",
    "pause-resume": "pauseResume",
    "stop-reading": "stopReading"
  };
  if (actions[command]) sendCommand(actions[command]);
});