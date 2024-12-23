# 新建文件
<template>
  <el-dialog
    v-model="modelValue"
    :title="title"
    width="800px"
    destroy-on-close
    top="10vh"
  >
    <div class="time-distribution">
      <!-- 统计头部 -->
      <div class="stats-header">
        <div class="stats-item">
          <div class="stats-label">总任务数</div>
          <div class="stats-value">{{ stats.total }}</div>
        </div>
        <div class="stats-item">
          <div class="stats-label">已完成</div>
          <div class="stats-value success">{{ stats.completed }}</div>
        </div>
        <div class="stats-item">
          <div class="stats-label">待处理</div>
          <div class="stats-value warning">{{ stats.pending }}</div>
        </div>
      </div>

      <el-divider />

      <!-- 任务列表 -->
      <div class="tasks-list">
        <template v-if="type === 'week'">
          <div v-for="(tasks, day) in groupedTasks" :key="day" class="day-group">
            <div class="day-header" @click="toggleDay(day)">
              <div class="day-info">
                <span class="day-label">{{ day }}</span>
                <span class="task-count">({{ getTasksLength(tasks) }})</span>
              </div>
              <el-icon class="expand-icon" :class="{ 'is-active': expandedDays[day] }">
                <ArrowDown />
              </el-icon>
            </div>
            <div v-show="expandedDays[day]" class="day-tasks">
              <task-item
                v-for="task in isTaskArray(tasks) ? tasks : []"
                :key="task.id"
                :task="task"
                @click="$emit('open-detail', task)"
              />
            </div>
          </div>
        </template>

        <template v-else-if="type === 'month'">
          <div v-for="(weekData, weekLabel) in groupedTasks" :key="weekLabel" class="week-group">
            <div class="week-header" @click="toggleWeek(weekLabel)">
              <div class="week-info">
                <span class="week-label">{{ weekLabel }}</span>
                <span class="task-count">({{ isWeekData(weekData) ? weekData.totalTasks : 0 }})</span>
              </div>
              <el-icon class="expand-icon" :class="{ 'is-active': expandedWeeks[weekLabel] }">
                <ArrowDown />
              </el-icon>
            </div>
            <div v-show="expandedWeeks[weekLabel]" class="week-content">
              <div v-for="(dayTasks, dayLabel) in isWeekData(weekData) ? weekData.days : {}" :key="dayLabel" class="day-group">
                <div class="day-header" @click="toggleDay(dayLabel)">
                  <div class="day-info">
                    <span class="day-label">{{ dayLabel }}</span>
                    <span class="task-count">({{ dayTasks.length }})</span>
                  </div>
                  <el-icon class="expand-icon" :class="{ 'is-active': expandedDays[dayLabel] }">
                    <ArrowDown />
                  </el-icon>
                </div>
                <div v-show="expandedDays[dayLabel]" class="day-tasks">
                  <task-item
                    v-for="task in dayTasks"
                    :key="task.id"
                    :task="task"
                    @click="$emit('open-detail', task)"
                  />
                </div>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div v-for="(monthData, monthLabel) in groupedTasks" :key="monthLabel" class="month-group">
            <div class="month-header" @click="toggleMonth(monthLabel)">
              <div class="month-info">
                <span class="month-label">{{ monthLabel }}</span>
                <span class="task-count">({{ isQuarterOrYearData(monthData) ? monthData.totalTasks : 0 }})</span>
              </div>
              <el-icon class="expand-icon" :class="{ 'is-active': expandedMonths[monthLabel] }">
                <ArrowDown />
              </el-icon>
            </div>
            <div v-show="expandedMonths[monthLabel]" class="month-content">
              <div v-for="(weekData, weekLabel) in isQuarterOrYearData(monthData) ? monthData.weeks : {}" :key="weekLabel" class="week-group">
                <div class="week-header" @click="toggleWeek(weekLabel)">
                  <div class="week-info">
                    <span class="week-label">{{ weekLabel }}</span>
                    <span class="task-count">({{ weekData.totalTasks }})</span>
                  </div>
                  <el-icon class="expand-icon" :class="{ 'is-active': expandedWeeks[weekLabel] }">
                    <ArrowDown />
                  </el-icon>
                </div>
                <div v-show="expandedWeeks[weekLabel]" class="week-content">
                  <div v-for="(dayTasks, dayLabel) in weekData.days" :key="dayLabel" class="day-group">
                    <div class="day-header" @click="toggleDay(dayLabel)">
                      <div class="day-info">
                        <span class="day-label">{{ dayLabel }}</span>
                        <span class="task-count">({{ dayTasks.length }})</span>
                      </div>
                      <el-icon class="expand-icon" :class="{ 'is-active': expandedDays[dayLabel] }">
                        <ArrowDown />
                      </el-icon>
                    </div>
                    <div v-show="expandedDays[dayLabel]" class="day-tasks">
                      <task-item
                        v-for="task in dayTasks"
                        :key="task.id"
                        :task="task"
                        @click="$emit('open-detail', task)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import TaskItem from './TaskItem.vue'
