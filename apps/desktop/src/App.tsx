import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BackendStatus } from './components/BackendStatus';
import { ChatView } from './components/ChatView';
import { checkBackendHealth } from './services/api';

export function App() {
  const [currentTab, setCurrentTab] = useState('chat');
  const [backendConnected, setBackendConnected] = useState(false);

  useEffect(() => {
    const pingBackend = async () => {
      try {
        const res = await checkBackendHealth();
        setBackendConnected(res.status === 'ok');
      } catch {
        setBackendConnected(false);
      }
    };
    pingBackend();
    const interval = setInterval(pingBackend, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-background overflow-hidden">
      {/* Native Mac-like Header / Window Controls area */}
      <Header backendConnected={backendConnected} activeTab={currentTab} />

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

        {/* Dynamic Content View */}
        <main className="flex-1 bg-gradient-to-b from-background via-surface/40 to-background overflow-hidden flex flex-col">
          {currentTab === 'status' && <BackendStatus />}
          {currentTab === 'chat' && <ChatView />}
          {currentTab !== 'status' && currentTab !== 'chat' && (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400 space-y-4">
              <div className="p-4 rounded-2xl bg-surface border border-border">
                <span className="text-2xl">🚧</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-200 uppercase tracking-wide">
                  {currentTab.toUpperCase()} Module
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  This module is part of the upcoming Kyro implementation phases (Phase 2 - Phase 7).
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
