import React, { useState } from 'react';
import {
  CheckSquare,
  Play,
  CheckCircle2,
  Clock,
  Trash2,
  Plus,
  Zap,
  Activity
} from 'lucide-react';

interface TaskItem {
  id: string;
  title: string;
  category: 'Voice Command' | 'System' | 'AI Workflow';
  status: 'completed' | 'in_progress' | 'pending';
  time: string;
  latency?: string;
}

export const TasksView: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: 't-1',
      title: 'Voice Command: "Open Chrome and search Google"',
      category: 'Voice Command',
      status: 'completed',
      time: '2 mins ago',
      latency: '2.4ms',
    },
    {
      id: 't-2',
      title: 'Fast Action: Set system volume to 50%',
      category: 'System',
      status: 'completed',
      time: '12 mins ago',
      latency: '3.1ms',
    },
    {
      id: 't-3',
      title: 'Stream LLM Query via Qwen3 8B Ollama',
      category: 'AI Workflow',
      status: 'completed',
      time: '25 mins ago',
      latency: '180ms',
    },
    {
      id: 't-4',
      title: 'Background Audio Stream (Hey Kyro Wake Word)',
      category: 'Voice Command',
      status: 'in_progress',
      time: 'Active now',
      latency: '0% CPU',
    },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: TaskItem = {
      id: `t-${Date.now()}`,
      title: newTaskTitle.trim(),
      category: 'AI Workflow',
      status: 'pending',
      time: 'Just now',
    };
    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full select-none font-sans">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#EBE5DC]">
        <div>
          <h1 className="text-2xl font-bold text-[#18181B] flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-[#16A34A]" />
            Tasks & Command History
          </h1>
          <p className="text-xs text-[#71717A] mt-1">
            Real-time execution log of desktop actions, automated scripts, and voice commands.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            Router Online (&lt;5ms)
          </span>
        </div>
      </div>

      {/* Quick Add Task Input */}
      <div className="flex items-center gap-2 mb-6 bg-[#FFFFFF] p-2 rounded-xl border border-[#EAE4DB] shadow-sm">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder="Queue a desktop task or voice automation..."
          className="flex-1 px-3 py-1.5 text-sm bg-transparent focus:outline-none text-[#18181B] placeholder-[#A1A1AA]"
        />
        <button
          type="button"
          onClick={addTask}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#18181B] text-white text-xs font-semibold hover:bg-[#27272A] transition-all cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-[#FFFFFF] border border-[#EAE4DB] rounded-xl p-4 shadow-card hover:shadow-soft transition-all duration-150 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${task.status === 'completed'
                    ? 'bg-[#ECFDF5] text-[#059669]'
                    : task.status === 'in_progress'
                      ? 'bg-[#FEF3C7] text-[#D97706]'
                      : 'bg-[#F4EFEA] text-[#71717A]'
                  }`}
              >
                {task.status === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : task.status === 'in_progress' ? (
                  <Play className="w-4 h-4 animate-pulse" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#18181B]">{task.title}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] font-medium text-[#71717A]">
                    {task.category}
                  </span>
                  <span className="text-[#D4D4D8]">•</span>
                  <span className="text-[11px] text-[#A1A1AA]">{task.time}</span>
                  {task.latency && (
                    <>
                      <span className="text-[#D4D4D8]">•</span>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.2 rounded-full bg-[#FAF6F0] text-[#D97706] border border-[#EBE3D7] flex items-center gap-0.5">
                        <Zap className="w-2.5 h-2.5" />
                        {task.latency}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeTask(task.id)}
              className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
              title="Remove task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