import { Task, Stats, WeekData, QuarterOrYearData, ViewRangeType, GroupedTasks } from '../../types/task'
import { getWeekNumber } from '../../utils/dateUtils'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  type: {
    type: String as () => ViewRangeType,
    required: true
  },
  tasks: {
    type: Array as () => Task[],
    required: true
  },
  stats: {
    type: Object as () => Stats,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'open-detail'])

// 展开状态
const expandedDays = ref<Record<string, boolean>>({})
const expandedWeeks = ref<Record<string, boolean>>({})
const expandedMonths = ref<Record<string, boolean>>({})

// 切换展开状态
const toggleDay = (day: string) => {
  expandedDays.value[day] = !expandedDays.value[day]
}

const toggleWeek = (week: string) => {
  expandedWeeks.value[week] = !expandedWeeks.value[week]
}

const toggleMonth = (month: string) => {
  expandedMonths.value[month] = !expandedMonths.value[month]
}

// 标题
const title = computed(() => {
  const titles: Record<ViewRangeType, string> = {
    week: '本周任务',
    month: '本月任务',
    quarter: '本季度任务',
    year: '本年度任务'
  }
  return titles[props.type] || '任务分布'
})

// 分组任务
const groupedTasks = computed<GroupedTasks>(() => {
  if (props.type === 'week') {
    return groupByWeek(props.tasks)
  } else if (props.type === 'month') {
    return groupByMonth(props.tasks)
  } else {
    return groupByQuarterOrYear(props.tasks)
  }
})

// 按周分组
const groupByWeek = (tasks: Task[]): Record<string, Task[]> => {
  const groups: Record<string, Task[]> = {}
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  
  days.forEach(day => {
    groups[day] = []
  })

  tasks.forEach(task => {
    const date = new Date(task.createdAt)
    let dayIndex = date.getDay() - 1
    if (dayIndex === -1) dayIndex = 6
    const dayName = days[dayIndex]
    groups[dayName].push(task)
  })

  return groups
}

// 按月分组
const groupByMonth = (tasks: Task[]): Record<string, WeekData> => {
  const groups: Record<string, WeekData> = {}

  tasks.forEach(task => {
    const date = new Date(task.createdAt)
    const weekNumber = getWeekNumber(date)
    const weekLabel = `第${weekNumber}周`
    const dayLabel = formatDayLabel(date)
    
    if (!groups[weekLabel]) {
      groups[weekLabel] = {
        totalTasks: 0,
        days: {}
      }
    }
    
    if (!groups[weekLabel].days[dayLabel]) {
      groups[weekLabel].days[dayLabel] = []
    }
    
    groups[weekLabel].days[dayLabel].push(task)
    groups[weekLabel].totalTasks++
  })

  return groups
}

