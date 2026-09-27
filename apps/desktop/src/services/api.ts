import { 
  BackendHealthResponse, 
  SystemInfoResponse, 
  VoiceStatusResponse,
  CommandResult,
  ProviderInfo
} from '../types';

export type { ProviderInfo };

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export async function checkBackendHealth(): Promise<BackendHealthResponse> {
  const response = await fetch(`${API_BASE_URL}/system/health`);
  if (!response.ok) {
    throw new Error(`Health check failed with status: ${response.status}`);
  }
  return response.json();
}

export async function getSystemInfo(): Promise<SystemInfoResponse> {
  const response = await fetch(`${API_BASE_URL}/system/info`);
  if (!response.ok) {
    throw new Error(`Failed to fetch system info: ${response.status}`);
  }
  return response.json();
}

export async function getVoiceStatus(): Promise<VoiceStatusResponse> {
  const response = await fetch(`${API_BASE_URL}/voice/status`);
  if (!response.ok) {
    throw new Error(`Failed to fetch voice status: ${response.status}`);
  }
  return response.json();
}

export async function getAIProviders(): Promise<ProviderInfo[]> {
  const response = await fetch(`${API_BASE_URL}/chat/providers`);
  if (!response.ok) {
    throw new Error(`Failed to fetch AI providers: ${response.status}`);
  }
  const data = await response.json();
  return data.providers || [];
}

export async function executeCommand(
  text: string,
  provider?: string
): Promise<CommandResult> {
  const response = await fetch(`${API_BASE_URL}/commands/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, provider }),
  });
  if (!response.ok) {
    throw new Error(`Command execution failed: ${response.status}`);
  }
  return response.json();
}

export async function sendChatMessage(
  message: string,
  provider?: string,
): Promise<{ reply: string; provider: string; conversation_id: string; status: string }> {
  const response = await fetch(`${API_BASE_URL}/chat/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, provider }),
  });
  if (!response.ok) {
    throw new Error(`Chat request failed: ${response.status}`);
  }
  return response.json();
}

export async function streamChatMessage(
  messages: Array<{ role: string; content: string }>,
  provider: string,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (err: Error) => void
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, provider }),
    });

    if (!response.ok) {
      throw new Error(`Stream request failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('ReadableStream not supported in response body');
    }

    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.error) {
              onError(new Error(data.error));
            } else if (data.content) {
              onChunk(data.content);
            }
            if (data.done) {
              onDone();
            }
          } catch {
            // continue parsing
          }
        }
      }
    }
    onDone();
  } catch (err: any) {
    onError(err);
  }
}
