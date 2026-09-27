import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BackendStatus } from './components/BackendStatus';
import { ChatView } from './components/ChatView';
import { VoicePopup } from './components/VoicePopup';
import { checkBackendHealth } from './services/api';

export function App() {
  const [currentTab, setCurrentTab] = useState('chat');
  const [backendConnected, setBackendConnected] = useState(false);
  const [isVoicePopupOpen, setIsVoicePopupOpen] = useState(false);

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

  // Global keyboard shortcut: Cmd+K / Ctrl+K to open Voice Popup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsVoicePopupOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsVoicePopupOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-background overflow-hidden relative">
      {/* Native Mac-like Header / Window Controls area */}
      <Header 
        backendConnected={backendConnected} 
        activeTab={currentTab} 
        onOpenVoicePopup={() => setIsVoicePopupOpen(true)}
      />

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

        {/* Dynamic Content View */}
        <main className="flex-1 bg-gradient-to-b from-background via-surface/40 to-background overflow-hidden flex flex-col">
          {currentTab === 'status' && <BackendStatus />}
          {currentTab === 'chat' && <ChatView onOpenVoicePopup={() => setIsVoicePopupOpen(true)} />}
          {currentTab !== 'status' && currentTab !== 'chat' && (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400 space-y-4">
              <div className="p-4 rounded-2xl bg-surface border border-border">
                <span className="text-2xl">✨</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-200 uppercase tracking-wide">
                  {currentTab.toUpperCase()} Module
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Voice-first assistant commands are ready! Try saying "open chrome" or "mute".
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Voice & Command Assistant Popup */}
      <VoicePopup
        isOpen={isVoicePopupOpen}
        onClose={() => setIsVoicePopupOpen(false)}
        selectedProvider="ollama"
      />
    </div>
  );
}

export default App;
