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
    desc: 'Instant desktop actions & voice routing',
    icon: Zap,
    color: 'text-[#16A34A]',
  },
  {
    id: 'openai',
    name: 'GPT-4o (Cloud)',
    badge: 'Cloud',
    desc: 'Advanced reasoning & multi-step analysis',
    icon: Cloud,
    color: 'text-[#2563EB]',
  },
];

interface ModelDropdownProps {
  selectedProvider: string;
  onSelectProvider: (id: string) => void;
  size?: 'sm' | 'md';
}

export const ModelDropdown: React.FC<ModelDropdownProps> = ({
  selectedProvider,
  onSelectProvider,
  size = 'md',
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

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 rounded-full border border-[#EAE4DB] bg-[#FAF7F2] hover:bg-[#F2ECE3] transition-all cursor-pointer select-none ${size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-xs font-semibold'
          } ${isOpen ? 'ring-2 ring-[#D97706]/30 border-[#D97706]/60' : ''}`}
      >
        <currentModel.icon className={`w-3.5 h-3.5 ${currentModel.color}`} />
        <span className="text-[#18181B]">{currentModel.name}</span>
        <ChevronDown
          className={`w-3 h-3 text-[#71717A] transition-transform duration-150 ${isOpen ? 'rotate-180 text-[#18181B]' : ''
            }`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-72 origin-bottom-right rounded-xl bg-[#FFFFFF] border border-[#EAE4DB] shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 font-sans">
          <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-[#8E887F] uppercase border-b border-[#F4EFEA] mb-1">
            Select AI Engine
          </div>

          <div className="space-y-1">
            {AVAILABLE_MODELS.map((model) => {
              const isSelected = model.id === selectedProvider;
              const Icon = model.icon;
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    onSelectProvider(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer group ${isSelected
                      ? 'bg-[#FAF6F0] border border-[#EBE3D7]'
                      : 'hover:bg-[#F8F5EE] border border-transparent'
                    }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`p-1.5 rounded-lg mt-0.5 ${isSelected ? 'bg-[#FEF3C7]' : 'bg-[#F4EFEA] group-hover:bg-[#EFE8DF]'
                        }`}
                    >
                      <Icon className={`w-4 h-4 ${model.color}`} />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#18181B]">
                          {model.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-[#F2ECE3] text-[#71717A]">
                          {model.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#71717A] mt-0.5 leading-tight">
                        {model.desc}
                      </p>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-[#D97706] shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
