import React from 'react';
import { Bot, ShieldCheck, Mic } from 'lucide-react';

interface HeaderProps {
  backendConnected: boolean;
  activeTab: string;
  onOpenVoicePopup?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ backendConnected, onOpenVoicePopup }) => {
  return (
    <header className="h-14 border-b border-border/60 bg-surface/80 backdrop-blur-md flex items-center justify-between px-6 pl-24 titlebar-drag select-none z-20">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-violet flex items-center justify-center shadow-glow">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Kyro
          </span>
          <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20">
            VOICE ASSISTANT
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 titlebar-no-drag">
        {/* Voice Popup Trigger */}
        <button
          onClick={onOpenVoicePopup}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-primary-600 to-accent-cyan text-white text-xs font-medium shadow-glow hover:opacity-90 transition-all cursor-pointer"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Voice Popup</span>
          <kbd className="px-1.5 py-0.2 rounded bg-black/30 text-[10px] font-mono">⌘K</kbd>
        </button>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 border border-border/80 text-xs">
          <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
          <span className={backendConnected ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
            {backendConnected ? 'FastAPI Connected' : 'Backend Offline'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-surface px-2.5 py-1 rounded-md border border-border">
          <ShieldCheck className="w-3.5 h-3.5 text-accent-cyan" />
          <span>macOS Native</span>
        </div>
      </div>
    </header>
  );
};
