import React, { useState } from 'react';
import { Search, MessageSquare, Terminal, FileCode, ArrowRight } from 'lucide-react';
import { ChatSession } from '../types';

interface SearchViewProps {
  chatSessions?: ChatSession[];
  onSelectSession?: (id: string) => void;
  onSelectChat?: (title: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  chatSessions = [],
  onSelectSession,
  onSelectChat,
}) => {
  const [query, setQuery] = useState('');

  const chatItems = chatSessions.map((session) => ({
    id: session.id,
    type: 'chat',
    title: session.title,
    desc: session.desc || (session.messages[0] ? session.messages[0].content.slice(0, 60) : 'Conversation with Kyro AI'),
    category: 'Chats',
    icon: MessageSquare,
  }));

  const systemItems = [
    {
      id: 'cmd-brightness',
      type: 'command',
      title: 'Set brightness to 80%',
      desc: 'Native macOS display brightness control',
      category: 'Commands',
      icon: Terminal,
    },
    {
      id: 'cmd-volume',
      type: 'command',
      title: 'Set volume to 50%',
      desc: 'macOS system audio control',
      category: 'Commands',
      icon: Terminal,
    },
    {
      id: 'cmd-battery',
      type: 'command',
      title: 'Check battery status',
      desc: 'Hardware power and battery percentage telemetry',
      category: 'Commands',
      icon: Terminal,
    },
    {
      id: 'file-voice',
      type: 'code',
      title: 'apps/backend/app/tts/service.py',
      desc: 'Neural TTS and Edge TTS voice synthesis engine',
      category: 'Files',
      icon: FileCode,
    },
  ];

  const allItems = [...chatItems, ...systemItems];

  const filtered = query.trim()
    ? allItems.filter(
      (r) =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.desc.toLowerCase().includes(query.toLowerCase())
    )
    : allItems;

  const handleItemClick = (item: typeof allItems[0]) => {
    if (item.type === 'chat' && onSelectSession) {
      onSelectSession(item.id);
    } else if (onSelectChat) {
      onSelectChat(item.title);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full select-none font-sans">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#18181B] mb-2">Universal Search</h1>
        <div className="relative">
          <Search className="w-5 h-5 text-[#8E887F] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            placeholder="Search recent conversations, commands, files, or agents..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#FFFFFF] border border-[#EAE4DB] shadow-hero text-sm text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#D97706]/30"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-[11px] font-bold tracking-wider text-[#8E887F] uppercase pl-1 mb-2">
          {query.trim() ? `Search Results (${filtered.length})` : 'Recent Chats & Actions'}
        </div>

        {filtered.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="bg-[#FFFFFF] hover:bg-[#FDFBF7] p-4 rounded-xl border border-[#EAE4DB] shadow-sm hover:shadow-soft transition-all duration-150 flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2 rounded-xl bg-[#FAF6F0] text-[#D97706] border border-[#EBE3D7] group-hover:scale-105 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#18181B] group-hover:text-[#D97706] transition-colors">
                      {item.title}
                    </h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#F4EFEA] text-[#71717A]">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#71717A] mt-0.5">{item.desc}</p>
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-[#A1A1AA] group-hover:text-[#18181B] group-hover:translate-x-1 transition-all" />
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs text-[#71717A]">
            No results found for "{query}".
          </div>
        )}
      </div>
    </div>
  );
};

