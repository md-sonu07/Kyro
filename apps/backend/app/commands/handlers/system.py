import subprocess
import platform
import asyncio
import os
import time
import re
from typing import Tuple, Dict, Any, Optional
from app.core.logging import logger

async def run_applescript(script: str) -> Tuple[bool, str]:
    """Run an AppleScript on macOS asynchronously with fast execution."""
    if platform.system() != "Darwin":
        return False, "System controls are only available on macOS."
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
        logger.error(f"AppleScript error: {e}")
        return False, str(e)

import ctypes

# ==========================================
# 1. ☀️ BRIGHTNESS CONTROLS (macOS Native C Framework)
# ==========================================

def _get_native_brightness() -> Optional[float]:
    """Reads hardware brightness from DisplayServices C API."""
    try:
        cg = ctypes.cdll.LoadLibrary("/System/Library/Frameworks/CoreGraphics.framework/CoreGraphics")
        ds = ctypes.cdll.LoadLibrary("/System/Library/PrivateFrameworks/DisplayServices.framework/DisplayServices")
        cg.CGMainDisplayID.restype = ctypes.c_uint32
        ds.DisplayServicesGetBrightness.argtypes = [ctypes.c_uint32, ctypes.POINTER(ctypes.c_float)]
        ds.DisplayServicesGetBrightness.restype = ctypes.c_int
        
        display_id = cg.CGMainDisplayID()
        val = ctypes.c_float()
        res = ds.DisplayServicesGetBrightness(display_id, ctypes.byref(val))
        if res == 0:
            return val.value
    except Exception as e:
        logger.warning(f"Native brightness read failed: {e}")
    return None

def _set_native_brightness(normalized_level: float) -> bool:
    """Sets hardware brightness directly via DisplayServices C API (0.0 - 1.0)."""
    try:
        cg = ctypes.cdll.LoadLibrary("/System/Library/Frameworks/CoreGraphics.framework/CoreGraphics")
        ds = ctypes.cdll.LoadLibrary("/System/Library/PrivateFrameworks/DisplayServices.framework/DisplayServices")
        cg.CGMainDisplayID.restype = ctypes.c_uint32
        ds.DisplayServicesSetBrightness.argtypes = [ctypes.c_uint32, ctypes.c_float]
        ds.DisplayServicesSetBrightness.restype = ctypes.c_int

        display_id = cg.CGMainDisplayID()
        norm = max(0.0, min(1.0, normalized_level))
        res = ds.DisplayServicesSetBrightness(display_id, ctypes.c_float(norm))
        return res == 0
    except Exception as e:
        logger.warning(f"Native brightness write failed: {e}")
        return False

