import { contextBridge, ipcRenderer } from 'electron'

console.log('Preload script starting...')

// 暴露给渲染进程的 API
try {
  console.log('Setting up IPC bridge...')
  
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
    'get-range-tasks'
  ]

  contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
      invoke: async (channel: string, ...args: any[]) => {
        if (validChannels.includes(channel)) {
          console.log('IPC Invoke:', channel, args)
          return await ipcRenderer.invoke(channel, ...args)
        }
        throw new Error(`Invalid channel: ${channel}`)
      },
      on: (channel: string, func: (...args: any[]) => void) => {
        if (validChannels.includes(channel)) {
          console.log('IPC On:', channel)
          ipcRenderer.on(channel, (event, ...args) => {
            console.log('IPC Received:', channel, args)
            func(...args)
          })
        }
      },
      removeAllListeners: (channel: string) => {
        if (validChannels.includes(channel)) {
          console.log('IPC Remove Listeners:', channel)
          ipcRenderer.removeAllListeners(channel)
        }
      }
    }
  })
  console.log('IPC bridge setup complete')
} catch (error) {
  console.error('Failed to setup IPC bridge:', error)
}

// 添加 DOMContentLoaded 事件监听器
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded in preload')
  console.log('Window electron object:', window.electron)
})

// 声明全局类型
declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        invoke(channel: string, ...args: any[]): Promise<any>
        on(channel: string, func: (...args: any[]) => void): void
        removeAllListeners(channel: string): void
      }
    }
  }
}

console.log('Preload script finished') 