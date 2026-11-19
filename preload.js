const { contextBridge, ipcRenderer } = require("electron");

// The setup page can only call these three things, nothing else from Node or Electron.
contextBridge.exposeInMainWorld("weighwiz", {
  getConfig: () => ipcRenderer.invoke("config:get"),
  saveConfig: (config) => ipcRenderer.invoke("config:save", config),
  retry: () => ipcRenderer.invoke("app:retry"),
});
