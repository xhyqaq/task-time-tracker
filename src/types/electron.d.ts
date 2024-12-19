interface IpcRenderer {
  send: (channel: string, data: any) => void
  on: (channel: string, callback: Function) => void
  removeAllListeners: (channel: string) => void
}

interface Electron {
  ipcRenderer: IpcRenderer
}

declare global {
  interface Window {
    electron: Electron
  }
} 