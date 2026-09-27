export type AgentStatus = 'idle' | 'planning' | 'executing' | 'waiting_permission' | 'error';

export interface AgentTask {
  id: string;
  goal: string;
  status: AgentStatus;
  createdAt: string;
}

export interface PermissionRequest {
  id: string;
  action: string;
  level: 'auto' | 'permission' | 'confirm';
  details: Record<string, any>;
}
