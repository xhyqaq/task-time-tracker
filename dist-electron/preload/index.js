"use strict";
const electron = require("electron");
console.log("Preload script starting...");
try {
  console.log("Setting up IPC bridge...");
  const validChannels = [
    "get-tasks",
    "get-deleted-tasks",
    "add-task",
    "update-task",
    "delete-task",
    "restore-task",
    "permanently-delete-task",
    "load-tasks",
    "get-config",
    "update-config",
    "select-data-path",
    "clear-all-data",
    "get-range-tasks"
  ];
  electron.contextBridge.exposeInMainWorld("electron", {
    ipcRenderer: {
      invoke: async (channel, ...args) => {
        if (validChannels.includes(channel)) {
          console.log("IPC Invoke:", channel, args);
          return await electron.ipcRenderer.invoke(channel, ...args);
        }
        throw new Error(`Invalid channel: ${channel}`);
      },
      on: (channel, func) => {
        if (validChannels.includes(channel)) {
          console.log("IPC On:", channel);
          electron.ipcRenderer.on(channel, (event, ...args) => {
            console.log("IPC Received:", channel, args);
            func(...args);
          });
        }
      },
      removeAllListeners: (channel) => {
        if (validChannels.includes(channel)) {
          console.log("IPC Remove Listeners:", channel);
          electron.ipcRenderer.removeAllListeners(channel);
        }
      }
    }
  });
  console.log("IPC bridge setup complete");
} catch (error) {
  console.error("Failed to setup IPC bridge:", error);
}
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded in preload");
  console.log("Window electron object:", window.electron);
});
console.log("Preload script finished");
