import pytest
from app.commands.router import command_router
from app.commands.intents import IntentType

def test_greeting_intent():
    parsed = command_router.parse_intent("hello kyro")
    assert parsed.intent_type == IntentType.GREETING
    assert parsed.direct_reply is not None

def test_open_app_intent():
    parsed = command_router.parse_intent("open chrome")
    assert parsed.intent_type == IntentType.OPEN_APP
    assert parsed.params["app_name"] == "chrome"

def test_search_web_intent():
    parsed = command_router.parse_intent("search for React Server Components")
    assert parsed.intent_type == IntentType.SEARCH_WEB
    assert parsed.params["query"] == "React Server Components"

def test_open_shortcut_url_intent():
    parsed = command_router.parse_intent("open youtube")
    assert parsed.intent_type == IntentType.OPEN_URL
    assert "youtube.com" in parsed.params["url"]

def test_system_command_intent():
    parsed = command_router.parse_intent("mute")
    assert parsed.intent_type == IntentType.SYSTEM_COMMAND
    assert parsed.action_name == "mute_volume"

@pytest.mark.asyncio
async def test_fast_execution_greeting():
    result = await command_router.execute("hey")
    assert result.success is True
    assert result.intent_type == IntentType.GREETING
    assert "Kyro" in result.text_response
    assert result.execution_time_ms < 50.0  # Must be fast (< 50ms)
