# 新建文件
<template>
  <el-dialog
    v-model="modelValue"
    title="回收站"
    width="80%"
    destroy-on-close
    @keydown.stop
    @keydown.esc="$emit('update:modelValue', false)"
    top="10vh"
  >
    <div class="recycle-bin">
      <el-card class="tasks-container">
        <template #header>
          <div class="card-header">
            <h2>已删除任务 ({{ tasks.length }})</h2>
            <div class="header-actions">
              <el-button 
                type="primary" 
                size="small" 
                :disabled="!selectedTask" 
                @click="selectedTask && $emit('restore', selectedTask)"
              >
                恢复选中任务
              </el-button>
              <el-button 
                type="danger" 
                size="small" 
                :disabled="!selectedTask" 
                @click="selectedTask && $emit('delete', selectedTask)"
              >
                永久删除
              </el-button>
            </div>
          </div>
        </template>

        <div class="tasks-list">
          <el-empty v-if="tasks.length === 0" description="回收站为空" />
          <template v-else>
            <div
              v-for="(task, index) in tasks"
              :key="task.id"
              :class="{ 'selected': selectedIndex === index }"
              class="task-item deleted"
              @click="selectTask(task, index)"
              @dblclick="$emit('open-detail', task)"
            >
              <div class="task-content">
                <div class="task-info">
                  <span class="task-index">{{ index + 1 }}</span>
                  <span class="task-name">{{ task.name }}</span>
                  <el-tag v-if="task.description" size="small" type="success">额外说明</el-tag>
                  <el-tag :type="task.completed ? 'success' : 'warning'" size="small" class="status-tag">
                    {{ task.completed ? '已完成' : '进行中' }}
                  </el-tag>
                </div>
                <div class="task-actions">
                  <el-button-group>
                    <el-button type="primary" size="small" @click.stop="$emit('restore', task)">
                      恢复
                    </el-button>
                    <el-button type="danger" size="small" @click.stop="$emit('delete', task)">
                      删除
                    </el-button>
                  </el-button-group>
                  <span class="task-date">删除于：{{ formatDate(task.deletedAt || task.createdAt) }}</span>
                  <span class="task-date">创建于：{{ formatDate(task.createdAt) }}</span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </el-card>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Task } from '../../types/task'
import { formatDate } from '../../utils/dateUtils'

defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  tasks: {
    type: Array as () => Task[],
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'restore', 'delete', 'open-detail'])

const selectedTask = ref<Task | null>(null)
const selectedIndex = ref(-1)

const selectTask = (task: Task, index: number) => {
  selectedTask.value = task
  selectedIndex.value = index
}
</script>

<style lang="scss" scoped>
.recycle-bin {
  .tasks-container {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }

    .tasks-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  }

  .task-item {
    padding: 12px;
    border-radius: 4px;
    background-color: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateX(4px);
      border-color: var(--el-border-color);
    }
    
    &.selected {
      transform: translateX(10px);
      border-color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }

    &.deleted {
      opacity: 0.7;
      background-color: var(--el-color-danger-light-9);
      
      .task-name {
        color: var(--el-text-color-secondary);
      }
    }

    .task-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .task-info {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .task-index {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--el-color-info-light-9);
          border-radius: 12px;
          font-size: 12px;
        }
        
        .task-name {
          font-size: 16px;
          margin-right: 12px;
        }

        .status-tag {
          margin-left: auto;
        }
      }

      .task-actions {
        display: flex;
        align-items: center;
        gap: 12px;

        .task-date {
          color: var(--el-text-color-secondary);
          font-size: 12px;
        }

        .el-button-group {
          margin-right: 12px;
        }
      }
    }
  }
}

:deep(.el-dialog) {
  margin-top: 10vh !important;
  
  .el-dialog__header {
    margin-right: 0;
    padding-bottom: 10px;
  }
  
  .el-dialog__body {
    padding-top: 10px;
  }
}
</style> 