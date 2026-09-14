import os
import subprocess
import tempfile

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from groq import Groq
from openai import OpenAI

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^chrome-extension://.*$",
    allow_methods=["POST"],
    allow_headers=["*"],
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct:free")

NOTES_SYSTEM_PROMPT = (
    "You are an assistant that turns a raw meeting transcript into structured notes. "
    "Given the transcript, respond with exactly these three markdown sections, each "
    "followed by a bullet list (write \"None noted.\" if a section has nothing "
    "relevant):\n\n## Summary\n## Key Decisions\n## Action Items"
)

EMPTY_NOTES = (
    "## Summary\nNot enough speech was captured to generate notes.\n\n"
    "## Key Decisions\nNone noted.\n\n## Action Items\nNone noted."
)


@app.post("/api/process-meeting")
async def process_meeting(file: UploadFile = File(...)):
    if not GROQ_API_KEY:
        raise HTTPException(500, "GROQ_API_KEY is not configured on the backend")
    if not OPENROUTER_API_KEY:
        raise HTTPException(500, "OPENROUTER_API_KEY is not configured on the backend")

    video_path = None
    audio_path = None

    try:
        video_path = save_upload(await file.read(), file.filename)
        audio_path = extract_audio(video_path)

        transcript = transcribe_with_groq(audio_path or video_path)
        notes = summarize_with_openrouter(transcript)

        return {"transcript": transcript, "notes": notes}

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(500, f"Processing failed: {error}")

    finally:
        for path in (video_path, audio_path):
            if path and os.path.exists(path):
                os.remove(path)


def save_upload(data, original_filename):
    suffix = os.path.splitext(original_filename or "")[1] or ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        temp_file.write(data)
        return temp_file.name


def extract_audio(video_path):
    audio_path = video_path + ".audio.ogg"
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-i", video_path, "-vn", "-ac", "1", "-ar", "16000", audio_path],
            check=True,
            capture_output=True,
        )
        return audio_path
    except Exception as error:
        print(f"Audio extraction failed, sending original file instead: {error}")
        return None


def transcribe_with_groq(audio_path):
    client = Groq(api_key=GROQ_API_KEY)
    with open(audio_path, "rb") as audio_file:
        transcription = client.audio.transcriptions.create(
            file=audio_file,
            model="whisper-large-v3",
            response_format="text",
        )
    return transcription if isinstance(transcription, str) else transcription.text


def summarize_with_openrouter(transcript):
    if len(transcript.strip()) < 10:
        return EMPTY_NOTES

    client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=OPENROUTER_API_KEY)

    completion = client.chat.completions.create(
        model=OPENROUTER_MODEL,
        messages=[
            {"role": "system", "content": NOTES_SYSTEM_PROMPT},
            {"role": "user", "content": transcript},
        ],
    )

    return completion.choices[0].message.content
