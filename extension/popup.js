const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const actionButton = document.getElementById("actionButton");
const notesSection = document.getElementById("notesSection");
const notesContent = document.getElementById("notesContent");
const resetButton = document.getElementById("resetButton");
const retryButton = document.getElementById("retryButton");
const copyButton = document.getElementById("copyButton");

let activeTab = null;
let pollHandle = null;

function stopPolling() {
  if (pollHandle) {
    clearInterval(pollHandle);
    pollHandle = null;
  }
}

function render(status) {
  const { stage, error, result } = status;

  notesSection.hidden = stage !== "done";
  retryButton.hidden = stage !== "error";
  actionButton.hidden = stage === "done" || stage === "error";

  statusDot.classList.toggle("recording", stage === "recording");
  statusDot.classList.toggle("busy", stage === "processing");

  if (stage === "recording") {
    statusText.textContent = "Recording this meeting";
    actionButton.textContent = "Stop Recording";
    actionButton.classList.add("recording");
    actionButton.disabled = false;
    stopPolling();
  } else if (stage === "processing") {
    statusText.textContent = "Processing AI notes…";
    actionButton.textContent = "Processing…";
    actionButton.disabled = true;
    if (!pollHandle) pollHandle = setInterval(refresh, 1500);
  } else if (stage === "done") {
    statusText.textContent = "Notes ready";
    notesContent.textContent = result?.notes || "(no notes returned)";
    stopPolling();
  } else if (stage === "error") {
    statusText.textContent = error || "Something went wrong";
    stopPolling();
  } else {
    actionButton.classList.remove("recording");
    actionButton.textContent = "Start Recording Notes";
    const onMeet = Boolean(activeTab?.url?.startsWith("https://meet.google.com/"));
    actionButton.disabled = !onMeet;
    statusText.textContent = onMeet ? "Ready to record" : "Open a Google Meet tab first";
    stopPolling();
  }
}

async function refresh() {
  const status = await chrome.runtime.sendMessage({ type: "get-status" });
  render(status);
}

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  activeTab = tab;
  await refresh();
}

async function handlePrimaryAction() {
  const status = await chrome.runtime.sendMessage({ type: "get-status" });
  actionButton.disabled = true;

  const response =
    status.stage === "recording"
      ? await chrome.runtime.sendMessage({ type: "stop-recording" })
      : await chrome.runtime.sendMessage({ type: "start-recording", tabId: activeTab.id });

  if (!response?.success) {
    render({ stage: "error", error: response?.error || "Something went wrong", result: null });
    return;
  }

  await refresh();
}

actionButton.addEventListener("click", handlePrimaryAction);
retryButton.addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ type: "reset" });
  await refresh();
});
resetButton.addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ type: "reset" });
  await refresh();
});
copyButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(notesContent.textContent || "");
  const original = copyButton.textContent;
  copyButton.textContent = "Copied!";
  setTimeout(() => (copyButton.textContent = original), 1500);
});

init();
