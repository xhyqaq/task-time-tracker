interface IpcRenderer {
  send(channel: string, ...args: any[]): void;
  on(channel: string, listener: (...args: any[]) => void): void;
  removeAllListeners(channel: string): void;
}

interface Electron {
  ipcRenderer: IpcRenderer;
}

declare global {
  interface Window {
    electron: Electron;
  }
} 