let mediaRecorder = null;
let recordedChunks = [];
let captureStream = null;
let audioContext = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "offscreen-start-recording") {
    startRecording(message.streamId)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: String(error) }));
    return true;
  }

  if (message.type === "offscreen-stop-recording") {
    stopRecording()
      .then((result) => sendResponse({ success: true, ...result }))
      .catch((error) => sendResponse({ success: false, error: String(error) }));
    return true;
  }

  return false;
});

async function startRecording(streamId) {
  captureStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: "tab",
        chromeMediaSourceId: streamId
      }
    },
    video: {
      mandatory: {
        chromeMediaSource: "tab",
        chromeMediaSourceId: streamId,
        maxWidth: 1280,
        maxHeight: 720,
        maxFrameRate: 15
      }
    }
  });

  // tabCapture mutes the tab's own audio output once captured -- route it
  // back to the speakers so the user isn't recording in silence.
  audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(captureStream);
  source.connect(audioContext.destination);

  recordedChunks = [];
  mediaRecorder = new MediaRecorder(captureStream, { mimeType: "video/webm;codecs=vp9,opus" });

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) recordedChunks.push(event.data);
  };

  mediaRecorder.start(1000);
}

async function stopRecording() {
  if (!mediaRecorder) {
    throw new Error("No active recording");
  }

  const blob = await new Promise((resolve) => {
    mediaRecorder.onstop = () => resolve(new Blob(recordedChunks, { type: "video/webm" }));
    mediaRecorder.stop();
  });

  captureStream.getTracks().forEach((track) => track.stop());
  if (audioContext) {
    await audioContext.close();
    audioContext = null;
  }
  mediaRecorder = null;
  captureStream = null;
  recordedChunks = [];

  // Phase 1: save locally so we can verify capture end-to-end before this
  // gets replaced with an upload to the AI backend in Phase 2.
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `meet-recording-${Date.now()}.webm`;
  link.click();
  URL.revokeObjectURL(url);

  return { size: blob.size };
}
