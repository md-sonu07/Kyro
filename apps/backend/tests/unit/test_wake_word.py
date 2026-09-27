import pytest
from app.voice.wake_word import WakeWordDetector

def test_wake_word_detection():
    activated = False
    def on_wake():
        nonlocal activated
        activated = True

    detector = WakeWordDetector(on_detected=on_wake)

    # Negative tests
    assert detector.check_phrase("hello world") is False
    assert activated is False

    assert detector.check_phrase("what time is it") is False
    assert activated is False

    # Positive tests
    assert detector.check_phrase("Hey Kyro, how are you?") is True
    detector.trigger_activation()
    assert activated is True

    # Standalone 'Kyro'
    assert detector.check_phrase("kyro open chrome") is True
