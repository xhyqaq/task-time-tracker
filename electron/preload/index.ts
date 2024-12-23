import { contextBridge, ipcRenderer } from 'electron'

console.log('Preload script starting...')

// 定义允许的 IPC 通道
const validChannels = [
  'get-tasks',
  'get-deleted-tasks',
  'add-task',
  'update-task',
  'delete-task',
  'restore-task',
  'permanently-delete-task',
  'load-tasks',
  'get-config',
  'update-config',
  'select-data-path',
  'clear-all-data',
  'get-range-tasks',
  'task-added',
  'task-updated',
  'task-deleted',
  'task-restored',
  'tasks-stats-updated'
]

// 创建安全的 IPC 通信接口
const api = {
  invoke: async (channel: string, ...args: any[]) => {
    if (validChannels.includes(channel)) {
      console.log('IPC Invoke:', channel, args)
      return await ipcRenderer.invoke(channel, ...args)
    }
    throw new Error(`Invalid channel: ${channel}`)
  },
  on: (channel: string, callback: (...args: any[]) => void) => {
    if (validChannels.includes(channel)) {
      console.log('IPC On:', channel)
      const subscription = (_event: any, ...args: any[]) => callback(...args)
      ipcRenderer.on(channel, subscription)
      return () => {
        console.log('Removing IPC listener:', channel)
        ipcRenderer.removeListener(channel, subscription)
      }
    }
  },
  removeAllListeners: (channel: string) => {
    if (validChannels.includes(channel)) {
      console.log('IPC Remove Listeners:', channel)
      ipcRenderer.removeAllListeners(channel)
    }
  }
}

try {
  console.log('Setting up IPC bridge...')
  
  // 暴露安全的 API 到渲染进程
  contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: api
  })
  
  console.log('IPC bridge setup complete')
} catch (error) {
  console.error('Failed to setup IPC bridge:', error)
}

// 验证 electron 对象
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded in preload')
  console.log('Window electron object:', (window as any).electron)
  
  if (!(window as any).electron) {
    console.error('Electron object not found in window!')
  } else {
    console.log('Electron object successfully exposed to window')
    console.log('Available IPC channels:', validChannels)
  }
})

console.log('Preload script finished') 