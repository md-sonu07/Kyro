import { BackendHealthResponse, SystemInfoResponse, VoiceStatusResponse } from '../types';

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

export async function sendChatMessage(message: string): Promise<{ reply: string; conversation_id: string; status: string }> {
  const response = await fetch(`${API_BASE_URL}/chat/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!response.ok) {
    throw new Error(`Chat request failed: ${response.status}`);
  }
  return response.json();
}
