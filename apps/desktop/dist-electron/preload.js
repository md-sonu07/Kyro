import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("electronAPI", {
  getVersion: () => ipcRenderer.invoke("app:version"),
  getPlatform: () => ipcRenderer.invoke("app:platform"),
  on: (channel, listener) => {
    ipcRenderer.on(channel, (_event, ...args) => listener(...args));
  },
  send: (channel, ...args) => {
    ipcRenderer.send(channel, ...args);
  }
});
//# sourceMappingURL=preload.js.map
