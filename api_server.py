import os
import threading
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

import config
from utils.meet_bot import GoogleMeetBot
from utils.transcription import TranscriptionService
from utils.file_generator import FileGenerator

app = FastAPI()

ALLOWED_ORIGINS = [
    "https://dashboard-mauve-zeta-23.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
    allow_private_network=True,
)

lock = threading.Lock()
state = {
    "stage": "idle",
    "error": None,
    "session_id": None,
    "result": None,
}
bot_holder = {"bot": None}


class JoinRequest(BaseModel):
    meeting_url: str


def run_join(meeting_url):
    bot = GoogleMeetBot()
    bot_holder["bot"] = bot

    join_success = bot.join_meeting(meeting_url)
    if not join_success:
        with lock:
            state["stage"] = "idle"
            state["error"] = bot.last_error or "Failed to join meeting"
        return

    session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
    recording_started = bot.start_recording(session_id)
    with lock:
        if recording_started:
            state["stage"] = "recording"
            state["session_id"] = session_id
        else:
            state["stage"] = "idle"
            state["error"] = "Failed to start recording"


def run_stop():
    bot = bot_holder["bot"]
    audio_path, video_path = bot.stop_recording()

    transcript_text = "No audio recorded"
    text_path = None
    pdf_path = None

    if audio_path:
        transcription_service = TranscriptionService()
        transcript_text = transcription_service.transcribe_audio(audio_path)

        file_generator = FileGenerator()
        text_path = file_generator.create_text_file(transcript_text, state["session_id"])
        pdf_path = file_generator.create_pdf_file(transcript_text, state["session_id"])

    with lock:
        state["stage"] = "done"
        state["result"] = {
            "transcript": transcript_text,
            "audio_file": os.path.basename(audio_path) if audio_path else None,
            "video_file": os.path.basename(video_path) if video_path else None,
            "text_file": os.path.basename(text_path) if text_path else None,
            "pdf_file": os.path.basename(pdf_path) if pdf_path else None,
        }


@app.get("/api/status")
def get_status():
    with lock:
        return dict(state)


@app.post("/api/join")
def join(payload: JoinRequest):
    with lock:
        if state["stage"] != "idle":
            raise HTTPException(400, "A session is already in progress")
        state["stage"] = "joining"
        state["error"] = None
        state["result"] = None
    threading.Thread(target=run_join, args=(payload.meeting_url,), daemon=True).start()
    return {"accepted": True}


@app.post("/api/stop")
def stop():
    with lock:
        if state["stage"] != "recording":
            raise HTTPException(400, "No active recording")
        state["stage"] = "transcribing"
    threading.Thread(target=run_stop, daemon=True).start()
    return {"accepted": True}


@app.post("/api/reset")
def reset():
    with lock:
        state["stage"] = "idle"
        state["error"] = None
        state["session_id"] = None
        state["result"] = None
    bot_holder["bot"] = None
    return {"accepted": True}


@app.get("/api/download/{kind}/{filename}")
def download(kind: str, filename: str):
    directories = {
        "audio": config.RECORDINGS_DIR,
        "video": config.RECORDINGS_DIR,
        "text": os.path.join(config.TRANSCRIPTS_DIR, "text"),
        "pdf": os.path.join(config.TRANSCRIPTS_DIR, "pdf"),
    }
    if kind not in directories:
        raise HTTPException(404, "Unknown file kind")

    directory = os.path.abspath(directories[kind])
    file_path = os.path.abspath(os.path.join(directory, filename))
    if not file_path.startswith(directory):
        raise HTTPException(400, "Invalid filename")
    if not os.path.exists(file_path):
        raise HTTPException(404, "File not found")

    return FileResponse(file_path)
