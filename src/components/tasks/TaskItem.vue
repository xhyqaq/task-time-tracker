<template>
  <div class="task-item" @click="$emit('click')">
    <div class="task-content">
      <div class="task-main">
        <span class="task-name">{{ task.name }}</span>
        <div class="task-tags">
          <el-tag v-if="task.description" size="small" type="success" effect="plain">额外说明</el-tag>
          <el-tag size="small" :type="task.completed ? 'success' : 'warning'" effect="light">
            {{ task.completed ? '已完成' : '进行中' }}
          </el-tag>
        </div>
      </div>
      <span class="task-time">{{ formatTime(task.createdAt) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Task } from '../../types/task'

defineProps({
  task: {
    type: Object as () => Task,
    required: true
  }
})

defineEmits(['click'])

const formatTime = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    })
  } catch {
    return '无效时间'
  }
}
</script>

<style lang="scss" scoped>
.task-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
  transition: all 0.3s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--el-color-primary-light-9);
    transform: translateX(4px);
  }

  .task-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;

    .task-main {
      display: flex;
      align-items: center;
      gap: 12px;

      .task-name {
        font-weight: 500;
      }

      .task-tags {
        display: flex;
        gap: 8px;
      }
    }

    .task-time {
      color: var(--el-text-color-secondary);
      font-size: 14px;
    }
  }
}
</style> 