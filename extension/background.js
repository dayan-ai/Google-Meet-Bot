const OFFSCREEN_URL = "offscreen.html";
const DEFAULT_STATE = { stage: "idle", error: null, result: null };

async function getState() {
  const { state } = await chrome.storage.session.get("state");
  return state || DEFAULT_STATE;
}

async function setState(state) {
  await chrome.storage.session.set({ state });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "get-status") {
    getState().then(sendResponse);
    return true;
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

  if (message.type === "reset") {
    setState(DEFAULT_STATE).then(() => sendResponse({ success: true }));
    return true;
  }

  if (message.type === "processing-complete") {
    setState({ stage: "done", error: null, result: message.result });
    return false;
  }

  if (message.type === "processing-error") {
    setState({ stage: "error", error: message.error, result: null });
    return false;
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
  const state = await getState();
  if (state.stage !== "idle") {
    return { success: false, error: "A session is already in progress" };
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

  await setState({ stage: "recording", error: null, result: null });
  await chrome.action.setBadgeText({ text: "REC" });
  await chrome.action.setBadgeBackgroundColor({ color: "#dc2626" });

  return { success: true };
}

async function stopRecording() {
  const state = await getState();
  if (state.stage !== "recording") {
    return { success: false, error: "Not currently recording" };
  }

  await chrome.action.setBadgeText({ text: "" });

  const response = await chrome.runtime.sendMessage({ type: "offscreen-stop-recording" });

  if (!response?.success) {
    const error = response?.error || "Failed to stop recording";
    await setState({ stage: "error", error, result: null });
    return { success: false, error };
  }

  // The offscreen document keeps running the upload + AI pipeline in the
  // background after this responds; it reports back via
  // "processing-complete"/"processing-error" once that finishes.
  await setState({ stage: "processing", error: null, result: null });
  return { success: true };
}
