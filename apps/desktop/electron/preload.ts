import { ipcRenderer, contextBridge } from 'electron';

// Expose safe Electron APIs to renderer process via window.electronAPI
contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => ipcRenderer.invoke('app:version'),
  getPlatform: () => ipcRenderer.invoke('app:platform'),
  on: (channel: string, listener: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (_event, ...args) => listener(...args));
  },
  send: (channel: string, ...args: any[]) => {
    ipcRenderer.send(channel, ...args);
  }
});
