export interface BackendHealthResponse {
  status: string;
  app: string;
  version: string;
  timestamp: number;
  uptime: number;
}

export interface SystemInfoResponse {
  platform: string;
  release: string;
  architecture: string;
  python_version: string;
  cpu_count: number | string;
}

export interface VoiceStatusResponse {
  status: string;
  stt_engine: string;
  tts_engine: string;
  wake_word: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
}
