import subprocess
import os


class VideoRecorder:
    def __init__(self):
        self.process = None
        self.output_path = None

    def start_recording(self, session_name, save_directory):
        os.makedirs(save_directory, exist_ok=True)
        self.output_path = os.path.join(save_directory, f"{session_name}_screen.mp4")

        command = [
            "ffmpeg", "-y",
            "-f", "gdigrab",
            "-framerate", "15",
            "-i", "desktop",
            "-pix_fmt", "yuv420p",
            self.output_path
        ]

        try:
            self.process = subprocess.Popen(
                command,
                stdin=subprocess.PIPE,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            return True
        except Exception as error:
            print(f"Video recording failed to start: {error}")
            return False

    def stop_recording(self):
        if not self.process:
            return None

        try:
            self.process.communicate(input=b'q', timeout=10)
        except subprocess.TimeoutExpired:
            self.process.kill()

        video_path = self.output_path
        self.process = None
        return video_path
