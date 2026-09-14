const OFFSCREEN_URL = "offscreen.html";

let recordingTabId = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "get-status") {
    sendResponse({ recording: message.tabId === recordingTabId });
    return false;
  }

  if (message.type === "start-recording") {
    startRecording(message.tabId)
      .then(sendResponse)
      .catch((error) => sendResponse({ success: false, error: String(error) }));
    return true;
  }

  if (message.type === "stop-recording") {
    stopRecording()
      .then(sendResponse)
      .catch((error) => sendResponse({ success: false, error: String(error) }));
    return true;
  }

  return false;
});

async function ensureOffscreenDocument() {
  const hasDocument = await chrome.offscreen.hasDocument();
  if (hasDocument) return;

  await chrome.offscreen.createDocument({
    url: OFFSCREEN_URL,
    reasons: ["USER_MEDIA"],
    justification: "Recording the active Google Meet tab's audio and video"
  });
}

async function startRecording(tabId) {
  if (recordingTabId !== null) {
    return { success: false, error: "Already recording another tab" };
  }

  await ensureOffscreenDocument();

  const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tabId });

  const response = await chrome.runtime.sendMessage({
    type: "offscreen-start-recording",
    streamId
  });

  if (!response?.success) {
    return response ?? { success: false, error: "Offscreen document did not respond" };
  }

  recordingTabId = tabId;
  await chrome.action.setBadgeText({ text: "REC" });
  await chrome.action.setBadgeBackgroundColor({ color: "#dc2626" });

  return { success: true, recording: true };
}

async function stopRecording() {
  if (recordingTabId === null) {
    return { success: false, error: "Not currently recording" };
  }

  const response = await chrome.runtime.sendMessage({ type: "offscreen-stop-recording" });

  recordingTabId = null;
  await chrome.action.setBadgeText({ text: "" });

  if (!response?.success) {
    return response ?? { success: false, error: "Offscreen document did not respond" };
  }

  return { success: true, recording: false, size: response.size };
}
