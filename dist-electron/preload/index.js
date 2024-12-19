"use strict";
const electron = require("electron");
console.log("Preload script starting...");
try {
  console.log("Setting up IPC bridge...");
  const validChannels = [
    "add-task",
    "update-task",
    "delete-task",
    "restore-task",
    "get-tasks",
    "get-range-tasks",
    "task-added",
    "task-updated",
    "task-deleted",
    "task-restored",
    "tasks-loaded",
    "tasks-stats-updated",
    "range-tasks-loaded"
  ];
  electron.contextBridge.exposeInMainWorld("electron", {
    ipcRenderer: {
      send: (channel, ...args) => {
        if (validChannels.includes(channel)) {
          console.log("IPC Send:", channel, args);
          electron.ipcRenderer.send(channel, ...args);
        }
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
