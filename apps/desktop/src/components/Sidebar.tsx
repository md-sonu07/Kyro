import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  SlidersHorizontal,
  MessageSquare,
  FolderKanban,
  CheckSquare,
  Bot,
  ChevronUp,
  Trash2,
  Mic,
  Sparkles,
  LogOut,
  Volume2
} from 'lucide-react';

export interface RecentChat {
  id: string;
  title: string;
  desc: string;
  mode?: 'chat' | 'voice';
}

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onNewChat: () => void;
  recentChats: RecentChat[];
  activeChatId?: string | null;
  onSelectRecentChat: (chat: RecentChat) => void;
  onDeleteRecentChat: (id: string, e: React.MouseEvent) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  onNewChat,
  recentChats,
  activeChatId,
  onSelectRecentChat,
  onDeleteRecentChat
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const mainNav = [
    { id: 'chats', label: 'Chats', icon: MessageSquare },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'agents', label: 'Agents', icon: Bot },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <aside className="w-64 h-full bg-[#FAF7F2] border-r border-[#EBE5DC] flex flex-col justify-between select-none text-[#18181B] font-sans shrink-0 relative">
      <div className="flex flex-col flex-1 overflow-y-auto px-3.5 pt-12 space-y-4">

        {/* Top Action Buttons */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={onNewChat}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-[#18181B] hover:bg-[#F0EBE3] rounded-lg transition-colors text-left cursor-pointer group"
          >
            <Plus className="w-4 h-4 text-[#71717A] group-hover:text-[#18181B] transition-colors" />
            <span>New chat</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('search')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left cursor-pointer group ${currentTab === 'search'
                ? 'bg-[#EFE9DF] text-[#18181B] font-semibold'
                : 'text-[#18181B] hover:bg-[#F0EBE3]'
              }`}
          >
            <Search className="w-4 h-4 text-[#71717A] group-hover:text-[#18181B] transition-colors" />
            <span>Search</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('customize')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left cursor-pointer group ${currentTab === 'customize'
                ? 'bg-[#EFE9DF] text-[#18181B] font-semibold'
                : 'text-[#18181B] hover:bg-[#F0EBE3]'
              }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-[#71717A] group-hover:text-[#18181B] transition-colors" />
            <span>Customize</span>
          </button>
        </div>

        <div className="h-[1px] bg-[#EBE5DC]/70 mx-1" />

        {/* Main Navigation Items */}
        <div className="space-y-0.5">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${isActive
                    ? 'bg-[#EFE9DF] text-[#18181B] font-semibold'
                    : 'text-[#3F3F46] hover:bg-[#F2ECE3] hover:text-[#18181B]'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#18181B]' : 'text-[#71717A]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="h-[1px] bg-[#EBE5DC]/70 mx-1" />

        {/* Dynamic RECENTS Section */}
        <div className="space-y-2 pt-1 flex-1">
          <div className="flex items-center justify-between px-3">
            <span className="text-[11px] font-semibold tracking-wider text-[#8E887F] uppercase">
              Recents
            </span>
            <span className="text-[10px] font-mono text-[#A1A1AA]">
              {recentChats.length}
            </span>
          </div>

          <div className="space-y-1">
            {recentChats.map((chat) => {
              const isSelected = activeChatId === chat.id;
              const isVoice = chat.mode === 'voice' || chat.title.startsWith('🎤');
              return (
                <div
                  key={chat.id}
                  onClick={() => onSelectRecentChat(chat)}
                  className={`w-full px-3 py-2 rounded-lg text-left transition-all group cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#EFE9DF] font-semibold border border-[#E5DFD5]'
                      : 'hover:bg-[#F0EBE3] border border-transparent'
                  }`}
                >
                  <div className="overflow-hidden pr-1.5 flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[#18181B] truncate flex items-center gap-1.5">
                      {isVoice ? (
                        <Mic className="w-3 h-3 text-[#D97706] shrink-0" />
                      ) : (
                        <MessageSquare className="w-3 h-3 text-[#71717A] shrink-0" />
                      )}
                      <span className="truncate">{chat.title.replace(/^🎤\s*/, '')}</span>
                    </div>
                    {chat.desc && (
                      <div className="text-[11px] text-[#8E887F] truncate mt-0.5 font-normal">
                        {chat.desc}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => onDeleteRecentChat(chat.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#E5DFD5] rounded-md text-[#A1A1AA] hover:text-[#EF4444] transition-all cursor-pointer shrink-0 ml-1"
                    title="Delete chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}

            {recentChats.length === 0 && (
              <div className="px-3 py-4 text-xs text-[#A1A1AA] italic text-center">
                No recent conversations yet.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* User Profile Pill at Bottom with interactive popover */}
      <div className="p-3 border-t border-[#EBE5DC] bg-[#FAF7F2] relative" ref={profileRef}>
        {/* Profile Popover Menu */}
        {isProfileOpen && (
          <div className="absolute left-3 right-3 bottom-full mb-2 bg-[#FFFFFF] border border-[#EAE4DB] rounded-xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-2.5">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#F4EFEA]">
              <div className="w-9 h-9 rounded-full bg-[#18181B] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                D
              </div>
              <div className="leading-tight">
                <div className="text-xs font-bold text-[#18181B]">Danish</div>
                <div className="text-[11px] text-[#8E887F]">danish@kyro.ai</div>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#FAF7F2] text-[#52525B]">
                <span className="flex items-center gap-1.5 font-medium">
                  <Mic className="w-3.5 h-3.5 text-[#D97706]" />
                  Wake Word:
                </span>
                <span className="font-semibold text-[#18181B]">"Hey Kyro"</span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#FAF7F2] text-[#52525B]">
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                  Local AI:
                </span>
                <span className="font-semibold text-[#18181B]">Qwen3 8B</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCurrentTab('customize');
                  setIsProfileOpen(false);
                }}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-[#FAF7F2] text-[#18181B] font-medium transition-colors text-left cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#71717A]" />
                <span>Voice & Audio Settings</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  alert("Kyro session reset.");
                  setIsProfileOpen(false);
                }}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-[#FEF2F2] text-[#EF4444] font-medium transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Reset Kyro State</span>
              </button>
            </div>
          </div>
        )}

        {/* Profile Trigger Pill */}
        <div
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className={`flex items-center justify-between p-2 rounded-lg transition-all cursor-pointer ${isProfileOpen ? 'bg-[#EFE9DF]' : 'hover:bg-[#F0EBE3]'
            }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#18181B] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              D
            </div>
            <div className="leading-tight">
              <div className="text-xs font-bold text-[#18181B]">Danish</div>
              <div className="text-[10px] text-[#8E887F]">danish@kyro.ai</div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[#8E887F]">
            <ChevronUp className={`w-3.5 h-3.5 transition-transform duration-150 ${isProfileOpen ? 'rotate-180 text-[#18181B]' : ''}`} />
          </div>
        </div>
      </div>
    </aside>
  );
};
