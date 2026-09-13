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

## 📁 Project Structure

```
Meet_Bot/
├── 📄 app.py # Main Streamlit application
├── ⚙️ config.py # Configuration settings
├── 📋 requirements.txt # Python dependencies
├── 🔒 .env # Environment variables
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
