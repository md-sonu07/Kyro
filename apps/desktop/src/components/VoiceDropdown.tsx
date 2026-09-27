import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Volume2, Check, Sparkles } from 'lucide-react';
import { TTSVoiceInfo } from '../services/api';

interface VoiceDropdownProps {
  voices: TTSVoiceInfo[];
  selectedVoiceId: string;
  onSelectVoice: (voiceId: string) => void;
}

export const VoiceDropdown: React.FC<VoiceDropdownProps> = ({
  voices,
  selectedVoiceId,
  onSelectVoice,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedVoice = voices.find((v) => v.id === selectedVoiceId) || voices[0] || {
    id: 'en-US-JennyNeural',
    name: 'Jenny (Studio AI)',
    accent: 'US',
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFFFF] hover:bg-[#FAF7F2] border border-[#EAE4DB] text-xs font-semibold text-[#18181B] shadow-2xs transition-all cursor-pointer"
      >
        <Volume2 className="w-3.5 h-3.5 text-[#D97706]" />
        <span>{selectedVoice.name}</span>
        <ChevronDown className={`w-3 h-3 text-[#71717A] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#FFFFFF] border border-[#EAE4DB] shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-[#F4EFEA] flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">
              Free AI Voice Models
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#D97706] font-semibold flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              HD Neural
            </span>
          </div>

          <div className="py-1 max-h-60 overflow-y-auto">
            {voices.map((voice) => {
              const isSelected = voice.id === selectedVoiceId;
              return (
                <button
                  key={voice.id}
                  type="button"
                  onClick={() => {
                    onSelectVoice(voice.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-[#FAF7F2] transition-colors cursor-pointer ${
                    isSelected ? 'bg-[#FAF6F0] font-bold text-[#18181B]' : 'text-[#3F3F46]'
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">{voice.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F4EFEA] text-[#71717A]">
                        {voice.accent || voice.gender}
                      </span>
                    </div>
                    {voice.description && (
                      <span className="text-[10px] text-[#A1A1AA] mt-0.5 font-normal line-clamp-1">
                        {voice.description}
                      </span>
                    )}
                  </div>

                  {isSelected && <Check className="w-3.5 h-3.5 text-[#D97706] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
