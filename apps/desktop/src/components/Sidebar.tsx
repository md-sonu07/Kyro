import React from 'react';
import { 
  MessageSquare, 
  Cpu, 
  Globe, 
  Mic, 
  Database, 
  Puzzle, 
  Settings, 
  ShieldAlert,
  TerminalSquare
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const navItems = [
    { id: 'status', label: 'Phase 1 Hub', icon: TerminalSquare, badge: 'Live' },
    { id: 'chat', label: 'Agent Chat', icon: MessageSquare },
    { id: 'browser', label: 'Browser Agent', icon: Globe, badge: 'Phase 4' },
    { id: 'voice', label: 'Voice Engine', icon: Mic, badge: 'Phase 5' },
    { id: 'memory', label: 'Memory & SQLite', icon: Database, badge: 'Phase 6' },
    { id: 'skills', label: 'Skills Registry', icon: Puzzle },
    { id: 'permissions', label: 'Permissions', icon: ShieldAlert },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-border/60 bg-surface/50 backdrop-blur-md flex flex-col justify-between p-3 select-none">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
          Modules & Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover/80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  item.badge === 'Live' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-border'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-3 rounded-xl glass-card border border-border/80">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
          <Cpu className="w-4 h-4 text-accent-cyan" />
          <span>Kyro Runtime</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Electron Desktop + FastAPI Agent Core
        </p>
      </div>
    </aside>
  );
};
