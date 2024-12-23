<template>
  <div class="statistics-section">
    <!-- 时间维度统计 -->
    <el-row :gutter="20" class="statistics-cards">
      <el-col :span="4" :offset="2">
        <el-card shadow="hover" class="clickable" @click="$emit('show-range', 'today')">
          <div class="statistic-item">
            <div class="title">今日任务</div>
            <div class="value">{{ todayCount }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="clickable" @click="$emit('show-range', 'week')">
          <div class="statistic-item">
            <div class="title">本周任务</div>
            <div class="value">{{ weekCount }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="clickable" @click="$emit('show-range', 'month')">
          <div class="statistic-item">
            <div class="title">本月任务</div>
            <div class="value">{{ monthCount }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="clickable" @click="$emit('show-range', 'quarter')">
          <div class="statistic-item">
            <div class="title">本季度任务</div>
            <div class="value">{{ quarterCount }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="clickable" @click="$emit('show-range', 'year')">
          <div class="statistic-item">
            <div class="title">本年度任务</div>
            <div class="value">{{ yearCount }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 状态统计 -->
    <el-row :gutter="20" class="statistics-cards">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="statistic-item">
            <div class="title">待处理</div>
            <div class="value">{{ pendingCount }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="statistic-item">
            <div class="title">已完成</div>
            <div class="value">{{ completedCount }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="clickable recycle-bin-card" @click="$emit('show-recycle-bin')">
          <div class="statistic-item">
            <div class="title">回收站</div>
            <div class="value danger">{{ deletedCount }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="clickable" @click="$emit('show-config')">
          <div class="statistic-item">
            <div class="title">系统配置</div>
            <div class="value">
              <el-icon><Setting /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { Setting } from '@element-plus/icons-vue'

defineProps({
  todayCount: {
    type: Number,
    default: 0
  },
  weekCount: {
    type: Number,
    default: 0
  },
  monthCount: {
    type: Number,
    default: 0
  },
  quarterCount: {
    type: Number,
    default: 0
  },
  yearCount: {
    type: Number,
    default: 0
  },
  pendingCount: {
    type: Number,
    default: 0
  },
  completedCount: {
    type: Number,
    default: 0
  },
  deletedCount: {
    type: Number,
    default: 0
  }
})

defineEmits(['show-range', 'show-recycle-bin', 'show-config'])
</script>

<style lang="scss" scoped>
.statistics-section {
  .statistics-cards {
    margin-bottom: 20px;

    .statistic-item {
      text-align: center;
      padding: 15px;
      transition: all 0.3s ease;

      .title {
        color: var(--el-text-color-secondary);
        font-size: 14px;
        margin-bottom: 12px;
        font-weight: 500;
      }

      .value {
        font-size: 28px;
        font-weight: bold;
        color: var(--el-color-primary);
        line-height: 1.2;

        &.danger {
          color: var(--el-color-danger);
        }

        .el-icon {
          font-size: 24px;
        }
      }
    }

    .el-card {
      border-radius: 8px;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
        
        .value {
          transform: scale(1.1);
        }
      }

      &.recycle-bin-card:hover {
        border-color: var(--el-color-danger);
      }
    }
  }
}

.clickable {
  cursor: pointer;
}
</style> 