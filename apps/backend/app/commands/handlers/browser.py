import subprocess
import urllib.parse
import platform
import asyncio
from typing import Tuple
from app.core.logging import logger

DOMAIN_SHORTCUTS = {
    "youtube": "https://www.youtube.com",
    "google": "https://www.google.com",
    "github": "https://www.github.com",
    "twitter": "https://www.x.com",
    "x": "https://www.x.com",
    "reddit": "https://www.reddit.com",
    "chatgpt": "https://chatgpt.com",
    "linkedin": "https://www.linkedin.com",
    "netflix": "https://www.netflix.com",
    "gmail": "https://mail.google.com",
}

async def open_url_in_browser(url: str) -> Tuple[bool, str]:
    """Opens a URL in the user's default browser."""
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url

    logger.info(f"Opening URL in browser: {url}")
    if platform.system() == "Darwin":
        try:
            proc = await asyncio.create_subprocess_exec(
                "open", url,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            await proc.communicate()
            return True, f"Opening {url}"
        except Exception as e:
            return False, f"Failed to open URL: {str(e)}"
    return False, "Browser open is supported on macOS."

async def search_web_in_browser(query: str) -> Tuple[bool, str]:
    """Performs an instant Google search in the browser."""
    clean_query = query.strip()
    encoded = urllib.parse.quote_plus(clean_query)
    search_url = f"https://www.google.com/search?q={encoded}"
    success, _ = await open_url_in_browser(search_url)
    if success:
        return True, f"Searching Google for \"{clean_query}\"."
    return False, f"Could not search for {clean_query}."
