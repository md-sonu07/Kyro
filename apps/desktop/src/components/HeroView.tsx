import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Paperclip,
  Globe,
  Mic,
  MicOff,
  ArrowUp
} from 'lucide-react';
import { ModelDropdown } from './ModelDropdown';
import { ProviderInfo } from '../types';

interface HeroViewProps {
  onSendMessage: (text: string) => void;
  selectedProvider: string;
  setSelectedProvider: (provider: string) => void;
  providers: ProviderInfo[];
}

export const HeroView: React.FC<HeroViewProps> = ({
  onSendMessage,
  selectedProvider,
  setSelectedProvider,
  providers: _providers
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Time-aware greeting (Morning / Afternoon / Evening)
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Web Speech API for Push-to-Talk
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        onSendMessage(transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [onSendMessage]);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert("Microphone recognition active in Chrome/Electron!");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput('');
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        onSendMessage(input.trim());
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 max-w-4xl mx-auto w-full space-y-8 select-none">


      {/* Hero Big Headline */}
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#18181B] text-center">
        {getGreeting()}, Danish
      </h1>

      {/* Main Floating Input Card matching screenshot */}
      <div className="w-full bg-[#FFFFFF] rounded-xl border border-[#E5DFD5] shadow-hero p-4 space-y-3 transition-shadow focus-within:shadow-xl">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening to your voice... (Speak now)" : "How can I help you today?"}
          rows={2}
          className="w-full bg-transparent resize-none text-base text-[#18181B] placeholder-[#A1A1AA] focus:outline-none px-2 pt-1 font-sans"
        />

        {/* Action Toolbar */}
        <div className="flex items-center justify-between pt-1 border-t border-[#F4EFEA]">
          {/* Left action icons (+, clip, web, mic) */}
          <div className="flex items-center gap-1 text-[#71717A]">
            <button
              type="button"
              title="Add context"
              className="p-2 rounded-xl hover:bg-[#F6F2EC] hover:text-[#18181B] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>

            <button
              type="button"
              title="Attach file"
              className="p-2 rounded-xl hover:bg-[#F6F2EC] hover:text-[#18181B] transition-colors cursor-pointer"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <button
              type="button"
              title="Search Web"
              className="p-2 rounded-xl hover:bg-[#F6F2EC] hover:text-[#18181B] transition-colors cursor-pointer"
            >
              <Globe className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={toggleVoice}
              title={isListening ? "Stop listening" : "Push-to-Talk Voice"}
              className={`p-2 rounded-xl transition-all cursor-pointer ${isListening
                  ? 'bg-[#EF4444] text-white shadow-md animate-pulse'
                  : 'hover:bg-[#F6F2EC] hover:text-[#18181B]'
                }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          {/* Right dropdown & Send Arrow Button */}
          <div className="flex items-center gap-2">
            {/* Custom Model Dropdown */}
            <ModelDropdown
              selectedProvider={selectedProvider}
              onSelectProvider={setSelectedProvider}
            />

            <button
              type="button"
              onClick={() => {
                if (input.trim()) onSendMessage(input.trim());
              }}
              disabled={!input.trim()}
              className="w-8 h-8 rounded-full bg-[#E5DFD5] disabled:opacity-40 enabled:bg-[#18181B] text-white flex items-center justify-center transition-all enabled:hover:scale-105 cursor-pointer shadow-sm"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
