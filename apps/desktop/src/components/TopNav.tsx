import React from 'react';
import { Sparkles, MessageSquare, Mic } from 'lucide-react';

export type TopNavView = 'chats' | 'assistant';

interface TopNavProps {
  activeView: TopNavView;
  setActiveView: (view: TopNavView) => void;
  backendConnected: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({ activeView, setActiveView, backendConnected }) => {
  return (
    <header className="h-12 w-full flex items-center justify-between px-6 titlebar-drag select-none shrink-0 bg-transparent z-20 font-sans">
      
      {/* Kyro AI Modern Logo Brand Badge */}
      <div className="titlebar-no-drag flex items-center gap-2 cursor-pointer group">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#18181B] to-[#27272A] border border-[#3F3F46] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
          <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-extrabold tracking-tight text-[#18181B] uppercase">
            Kyro
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#FAF6F0] text-[#D97706] border border-[#EBE3D7] font-semibold">
            AI
          </span>
        </div>
      </div>

      {/* Center Segmented Pill Controller [ Chat | Chat Assistant ] */}
      <div className="titlebar-no-drag bg-[#EBE5DC]/85 p-0.5 rounded-full flex items-center shadow-inner text-xs font-medium border border-[#E0D9CE]">
        <button
          type="button"
          onClick={() => setActiveView('chats')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all cursor-pointer ${
            activeView === 'chats'
              ? 'bg-[#FFFFFF] text-[#18181B] font-bold shadow-sm'
              : 'text-[#71717A] hover:text-[#18181B]'
          }`}
        >
          <MessageSquare className={`w-3.5 h-3.5 ${activeView === 'chats' ? 'text-[#18181B]' : 'text-[#8E887F]'}`} />
          <span>Chat</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('assistant')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all cursor-pointer ${
            activeView === 'assistant'
              ? 'bg-[#18181B] text-[#FFFFFF] font-bold shadow-sm'
              : 'text-[#71717A] hover:text-[#18181B]'
          }`}
        >
          <Mic className={`w-3.5 h-3.5 ${activeView === 'assistant' ? 'text-[#F59E0B] animate-pulse' : 'text-[#8E887F]'}`} />
          <span>Chat Assistant</span>
        </button>
      </div>

      {/* Right Backend Status Dot */}
      <div className="titlebar-no-drag flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#EBE5DC] text-[11px] text-[#71717A] font-mono shadow-xs">
          <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-[#22C55E] animate-pulse' : 'bg-[#EF4444]'}`} />
          <span>{backendConnected ? 'Kyro 8000' : 'Offline'}</span>
        </div>
      </div>
    </header>
  );
};
