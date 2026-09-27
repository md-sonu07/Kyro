import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Sparkles, Zap, Cloud } from 'lucide-react';

export interface ModelOption {
  id: string;
  name: string;
  badge: string;
  desc: string;
  icon: React.ElementType;
  color: string;
}

const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'ollama',
    name: 'Qwen3 8B (Ollama)',
    badge: 'Local',
    desc: 'Local neural model • Private & Fast',
    icon: Sparkles,
    color: 'text-[#D97706]',
  },
  {
    id: 'mock',
    name: 'Kyro Fast Engine',
    badge: '<5ms',
    desc: 'Instant desktop actions & fast routing',
    icon: Zap,
    color: 'text-[#16A34A]',
  },
  {
    id: 'openai',
    name: 'GPT-4o (Cloud)',
    badge: 'Cloud',
    desc: 'Advanced reasoning & deep analysis',
    icon: Cloud,
    color: 'text-[#2563EB]',
  },
];

interface ModelDropdownProps {
  selectedProvider: string;
  onSelectProvider: (id: string) => void;
  size?: 'sm' | 'md';
  direction?: 'up' | 'down' | 'auto';
}

export const ModelDropdown: React.FC<ModelDropdownProps> = ({
  selectedProvider,
  onSelectProvider,
  size = 'md',
  direction = 'auto',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModel =
    AVAILABLE_MODELS.find((m) => m.id === selectedProvider) || AVAILABLE_MODELS[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isUp = direction === 'up' || (direction === 'auto' && size === 'md');

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 rounded-full bg-[#FFFFFF] hover:bg-[#FAF7F2] border border-[#EAE4DB] shadow-2xs transition-all cursor-pointer select-none ${
          size === 'sm' ? 'px-3 py-1.5 text-xs font-semibold' : 'px-3.5 py-1.5 text-xs font-semibold'
        } ${isOpen ? 'ring-2 ring-[#D97706]/20 border-[#D97706]' : ''}`}
      >
        <currentModel.icon className={`w-3.5 h-3.5 ${currentModel.color}`} />
        <span className="text-[#18181B] font-semibold">{currentModel.name}</span>
        <ChevronDown
          className={`w-3 h-3 text-[#71717A] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#18181B]' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown matching VoiceDropdown styling */}
      {isOpen && (
        <div
          className={`absolute right-0 ${
            isUp ? 'bottom-full mb-2' : 'mt-2'
          } w-72 rounded-2xl bg-[#FFFFFF] border border-[#EAE4DB] shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100 font-sans`}
        >
          <div className="px-3.5 py-2 border-b border-[#F4EFEA] flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">
              Select AI Model
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#D97706] font-semibold flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              Local / Cloud
            </span>
          </div>

          <div className="py-1 max-h-72 overflow-y-auto">
            {AVAILABLE_MODELS.map((model) => {
              const isSelected = model.id === selectedProvider;
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    onSelectProvider(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-[#FAF7F2] transition-colors cursor-pointer ${
                    isSelected ? 'bg-[#FAF6F0] font-bold text-[#18181B]' : 'text-[#3F3F46]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#18181B]">
                          {model.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F4EFEA] text-[#71717A] font-mono">
                          {model.badge}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#A1A1AA] mt-0.5 font-normal line-clamp-1">
                        {model.desc}
                      </span>
                    </div>
                  </div>

                  {isSelected && <Check className="w-3.5 h-3.5 text-[#D97706] shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
