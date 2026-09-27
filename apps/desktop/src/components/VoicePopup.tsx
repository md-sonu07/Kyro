import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Zap,
  Volume2,
  Globe,
  Folder,
  Sliders,
  Bot,
  Sparkles,
  X,
  Loader2
} from 'lucide-react';
import { executeCommand } from '../services/api';
import { CommandResult } from '../types';

interface VoicePopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProvider: string;
}

export const VoicePopup: React.FC<VoicePopupProps> = ({ isOpen, onClose, selectedProvider }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<CommandResult | null>(null);
  const [voiceSpeechEnabled, setVoiceSpeechEnabled] = useState(true);

  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Web Speech API for voice recognition if available
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        handleRunCommand(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice speech recognition is supported in Chromium/Electron. Type your command below!");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput('');
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch {
        setIsListening(false);
      }
    }
  };

  const speakReply = (text: string) => {
    if (!voiceSpeechEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleRunCommand = async (cmdText?: string) => {
    const text = cmdText || input;
    if (!text.trim() || loading) return;

    setLoading(true);
    try {
      const res = await executeCommand(text, selectedProvider);
      setLastResult(res);
      setInput('');

      // Speak the voice response
      if (res.voice_response) {
        speakReply(res.voice_response);
      }
    } catch (err: any) {
      setLastResult({
        success: false,
        intent_type: 'UNKNOWN',
        voice_response: `Error: ${err.message}`,
        text_response: `Failed to execute command: ${err.message}`,
        execution_time_ms: 0,
        stream_needed: false,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const quickShortcuts = [
    { label: "open chrome", icon: Globe },
    { label: "open vscode", icon: Folder },
    { label: "open spotify", icon: Sliders },
    { label: "search for React 19 features", icon: Globe },
    { label: "mute", icon: Volume2 },
    { label: "what is artificial intelligence?", icon: Bot },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Floating Spotlight Card */}
      <div className="relative w-full max-w-xl mx-4 rounded-xl glass-panel border border-primary-500/40 p-5 shadow-2xl space-y-4 z-10 animate-slideDown">

        {/* Top Header Controls */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-violet flex items-center justify-center shadow-glow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Kyro Fast Assistant
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 font-mono">
              VOICE & COMMANDS
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setVoiceSpeechEnabled(!voiceSpeechEnabled)}
              title={voiceSpeechEnabled ? "Voice Output Enabled" : "Voice Output Muted"}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${voiceSpeechEnabled
                ? 'bg-primary-500/20 text-primary-400 border-primary-500/30'
                : 'bg-surface text-slate-500 border-border'
                }`}
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface border border-transparent hover:border-border transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Voice Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRunCommand();
          }}
          className="relative flex items-center gap-3 bg-slate-900/90 border border-primary-500/50 rounded-xl px-4 py-3 shadow-inner focus-within:border-primary-400 transition-all"
        >
          {/* Push-to-Talk Mic Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-xl transition-all ${isListening
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse scale-105'
              : 'bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 border border-primary-500/30'
              }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening... Speak your command..." : "Say or type: 'open chrome', 'search for...', 'what is...'"}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium transition-all shadow-glow disabled:opacity-40"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>

        {/* Listening Waveform Animation */}
        {isListening && (
          <div className="flex items-center justify-center gap-1.5 py-2">
            {[12, 24, 16, 32, 20, 28, 14, 22].map((height, i) => (
              <span
                key={i}
                style={{ height: `${height}px` }}
                className="w-1 bg-gradient-to-t from-accent-cyan to-primary-400 rounded-full animate-pulse"
              />
            ))}
            <span className="text-xs text-accent-cyan font-mono ml-2">Live Listening...</span>
          </div>
        )}

        {/* Fast Command Feedback Result */}
        {lastResult && (
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-border/80 space-y-2 animate-fadeIn text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${lastResult.intent_type === 'OPEN_APP' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  lastResult.intent_type === 'SEARCH_WEB' ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30' :
                    lastResult.intent_type === 'GREETING' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' :
                      'bg-accent-violet/20 text-accent-violet border border-accent-violet/30'
                  }`}>
                  {lastResult.intent_type}
                </span>
                {lastResult.action_executed && (
                  <span className="text-slate-400 font-mono text-[11px]">
                    ↳ {lastResult.action_executed}
                  </span>
                )}
              </div>
              <span className="text-slate-500 font-mono text-[10px] flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" /> {lastResult.execution_time_ms}ms
              </span>
            </div>

            <p className="text-slate-200 text-xs leading-relaxed font-sans pt-1">
              {lastResult.text_response}
            </p>
          </div>
        )}

        {/* Quick Command Suggestions */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Quick Actions
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickShortcuts.map((sc, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInput(sc.label);
                  handleRunCommand(sc.label);
                }}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-border/80 px-2.5 py-1.5 rounded-xl transition-all font-mono"
              >
                <sc.icon className="w-3 h-3 text-accent-cyan" />
                <span>{sc.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Shortcut Tip */}
        <div className="text-center text-[10px] text-slate-500 font-mono pt-1">
          Press <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-border text-slate-400">Esc</kbd> to close • Click Mic for Push-to-Talk
        </div>
      </div>
    </div>
  );
};
