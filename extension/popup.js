const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const toggleButton = document.getElementById("toggleButton");

let activeTab = null;

function setUiState({ recording, enabled, message }) {
  statusDot.classList.toggle("recording", recording);
  toggleButton.classList.toggle("recording", recording);
  toggleButton.textContent = recording ? "Stop Recording" : "Start Recording Notes";
  toggleButton.disabled = !enabled;
  statusText.textContent = message;
}

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  activeTab = tab;

  if (!tab || !tab.url || !tab.url.startsWith("https://meet.google.com/")) {
    setUiState({ recording: false, enabled: false, message: "Open a Google Meet tab first" });
    return;
  }

  const status = await chrome.runtime.sendMessage({ type: "get-status", tabId: tab.id });

  if (status?.recording) {
    setUiState({ recording: true, enabled: true, message: "Recording this meeting" });
  } else {
    setUiState({ recording: false, enabled: true, message: "Ready to record" });
  }
}

toggleButton.addEventListener("click", async () => {
  if (!activeTab) return;

  toggleButton.disabled = true;

  const status = await chrome.runtime.sendMessage({ type: "get-status", tabId: activeTab.id });

  const response = status?.recording
    ? await chrome.runtime.sendMessage({ type: "stop-recording", tabId: activeTab.id })
    : await chrome.runtime.sendMessage({ type: "start-recording", tabId: activeTab.id });

  if (!response?.success) {
    setUiState({ recording: false, enabled: true, message: response?.error || "Something went wrong" });
    return;
  }

  setUiState(
    response.recording
      ? { recording: true, enabled: true, message: "Recording this meeting" }
      : { recording: false, enabled: true, message: "Saved — ready to record again" }
  );
});

init();
