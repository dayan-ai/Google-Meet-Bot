# 🎤 Google Meet Bot

**Automate Google Meet attendance, record audio + video, and generate AI-powered transcriptions**

[![Demo Video](https://img.shields.io/badge/Demo-Watch%20Video-red?style=for-the-badge&logo=youtube)](https://youtu.be/NALaPhlwDks)

## 🚀 Features

✅ **Automatic Meeting Join** - Bot joins Google Meet sessions automatically  
✅ **Real-time Recording** - Captures meeting audio and screen video in the background  
✅ **AI Transcription** - Uses OpenAI Whisper (local) and AssemblyAI (cloud)  
✅ **File Generation** - Creates PDF and text transcripts  
✅ **Simple Interface** - Clean Streamlit web UI  



## 🛠 Quick Setup

```
Clone repository
git clone https://github.com/dayan-ai/Google-Meet-Bot.git
cd Google-Meet-Bot

Setup virtual environment
python -m venv venv

Windows:
venv\Scripts\activate

Mac/Linux:
source venv/bin/activate

Install dependencies
pip install -r requirements.txt

(Optional) Add AssemblyAI API key
echo "ASSEMBLYAI_API_KEY=your-api-key-here" > .env

Run the app
streamlit run app.py
```

The first time you join a meeting, a dedicated Chrome window (separate from your regular browser profile) will open under `chrome_profile/`. If the meeting requires a signed-in Google account, sign in inside that window once — it stays logged in for future runs.

### Optional: control it from the web dashboard

The `dashboard/` folder is a hosted Next.js control panel. By default it only shows a
simulated demo, but it becomes a real control panel for your bot if you also run the
local API server:

```
Run the local API server (from the project root, with venv active)
uvicorn api_server:app --host 127.0.0.1 --port 8000
```

With that running, open the [live dashboard](https://dashboard-mauve-zeta-23.vercel.app)
(or `npm run dev` inside `dashboard/` for a local copy) — its "Try the workflow" section
detects the server on `127.0.0.1:8000` and switches from a simulated demo to actually
joining, recording, and transcribing through it. The API only accepts requests from that
dashboard's own origin (or `localhost:3000`), and only listens on `127.0.0.1`, so it's not
reachable from other devices on your network.

## 📁 Project Structure

```
Meet_Bot/
├── 📄 app.py # Main Streamlit application
├── 🌐 api_server.py # FastAPI backend for the web dashboard
├── ⚙️ config.py # Configuration settings
├── 📋 requirements.txt # Python dependencies
├── 🔒 .env # Environment variables
├── 📂 dashboard/ # Next.js landing page + live control panel
├── 📂 assets/
│ ├── 🎵 recordings/ # Audio + video files
│ └── 📄 transcripts/
│ ├── text/ # Text transcripts
│ └── pdf/ # PDF transcripts
└── 🛠 utils/
├── 🎙️ audio_recorder.py # Audio recording logic
├── 🎬 video_recorder.py # Screen recording logic
├── 🤖 meet_bot.py # Google Meet automation
├── 📝 transcription.py # AI transcription service
└── 📋 file_generator.py # PDF/text file creation
```


## 🎯 How It Works

1. **Enter Google Meet URL** in the web interface
2. **Click Join Meeting** - Chrome opens and bot joins automatically
3. **Recording starts** - Audio and screen video captured in background
4. **Click Stop** - AI processes speech to text
5. **Download files** - Get audio, video, PDF, and text transcripts

## 🧠 AI Technologies Used

- **OpenAI Whisper** - Local speech recognition
- **AssemblyAI** - Cloud-based transcription service  
- **Selenium WebDriver** - Browser automation
- **Streamlit** - Web interface framework
- **FFmpeg** - Screen recording (gdigrab)

## 📋 Requirements

- Python 3.8+
- Chrome Browser (Selenium Manager auto-resolves a matching driver)
- FFmpeg (for audio/video processing)
- Microphone access

## 🔧 Troubleshooting

**Chrome Driver Issues:**
- Selenium Manager auto-downloads the ChromeDriver matching your installed Chrome version
- Ensure you have Google Chrome installed

**"This browser may not be secure" / can't sign in:**
- Make sure no other process is using `chrome_profile/` (close any bot-launched Chrome window first)
- Sign in manually inside the bot's Chrome window; the session persists across runs

**"Transcription services unavailable or failed" even with clear speech:**
- PyPI's `openai-whisper` wheel can be broken on some Python versions (installs metadata but not the actual package). `requirements.txt` installs it straight from GitHub source to avoid this — if you installed before this fix, run `pip uninstall openai-whisper` then `pip install -r requirements.txt` again.

**Transcription Not Working:**
- Check FFmpeg installation (Windows users)
- Verify microphone permissions
- Ensure clear speech during recording

**Empty Transcripts:**
- Make sure people are actually speaking
- Check audio input levels
- Test with music/voice playing

## ⚠️ A Note on Recording Consent

This bot joins meetings as a visible participant and records audio/video. Make sure you have the right to record everyone on the call — consent requirements vary by jurisdiction.

## 📄 License

MIT License - see [LICENSE](LICENSE).

---

⭐ **Star this repository if you found it helpful!**