async def set_brightness(level: int) -> Tuple[bool, str]:
    """Sets screen brightness (0 - 100)."""
    level = max(0, min(100, level))
    
    # 1. Direct macOS DisplayServices C API (Fastest, zero permissions required)
    if _set_native_brightness(level / 100.0):
        return True, f"Screen brightness set to {level}%."

    # 2. Try brightness CLI if available
    try:
        proc = await asyncio.create_subprocess_exec("brightness", str(level / 100.0), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        await proc.communicate()
        if proc.returncode == 0:
            return True, f"Screen brightness set to {level}%."
    except Exception:
        pass

    # 3. AppleScript Key codes fallback
    script = f'''
    tell application "System Events"
        repeat 16 times
            key code 144
        end repeat
        repeat {int(level / 6.25)} times
            key code 145
        end repeat
    end tell
    '''
    await run_applescript(script)
    return True, f"Screen brightness set to {level}%."

async def increase_brightness(step: int = 15) -> Tuple[bool, str]:
    """Increases screen brightness."""
    curr = _get_native_brightness()
    if curr is not None:
        new_norm = min(1.0, curr + (step / 100.0))
        if _set_native_brightness(new_norm):
            return True, f"Brightness increased to {int(new_norm * 100)}%."

    script = f'''
    tell application "System Events"
        repeat {max(1, int(step / 6))} times
            key code 145
        end repeat
    end tell
    '''
    await run_applescript(script)
    return True, "Increased screen brightness."

async def decrease_brightness(step: int = 15) -> Tuple[bool, str]:
    """Decreases screen brightness."""
    curr = _get_native_brightness()
    if curr is not None:
        new_norm = max(0.0, curr - (step / 100.0))
        if _set_native_brightness(new_norm):
            return True, f"Brightness decreased to {int(new_norm * 100)}%."

    script = f'''
    tell application "System Events"
        repeat {max(1, int(step / 6))} times
            key code 144
        end repeat
    end tell
    '''
    await run_applescript(script)
    return True, "Decreased screen brightness."

# ==========================================
# 2. 🔊 VOLUME & AUDIO CONTROLS
# ==========================================

async def set_volume(level: int) -> Tuple[bool, str]:
    """Sets system volume (0 - 100)."""
    level = max(0, min(100, level))
    success, _ = await run_applescript(f"set volume output volume {level}")
    if success:
        return True, f"Volume set to {level}%."
    return False, "Failed to adjust volume."

async def increase_volume(step: int = 10) -> Tuple[bool, str]:
    """Increases current system volume."""
    success, current = await run_applescript("output volume of (get volume settings)")
    try:
        curr_vol = int(current) if success and current.isdigit() else 50
        new_vol = min(100, curr_vol + step)
        await set_volume(new_vol)
        return True, f"Volume increased to {new_vol}%."
    except Exception:
        await run_applescript("set volume output volume ((output volume of (get volume settings)) + 10)")
        return True, "Volume increased."

async def decrease_volume(step: int = 10) -> Tuple[bool, str]:
    """Decreases current system volume."""
    success, current = await run_applescript("output volume of (get volume settings)")
    try:
        curr_vol = int(current) if success and current.isdigit() else 50
        new_vol = max(0, curr_vol - step)
        await set_volume(new_vol)
        return True, f"Volume decreased to {new_vol}%."
    except Exception:
        await run_applescript("set volume output volume ((output volume of (get volume settings)) - 10)")
        return True, "Volume decreased."

async def mute_volume(mute: bool = True) -> Tuple[bool, str]:
    """Mutes or unmutes system audio."""
    state = "true" if mute else "false"
    success, _ = await run_applescript(f"set volume output muted {state}")
    if success:
        return True, "Audio muted." if mute else "Audio unmuted."
    return False, "Failed to toggle mute."

# ==========================================
# 3. 🌙 DARK MODE & APPEARANCE
# ==========================================

async def toggle_dark_mode() -> Tuple[bool, str]:
    """Toggles macOS Dark Mode appearance."""
    script = '''
    tell application "System Events"
        tell appearance preferences
            set dark mode to not dark mode
        end tell
    end tell
    '''
    success, _ = await run_applescript(script)
    if success:
        return True, "Toggled macOS dark mode appearance."
    return True, "Switched macOS appearance mode."

# ==========================================
# 4. 🎵 MEDIA CONTROLS (Spotify, Apple Music, Web)
# ==========================================

async def media_play_pause() -> Tuple[bool, str]:
    """Play or pause active media playback."""
    # Try Spotify first
    spotify_script = '''
    if application "Spotify" is running then
        tell application "Spotify" to playpause
        return "Spotify"
    else if application "Music" is running then
        tell application "Music" to playpause
        return "Apple Music"
    else
        tell application "System Events" to key code 49 using command down
        return "Media"
    end if
    '''
    success, app_name = await run_applescript(spotify_script)
    if success:
        return True, f"Toggled media playback ({app_name or 'Audio'})."
    return True, "Media playback toggled."

async def media_next_track() -> Tuple[bool, str]:
    """Skip to next track."""
    script = '''
    if application "Spotify" is running then
        tell application "Spotify" to next track
        return "Spotify next track"
    else if application "Music" is running then
        tell application "Music" to next track
        return "Apple Music next track"
    end if
    '''
    await run_applescript(script)
    return True, "Skipped to next track."

async def media_prev_track() -> Tuple[bool, str]:
    """Go to previous track."""
    script = '''
    if application "Spotify" is running then
        tell application "Spotify" to previous track
        return "Spotify previous track"
    else if application "Music" is running then
        tell application "Music" to previous track
        return "Apple Music previous track"
    end if
    '''
    await run_applescript(script)
    return True, "Playing previous track."

# ==========================================
# 5. 📸 SCREENSHOTS & DESKTOP ACTIONS
# ==========================================

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

async def lock_screen() -> Tuple[bool, str]:
    """Instantly locks the screen / puts displays to sleep."""
    try:
        proc = await asyncio.create_subprocess_exec("pmset", "displaysleepnow")
        await proc.communicate()
        return True, "Locking screen now."
    except Exception as e:
        return False, f"Failed to lock screen: {e}"

async def empty_trash() -> Tuple[bool, str]:
    """Empties macOS Trash."""
    script = 'tell application "Finder" to empty trash'
    success, _ = await run_applescript(script)
    if success:
        return True, "macOS Trash emptied."
    return False, "Failed to empty trash."

# ==========================================
# 6. 📊 SYSTEM & BATTERY STATS
# ==========================================

async def get_battery_info() -> Dict[str, Any]:
    """Get clean, human-readable macOS battery status."""
    try:
        proc = await asyncio.create_subprocess_exec(
            "pmset", "-g", "batt",
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        out, _ = await proc.communicate()
        raw = out.decode().strip()

        pct_match = re.search(r"(\d+)%", raw)
        percentage = int(pct_match.group(1)) if pct_match else None

        status = "on battery"
        if "charging" in raw.lower() and "discharging" not in raw.lower():
            status = "charging"
        elif "charged" in raw.lower() or (percentage is not None and percentage == 100):
            status = "fully charged"
        elif "discharging" in raw.lower():
            status = "discharging"

        time_match = re.search(r"(\d+):(\d+)\s+remaining", raw)
        time_rem = ""
        if time_match:
            hours, mins = time_match.groups()
            if int(hours) > 0:
                time_rem = f"{hours}h {mins}m remaining"
            else:
                time_rem = f"{mins}m remaining"

        # Build clean natural sentence
        if percentage is not None:
            if status == "charging":
                est = f" (approx. {time_rem})" if time_rem else ""
                sentence = f"🔋 Battery is at {percentage}% and currently charging{est}."
            elif status == "fully charged":
                sentence = f"⚡ Battery is fully charged at 100% on AC power."
            else:
                est = f" (~{time_rem})" if time_rem else ""
                sentence = f"🔋 Battery is at {percentage}%{est}."
        else:
            sentence = "⚡ Connected to power."

        return {
            "percentage": percentage,
            "status": status,
            "time_remaining": time_rem,
            "formatted": sentence,
        }
    except Exception as e:
        logger.error(f"Battery info error: {e}")
        return {
            "percentage": None,
            "status": "unknown",
            "time_remaining": "",
            "formatted": "Battery status currently unavailable.",
        }

async def get_system_stats() -> Dict[str, Any]:
    """Get clean system specifications and telemetry."""
    batt = await get_battery_info()
    arch_name = "Apple Silicon" if platform.machine() == "arm64" else platform.machine()
    cpu_cores = os.cpu_count() or 1

    summary = f"🖥️ macOS ({arch_name}, {cpu_cores} CPU cores) • {batt['formatted']}"

    return {
        "os": "macOS",
        "arch": arch_name,
        "cpu_cores": cpu_cores,
        "python": platform.python_version(),
        "battery": batt,
        "formatted": summary,
    }
