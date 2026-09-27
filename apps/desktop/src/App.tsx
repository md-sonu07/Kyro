import { useState, useEffect } from 'react';
import { TopNav, TopNavView } from './components/TopNav';
import { Sidebar, RecentChat } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { ProjectsView } from './components/ProjectsView';
import { TasksView } from './components/TasksView';
import { AgentsView } from './components/AgentsView';
import { CustomizeView } from './components/CustomizeView';
import { SearchView } from './components/SearchView';
import { VoiceAssistantView } from './components/VoiceAssistantView';
import { VoicePopup } from './components/VoicePopup';
import { checkBackendHealth } from './services/api';
import { ChatSession } from './types';

const STORAGE_KEY = 'kyro_chat_sessions';

export function App() {
  const [activeView, setActiveView] = useState<TopNavView>('chats');
  const [currentTab, setCurrentTab] = useState('chats');
  const [backendConnected, setBackendConnected] = useState(false);
  const [isVoicePopupOpen, setIsVoicePopupOpen] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

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

  // Global keyboard shortcut: Cmd+K / Ctrl+K to open Voice Assistant
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

  const saveSessionsToStorage = (sessions: ChatSession[]) => {
    setChatSessions(sessions);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to persist chat sessions:', e);
    }
  };

  const handleSaveSession = (session: ChatSession) => {
    const existingIndex = chatSessions.findIndex((s) => s.id === session.id);
    let updated: ChatSession[];
    if (existingIndex >= 0) {
      updated = [...chatSessions];
      updated[existingIndex] = session;
    } else {
      updated = [session, ...chatSessions];
    }
    saveSessionsToStorage(updated);
    setActiveSessionId(session.id);
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setCurrentTab('chats');
    setActiveView('chats');
  };

  const handleSelectRecentChat = (chat: RecentChat) => {
    setActiveSessionId(chat.id);
    const session = chatSessions.find((s) => s.id === chat.id);
    const isVoice = chat.mode === 'voice' || session?.mode === 'voice' || chat.title.startsWith('🎤');
    if (isVoice) {
      setActiveView('assistant');
      setCurrentTab('agents');
    } else {
      setActiveView('chats');
      setCurrentTab('chats');
    }
  };

  const handleDeleteRecentChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = chatSessions.filter((c) => c.id !== id);
    saveSessionsToStorage(updated);
    if (activeSessionId === id) {
      setActiveSessionId(null);
    }
  };

  const handleTopNavChange = (view: TopNavView) => {
    setActiveView(view);
    if (view === 'chats') {
      setCurrentTab('chats');
    } else if (view === 'assistant') {
      setCurrentTab('agents');
    }
  };

  const recentChats: RecentChat[] = chatSessions.map((s) => ({
    id: s.id,
    title: s.title,
    desc: s.desc,
    mode: s.mode,
  }));

  const activeSession = chatSessions.find((s) => s.id === activeSessionId) || null;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F8F5EE] overflow-hidden select-none font-sans">
      
      {/* Main App Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={(tab) => {
            setCurrentTab(tab);
            if (tab === 'chats') setActiveView('chats');
            else if (tab === 'agents') setActiveView('assistant');
          }}
          onNewChat={handleNewChat}
          recentChats={recentChats}
          activeChatId={activeSessionId}
          onSelectRecentChat={handleSelectRecentChat}
          onDeleteRecentChat={handleDeleteRecentChat}
        />

        {/* Main Canvas View with Warm Ambient Backdrop */}
        <main className="flex-1 warm-canvas-gradient overflow-hidden flex flex-col relative">
          {/* Top Navigation Bar with Traffic Lights & [ Chats | Colab | Code ] Switcher */}
          <TopNav
            activeView={activeView}
            setActiveView={handleTopNavChange}
            backendConnected={backendConnected}
          />

          <div className="flex-1 overflow-hidden flex flex-col">
            {activeView === 'assistant' ? (
              <VoiceAssistantView
                key={activeSessionId || 'voice-new'}
                activeSession={activeSession}
                onSaveSession={handleSaveSession}
                onBackToChat={() => handleTopNavChange('chats')}
              />
            ) : (
              <>
                {currentTab === 'chats' && (
                  <ChatView
                    key={activeSessionId || 'new'}
                    activeSession={activeSession}
                    onSaveSession={handleSaveSession}
                    onNewChat={handleNewChat}
                    onOpenVoicePopup={() => setIsVoicePopupOpen(true)}
                  />
                )}
                {currentTab === 'projects' && <ProjectsView />}
                {currentTab === 'tasks' && <TasksView />}
                {currentTab === 'agents' && <AgentsView />}
                {currentTab === 'customize' && <CustomizeView />}
                {currentTab === 'search' && (
                  <SearchView
                    chatSessions={chatSessions}
                    onSelectSession={(id) => {
                      setActiveSessionId(id);
                      const session = chatSessions.find((s) => s.id === id);
                      const isVoice = session?.mode === 'voice' || session?.title.startsWith('🎤');
                      if (isVoice) {
                        setActiveView('assistant');
                        setCurrentTab('agents');
                      } else {
                        setActiveView('chats');
                        setCurrentTab('chats');
                      }
                    }}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Floating Voice & Command Assistant Popup */}
      <VoicePopup
        isOpen={isVoicePopupOpen}
        onClose={() => setIsVoicePopupOpen(false)}
        selectedProvider="ollama"
        onSaveSession={handleSaveSession}
      />
    </div>
  );
}

export default App;
