import React, { useState } from 'react';
import {
  Bot,
  Terminal,
  Code2,
  Search,
  Mic,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface AgentProfile {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: React.ElementType;
  badge: string;
  status: 'Ready' | 'Active';
}

export const AgentsView: React.FC = () => {
  const [agents] = useState<AgentProfile[]>([
    {
      id: 'voice-commander',
      name: 'Kyro Voice Commander',
      role: 'Voice-First Assistant',
      description: 'Listens to "Hey Kyro" wake word, launches macOS applications, and controls system settings.',
      icon: Mic,
      badge: 'Core Engine',
      status: 'Active',
    },
    {
      id: 'code-architect',
      name: 'Code & Refactor Agent',
      role: 'Developer Pair Programmer',
      description: 'Full-stack TypeScript, Python, and frontend component developer with AST code editing.',
      icon: Code2,
      badge: 'Coding Specialist',
      status: 'Ready',
    },
    {
      id: 'terminal-executor',
      name: 'macOS Shell Agent',
      role: 'Terminal Operator',
      description: 'Executes zsh shell commands, manages background daemons, and debugs builds.',
      icon: Terminal,
      badge: 'System Access',
      status: 'Ready',
    },
    {
      id: 'web-researcher',
      name: 'Deep Research Agent',
      role: 'Web & Documentation Search',
      description: 'Surfs the web, extracts relevant developer docs, and synthesizes summaries.',
      icon: Search,
      badge: 'Browser Tool',
      status: 'Ready',
    },
  ]);

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full select-none font-sans">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#EBE5DC]">
        <div>
          <h1 className="text-2xl font-bold text-[#18181B] flex items-center gap-2.5">
            <Bot className="w-6 h-6 text-[#2563EB]" />
            Kyro Autonomous Agents
          </h1>
          <p className="text-xs text-[#71717A] mt-1">
            Specialized AI personas and execution agents connected to your local and cloud neural engines.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF6F0] text-[#D97706] border border-[#EBE3D7] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          4 Agents Online
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent) => {
          const Icon = agent.icon;
          return (
            <div
              key={agent.id}
              className="bg-[#FFFFFF] border border-[#EAE4DB] rounded-xl p-5 shadow-card hover:shadow-soft transition-all duration-150 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#FAF6F0] text-[#D97706] border border-[#EBE3D7]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#18181B]">{agent.name}</h3>
                      <span className="text-[11px] font-medium text-[#71717A]">{agent.role}</span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${agent.status === 'Active'
                        ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                        : 'bg-[#F4EFEA] text-[#71717A] border-[#EAE4DB]'
                      }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {agent.status}
                  </span>
                </div>

                <p className="mt-3 text-xs text-[#52525B] leading-relaxed">
                  {agent.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#F4EFEA] flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#F4EFEA] text-[#71717A]">
                  {agent.badge}
                </span>

                <button
                  type="button"
                  onClick={() => alert(`Selected agent: ${agent.name}`)}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE3] border border-[#EAE4DB] text-xs font-semibold text-[#18181B] transition-colors cursor-pointer"
                >
                  Activate Agent
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
