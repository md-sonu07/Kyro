import re
import time
from typing import Dict, Any, Optional, AsyncGenerator
from app.commands.intents import IntentType, ParsedIntent, CommandResult
from app.commands.handlers.apps import launch_application, MAC_APP_MAP
from app.commands.handlers.browser import search_web_in_browser, open_url_in_browser, DOMAIN_SHORTCUTS
from app.commands.handlers.system import (
    set_brightness,
    increase_brightness,
    decrease_brightness,
    set_volume,
    increase_volume,
    decrease_volume,
    mute_volume,
    toggle_dark_mode,
    media_play_pause,
    media_next_track,
    media_prev_track,
    take_screenshot,
    lock_screen,
    empty_trash,
    get_battery_info,
    get_system_stats,
)
from app.ai.router import ai_router
from app.ai.providers.base import Message, AIResponseChunk
from app.core.logging import logger

GREETING_WORDS = {"hey", "hi", "hello", "yo", "sup", "what's up", "good morning", "good evening", "how are you", "who are you"}

class CommandRouter:
    def parse_intent(self, text: str) -> ParsedIntent:
        clean = text.strip().lower()
        
        # 1. Check Greetings
        if clean in GREETING_WORDS or clean.startswith("hello kyro") or clean.startswith("hey kyro"):
            return ParsedIntent(
                intent_type=IntentType.GREETING,
                action_name="greeting",
                direct_reply="Hey! 👋 I'm Kyro. How can I help you on your Mac?",
            )

        # 2. Check Brightness Controls
        bright_set_match = re.match(r"^(?:set\s+|change\s+)?(?:screen\s+|display\s+)?brightness\s+(?:to\s+|at\s+)?(\d+)(?:%)?$", clean)
        if not bright_set_match:
            bright_set_match = re.match(r"^(?:brightness|screen brightness)\s+(\d+)(?:%)?$", clean)

        if bright_set_match:
            val = int(bright_set_match.group(1))
            return ParsedIntent(intent_type=IntentType.SYSTEM_COMMAND, action_name="set_brightness", params={"level": val})

        if clean in ["increase brightness", "brightness up", "brighter", "more brightness", "turn up brightness", "raise brightness", "make screen brighter"]:
            return ParsedIntent(intent_type=IntentType.SYSTEM_COMMAND, action_name="increase_brightness")

        if clean in ["decrease brightness", "brightness down", "dim screen", "dimmer", "less brightness", "turn down brightness", "lower brightness", "make screen darker"]:
            return ParsedIntent(intent_type=IntentType.SYSTEM_COMMAND, action_name="decrease_brightness")

        # 3. Check Volume & Mute Controls
        if clean in ["mute", "mute audio", "mute volume", "silence", "turn off sound"]:
            return ParsedIntent(intent_type=IntentType.SYSTEM_COMMAND, action_name="mute_volume", params={"mute": True})
        if clean in ["unmute", "unmute audio", "unmute volume", "turn on sound"]:
            return ParsedIntent(intent_type=IntentType.SYSTEM_COMMAND, action_name="mute_volume", params={"mute": False})
        
        vol_match = re.match(r"^(?:set\s+volume\s+(?:to\s+)?|volume\s+)(\d+)(?:%)?$", clean)
        if vol_match:
            vol_val = int(vol_match.group(1))
            return ParsedIntent(intent_type=IntentType.SYSTEM_COMMAND, action_name="set_volume", params={"level": vol_val})

        if clean in ["increase volume", "volume up", "louder", "turn up volume", "raise volume"]:
            return ParsedIntent(intent_type=IntentType.SYSTEM_COMMAND, action_name="increase_volume")

        if clean in ["decrease volume", "volume down", "softer", "quieter", "turn down volume", "lower volume"]:
            return ParsedIntent(intent_type=IntentType.SYSTEM_COMMAND, action_name="decrease_volume")

        # 4. Check Dark Mode
        if clean in ["dark mode", "toggle dark mode", "light mode", "toggle light mode", "switch to dark mode", "switch to light mode", "turn on dark mode", "turn off dark mode"]:
            return ParsedIntent(intent_type=IntentType.SYSTEM_COMMAND, action_name="toggle_dark_mode")

        # 5. Check Media Controls
        if clean in ["play music", "pause music", "pause", "resume music", "play", "stop music", "toggle music", "play spotify", "pause spotify", "music play pause"]:
            return ParsedIntent(intent_type=IntentType.SYSTEM_COMMAND, action_name="media_play_pause")

        if clean in ["next song", "next track", "skip song", "skip track", "next"]:
            return ParsedIntent(intent_type=IntentType.SYSTEM_COMMAND, action_name="media_next_track")

        if clean in ["previous song", "previous track", "prev song", "prev track", "back track", "last song"]:
            return ParsedIntent(intent_type=IntentType.SYSTEM_COMMAND, action_name="media_prev_track")

        # 6. Check Screenshots, Lock Screen, Trash
        if "screenshot" in clean or "capture screen" in clean or clean == "take a picture":
            return ParsedIntent(intent_type=IntentType.SYSTEM_COMMAND, action_name="screenshot")

        if clean in ["lock screen", "lock mac", "sleep screen", "lock computer", "lock display"]:
            return ParsedIntent(intent_type=IntentType.SYSTEM_COMMAND, action_name="lock_screen")

        if clean in ["empty trash", "clean trash", "clear trash", "empty recycle bin"]:
            return ParsedIntent(intent_type=IntentType.SYSTEM_COMMAND, action_name="empty_trash")

        # 7. Check Battery & System Specs
        if clean in ["battery", "battery status", "battery level", "battery percentage", "check battery", "how much battery", "battery percent", "my battery", "batt"]:
            return ParsedIntent(intent_type=IntentType.SYSTEM_COMMAND, action_name="battery_status")

        if clean in ["system info", "system specs", "hardware specs", "mac specs", "system status", "specs", "computer specs"]:
            return ParsedIntent(intent_type=IntentType.SYSTEM_COMMAND, action_name="system_stats")

        # 8. Check App Launching ("open chrome", "launch vscode", "start spotify")
        app_match = re.match(r"^(?:open|launch|start)\s+([a-zA-Z0-9\s]+)$", clean)
        if app_match:
            target = app_match.group(1).strip()
            # Check if it's a domain shortcut first (e.g. "open youtube", "open github")
            if target in DOMAIN_SHORTCUTS:
                return ParsedIntent(
                    intent_type=IntentType.OPEN_URL,
                    action_name="open_url",
                    params={"url": DOMAIN_SHORTCUTS[target]},
                )
            # Check if target is a known app or app query
            return ParsedIntent(
                intent_type=IntentType.OPEN_APP,
                action_name="launch_app",
                params={"app_name": target},
            )

        # 9. Check Web Search ("search for react", "google react", "search react tutorial")
        search_match = re.match(r"^(?:search\s+for|search|google|lookup)\s+(.+)$", text.strip(), re.IGNORECASE)
        if search_match:
            query = search_match.group(1).strip()
            return ParsedIntent(
                intent_type=IntentType.SEARCH_WEB,
                action_name="search_web",
                params={"query": query},
            )

        # 10. Check Direct URLs ("open https://...", "go to youtube.com")
        url_match = re.match(r"^(?:go\s+to|open|visit)\s+(https?://[^\s]+|[a-zA-Z0-9-]+\.(?:com|org|io|dev|ai|net|co)[^\s]*)$", clean)
        if url_match:
            return ParsedIntent(
                intent_type=IntentType.OPEN_URL,
                action_name="open_url",
                params={"url": url_match.group(1)},
            )

        # 11. Default -> AI Knowledge Query
        return ParsedIntent(
            intent_type=IntentType.AI_QUERY,
            action_name="ask_ai",
            params={"query": text},
        )

    async def execute(self, text: str, provider_name: Optional[str] = None) -> CommandResult:
        start = time.time()
        parsed = self.parse_intent(text)
        logger.info(f"CommandRouter parsed intent: {parsed.intent_type} (action: {parsed.action_name})")

        # Handle GREETING
        if parsed.intent_type == IntentType.GREETING:
            msg = parsed.direct_reply or "Hey! 👋 I'm Kyro. How can I help you on your Mac?"
            return CommandResult(
                success=True,
                intent_type=parsed.intent_type,
                action_executed=parsed.action_name,
                voice_response=msg,
                text_response=msg,
                execution_time_ms=round((time.time() - start) * 1000, 2),
            )

        # Handle OPEN_APP
        if parsed.intent_type == IntentType.OPEN_APP:
            app_query = parsed.params.get("app_name", "")
            success, msg, resolved = await launch_application(app_query)
            return CommandResult(
                success=success,
                intent_type=parsed.intent_type,
                action_executed=f"open -a \"{resolved}\"",
                voice_response=msg,
                text_response=msg,
                execution_time_ms=round((time.time() - start) * 1000, 2),
            )

        # Handle SEARCH_WEB
        if parsed.intent_type == IntentType.SEARCH_WEB:
            query = parsed.params.get("query", "")
            success, msg = await search_web_in_browser(query)
            return CommandResult(
                success=success,
                intent_type=parsed.intent_type,
                action_executed=f"google_search: {query}",
                voice_response=msg,
                text_response=msg,
                execution_time_ms=round((time.time() - start) * 1000, 2),
            )

        # Handle OPEN_URL
        if parsed.intent_type == IntentType.OPEN_URL:
            url = parsed.params.get("url", "")
            success, msg = await open_url_in_browser(url)
            return CommandResult(
                success=success,
                intent_type=parsed.intent_type,
                action_executed=f"open_url: {url}",
                voice_response=msg,
                text_response=msg,
                execution_time_ms=round((time.time() - start) * 1000, 2),
            )

        # Handle SYSTEM_COMMAND
        if parsed.intent_type == IntentType.SYSTEM_COMMAND:
            if parsed.action_name == "set_brightness":
                success, msg = await set_brightness(parsed.params.get("level", 50))
            elif parsed.action_name == "increase_brightness":
                success, msg = await increase_brightness()
            elif parsed.action_name == "decrease_brightness":
                success, msg = await decrease_brightness()
            elif parsed.action_name == "set_volume":
                success, msg = await set_volume(parsed.params.get("level", 50))
            elif parsed.action_name == "increase_volume":
                success, msg = await increase_volume()
            elif parsed.action_name == "decrease_volume":
                success, msg = await decrease_volume()
            elif parsed.action_name == "mute_volume":
                success, msg = await mute_volume(parsed.params.get("mute", True))
            elif parsed.action_name == "toggle_dark_mode":
                success, msg = await toggle_dark_mode()
            elif parsed.action_name == "media_play_pause":
                success, msg = await media_play_pause()
            elif parsed.action_name == "media_next_track":
                success, msg = await media_next_track()
            elif parsed.action_name == "media_prev_track":
                success, msg = await media_prev_track()
            elif parsed.action_name == "screenshot":
                success, msg = await take_screenshot()
            elif parsed.action_name == "lock_screen":
                success, msg = await lock_screen()
            elif parsed.action_name == "empty_trash":
                success, msg = await empty_trash()
            elif parsed.action_name == "battery_status":
                batt = await get_battery_info()
                success = True
                msg = batt["formatted"]
            elif parsed.action_name == "system_stats":
                stats = await get_system_stats()
                success = True
                msg = stats["formatted"]
            else:
                success, msg = False, "Unknown system command"

            return CommandResult(
                success=success,
                intent_type=parsed.intent_type,
                action_executed=parsed.action_name,
                voice_response=msg,
                text_response=msg,
                execution_time_ms=round((time.time() - start) * 1000, 2),
            )

        # Handle AI_QUERY
        provider = await ai_router.get_active_provider(provider_name)
        messages = [
            Message(role="system", content="You are Kyro, a fast and intelligent personal AI assistant on macOS. Answer concisely and helpfully."),
            Message(role="user", content=text),
        ]
        reply = await provider.generate(messages)
        return CommandResult(
            success=True,
            intent_type=parsed.intent_type,
            action_executed=f"ai_model: {provider.name}",
            voice_response=reply[:180] + ("..." if len(reply) > 180 else ""),
            text_response=reply,
            execution_time_ms=round((time.time() - start) * 1000, 2),
            stream_needed=True,
        )

command_router = CommandRouter()
