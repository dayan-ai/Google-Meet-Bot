from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from utils.audio_recorder import AudioRecorder
from utils.video_recorder import VideoRecorder
import os
import time
import psutil
import config

BLOCKING_SCREEN_PHRASES = [
    "you can't join this video call",
    "check your meeting code",
    "this meeting has ended",
    "your account doesn't allow you to join",
]

JOIN_BUTTON_XPATH = " | ".join([
    "//span[contains(text(), 'Join now')]",
    "//span[contains(text(), 'Ask to join')]",
    "//div[contains(text(), 'Join now')]",
    "//div[contains(text(), 'Ask to join')]",
    "//button[.//span[contains(text(), 'Join now')]]",
    "//button[.//span[contains(text(), 'Ask to join')]]",
    "//button[contains(@aria-label, 'Join now')]",
    "//button[contains(@aria-label, 'Ask to join')]",
])

def close_stale_automation_chrome():
    profile_dir = os.path.abspath(config.CHROME_USER_DATA_DIR)
    for proc in psutil.process_iter(["name", "cmdline"]):
        try:
            name = (proc.info["name"] or "").lower()
            if "chrome" not in name:
                continue
            cmdline = proc.info["cmdline"] or []
            if any(profile_dir in arg for arg in cmdline):
                proc.kill()
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue


class GoogleMeetBot:
    def __init__(self):
        self.browser = None
        self.audio_recorder = None
        self.video_recorder = None
        self.meeting_is_active = False
        self.last_error = None

    def setup_browser(self):
        close_stale_automation_chrome()
        time.sleep(1)

        browser_options = Options()
        browser_options.add_experimental_option("detach", True)
        browser_options.add_argument("--use-fake-ui-for-media-stream")
        browser_options.add_argument("--start-maximized")
        browser_options.add_argument("--no-sandbox")
        browser_options.add_argument("--disable-dev-shm-usage")
        browser_options.add_argument("--disable-blink-features=AutomationControlled")
        browser_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        browser_options.add_experimental_option("useAutomationExtension", False)

        if config.CHROME_USER_DATA_DIR:
            browser_options.add_argument(f"--user-data-dir={config.CHROME_USER_DATA_DIR}")
            browser_options.add_argument(f"--profile-directory={config.CHROME_PROFILE_DIRECTORY}")

        media_permissions = {
            "profile.default_content_setting_values": {
                "media_stream_mic": 1,
                "media_stream_camera": 1,
                "notifications": 2
            }
        }
        browser_options.add_experimental_option("prefs", media_permissions)

        try:
            print("Setting up Chrome browser...")
            self.browser = webdriver.Chrome(options=browser_options)

            self.browser.execute_cdp_cmd(
                "Page.addScriptToEvaluateOnNewDocument",
                {"source": "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"}
            )

            print("Chrome setup successful")
            return True

        except Exception as error:
            print(f"Chrome setup failed: {error}")
            self.last_error = str(error)
            return False

    def join_meeting(self, meeting_url):
        if not self.setup_browser():
            return False

        try:
            print(f"Opening meeting: {meeting_url}")
            self.browser.get(meeting_url)
            time.sleep(5)

            blocking_reason = self.detect_blocking_screen()
            if blocking_reason:
                self.last_error = f"Google Meet would not let the bot in: {blocking_reason}"
                print(self.last_error)
                return False

            print("Configuring audio and video...")
            self.turn_off_microphone()
            self.turn_off_camera()

            print("Looking for join button...")
            join_successful = self.attempt_to_join()

            if not join_successful:
                blocking_reason = self.detect_blocking_screen()
                self.last_error = blocking_reason or (
                    "Could not find a join button. The meeting may require a signed-in "
                    "Google account, or the page took too long to load."
                )
                print(self.last_error)
                return False

            print("Meeting joined successfully")
            self.meeting_is_active = True
            time.sleep(3)
            return True

        except Exception as error:
            print(f"Meeting join failed: {error}")
            self.last_error = str(error)
            return False

    def detect_blocking_screen(self):
        try:
            page_text = self.browser.find_element(By.TAG_NAME, "body").text.lower()
        except Exception:
            return None

        for phrase in BLOCKING_SCREEN_PHRASES:
            if phrase in page_text:
                return phrase
        return None
    
    def turn_off_microphone(self):
        microphone_selectors = [
            '[aria-label*="microphone"]',
            '[aria-label*="Turn off microphone"]',
            '[data-testid*="mic"]',
            'div[aria-label*="Mute"]'
        ]
        
        for selector in microphone_selectors:
            try:
                mic_button = self.browser.find_element(By.CSS_SELECTOR, selector)
                if mic_button.is_displayed():
                    mic_button.click()
                    print("Microphone disabled")
                    time.sleep(1)
                    break
            except:
                continue
    
    def turn_off_camera(self):
        camera_selectors = [
            '[aria-label*="camera"]',
            '[aria-label*="Turn off camera"]',
            '[data-testid*="camera"]',
            'div[aria-label*="camera off"]'
        ]
        
        for selector in camera_selectors:
            try:
                camera_button = self.browser.find_element(By.CSS_SELECTOR, selector)
                if camera_button.is_displayed():
                    camera_button.click()
                    print("Camera disabled")
                    time.sleep(1)
                    break
            except:
                continue
    
    def attempt_to_join(self):
        try:
            join_button = WebDriverWait(self.browser, 25).until(
                EC.element_to_be_clickable((By.XPATH, JOIN_BUTTON_XPATH))
            )
            join_button.click()
            print("Clicked join button")
            return True
        except TimeoutException:
            print("Join button never appeared")
            return False
    
    def start_recording(self, session_name):
        if not self.meeting_is_active:
            print("No active meeting to record")
            return False
        
        try:
            print(f"Starting audio recording: {session_name}")
            self.audio_recorder = AudioRecorder()
            audio_started = self.audio_recorder.start_recording(session_name, config.RECORDINGS_DIR)

            print(f"Starting video recording: {session_name}")
            self.video_recorder = VideoRecorder()
            video_started = self.video_recorder.start_recording(
                session_name, config.RECORDINGS_DIR, window_title=self.browser.title
            )

            if audio_started and video_started:
                print("Recording started")
                return True
            else:
                print("Recording failed to start")
                return False

        except Exception as error:
            print(f"Recording error: {error}")
            return False

    def stop_recording(self):
        audio_file_path = None
        video_file_path = None

        if self.audio_recorder:
            print("Stopping audio recording...")
            audio_file_path = self.audio_recorder.stop_recording()
            print(f"Audio saved: {audio_file_path}")

        if self.video_recorder:
            print("Stopping video recording...")
            video_file_path = self.video_recorder.stop_recording()
            print(f"Video saved: {video_file_path}")

        return audio_file_path, video_file_path
    
    def leave_meeting(self):
        print("Leaving meeting...")
        try:
            self.find_and_click_leave_button()
        except Exception as error:
            print(f"Could not leave gracefully: {error}")
        
        finally:
            if self.browser:
                self.browser.quit()
                print("Browser closed")
                self.meeting_is_active = False
    
    def find_and_click_leave_button(self):
        leave_button_selectors = [
            '[aria-label*="Leave call"]',
            '[data-testid*="leave"]',
            'button[aria-label*="Leave call"]'
        ]
        
        for selector in leave_button_selectors:
            try:
                leave_button = self.browser.find_element(By.CSS_SELECTOR, selector)
                if leave_button.is_displayed():
                    leave_button.click()
                    print("Left meeting via button")
                    break
            except:
                continue
