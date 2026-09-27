import React, { useState } from 'react';
import {
  FolderKanban,
  FolderGit2,
  FileCode,
  ExternalLink,
  Terminal,
  Plus,
  CheckCircle2
} from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const [projects] = useState([
    {
      id: 'kyro-core',
      name: 'Kyro Desktop Monorepo',
      path: '/Users/danish/Desktop/Projects/My Projects/Kyro',
      type: 'TypeScript & Python',
      status: 'Active Workspace',
      filesCount: 42,
      lastModified: 'Just now',
    },
    {
      id: 'voice-engine',
      name: 'Voice Assistant Pipeline',
      path: 'apps/backend/app/voice',
      type: 'Python 3.14 • 16kHz Audio',
      status: 'Ready',
      filesCount: 6,
      lastModified: '15m ago',
    },
    {
      id: 'desktop-ui',
      name: 'Kyro Desktop UI',
      path: 'apps/desktop',
      type: 'React 18 • Vite • Tailwind',
      status: 'Running (Port 5173)',
      filesCount: 28,
      lastModified: '5m ago',
    },
  ]);

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full select-none font-sans">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#EBE5DC]">
        <div>
          <h1 className="text-2xl font-bold text-[#18181B] flex items-center gap-2.5">
            <FolderKanban className="w-6 h-6 text-[#D97706]" />
            Projects & Workspaces
          </h1>
          <p className="text-xs text-[#71717A] mt-1">
            Manage your connected code repositories, local folders, and Kyro agent workspaces.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Add project workspace connected!")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#18181B] text-white text-xs font-semibold hover:bg-[#27272A] transition-all cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Workspace</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="bg-[#FFFFFF] border border-[#EAE4DB] rounded-xl p-5 shadow-card hover:shadow-soft transition-all duration-150 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#FAF6F0] text-[#D97706] border border-[#EBE3D7]">
                    <FolderGit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#18181B]">{proj.name}</h3>
                    <span className="text-[11px] text-[#71717A] font-mono">{proj.type}</span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                  <CheckCircle2 className="w-3 h-3" />
                  {proj.status}
                </span>
              </div>

              <div className="mt-4 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFE9DF] text-xs font-mono text-[#52525B] truncate">
                {proj.path}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#F4EFEA] flex items-center justify-between text-xs text-[#71717A]">
              <span className="flex items-center gap-1 text-[11px]">
                <FileCode className="w-3.5 h-3.5 text-[#8E887F]" />
                {proj.filesCount} files
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert(`Opened terminal for ${proj.name}`)}
                  className="p-1.5 rounded-lg hover:bg-[#F0EBE3] text-[#71717A] hover:text-[#18181B] transition-colors cursor-pointer"
                  title="Open in Terminal"
                >
                  <Terminal className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => alert(`Opened ${proj.name} in IDE`)}
                  className="p-1.5 rounded-lg hover:bg-[#F0EBE3] text-[#71717A] hover:text-[#18181B] transition-colors cursor-pointer"
                  title="Open Workspace"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
