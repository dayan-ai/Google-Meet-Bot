import os

AUDIO_SAMPLE_RATE = 44100
AUDIO_CHANNELS = 2

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
RECORDINGS_DIR = os.path.join(PROJECT_ROOT, 'assets', 'recordings')
TRANSCRIPTS_DIR = os.path.join(PROJECT_ROOT, 'assets', 'transcripts')

CHROME_USER_DATA_DIR = os.getenv(
    'CHROME_USER_DATA_DIR',
    os.path.join(PROJECT_ROOT, 'chrome_profile')
)
CHROME_PROFILE_DIRECTORY = os.getenv('CHROME_PROFILE_DIRECTORY', 'Default')

def create_project_directories():
    directories_to_create = [
        RECORDINGS_DIR,
        os.path.join(TRANSCRIPTS_DIR, 'text'),
        os.path.join(TRANSCRIPTS_DIR, 'pdf')
    ]
    
    for directory in directories_to_create:
        os.makedirs(directory, exist_ok=True)

create_project_directories()
