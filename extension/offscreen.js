const BACKEND_URL = "http://localhost:8000/api/process-meeting";

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
    stopRecordingAndProcess(sendResponse);
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

async function finalizeRecording() {
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

  return blob;
}

async function stopRecordingAndProcess(sendResponse) {
  let blob;
  try {
    blob = await finalizeRecording();
  } catch (error) {
    sendResponse({ success: false, error: String(error) });
    return;
  }

  sendResponse({ success: true, size: blob.size });

  try {
    const result = await uploadForProcessing(blob);
    chrome.runtime.sendMessage({ type: "processing-complete", result });
  } catch (error) {
    chrome.runtime.sendMessage({ type: "processing-error", error: String(error) });
  }
}

async function uploadForProcessing(blob) {
  const formData = new FormData();
  formData.append("file", blob, `meeting-${Date.now()}.webm`);

  const response = await fetch(BACKEND_URL, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Backend returned ${response.status}`);
  }

  return response.json();
}
