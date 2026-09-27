import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Mic,
  Volume2,
  Check,
  Save,
  Cpu
} from 'lucide-react';

export const CustomizeView: React.FC = () => {
  const [wakeWord, setWakeWord] = useState('Hey Kyro');
  const [speechRate, setSpeechRate] = useState(1.05);
  const [selectedVoice, setSelectedVoice] = useState('Default Modern Neural');
  const [autoListen, setAutoListen] = useState(true);
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full select-none font-sans">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#EBE5DC]">
        <div>
          <h1 className="text-2xl font-bold text-[#18181B] flex items-center gap-2.5">
            <SlidersHorizontal className="w-6 h-6 text-[#D97706]" />
            Preferences & Voice Settings
          </h1>
          <p className="text-xs text-[#71717A] mt-1">
            Configure Kyro wake-word detection, speech synthesis, and local LLM endpoints.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#18181B] text-white text-xs font-semibold hover:bg-[#27272A] transition-all cursor-pointer shadow-sm"
        >
          {saved ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Save className="w-3.5 h-3.5" />}
          <span>{saved ? 'Saved!' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Wake Word Section */}
        <div className="bg-[#FFFFFF] border border-[#EAE4DB] rounded-xl p-5 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#F4EFEA]">
            <Mic className="w-4 h-4 text-[#D97706]" />
            <h3 className="text-sm font-bold text-[#18181B]">Wake Word Engine</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-[#3F3F46] block mb-1">
                Activation Phrase
              </label>
              <input
                type="text"
                value={wakeWord}
                onChange={(e) => setWakeWord(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#EAE4DB] text-xs font-semibold text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#D97706]/30"
              />
              <span className="text-[11px] text-[#71717A] mt-1 block">
                Saying this phrase will instantly wake Kyro without clicking anything.
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-xs font-semibold text-[#18181B] block">
                  Continuous Background Listening
                </span>
                <span className="text-[11px] text-[#71717A]">
                  Listen for wake words while other applications are active.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoListen}
                onChange={(e) => setAutoListen(e.target.checked)}
                className="w-4 h-4 rounded text-[#D97706] focus:ring-[#D97706] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Text-to-Speech Settings */}
        <div className="bg-[#FFFFFF] border border-[#EAE4DB] rounded-xl p-5 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#F4EFEA]">
            <Volume2 className="w-4 h-4 text-[#D97706]" />
            <h3 className="text-sm font-bold text-[#18181B]">Speech & Voice Output (TTS)</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#3F3F46] block mb-1">
                Voice Style
              </label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#EAE4DB] text-xs font-semibold text-[#18181B] focus:outline-none cursor-pointer"
              >
                <option value="Default Modern Neural">Default Modern Neural (Samantha/Alex)</option>
                <option value="Warm Natural English">Warm Natural English</option>
                <option value="Crisp Assistant Voice">Crisp Assistant Voice</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-[#3F3F46] mb-1">
                <span>Speech Speed: {speechRate}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.5"
                step="0.05"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full accent-[#D97706] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Local AI Engine Endpoints */}
        <div className="bg-[#FFFFFF] border border-[#EAE4DB] rounded-xl p-5 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#F4EFEA]">
            <Cpu className="w-4 h-4 text-[#D97706]" />
            <h3 className="text-sm font-bold text-[#18181B]">Local Ollama Server</h3>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#3F3F46] block mb-1">
              Ollama Host URL
            </label>
            <input
              type="text"
              value={ollamaUrl}
              onChange={(e) => setOllamaUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#EAE4DB] text-xs font-mono text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#D97706]/30"
            />
            <span className="text-[11px] text-[#71717A] mt-1 block">
              Default: http://localhost:11434 (Connected to Qwen3 8B model).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
