import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowUp,
  Bot,
  Mic,
  MicOff,
  Paperclip,
  Plus,
  Globe,
  Trash2,
  Volume2
} from 'lucide-react';
import { HeroView } from './HeroView';
import { ModelDropdown } from './ModelDropdown';
import { ThinkingBlock } from './ThinkingBlock';
import { streamChatMessage, executeCommand, getAIProviders, ProviderInfo } from '../services/api';
import { ChatMessage, ChatSession } from '../types';

interface ChatViewProps {
  onOpenVoicePopup?: () => void;
  activeSession?: ChatSession | null;
  onSaveSession: (session: ChatSession) => void;
  onNewChat: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  activeSession,
  onSaveSession,
  onNewChat,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(activeSession?.messages || []);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSpeechEnabled, setVoiceSpeechEnabled] = useState(true);
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>(activeSession?.provider || 'ollama');
  const [sessionId, setSessionId] = useState<string>(activeSession?.id || `s-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (activeSession) {
      setMessages(activeSession.messages || []);
      setSelectedProvider(activeSession.provider || 'ollama');
      setSessionId(activeSession.id);
    } else {
      setMessages([]);
      setSessionId(`s-${Date.now()}`);
    }
  }, [activeSession]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Load available AI providers
  useEffect(() => {
    const refreshProviders = () => {
      getAIProviders()
        .then((data) => {
          setProviders(data);
          const available = data.find((p) => p.available);
          if (available && selectedProvider === 'mock') {
            setSelectedProvider(available.name);
          }
        })
        .catch(() => { });
    };

    refreshProviders();
    const interval = setInterval(refreshProviders, 10000);
    return () => clearInterval(interval);
  }, [selectedProvider]);

  // Web Speech API for Push-to-Talk
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
        handleSend(transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert("Microphone recognition is available in Chrome/Electron.");
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
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isStreaming) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const assistantMsgId = `a-${Date.now()}`;
    const assistantMsgPlaceholder: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      provider: selectedProvider,
    };

    const nextMessages = [...messages, userMsg, assistantMsgPlaceholder];
    setMessages(nextMessages);
    setInput('');
    setIsStreaming(true);

    try {
      // 1. Run through Fast Command Router
      const cmdResult = await executeCommand(text, selectedProvider);

      if (cmdResult.intent_type !== 'AI_QUERY' && !cmdResult.stream_needed) {
        // Fast instant desktop action (app launch, web search, system command, greeting)
        const updatedMessages: ChatMessage[] = nextMessages.map((m) =>
          m.id === assistantMsgId
            ? {
              ...m,
              content: cmdResult.text_response,
              intentType: cmdResult.intent_type,
              actionExecuted: cmdResult.action_executed,
              executionTimeMs: cmdResult.execution_time_ms,
            }
            : m
        );
        setMessages(updatedMessages);
        speakReply(cmdResult.voice_response);
        setIsStreaming(false);

        // Save session
        const title = activeSession?.title || (userMsg.content.length > 38 ? userMsg.content.slice(0, 38) + '...' : userMsg.content);
        const desc = cmdResult.text_response.slice(0, 50) + (cmdResult.text_response.length > 50 ? '...' : '');
        onSaveSession({
          id: sessionId,
          title,
          desc,
          messages: updatedMessages,
          createdAt: activeSession?.createdAt || Date.now(),
          updatedAt: Date.now(),
          provider: selectedProvider,
          mode: 'chat',
        });
        return;
      }

      // 2. If knowledge question / AI query, stream answer from active model
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      let fullAnswer = '';
      await streamChatMessage(
        history,
        selectedProvider,
        (chunk) => {
          fullAnswer += chunk;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? {
                  ...m,
                  content: m.content + chunk,
                  intentType: 'AI_QUERY',
                }
                : m
            )
          );
        },
        () => {
          setIsStreaming(false);
          speakReply(fullAnswer.slice(0, 160));

          // Save completed streamed conversation session
          const finalMessages: ChatMessage[] = nextMessages.map((m) =>
            m.id === assistantMsgId
              ? {
                ...m,
                content: fullAnswer,
                intentType: 'AI_QUERY',
              }
              : m
          );
          const title = activeSession?.title || (userMsg.content.length > 38 ? userMsg.content.slice(0, 38) + '...' : userMsg.content);
          const cleanAnswer = fullAnswer.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/[*#`_~]/g, '').trim();
          const desc = cleanAnswer.slice(0, 50) + (cleanAnswer.length > 50 ? '...' : '');

          onSaveSession({
            id: sessionId,
            title,
            desc: desc || 'Conversation with Kyro AI',
            messages: finalMessages,
            createdAt: activeSession?.createdAt || Date.now(),
            updatedAt: Date.now(),
            provider: selectedProvider,
            mode: 'chat',
          });
        },
        (err) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, content: m.content + `\n\n*(Error: ${err.message})*` }
                : m
            )
          );
          setIsStreaming(false);
        }
      );
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: `Error executing command: ${err.message}` }
            : m
        )
      );
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // If no conversation yet, render Hero View
  if (messages.length === 0) {
    return (
      <HeroView
        onSendMessage={handleSend}
        selectedProvider={selectedProvider}
        setSelectedProvider={setSelectedProvider}
        providers={providers}
      />
    );
  }

  return (
    <div className="flex flex-col h-full relative overflow-hidden select-none font-sans">
      {/* Top action header */}
      <div className="h-12 border-b border-[#EBE5DC] bg-[#FAF7F2]/80 backdrop-blur-md px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={onNewChat}
            className="text-xs font-semibold text-[#18181B] hover:text-[#D97706] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            ← New Conversation
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setVoiceSpeechEnabled(!voiceSpeechEnabled)}
            className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${voiceSpeechEnabled
                ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]'
                : 'bg-[#FFFFFF] text-[#A1A1AA] border-[#EBE5DC]'
              }`}
            title="Toggle voice output"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onNewChat}
            title="Clear and start new conversation"
            className="p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#F2ECE3] transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 max-w-4xl mx-auto w-full">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return isUser ? (
            /* User Sent Message (Right aligned) */
            <div key={msg.id} className="flex flex-col items-end space-y-1.5 max-w-[65%] ml-auto">
              {/* Top Header: Time + Name + Avatar */}
              <div className="flex items-center gap-2 pr-1">
                <span className="text-[11px] text-[#71717A] font-medium">{msg.timestamp}</span>
                <span className="text-xs font-bold text-[#18181B]">Danish</span>
                <div className="w-8 h-8 rounded-full bg-[#18181B] text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
                  D
                </div>
              </div>

              {/* Bubble Content Card */}
              <div className="bg-[#EFF6FF] border border-[#DBEAFE] text-[#1E3A8A] rounded-lg px-4 py-3 text-xs leading-relaxed shadow-xs w-full">
                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
              </div>
            </div>
          ) : (
            /* Assistant Received Message (Left aligned) */
            <div key={msg.id} className="flex flex-col items-start space-y-1.5 max-w-[85%]">
              {/* Top Header: Avatar + Name + Time */}
              <div className="flex items-center gap-2 pl-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#18181B] to-[#3F3F46] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <Bot className="w-3.5 h-3.5 text-[#F59E0B]" />
                </div>
                <span className="text-xs font-bold text-[#18181B]">Kyro AI</span>
                <span className="text-[11px] text-[#71717A] font-medium">{msg.timestamp}</span>
              </div>

              {/* Bubble Content Card */}
              <div className="bg-[#FFFFFF] border border-[#EAE4DB] text-[#18181B] rounded-lg px-4 py-3.5 text-xs leading-relaxed shadow-sm w-full space-y-2">
                {/* Fast Action Indicator Pill */}
                {msg.intentType && msg.intentType !== 'AI_QUERY' && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                      ⚡ {msg.intentType}
                    </span>
                    {msg.actionExecuted && (
                      <span className="text-[#71717A] font-mono text-[11px]">
                        ↳ {msg.actionExecuted}
                      </span>
                    )}
                    {msg.executionTimeMs !== undefined && (
                      <span className="text-[#A1A1AA] font-mono text-[10px] ml-auto">
                        {msg.executionTimeMs}ms
                      </span>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="whitespace-pre-wrap font-sans">
                  {msg.content ? (
                    <ThinkingBlock content={msg.content} />
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[#71717A] text-xs font-mono py-1">
                      <span className="w-2 h-2 rounded-full bg-[#D97706] animate-ping" />
                      Processing...
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Bottom Input */}
      <div className="p-4 max-w-4xl mx-auto w-full">
        <div className="bg-[#FFFFFF] rounded-xl border border-[#E5DFD5] shadow-hero p-3 space-y-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening to your voice..." : "Type your message or command..."}
            rows={1}
            className="w-full bg-transparent resize-none text-sm text-[#18181B] placeholder-[#A1A1AA] focus:outline-none px-2 font-sans max-h-32 min-h-[36px]"
          />

          <div className="flex items-center justify-between pt-1 border-t border-[#F4EFEA]">
            <div className="flex items-center gap-1 text-[#71717A]">
              <button
                type="button"
                className="p-1.5 rounded-lg hover:bg-[#F6F2EC] hover:text-[#18181B] transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>

              <button
                type="button"
                className="p-1.5 rounded-lg hover:bg-[#F6F2EC] hover:text-[#18181B] transition-colors cursor-pointer"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <button
                type="button"
                className="p-1.5 rounded-lg hover:bg-[#F6F2EC] hover:text-[#18181B] transition-colors cursor-pointer"
              >
                <Globe className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={toggleVoice}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${isListening
                    ? 'bg-[#EF4444] text-white shadow-sm animate-pulse'
                    : 'hover:bg-[#F6F2EC] hover:text-[#18181B]'
                  }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <ModelDropdown
                selectedProvider={selectedProvider}
                onSelectProvider={setSelectedProvider}
                size="sm"
                direction="up"
              />

              <button
                type="button"
                onClick={() => {
                  if (input.trim()) handleSend(input.trim());
                }}
                disabled={!input.trim() || isStreaming}
                className="w-7 h-7 rounded-full bg-[#E5DFD5] disabled:opacity-40 enabled:bg-[#18181B] text-white flex items-center justify-center transition-all enabled:hover:scale-105 cursor-pointer shadow-sm"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
