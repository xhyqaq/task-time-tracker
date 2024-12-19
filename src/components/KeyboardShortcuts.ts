import { ComputedRef } from 'vue'

interface Task {
  id: number
  name: string
  completed: boolean
  createdAt: string
  deleted?: boolean
  deletedAt?: string | null
  description?: string
}

interface KeyboardState {
  selectedTaskIndex: number
  selectedDeletedIndex: number
  viewingRecycleBin: boolean
  showQuickAdd: boolean
  taskDetailVisible: boolean
  showTaskDashboard: boolean
  viewingCompleted: boolean
}

interface TaskLists {
  pendingTasks: Task[]
  completedTasks: Task[]
  deletedTasks: Task[]
}

interface Actions {
  selectTask: (index: number, isCompleted: boolean) => void
  updateTaskCompletion: (task: Task) => void
  deleteTask: (task: Task) => void
}

export function useKeyboardShortcuts(
  state: ComputedRef<KeyboardState>,
  lists: ComputedRef<TaskLists>,
  actions: Actions
) {
  const handleKeydown = (e: KeyboardEvent) => {
    // 如果在特殊状态下，不处理快捷键
    if (state.value.showQuickAdd || state.value.taskDetailVisible || state.value.showTaskDashboard) {
      return
    }

    // Command + 数字键选择任务
    if (e.metaKey && /^[1-9]$/.test(e.key)) {
      e.preventDefault()
      const index = parseInt(e.key) - 1
      const currentList = state.value.viewingCompleted ? lists.value.completedTasks : lists.value.pendingTasks
      if (index < currentList.length) {
        actions.selectTask(index, state.value.viewingCompleted)
      }
      return
    }

    // 上下键导航
    if (state.value.selectedTaskIndex !== -1) {
      const currentList = state.value.viewingCompleted ? lists.value.completedTasks : lists.value.pendingTasks
      
      if (e.key === 'ArrowUp' && state.value.selectedTaskIndex > 0) {
        e.preventDefault()
        actions.selectTask(state.value.selectedTaskIndex - 1, state.value.viewingCompleted)
        return
      }
      
      if (e.key === 'ArrowDown' && state.value.selectedTaskIndex < currentList.length - 1) {
        e.preventDefault()
        actions.selectTask(state.value.selectedTaskIndex + 1, state.value.viewingCompleted)
        return
      }
    }

    // 回车键切换任务状态
    if (e.key === 'Enter' && state.value.selectedTaskIndex !== -1) {
      e.preventDefault()
      const currentList = state.value.viewingCompleted ? lists.value.completedTasks : lists.value.pendingTasks
      const task = currentList[state.value.selectedTaskIndex]
      if (task) {
        actions.updateTaskCompletion(task)
        // 重置选中状态，因为任务会移动到另一个列表
        actions.selectTask(-1, state.value.viewingCompleted)
      }
      return
    }

    // Delete/Backspace 键删除任务
    if ((e.key === 'Delete' || e.key === 'Backspace') && state.value.selectedTaskIndex !== -1) {
      e.preventDefault()
      const currentList = state.value.viewingCompleted ? lists.value.completedTasks : lists.value.pendingTasks
      const task = currentList[state.value.selectedTaskIndex]
      if (task && !task.deleted) {
        actions.deleteTask(task)
        // 重置选中状态，因为任务已被删除
        actions.selectTask(-1, state.value.viewingCompleted)
      }
      return
    }
  }

  return {
    handleKeydown
  }
} 