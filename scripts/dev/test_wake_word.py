#!/usr/bin/env python3
"""
Interactive Wake Word Test Script for Kyro
Run: python scripts/dev/test_wake_word.py
"""
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../apps/backend")))

from app.voice.wake_word import WakeWordDetector

def on_kyro_wake():
    print("\n🟢 [Kyro] Wake word detected!")
    print("🟢 [Kyro] Activated -> Ready to listen for command!\n")

def main():
    print("=" * 60)
    print("🎧 Kyro Wake Word Detector Test")
    print("Listening for: 'Hey Kyro' or 'Kyro'")
    print("=" * 60)

    detector = WakeWordDetector(on_detected=on_kyro_wake)

    # Test phrase validation
    test_phrases = [
        "What is the weather today?",
        "Hey Kyro, open Chrome",
        "Just testing my microphone",
        "Kyro, set volume to 50",
        "Good morning everyone",
        "Hey Kyro",
    ]

    print("\n🧪 Running automated phrase tests:")
    for phrase in test_phrases:
        is_wake = detector.check_phrase(phrase)
        if is_wake:
            detector.trigger_activation(phrase)
        else:
            print(f"⚪ Ignored non-wake phrase: \"{phrase}\"")

    print("\n" + "=" * 60)
    print("Type anything in terminal to test detection (type 'exit' to quit):")
    print("=" * 60)

    try:
        while True:
            user_input = input("🎤 Speak (type text): ").strip()
            if user_input.lower() in ["exit", "quit", "q"]:
                break
            if detector.check_phrase(user_input):
                detector.trigger_activation(user_input)
            else:
                print(f"⚪ (Waiting for 'Hey Kyro'...)")
    except (KeyboardInterrupt, EOFError):
        print("\nExiting test.")

if __name__ == "__main__":
    main()
