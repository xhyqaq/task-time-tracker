<template>
  <el-dialog
    v-model="modelValue"
    title="任务详情"
    width="50%"
    destroy-on-close
    @keydown.stop
    @keydown.esc="$emit('update:modelValue', false)"
  >
    <div 
      class="task-detail" 
      v-if="task" 
      tabindex="0" 
      @keydown.meta.s.prevent="handleSave"
      @keydown.ctrl.s.prevent="handleSave"
    >
      <div class="task-title">
        <el-input
          v-model="taskTitle"
          placeholder="任务标题"
          @keydown.stop
        />
      </div>
      <el-divider />
      <div class="task-description">
        <el-input
          v-model="taskDescription"
          type="textarea"
          :rows="4"
          placeholder="添加任务说明..."
          @keydown.stop
        />
      </div>
      <div class="task-meta">
        <div class="meta-item">
          <span class="meta-label">创建时间：</span>
          <span class="meta-value">{{ formatDate(task.createdAt) }}</span>
          <el-tag 
            v-if="!isToday(new Date(task.createdAt))" 
            size="small" 
            type="warning"
            effect="dark"
            class="time-tag"
          >
            {{ getTaskTimeLabel(task.createdAt) }}
          </el-tag>
        </div>
        <div class="meta-item">
          <span class="meta-label">状态：</span>
          <el-tag :type="task.completed ? 'success' : 'warning'">
            {{ task.completed ? '已完成' : '进行中' }}
          </el-tag>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="$emit('update:modelValue', false)">关闭</el-button>
        <el-button type="primary" @click="handleSave">
          保存更改
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Task } from '../../types/task'
import { isToday, formatDate, getTaskTimeLabel } from '../../utils/dateUtils'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  task: {
    type: Object as () => Task,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const taskTitle = ref('')
const taskDescription = ref('')

// 监听任务变化，更新表单数据
watch(() => props.task, (newTask) => {
  if (newTask) {
    taskTitle.value = newTask.name
    taskDescription.value = newTask.description || ''
  }
}, { immediate: true })

// 保存任务
const handleSave = () => {
  emit('save', {
    ...props.task,
    name: taskTitle.value,
    description: taskDescription.value
  })
}
</script>

<style lang="scss" scoped>
.task-detail {
  padding: 20px;
  
  .task-title {
    margin-bottom: 20px;
    
    .el-input {
      font-size: 18px;
      font-weight: 500;
    }
  }
  
  .task-description {
    margin: 20px 0;
  }
  
  .task-meta {
    .meta-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .meta-label {
        color: var(--el-text-color-secondary);
        margin-right: 8px;
      }
      
      .meta-value {
        margin-right: 8px;
      }
      
      .time-tag {
        margin-left: 8px;
        background-color: var(--el-color-warning-light-5);
        border-color: var(--el-color-warning-light-3);
        color: var(--el-color-warning-dark-2);
      }
    }
  }

  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner) {
    box-shadow: none !important;
    border: 1px solid var(--el-border-color-light);
    
    &:hover, &:focus {
      border-color: var(--el-color-primary);
    }
  }
}

:deep(.el-dialog) {
  margin-top: 30vh !important;
  
  .el-dialog__header {
    margin-right: 0;
    padding-bottom: 10px;
  }
  
  .el-dialog__body {
    padding-top: 10px;
  }
}
</style> 