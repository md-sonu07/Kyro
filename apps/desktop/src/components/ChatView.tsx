import { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Cpu, 
  Trash2, 
  Mic, 
  Zap,
  Globe,
  Volume2
} from 'lucide-react';
import { streamChatMessage, executeCommand, getAIProviders, ProviderInfo } from '../services/api';
import { ChatMessage } from '../types';

interface ChatViewProps {
  onOpenVoicePopup?: () => void;
}

export const ChatView = ({ onOpenVoicePopup }: ChatViewProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm **Kyro**, your fast voice & desktop assistant on macOS.\n\n⚡ **Fast Command Router** is active! You can say or type:\n• *\"open chrome\"* or *\"open vscode\"*\n• *\"search for Next.js 15 tutorials\"*\n• *\"mute\"* or *\"set volume 50\"*\n• Or ask any programming / general question to stream AI answers.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      provider: 'fast_router',
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('ollama');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Load available AI providers on mount and periodically refresh
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
        .catch(() => {});
    };

    refreshProviders();
    const interval = setInterval(refreshProviders, 10000);
    return () => clearInterval(interval);
  }, [selectedProvider]);

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

    setMessages((prev) => [...prev, userMsg, assistantMsgPlaceholder]);
    setInput('');
    setIsStreaming(true);

    try {
      // 1. Run through Fast Command Router
      const cmdResult = await executeCommand(text, selectedProvider);

      if (cmdResult.intent_type !== 'AI_QUERY' && !cmdResult.stream_needed) {
        // Fast instant desktop action (app launch, web search, system command, greeting)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: cmdResult.text_response,
                  intentType: cmdResult.intent_type,
                  actionExecuted: cmdResult.action_executed,
                  executionTimeMs: cmdResult.execution_time_ms,
                }
              : m
          )
        );
        setIsStreaming(false);
        return;
      }

      // 2. If knowledge question / AI query, stream answer from active model
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      await streamChatMessage(
        history,
        selectedProvider,
        (chunk) => {
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

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: 'Chat session cleared. Say or type a command to continue.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const quickShortcuts = [
    { label: "open chrome", icon: Globe },
    { label: "open vscode", icon: Zap },
    { label: "search for React 19 features", icon: Globe },
    { label: "mute", icon: Volume2 },
    { label: "what is TypeScript?", icon: Bot },
  ];

  return (
    <div className="flex flex-col h-full bg-background/50 relative overflow-hidden">
      {/* Top Bar with Provider Selector & Voice Popup Trigger */}
      <div className="h-14 border-b border-border/60 bg-surface/40 backdrop-blur-md px-6 flex items-center justify-between z-10 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span>Kyro Voice & Assistant Hub</span>
          </div>

          <button
            onClick={onOpenVoicePopup}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-primary-600 to-accent-cyan text-white shadow-glow hover:scale-105 transition-all"
          >
            <Mic className="w-3.5 h-3.5 text-white" />
            <span>Open Voice Assistant (⌘K)</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Provider selector pill */}
          <div className="flex items-center gap-2 bg-slate-900/80 border border-border px-3 py-1.5 rounded-xl text-xs">
            <Cpu className="w-3.5 h-3.5 text-accent-cyan" />
            <span className="text-slate-400">Model:</span>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              {providers.length > 0 ? (
                providers.map((p) => (
                  <option key={p.name} value={p.name} className="bg-surface text-slate-200">
                    {p.name === 'ollama' ? '🦙 Ollama Local' : p.name === 'openai' ? '☁️ Cloud OpenAI' : '⚡ Kyro Fast Engine'} {p.available ? '(Ready)' : '(Offline)'}
                  </option>
                ))
              ) : (
                <>
                  <option value="ollama" className="bg-surface text-slate-200">🦙 Ollama Local</option>
                  <option value="openai" className="bg-surface text-slate-200">☁️ Cloud OpenAI</option>
                  <option value="mock" className="bg-surface text-slate-200">⚡ Kyro Fast Engine</option>
                </>
              )}
            </select>
          </div>

          <button
            onClick={clearChat}
            title="Clear conversation"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-surface border border-transparent hover:border-border transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-violet flex items-center justify-center shadow-glow shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-primary-600 text-white rounded-br-sm shadow-md'
                    : 'glass-card border border-border text-slate-200 rounded-bl-sm'
                }`}
              >
                {/* Fast Action Indicator Pill */}
                {msg.intentType && msg.intentType !== 'AI_QUERY' && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ⚡ {msg.intentType}
                    </span>
                    {msg.actionExecuted && (
                      <span className="text-slate-400 font-mono text-[11px]">
                        ↳ {msg.actionExecuted}
                      </span>
                    )}
                    {msg.executionTimeMs !== undefined && (
                      <span className="text-slate-500 font-mono text-[10px] ml-auto">
                        {msg.executionTimeMs}ms
                      </span>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="whitespace-pre-wrap font-sans">
                  {msg.content || (
                    <span className="inline-flex items-center gap-1.5 text-slate-400 text-xs font-mono py-1">
                      <span className="w-2 h-2 rounded-full bg-primary-400 animate-ping" />
                      Executing...
                    </span>
                  )}
                </div>

                <div
                  className={`text-[10px] mt-2 flex items-center gap-2 ${
                    isUser ? 'text-primary-200 justify-end' : 'text-slate-500 justify-start'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.provider && (
                    <span className="font-mono uppercase text-[9px] bg-slate-900/60 px-1.5 py-0.5 rounded border border-border/60">
                      {msg.provider}
                    </span>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-border flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Shortcuts */}
      {messages.length <= 2 && (
        <div className="px-6 pb-2 flex flex-wrap gap-2">
          {quickShortcuts.map((sc, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(sc.label)}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-surface/80 hover:bg-surface border border-border px-3 py-1.5 rounded-full transition-all font-mono"
            >
              <sc.icon className="w-3.5 h-3.5 text-accent-cyan" />
              <span>{sc.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-surface/60 backdrop-blur-md border-t border-border/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative max-w-4xl mx-auto flex items-end gap-2 bg-slate-950/80 border border-border rounded-2xl p-2 shadow-xl focus-within:border-primary-500 transition-colors"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Say or type a command ('open chrome', 'search for...', 'what is react?')..."
            rows={1}
            className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none max-h-32 min-h-[40px]"
          />

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onOpenVoicePopup}
              title="Open Voice Popup Assistant (⌘K)"
              className="p-2 rounded-xl text-accent-cyan hover:bg-surface transition-colors"
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="p-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium transition-all shadow-glow disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
