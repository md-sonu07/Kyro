import subprocess
import platform
import asyncio
import os
import time
from typing import Tuple, Dict, Any
from app.core.logging import logger

async def run_applescript(script: str) -> Tuple[bool, str]:
    """Run an AppleScript on macOS."""
    if platform.system() != "Darwin":
        return False, "AppleScript is only available on macOS."
    try:
        proc = await asyncio.create_subprocess_exec(
            "osascript", "-e", script,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        stdout, stderr = await proc.communicate()
        if proc.returncode == 0:
            return True, stdout.decode().strip()
        return False, stderr.decode().strip()
    except Exception as e:
        return False, str(e)

async def set_volume(level: int) -> Tuple[bool, str]:
    """Sets system volume (0 - 100)."""
    level = max(0, min(100, level))
    success, _ = await run_applescript(f"set volume output volume {level}")
    if success:
        return True, f"Volume set to {level}%."
    return False, "Failed to adjust volume."

async def mute_volume(mute: bool = True) -> Tuple[bool, str]:
    """Mutes or unmutes system audio."""
    state = "true" if mute else "false"
    success, _ = await run_applescript(f"set volume output muted {state}")
    if success:
        return True, "Audio muted." if mute else "Audio unmuted."
    return False, "Failed to toggle mute."

async def take_screenshot() -> Tuple[bool, str]:
    """Takes a desktop screenshot and saves to Desktop."""
    desktop_dir = os.path.expanduser("~/Desktop")
    filename = f"Kyro_Screenshot_{int(time.time())}.png"
    filepath = os.path.join(desktop_dir, filename)
    try:
        proc = await asyncio.create_subprocess_exec(
            "screencapture", "-x", filepath,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        await proc.communicate()
        return True, f"Screenshot saved to your Desktop: {filename}"
    except Exception as e:
        return False, f"Screenshot failed: {e}"

async def get_system_stats() -> Dict[str, Any]:
    return {
        "os": platform.system(),
        "release": platform.release(),
        "arch": platform.machine(),
        "cpu_cores": os.cpu_count() or 1,
        "python": platform.python_version(),
    }
