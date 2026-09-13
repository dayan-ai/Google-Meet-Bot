import subprocess
import time
import os


class VideoRecorder:
    def __init__(self):
        self.process = None
        self.output_path = None

    def start_recording(self, session_name, save_directory, window_title=None):
        os.makedirs(save_directory, exist_ok=True)
        self.output_path = os.path.join(save_directory, f"{session_name}_screen.mp4")

        if window_title:
            full_title = f"{window_title} - Google Chrome"
            if self._start_ffmpeg(["-f", "gdigrab", "-framerate", "15", "-i", f"title={full_title}"]):
                return True
            print(f"Could not capture window '{full_title}', falling back to full desktop")

        return self._start_ffmpeg(["-f", "gdigrab", "-framerate", "15", "-i", "desktop"])

    def _start_ffmpeg(self, input_args):
        command = [
            "ffmpeg", "-y", *input_args,
            "-vf", "crop=trunc(iw/2)*2:trunc(ih/2)*2",
            "-pix_fmt", "yuv420p", self.output_path
        ]

        try:
            process = subprocess.Popen(
                command,
                stdin=subprocess.PIPE,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE
            )
        except Exception as error:
            print(f"Video recording failed to start: {error}")
            return False

        time.sleep(1.5)
        if process.poll() is not None:
            stderr = process.stderr.read().decode(errors="ignore") if process.stderr else ""
            print(f"ffmpeg exited immediately: {stderr[-500:]}")
            return False

        self.process = process
        return True

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
