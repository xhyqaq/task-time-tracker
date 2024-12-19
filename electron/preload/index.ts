import { contextBridge, ipcRenderer } from 'electron'

console.log('Preload script starting...')

// 暴露给渲染进程的 API
try {
  console.log('Setting up IPC bridge...')
  
  // 定义允许的 IPC 通道
  const validChannels = [
    'add-task',
    'update-task',
    'delete-task',
    'restore-task',
    'get-tasks',
    'get-range-tasks',
    'task-added',
    'task-updated',
    'task-deleted',
    'task-restored',
    'tasks-loaded',
    'tasks-stats-updated',
    'range-tasks-loaded'
  ]

  contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
      send: (channel: string, ...args: any[]) => {
        if (validChannels.includes(channel)) {
          console.log('IPC Send:', channel, args)
          ipcRenderer.send(channel, ...args)
        }
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

console.log('Preload script finished') 