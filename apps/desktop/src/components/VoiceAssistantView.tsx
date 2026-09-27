import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  ArrowLeft,
  RotateCcw,
  Bot,
  Radio
} from 'lucide-react';
import { ModelDropdown } from './ModelDropdown';
import { ThinkingBlock, parseThinkingContent } from './ThinkingBlock';
import { executeCommand, streamChatMessage } from '../services/api';

interface DialogueMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
  intent?: string;
  action?: string;
  latency?: number;
  isStreaming?: boolean;
}

interface VoiceAssistantViewProps {
  onBackToChat: () => void;
}

export const VoiceAssistantView: React.FC<VoiceAssistantViewProps> = ({ onBackToChat }) => {
  const [isListening, setIsListening] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceSpeechEnabled, setVoiceSpeechEnabled] = useState(true);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [dialogue, setDialogue] = useState<DialogueMessage[]>([
    {
      id: 'd-welcome',
      role: 'assistant',
      content: 'Hello! I am Kyro, your voice assistant. Say any desktop command like "Open Chrome" or ask me a question and I will answer with live speech.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState('ollama');
  const [lastAction, setLastAction] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const dialogueEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    dialogueEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [dialogue, currentTranscript]);

  // Audio Visualizer setup using Web Audio API
  useEffect(() => {
    let active = true;

    const setupMicAnalyzer = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;

        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateLevel = () => {
          if (!active) return;
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            const normalized = Math.min(1, avg / 70);
            setAudioLevel(normalized);
          }
          animationFrameRef.current = requestAnimationFrame(updateLevel);
        };
        updateLevel();
      } catch {
        const interval = setInterval(() => {
          if (!active) return;
          setAudioLevel(Math.random() * 0.35 + 0.1);
        }, 120);
        return () => clearInterval(interval);
      }
    };

    setupMicAnalyzer();

    return () => {
      active = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => { });
      }
    };
  }, []);

  // Web Speech API continuous recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = (finalTranscript || interimTranscript).trim();
        if (currentText) {
          setCurrentTranscript(currentText);
        }

        if (finalTranscript.trim()) {
          handleVoiceCommand(finalTranscript.trim());
          setCurrentTranscript('');
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        if (isListening) {
          try {
            recognition.start();
          } catch { }
        }
      };

      recognitionRef.current = recognition;

      if (isListening) {
        try {
          recognition.start();
        } catch { }
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch { }
      }
    };
  }, [isListening, selectedProvider]);

  const speakText = (text: string) => {
    if (!voiceSpeechEnabled || !window.speechSynthesis) return;

    // Clean out <think> tags before speaking
    const parsed = parseThinkingContent(text);
    const spokenContent = (parsed.answer || text).replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    if (!spokenContent) return;

    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(spokenContent.slice(0, 300));
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceCommand = async (text: string) => {
    if (!text.trim()) return;

    const userMsgId = `u-${Date.now()}`;
    const userMsg: DialogueMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const assistantMsgId = `a-${Date.now()}`;
    const assistantPlaceholder: DialogueMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '<think>Analyzing user request and formulating optimal response...</think>',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
    };

    setDialogue((prev) => [...prev, userMsg, assistantPlaceholder]);
    setLastAction(null);

    try {
      // 1. Fast Command Router for Desktop Actions
      const cmdResult = await executeCommand(text, selectedProvider);

      if (cmdResult.intent_type !== 'AI_QUERY' && !cmdResult.stream_needed) {
        setDialogue((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                ...msg,
                content: cmdResult.text_response,
                intent: cmdResult.intent_type,
                action: cmdResult.action_executed,
                latency: cmdResult.execution_time_ms,
                isStreaming: false,
              }
              : msg
          )
        );
        setLastAction(`${cmdResult.intent_type} • ${cmdResult.action_executed || 'Executed'}`);
        speakText(cmdResult.voice_response);
        return;
      }

      // 2. Stream Knowledge / LLM query
      let fullAnswer = '';
      await streamChatMessage(
        [{ role: 'user', content: text }],
        selectedProvider,
        (chunk) => {
          fullAnswer += chunk;
          setDialogue((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? {
                  ...msg,
                  content: fullAnswer,
                  intent: 'AI_QUERY',
                  isStreaming: true,
                }
                : msg
            )
          );
        },
        () => {
          setDialogue((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, isStreaming: false }
                : msg
            )
          );
          speakText(fullAnswer);
        },
        (err) => {
          setDialogue((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, content: `Error: ${err.message}`, isStreaming: false }
                : msg
            )
          );
        }
      );
    } catch (err: any) {
      setDialogue((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, content: `Failed: ${err.message}`, isStreaming: false }
            : msg
        )
      );
    }
  };

  const toggleMic = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch { }
      }
    }
  };

  const clearDialogue = () => {
    setDialogue([]);
    setCurrentTranscript('');
    setLastAction(null);
  };

  // Organic pulsing scale calculation for Siri / ChatGPT orb effect
  const orbScale = 1 + (isSpeaking ? 0.35 + Math.sin(Date.now() / 150) * 0.15 : audioLevel * 0.45);
  const orbGlow = 25 + audioLevel * 60 + (isSpeaking ? 50 : 0);

  return (
    <div className="flex-1 flex flex-col p-6 select-none relative overflow-hidden font-sans h-full">

      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between pb-4 border-b border-[#EBE5DC]/80 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToChat}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFFFF] hover:bg-[#FAF7F2] border border-[#EAE4DB] text-xs font-semibold text-[#18181B] shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit Assistant</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F0] border border-[#EBE3D7] text-xs font-semibold text-[#D97706]">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>Live Voice Mode</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ModelDropdown
            selectedProvider={selectedProvider}
            onSelectProvider={setSelectedProvider}
            size="sm"
          />

          <button
            type="button"
            onClick={() => setVoiceSpeechEnabled(!voiceSpeechEnabled)}
            className={`p-2 rounded-full border text-xs transition-all cursor-pointer shadow-sm ${voiceSpeechEnabled
              ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]'
              : 'bg-[#FFFFFF] text-[#A1A1AA] border-[#EAE4DB]'
              }`}
            title="Toggle Voice Output"
          >
            {voiceSpeechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Voice Visualizer + Right Conversation Column */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 overflow-hidden min-h-0">

        {/* LEFT SIDE: Vibrating Organic Voice Sphere & Audio Waves (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-between p-6 bg-[#FFFFFF]/60 backdrop-blur-md rounded-2xl border border-[#EAE4DB] shadow-soft relative overflow-hidden">

          {/* Ambient Radial Waves in Background */}
          <div
            className="absolute w-72 h-72 rounded-full transition-all duration-300 pointer-events-none opacity-40 blur-3xl"
            style={{
              background: isSpeaking
                ? 'radial-gradient(circle, rgba(217, 119, 6, 0.8) 0%, rgba(245, 158, 11, 0.4) 50%, transparent 70%)'
                : 'radial-gradient(circle, rgba(249, 115, 22, 0.6) 0%, rgba(251, 191, 36, 0.3) 50%, transparent 70%)',
              transform: `scale(${orbScale * 1.5})`,
            }}
          />

          {/* Top Status Pill */}
          <div className="z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFFFF] border border-[#EAE4DB] shadow-sm text-xs font-semibold text-[#18181B]">
              <span className={`w-2.5 h-2.5 rounded-full ${isSpeaking ? 'bg-[#D97706] animate-ping' : isListening ? 'bg-[#22C55E] animate-pulse' : 'bg-[#71717A]'}`} />
              <span>
                {isSpeaking ? 'Kyro Speaking...' : isListening ? (currentTranscript ? 'Hearing you...' : 'Listening to your voice...') : 'Microphone Muted'}
              </span>
            </div>
          </div>

          {/* Center Pulsing Sphere with Ripples */}
          <div className="relative flex items-center justify-center my-auto py-10 z-10">
            {/* Outer Ripple Rings */}
            <div
              className="absolute w-56 h-56 rounded-full border border-[#D97706]/30 transition-all duration-150 animate-pulse pointer-events-none"
              style={{
                transform: `scale(${1 + audioLevel * 0.5})`,
                borderColor: isSpeaking ? 'rgba(217, 119, 6, 0.7)' : 'rgba(234, 88, 12, 0.35)',
              }}
            />

            <div
              className="absolute w-44 h-44 rounded-full border border-[#F59E0B]/40 transition-all duration-100 pointer-events-none"
              style={{
                transform: `scale(${1 + audioLevel * 0.35})`,
              }}
            />

            {/* Core Glowing Orb */}
            <div
              onClick={toggleMic}
              className="relative w-36 h-36 rounded-full cursor-pointer flex items-center justify-center shadow-2xl transition-all duration-100 group"
              style={{
                transform: `scale(${orbScale})`,
                background: isSpeaking
                  ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)'
                  : 'linear-gradient(135deg, #18181B 0%, #27272A 50%, #3F3F46 100%)',
                boxShadow: `0 0 ${orbGlow}px rgba(217, 119, 6, ${0.4 + audioLevel * 0.5})`,
              }}
            >
              {/* Internal Audio Reactive Waveform Bars */}
              <div className="flex items-center gap-1.5 z-20">
                {[0.4, 0.8, 1.2, 0.7, 0.3].map((factor, idx) => {
                  const barHeight = 8 + (audioLevel * 42 * factor) + (isSpeaking ? 28 * factor : 0);
                  return (
                    <div
                      key={idx}
                      className="w-1.5 rounded-full bg-white transition-all duration-75"
                      style={{
                        height: `${Math.max(6, Math.min(42, barHeight))}px`,
                        opacity: isListening || isSpeaking ? 0.95 : 0.4,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Action & Mic Button */}
          <div className="w-full space-y-3 z-10 text-center">
            {lastAction && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F0] border border-[#EBE3D7] text-xs font-mono text-[#D97706] font-semibold">
                <Zap className="w-3.5 h-3.5" />
                <span>{lastAction}</span>
              </div>
            )}

            <div>
              <button
                type="button"
                onClick={toggleMic}
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${isListening
                  ? 'bg-[#18181B] text-white hover:bg-[#27272A]'
                  : 'bg-[#EF4444] text-white hover:bg-[#DC2626]'
                  }`}
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                <span>{isListening ? 'Mute Microphone' : 'Unmute Microphone'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Live Conversation Timeline with Collapsible Thoughts (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col bg-[#FFFFFF] rounded-2xl border border-[#EAE4DB] shadow-card overflow-hidden">

          {/* Conversation Header */}
          <div className="h-12 px-5 border-b border-[#F4EFEA] flex items-center justify-between shrink-0 bg-[#FAF7F2]/50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D97706]" />
              <span className="text-xs font-bold text-[#18181B]">Live Conversation & Thinking</span>
            </div>

            <button
              type="button"
              onClick={clearDialogue}
              className="p-1.5 hover:bg-[#EAE4DB] rounded-lg text-[#71717A] hover:text-[#18181B] transition-colors cursor-pointer"
              title="Clear conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {dialogue.map((msg) => {
              const isUser = msg.role === 'user';
              return isUser ? (
                /* User Sent Message (Right aligned) */
                <div key={msg.id} className="flex flex-col items-end space-y-1.5 max-w-[88%] ml-auto">
                  {/* Top Header: Time + Name + Avatar */}
                  <div className="flex items-center gap-2 pr-1">
                    <span className="text-[11px] text-[#71717A] font-medium">{msg.time}</span>
                    <span className="text-xs font-bold text-[#18181B]">Danish</span>
                    <div className="w-8 h-8 rounded-full bg-[#18181B] text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
                      D
                    </div>
                  </div>

                  {/* Bubble Content Card */}
                  <div className="bg-[#EFF6FF] border border-[#DBEAFE] text-[#1E3A8A] rounded-lg px-4 py-3 text-xs leading-relaxed shadow-xs w-auto max-w-[70%]">
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ) : (
                /* Assistant Received Message (Left aligned) */
                <div key={msg.id} className="flex flex-col items-start space-y-1.5 max-w-[88%]">
                  {/* Top Header: Avatar + Name + Time */}
                  <div className="flex items-center gap-2 pl-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#18181B] to-[#3F3F46] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <Bot className="w-3.5 h-3.5 text-[#F59E0B]" />
                    </div>
                    <span className="text-xs font-bold text-[#18181B]">Kyro AI</span>
                    <span className="text-[11px] text-[#71717A] font-medium">{msg.time}</span>
                  </div>

                  {/* Bubble Content Card */}
                  <div className="bg-[#FFFFFF] border border-[#EAE4DB] text-[#18181B] rounded-xl px-4 py-3.5 text-xs leading-relaxed shadow-sm w-full space-y-2">
                    {/* Fast Action Badge */}
                    {msg.intent && msg.intent !== 'AI_QUERY' && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="px-1.5 py-0.2 rounded font-mono text-[9px] font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                          ⚡ {msg.intent}
                        </span>
                        {msg.action && (
                          <span className="text-[#71717A] font-mono text-[10px]">
                            {msg.action}
                          </span>
                        )}
                        {msg.latency !== undefined && (
                          <span className="text-[#A1A1AA] font-mono text-[9px] ml-auto">
                            {msg.latency}ms
                          </span>
                        )}
                      </div>
                    )}

                    {/* Content with Collapsible Thinking Process */}
                    <ThinkingBlock content={msg.content} />
                  </div>
                </div>
              );
            })}

            {/* Live Real-time Listening Interim Bubble (Appears as you talk) */}
            {currentTranscript && (
              <div className="flex flex-col items-end space-y-1.5 max-w-[88%] ml-auto animate-in fade-in slide-in-from-bottom-2 duration-150">
                <div className="flex items-center gap-2 pr-1">
                  <span className="text-[10px] text-[#D97706] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-ping" />
                    Speaking...
                  </span>
                  <span className="text-xs font-bold text-[#18181B]">Danish</span>
                  <div className="w-6 h-6 rounded-full bg-[#18181B] text-white flex items-center justify-center font-bold text-[11px]">
                    D
                  </div>
                </div>

                <div className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E3A8A] rounded-xl px-4 py-3 text-xs leading-relaxed shadow-xs w-full">
                  <span>{currentTranscript}</span>
                </div>
              </div>
            )}

            <div ref={dialogueEndRef} />
          </div>

          {/* Quick Voice Prompt Suggestions Footer */}
          <div className="p-3 border-t border-[#F4EFEA] bg-[#FAF7F2]/60 shrink-0">
            <div className="text-[10px] font-bold tracking-wider text-[#8E887F] uppercase mb-1.5 pl-1">
              Try Saying:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Open Spotify',
                'Open VS Code',
                'Search Google for AI trends',
                'Set volume to 70%',
                'Explain Quantum Computing',
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleVoiceCommand(suggestion)}
                  className="px-2.5 py-1 rounded-full bg-[#FFFFFF] hover:bg-[#F0EBE3] border border-[#EAE4DB] text-[11px] font-medium text-[#18181B] transition-colors cursor-pointer shadow-2xs"
                >
                  "{suggestion}"
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
