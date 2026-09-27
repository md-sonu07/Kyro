import re
import time
from typing import Dict, Any, Optional, AsyncGenerator
from app.commands.intents import IntentType, ParsedIntent, CommandResult
from app.commands.handlers.apps import launch_application, MAC_APP_MAP
from app.commands.handlers.browser import search_web_in_browser, open_url_in_browser, DOMAIN_SHORTCUTS
from app.commands.handlers.system import set_volume, mute_volume, take_screenshot, get_system_stats
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

        # 2. Check App Launching ("open chrome", "launch vscode", "start spotify")
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

        # 3. Check Web Search ("search for react", "google react", "search react tutorial")
        search_match = re.match(r"^(?:search\s+for|search|google|lookup)\s+(.+)$", text.strip(), re.IGNORECASE)
        if search_match:
            query = search_match.group(1).strip()
            return ParsedIntent(
                intent_type=IntentType.SEARCH_WEB,
                action_name="search_web",
                params={"query": query},
            )

        # 4. Check Direct URLs ("open https://...", "go to youtube.com")
        url_match = re.match(r"^(?:go\s+to|open|visit)\s+(https?://[^\s]+|[a-zA-Z0-9-]+\.(?:com|org|io|dev|ai|net|co)[^\s]*)$", clean)
        if url_match:
            return ParsedIntent(
                intent_type=IntentType.OPEN_URL,
                action_name="open_url",
                params={"url": url_match.group(1)},
            )

        # 5. Check System Commands (Volume, Screenshot, Mute)
        if clean in ["mute", "mute audio", "mute volume", "silence"]:
            return ParsedIntent(intent_type=IntentType.SYSTEM_COMMAND, action_name="mute_volume", params={"mute": True})
        if clean in ["unmute", "unmute audio", "unmute volume"]:
            return ParsedIntent(intent_type=IntentType.SYSTEM_COMMAND, action_name="mute_volume", params={"mute": False})
        
        vol_match = re.match(r"^(?:set\s+volume\s+(?:to\s+)?|volume\s+)(\d+)(?:%)?$", clean)
        if vol_match:
            vol_val = int(vol_match.group(1))
            return ParsedIntent(intent_type=IntentType.SYSTEM_COMMAND, action_name="set_volume", params={"level": vol_val})

        if "screenshot" in clean:
            return ParsedIntent(intent_type=IntentType.SYSTEM_COMMAND, action_name="screenshot")

        if clean in ["system info", "system specs", "hardware specs", "mac specs"]:
            return ParsedIntent(intent_type=IntentType.SYSTEM_COMMAND, action_name="system_stats")

        # 6. Default -> AI Knowledge Query
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
            msg = parsed.direct_reply or "Hello! How can I assist you today?"
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
            if parsed.action_name == "mute_volume":
                success, msg = await mute_volume(parsed.params.get("mute", True))
            elif parsed.action_name == "set_volume":
                success, msg = await set_volume(parsed.params.get("level", 50))
            elif parsed.action_name == "screenshot":
                success, msg = await take_screenshot()
            elif parsed.action_name == "system_stats":
                stats = await get_system_stats()
                success = True
                msg = f"Host: {stats['os']} ({stats['arch']}), CPU: {stats['cpu_cores']} cores, Python {stats['python']}"
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
