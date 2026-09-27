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

const INITIAL_RECENTS: RecentChat[] = [
  {
    id: 'c-1',
    title: 'Neural architecture analysis',
    desc: 'Comparing transformer variants for seq...',
  },
  {
    id: 'c-2',
    title: 'Build a React dashboard',
    desc: 'Full analytics dashboard with real-time...',
  },
  {
    id: 'c-3',
    title: 'Explain quantum entanglement',
    desc: 'A simplified explanation for software...',
  },
  {
    id: 'c-4',
    title: 'Product copy generator',
    desc: 'AI-powered marketing copy for SaaS...',
  },
  {
    id: 'c-5',
    title: 'Analyze my design aesthetic',
    desc: 'Visual analysis and recommendations...',
  },
];

export function App() {
  const [activeView, setActiveView] = useState<TopNavView>('chats');
  const [currentTab, setCurrentTab] = useState('chats');
  const [backendConnected, setBackendConnected] = useState(false);
  const [isVoicePopupOpen, setIsVoicePopupOpen] = useState(false);
  const [recentChats, setRecentChats] = useState<RecentChat[]>(INITIAL_RECENTS);
  const [chatKey, setChatKey] = useState(0);

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

  const handleNewChat = () => {
    setCurrentTab('chats');
    setActiveView('chats');
    setChatKey((prev) => prev + 1);
  };

  const handleSelectRecentChat = (_chat: RecentChat) => {
    setCurrentTab('chats');
    setActiveView('chats');
    setChatKey((prev) => prev + 1);
  };

  const handleDeleteRecentChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentChats((prev) => prev.filter((c) => c.id !== id));
  };

  const handleTopNavChange = (view: TopNavView) => {
    setActiveView(view);
    if (view === 'chats') {
      setCurrentTab('chats');
    } else if (view === 'assistant') {
      setCurrentTab('agents');
    }
  };

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
              <VoiceAssistantView onBackToChat={() => handleTopNavChange('chats')} />
            ) : (
              <>
                {currentTab === 'chats' && (
                  <ChatView key={chatKey} onOpenVoicePopup={() => setIsVoicePopupOpen(true)} />
                )}
                {currentTab === 'projects' && <ProjectsView />}
                {currentTab === 'tasks' && <TasksView />}
                {currentTab === 'agents' && <AgentsView />}
                {currentTab === 'customize' && <CustomizeView />}
                {currentTab === 'search' && (
                  <SearchView
                    onSelectChat={(_title) => {
                      setCurrentTab('chats');
                      setActiveView('chats');
                      setChatKey((prev) => prev + 1);
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
      />
    </div>
  );
}

export default App;
