import subprocess
import platform
import asyncio
from typing import Dict, Optional, Tuple
from app.core.logging import logger

# Mapping of common aliases to macOS Application bundle names
MAC_APP_MAP = {
    "chrome": "Google Chrome",
    "google chrome": "Google Chrome",
    "browser": "Google Chrome",
    "vscode": "Visual Studio Code",
    "vs code": "Visual Studio Code",
    "code": "Visual Studio Code",
    "visual studio code": "Visual Studio Code",
    "spotify": "Spotify",
    "music": "Spotify",
    "terminal": "Terminal",
    "iterm": "iTerm",
    "finder": "Finder",
    "files": "Finder",
    "notes": "Notes",
    "safari": "Safari",
    "calculator": "Calculator",
    "slack": "Slack",
    "discord": "Discord",
    "notion": "Notion",
    "settings": "System Settings",
    "system settings": "System Settings",
    "preferences": "System Settings",
    "calendar": "Calendar",
    "messages": "Messages",
    "mail": "Mail",
    "photos": "Photos",
}

async def launch_application(app_name_query: str) -> Tuple[bool, str, Optional[str]]:
    """
    Launches a local application on macOS.
    Returns (success, user_friendly_message, resolved_app_name).
    """
    clean_query = app_name_query.strip().lower()
    resolved_name = MAC_APP_MAP.get(clean_query, app_name_query.strip())

    logger.info(f"Opening desktop app: '{resolved_name}' (query: '{app_name_query}')")

    if platform.system() == "Darwin":
        try:
            # Use macOS native 'open -a' command
            proc = await asyncio.create_subprocess_exec(
                "open", "-a", resolved_name,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            stdout, stderr = await proc.communicate()
            if proc.returncode == 0:
                return True, f"Opening {resolved_name} for you.", resolved_name
            else:
                err_msg = stderr.decode().strip()
                logger.warning(f"open -a failed: {err_msg}")
                return False, f"Could not find or open {resolved_name}.", resolved_name
        except Exception as e:
            logger.error(f"Failed to launch app: {e}")
            return False, f"Failed to open {resolved_name}: {str(e)}", resolved_name
    else:
        return False, "App launching is currently optimized for macOS.", resolved_name
