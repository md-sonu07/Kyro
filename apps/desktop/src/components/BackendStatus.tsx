import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Server, 
  Cpu, 
  Wifi, 
  Send, 
  Zap, 
  Terminal as TerminalIcon,
  Layers,
  Bot
} from 'lucide-react';
import { checkBackendHealth, getSystemInfo, sendChatMessage } from '../services/api';
import { BackendHealthResponse, SystemInfoResponse } from '../types';

export const BackendStatus: React.FC = () => {
  const [health, setHealth] = useState<BackendHealthResponse | null>(null);
  const [sysInfo, setSysInfo] = useState<SystemInfoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Interactive test states
  const [testInput, setTestInput] = useState('Hello Kyro! Test connection.');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const [hData, sData] = await Promise.all([
        checkBackendHealth(),
        getSystemInfo().catch(() => null)
      ]);
      setHealth(hData);
      setSysInfo(sData);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to FastAPI backend');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim()) return;
    setChatLoading(true);
    try {
      const res = await sendChatMessage(testInput);
      setTestResponse(res.reply);
    } catch (err: any) {
      setTestResponse(`Error: ${err.message}`);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 overflow-y-auto max-h-full">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-900/40 via-surface to-slate-900 border border-border p-8 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-primary-400 font-semibold text-xs uppercase tracking-wider mb-2">
              <Zap className="w-4 h-4" /> Phase 1 Setup & Verification
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Kyro Desktop Architecture
            </h1>
            <p className="text-slate-400 mt-2 max-w-xl text-sm leading-relaxed">
              Your autonomous AI desktop assistant foundation is active. React (UI) is interfaced with Electron and FastAPI on localhost:8000.
            </p>
          </div>
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="self-start md:self-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm transition-all shadow-glow hover:shadow-primary-500/25 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Verifying...' : 'Test Kyro Backend'}</span>
          </button>
        </div>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Connection Health */}
        <div className="p-6 rounded-2xl glass-card border border-border flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400">
              <Server className="w-5 h-5" />
            </div>
            {health ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> ONLINE
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <XCircle className="w-3.5 h-3.5" /> OFFLINE
              </span>
            )}
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">FastAPI Backend</h3>
            <p className="text-xs text-slate-400 mt-1 font-mono">http://127.0.0.1:8000</p>
          </div>
          <div className="pt-3 border-t border-border/60 text-xs text-slate-400 space-y-1 font-mono">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={health ? 'text-emerald-400 font-semibold' : 'text-rose-400'}>
                {health ? '✓ Connected' : 'Unreachable'}
              </span>
            </div>
            {health && (
              <div className="flex justify-between">
                <span>Uptime:</span>
                <span className="text-slate-300">{health.uptime}s</span>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Runtime Engine */}
        <div className="p-6 rounded-2xl glass-card border border-border flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-border">
              Mac Desktop
            </span>
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Host System</h3>
            <p className="text-xs text-slate-400 mt-1">
              {sysInfo ? `${sysInfo.platform} (${sysInfo.architecture})` : 'macOS Darwin'}
            </p>
          </div>
          <div className="pt-3 border-t border-border/60 text-xs text-slate-400 space-y-1 font-mono">
            <div className="flex justify-between">
              <span>Python:</span>
              <span className="text-slate-300">{sysInfo?.python_version || '3.14+'}</span>
            </div>
            <div className="flex justify-between">
              <span>CPU Cores:</span>
              <span className="text-slate-300">{sysInfo?.cpu_count || 'Auto'}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Architecture Layers */}
        <div className="p-6 rounded-2xl glass-card border border-border flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-accent-violet/10 border border-accent-violet/20 text-accent-violet">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-border">
              Monorepo
            </span>
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Multi-Engine Stack</h3>
            <p className="text-xs text-slate-400 mt-1">Electron • React • FastAPI • Agent</p>
          </div>
          <div className="pt-3 border-t border-border/60 text-xs text-slate-400 space-y-1 font-mono">
            <div className="flex justify-between">
              <span>Protocol:</span>
              <span className="text-slate-300">REST & WebSocket</span>
            </div>
            <div className="flex justify-between">
              <span>Next Phase:</span>
              <span className="text-accent-cyan font-semibold">Phase 2: AI Layer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive React ↔ FastAPI Bridge Test */}
      <div className="p-6 rounded-2xl glass-panel border border-border space-y-4">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-5 h-5 text-primary-400" />
          <h2 className="text-lg font-bold text-white">Live Frontend ↔ Backend Bridge Test</h2>
        </div>
        <p className="text-xs text-slate-400">
          Send a request from the React UI to the Python FastAPI backend to test the end-to-end communication channel.
        </p>

        <form onSubmit={handleTestMessage} className="flex gap-3">
          <input
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="Type a test message..."
            className="flex-1 bg-slate-900/80 border border-border/80 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 transition-colors font-mono"
          />
          <button
            type="submit"
            disabled={chatLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm transition-all shadow-glow disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{chatLoading ? 'Sending...' : 'Send'}</span>
          </button>
        </form>

        {testResponse && (
          <div className="p-4 rounded-xl bg-slate-950/70 border border-primary-500/20 text-xs font-mono space-y-1.5 animate-fadeIn">
            <div className="text-primary-400 font-semibold flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" /> FastAPI Response:
            </div>
            <p className="text-slate-200">{testResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
};