// 按季度或年分组
const groupByQuarterOrYear = (tasks: Task[]): Record<string, QuarterOrYearData> => {
  const groups: Record<string, QuarterOrYearData> = {}

  tasks.forEach(task => {
    const date = new Date(task.createdAt)
    const monthLabel = formatMonthLabel(date)
    const weekNumber = getWeekNumber(date)
    const weekLabel = `第${weekNumber}周`
    const dayLabel = formatDayLabel(date)
    
    if (!groups[monthLabel]) {
      groups[monthLabel] = {
        totalTasks: 0,
        weeks: {}
      }
    }
    
    if (!groups[monthLabel].weeks[weekLabel]) {
      groups[monthLabel].weeks[weekLabel] = {
        totalTasks: 0,
        days: {}
      }
    }
    
    if (!groups[monthLabel].weeks[weekLabel].days[dayLabel]) {
      groups[monthLabel].weeks[weekLabel].days[dayLabel] = []
    }
    
    groups[monthLabel].weeks[weekLabel].days[dayLabel].push(task)
    groups[monthLabel].weeks[weekLabel].totalTasks++
    groups[monthLabel].totalTasks++
  })

  return groups
}

// 辅助函数
const formatDayLabel = (date: Date): string => {
  const month = String(date.getMonth() + 1)
  const day = String(date.getDate())
  return `${month}月${day}日`
}

const formatMonthLabel = (date: Date): string => {
  const month = String(date.getMonth() + 1)
  return `${month}月`
}

// 类型守卫函数
const isWeekData = (data: any): data is WeekData => {
  return data && typeof data === 'object' && 'totalTasks' in data && 'days' in data
}

const isQuarterOrYearData = (data: any): data is QuarterOrYearData => {
  return data && typeof data === 'object' && 'totalTasks' in data && 'weeks' in data
}

const isTaskArray = (data: any): data is Task[] => {
  return Array.isArray(data)
}

// 辅助函数 - 获取任务数组长度
const getTasksLength = (data: Task[] | WeekData | QuarterOrYearData): number => {
  if (isTaskArray(data)) {
    return data.length
  } else if (isWeekData(data)) {
    return data.totalTasks
  } else if (isQuarterOrYearData(data)) {
    return data.totalTasks
  }
  return 0
}
</script>

<style lang="scss" scoped>
.time-distribution {
  padding: 20px;

  .stats-header {
    display: flex;
    justify-content: space-around;
    margin-bottom: 20px;

    .stats-item {
      text-align: center;
      padding: 15px 30px;
      border-radius: 8px;
      background: var(--el-bg-color-overlay);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      }

      .stats-label {
        color: var(--el-text-color-secondary);
        font-size: 14px;
        margin-bottom: 8px;
      }

      .stats-value {
        font-size: 24px;
        font-weight: bold;
        color: var(--el-color-primary);

        &.success {
          color: var(--el-color-success);
        }

        &.warning {
          color: var(--el-color-warning);
        }
      }
    }
  }

  .tasks-list {
    .month-group,
    .week-group,
    .day-group {
      margin-bottom: 16px;
      border-radius: 8px;
      overflow: hidden;
      background: var(--el-bg-color-overlay);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

      &:last-child {
        margin-bottom: 0;
      }
    }

    .month-header,
    .week-header,
    .day-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      cursor: pointer;
      transition: all 0.3s ease;

      .month-info,
      .week-info,
      .day-info {
        display: flex;
        align-items: center;
        gap: 8px;

        .month-label,
        .week-label,
        .day-label {
          font-weight: 500;
        }

        .task-count {
          color: var(--el-text-color-secondary);
          font-size: 14px;
        }
      }

      .expand-icon {
        font-size: 16px;
        transition: transform 0.3s ease;

        &.is-active {
          transform: rotate(180deg);
        }
      }
    }

    .month-header {
      background: var(--el-color-primary-dark-2);
      color: white;

      &:hover {
        background: var(--el-color-primary);
      }

      .expand-icon {
        color: white;
      }
    }

    .week-header {
      background: var(--el-color-primary-light-9);

      &:hover {
        background: var(--el-color-primary-light-8);
      }

      .week-label {
        color: var(--el-color-primary);
      }
    }

    .day-header {
      background: var(--el-color-primary-light-9);

      &:hover {
        background: var(--el-color-primary-light-8);
      }

      .day-label {
        color: var(--el-color-primary);
      }
    }

    .month-content,
    .week-content,
    .day-tasks {
      padding: 10px;
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