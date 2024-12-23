"use strict";
const electron = require("electron");
console.log("Preload script starting...");
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
  "get-range-tasks",
  "task-added",
  "task-updated",
  "task-deleted",
  "task-restored",
  "tasks-stats-updated"
];
const api = {
  invoke: async (channel, ...args) => {
    if (validChannels.includes(channel)) {
      console.log("IPC Invoke:", channel, args);
      return await electron.ipcRenderer.invoke(channel, ...args);
    }
    throw new Error(`Invalid channel: ${channel}`);
  },
  on: (channel, callback) => {
    if (validChannels.includes(channel)) {
      console.log("IPC On:", channel);
      const subscription = (_event, ...args) => callback(...args);
      electron.ipcRenderer.on(channel, subscription);
      return () => {
        console.log("Removing IPC listener:", channel);
        electron.ipcRenderer.removeListener(channel, subscription);
      };
    }
  },
  removeAllListeners: (channel) => {
    if (validChannels.includes(channel)) {
      console.log("IPC Remove Listeners:", channel);
      electron.ipcRenderer.removeAllListeners(channel);
    }
  }
};
try {
  console.log("Setting up IPC bridge...");
  electron.contextBridge.exposeInMainWorld("electron", {
    ipcRenderer: api
  });
  console.log("IPC bridge setup complete");
} catch (error) {
  console.error("Failed to setup IPC bridge:", error);
}
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded in preload");
  console.log("Window electron object:", window.electron);
  if (!window.electron) {
    console.error("Electron object not found in window!");
  } else {
    console.log("Electron object successfully exposed to window");
    console.log("Available IPC channels:", validChannels);
  }
});
console.log("Preload script finished");
