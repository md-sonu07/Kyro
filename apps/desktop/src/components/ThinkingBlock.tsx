import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Brain, Sparkles } from 'lucide-react';

interface ThinkingBlockProps {
  content: string;
}

export function parseThinkingContent(rawText: string): {
  thinking: string | null;
  answer: string;
  isThinkingActive: boolean;
} {
  if (!rawText) {
    return { thinking: null, answer: '', isThinkingActive: false };
  }

  // Check for <think> ... </think> or unclosed <think> ...
  const thinkStart = rawText.indexOf('<think>');
  if (thinkStart !== -1) {
    const thinkEnd = rawText.indexOf('</think>');
    if (thinkEnd !== -1) {
      // Completed thought
      const thinking = rawText.substring(thinkStart + 7, thinkEnd).trim();
      const answer = (rawText.substring(0, thinkStart) + rawText.substring(thinkEnd + 8)).trim();
      return { thinking, answer, isThinkingActive: false };
    } else {
      // Unclosed thought (still generating thinking process)
      const thinking = rawText.substring(thinkStart + 7).trim();
      const answer = rawText.substring(0, thinkStart).trim();
      return { thinking, answer, isThinkingActive: true };
    }
  }

  return { thinking: null, answer: rawText, isThinkingActive: false };
}

export const ThinkingBlock: React.FC<ThinkingBlockProps> = ({ content }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { thinking, answer, isThinkingActive } = parseThinkingContent(content);

  return (
    <div className="space-y-2 font-sans">
      {/* Collapsible Thinking Accordion */}
      {thinking && (
        <div className="rounded-xl border border-[#EAE4DB] bg-[#FAF6F0]/80 overflow-hidden transition-all duration-150">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#F4EFEA] transition-colors cursor-pointer text-xs font-semibold text-[#71717A] select-none"
          >
            <div className="flex items-center gap-2">
              <Brain className={`w-3.5 h-3.5 ${isThinkingActive ? 'text-[#D97706] animate-pulse' : 'text-[#8E887F]'}`} />
              <span className="text-[#18181B]">
                {isThinkingActive ? 'Thinking in progress...' : 'Thought process'}
              </span>
              <span className="text-[10px] font-mono font-normal px-1.5 py-0.2 rounded-md bg-[#EBE3D7] text-[#52525B]">
                {isThinkingActive ? 'Live' : 'Click to view'}
              </span>
            </div>

            {isOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-[#71717A]" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-[#71717A]" />
            )}
          </button>

          {isOpen && (
            <div className="px-3.5 py-2.5 border-t border-[#EAE4DB] text-[11px] font-mono leading-relaxed text-[#52525B] bg-[#FFFFFF]/70 whitespace-pre-wrap max-h-56 overflow-y-auto">
              {thinking}
            </div>
          )}
        </div>
      )}

      {/* Main Answer Content */}
      <div className="whitespace-pre-wrap text-xs leading-relaxed text-[#18181B]">
        {answer || (isThinkingActive ? (
          <span className="inline-flex items-center gap-1.5 text-[#8E887F] text-xs font-mono py-1">
            <Sparkles className="w-3.5 h-3.5 text-[#D97706] animate-spin" />
            Formulating final answer...
          </span>
        ) : null)}
      </div>
    </div>
  );
};
