# 新建文件
<template>
  <div class="tasks-section">
    <!-- 进行中的任务 -->
    <el-card class="tasks-container">
      <template #header>
        <div class="card-header">
          <h2>进行中 ({{ pendingTasks.length }})</h2>
          <el-button type="primary" @click="$emit('add-task')">
            <el-icon><Plus /></el-icon>添加任务
          </el-button>
        </div>
      </template>

      <div class="tasks-list">
        <el-empty v-if="pendingTasks.length === 0" description="暂无进行中的任务" />
        <template v-else>
          <div
            v-for="(task, index) in pendingTasks"
            :key="task.id"
            :class="{ 'selected': selectedTaskIndex === index && !viewingCompleted }"
            class="task-item"
            @click="selectTask(index, false)"
            @dblclick="$emit('open-detail', task)"
          >
            <div class="task-content">
              <div class="task-info">
                <span class="task-index">{{ index + 1 }}</span>
                <span class="task-name">{{ task.name }}</span>
                <el-tag v-if="task.description" size="small" type="success">额外说明</el-tag>
                <el-tag 
                  v-if="!isToday(new Date(task.createdAt))" 
                  size="small" 
                  type="warning"
                  effect="dark"
                >
                  {{ getTaskTimeLabel(task.createdAt) }}
                </el-tag>
              </div>
              <div class="task-actions">
                <el-tag type="warning" size="small" class="status-tag">进行中</el-tag>
                <span class="task-date">{{ formatDate(task.createdAt) }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </el-card>

    <!-- 已完成的任务 -->
    <el-card class="tasks-container">
      <template #header>
        <div class="card-header">
          <h2>已完成 ({{ completedTasks.length }})</h2>
        </div>
      </template>

      <div class="tasks-list">
        <el-empty v-if="completedTasks.length === 0" description="暂无已完成的任务" />
        <template v-else>
          <div
            v-for="(task, index) in completedTasks"
            :key="task.id"
            :class="{ 'selected': selectedTaskIndex === index && viewingCompleted }"
            class="task-item completed"
            @click="selectTask(index, true)"
            @dblclick="$emit('open-detail', task)"
          >
            <div class="task-content">
              <div class="task-info">
                <span class="task-index">{{ index + 1 }}</span>
                <span class="task-name">{{ task.name }}</span>
                <el-tag v-if="task.description" size="small" type="success">额外说明</el-tag>
              </div>
              <div class="task-actions">
                <el-tag type="success" size="small" class="status-tag">已完成</el-tag>
                <span class="task-date">{{ formatDate(task.createdAt) }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { Task } from '../../types/task'
import { isToday, formatDate, getTaskTimeLabel } from '../../utils/dateUtils'

defineProps({
  pendingTasks: {
    type: Array as () => Task[],
    required: true
  },
  completedTasks: {
    type: Array as () => Task[],
    required: true
  },
  selectedTaskIndex: {
    type: Number,
    default: -1
  },
  viewingCompleted: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select-task', 'open-detail', 'add-task'])

const selectTask = (index: number, isCompleted: boolean) => {
  emit('select-task', index, isCompleted)
}
</script>

<style lang="scss" scoped>
.tasks-section {
  display: flex;
  flex-direction: column;
  gap: 20px;

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
    }

    .tasks-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
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

      &.completed {
        opacity: 0.8;
        .task-name {
          text-decoration: line-through;
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
          }
        }

        .task-actions {
          display: flex;
          align-items: center;
          gap: 12px;

          .status-tag {
            min-width: 56px;
            text-align: center;
          }

          .task-date {
            color: var(--el-text-color-secondary);
            font-size: 12px;
          }
        }
      }
    }
  }
}
</style> 