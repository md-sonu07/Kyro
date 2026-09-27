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
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  provider?: string;
  intentType?: string;
  actionExecuted?: string;
  executionTimeMs?: number;
}

export interface CommandResult {
  success: boolean;
  intent_type: 'OPEN_APP' | 'SEARCH_WEB' | 'OPEN_URL' | 'SYSTEM_COMMAND' | 'GREETING' | 'AI_QUERY' | 'UNKNOWN';
  action_executed?: string;
  voice_response: string;
  text_response: string;
  execution_time_ms: number;
  stream_needed: boolean;
  data?: Record<string, any>;
}

export interface ProviderInfo {
  name: string;
  available: boolean;
  models: string[];
}
