import { spawn, ChildProcess } from 'child_process';
import path from 'path';

export class BackendService {
  private static instance: BackendService;
  private process: ChildProcess | null = null;
  private backendUrl = 'http://127.0.0.1:8000';

  private constructor() {}

  public static getInstance(): BackendService {
    if (!BackendService.instance) {
      BackendService.instance = new BackendService();
    }
    return BackendService.instance;
  }

  public async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.backendUrl}/api/system/health`);
      if (response.ok) {
        const data = await response.json();
        return data.status === 'ok';
      }
      return false;
    } catch {
      return false;
    }
  }

  public getUrl(): string {
    return this.backendUrl;
  }
}
