<template>
  <div class="tasks-view" @keydown="handleKeyboardShortcuts" tabindex="0" ref="tasksViewRef">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="statistics-cards">
      <el-col :span="4" :offset="2">
        <el-card shadow="hover" class="clickable" @click="showRangeTasks('today')">
          <div class="statistic-item">
            <div class="title">今日任务</div>
            <div class="value">{{ todayTasks.length }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="clickable" @click="showRangeTasks('week')">
          <div class="statistic-item">
            <div class="title">本周任务</div>
            <div class="value">{{ weekTasks.length }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="clickable" @click="showRangeTasks('month')">
          <div class="statistic-item">
            <div class="title">本月任务</div>
            <div class="value">{{ monthTasks.length }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="clickable" @click="showRangeTasks('quarter')">
          <div class="statistic-item">
            <div class="title">本季度任务</div>
            <div class="value">{{ quarterTasks.length }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="clickable" @click="showRangeTasks('year')">
          <div class="statistic-item">
            <div class="title">本年度任务</div>
            <div class="value">{{ yearTasks.length }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="statistics-cards">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="statistic-item">
            <div class="title">待处理</div>
            <div class="value">{{ pendingTasks.length }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="statistic-item">
            <div class="title">已完成</div>
            <div class="value">{{ completedTasks.length }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="clickable recycle-bin-card" @click="showRecycleBin">
          <div class="statistic-item">
            <div class="title">回收站</div>
            <div class="value danger">{{ deletedTasks.length }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="clickable" @click="showConfig">
          <div class="statistic-item">
            <div class="title">系统配置</div>
            <div class="value">
              <el-icon><Setting /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 任务列表 -->
    <div class="tasks-section">
      <!-- 进行中的任务 -->
      <el-card class="tasks-container">
        <template #header>
          <div class="card-header">
            <h2>进行中 ({{ pendingTasks.length }})</h2>
            <el-button type="primary" @click="showQuickAdd = true">
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
              @dblclick="openTaskDetail(task)"
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
              @dblclick="openTaskDetail(task)"
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
                  <el-tag type="success" size="small" class="status-tag">已完成</el-tag>
                  <span class="task-date">{{ formatDate(task.updatedAt || task.createdAt) }}</span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </el-card>
    </div>

    <!-- 快速添加任务对话框 -->
    <el-dialog
      v-model="showQuickAdd"
      title="快速添加任务"
      width="400px"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
      @closed="handleDialogClose"
      @open="handleDialogOpen"
      :modal-append-to-body="false"
      append-to-body
    >
      <el-input
        v-model="newTaskName"
        placeholder="输入任务名称"
        @keyup.enter="handleAddTask"
        @keyup.escape="showQuickAdd = false"
        ref="taskInput"
        autofocus
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showQuickAdd = false">取消</el-button>
          <el-button type="primary" @click="handleAddTask">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 任务仪表盘对话框 -->
    <el-dialog
      v-model="showTaskDashboard"
      :title="dashboardTitle"
      width="800px"
      :fullscreen="false"
      destroy-on-close
      top="10vh"
    >
      <div class="task-dashboard">
        <!-- 仪表盘统计 -->
        <div class="stats-header">
          <div class="stats-item">
            <div class="stats-label">总任务数</div>
            <div class="stats-value">{{ rangeStats.total }}</div>
          </div>
          <div class="stats-item">
            <div class="stats-label">已完成</div>
            <div class="stats-value success">{{ rangeStats.completed }}</div>
          </div>
          <div class="stats-item">
            <div class="stats-label">待处理</div>
            <div class="stats-value warning">{{ rangeStats.pending }}</div>
          </div>
        </div>

        <el-divider />

        <!-- 任务列表 -->
        <div class="tasks-list">
          <div v-for="task in rangeTasks" :key="task.id" class="task-item" @click="openTaskDetail(task)">
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
        </div>
      </div>
    </el-dialog>

    <!-- 任务详情对话框 -->
    <el-dialog
      v-model="taskDetailVisible"
      title="任务详情"
      width="50%"
      destroy-on-close
      @keydown.stop
      @keydown.esc="taskDetailVisible = false"
    >
      <div 
        class="task-detail" 
        v-if="currentTask" 
        tabindex="0" 
        @keydown.meta.s.prevent="handleSaveTask"
        @keydown.ctrl.s.prevent="handleSaveTask"
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
            <span class="meta-value">{{ formatDate(currentTask.createdAt) }}</span>
            <el-tag 
              v-if="!isToday(new Date(currentTask.createdAt))" 
              size="small" 
              type="warning"
              effect="dark"
              class="time-tag"
            >
              {{ getTaskTimeLabel(currentTask.createdAt) }}
            </el-tag>
          </div>
          <div class="meta-item">
            <span class="meta-label">状态：</span>
            <el-tag :type="currentTask.completed ? 'success' : 'warning'">
              {{ currentTask.completed ? '已完成' : '进行中' }}
            </el-tag>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="taskDetailVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleSaveTask">
            保存更改
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 回收站对话框 -->
    <el-dialog
      v-model="showRecycleBinDialog"
      title="回收站"
      width="80%"
      destroy-on-close
      @keydown.stop
      @keydown.esc="closeRecycleBin"
      top="10vh"
    >
      <div class="recycle-bin">
        <!-- 回收站统计 -->
        <el-card class="tasks-container">
          <template #header>
            <div class="card-header">
              <h2>已删除任务 ({{ deletedTasks.length }})</h2>
              <div class="header-actions">
                <el-button 
                  type="primary" 
                  size="small" 
                  :disabled="!selectedDeletedTask" 
                  @click="selectedDeletedTask && handleRestoreTask(selectedDeletedTask)"
                >
                  恢复选中任务
                </el-button>
                <el-button 
                  type="danger" 
                  size="small" 
                  :disabled="!selectedDeletedTask" 
                  @click="selectedDeletedTask && handleHardDeleteTask(selectedDeletedTask)"
                >
                  永久删除
                </el-button>
              </div>
            </div>
          </template>

          <div class="tasks-list">
            <el-empty v-if="deletedTasks.length === 0" description="回收站为空" />
            <template v-else>
              <div
                v-for="(task, index) in deletedTasks"
                :key="task.id"
                :class="{ 'selected': selectedDeletedIndex === index }"
                class="task-item deleted"
                @click="selectDeletedTask(task, index)"
                @dblclick="openTaskDetail(task)"
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
                      <el-button type="primary" size="small" @click.stop="handleRestoreTask(task)">
                        恢复
                      </el-button>
                      <el-button type="danger" size="small" @click.stop="handleHardDeleteTask(task)">
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

    <!-- 配置对话框 -->
    <el-dialog
      v-model="showConfigDialog"
      title="系统配置"
      width="50%"
      destroy-on-close
    >
      <div class="config-container">
        <el-form label-width="120px">
          <el-form-item label="数据存储路径">
            <div class="path-selector">
              <el-input v-model="configInfo.dataPath" readonly />
              <el-button type="primary" @click="handleSelectDataPath">
                选择路径
              </el-button>
            </div>
          </el-form-item>
          <el-form-item label="版本信息">
            <el-tag>{{ configInfo.version || '1.0.0' }}</el-tag>
          </el-form-item>
          <el-form-item label="最后备份时间">
            <span>{{ configInfo.lastBackup ? formatDate(configInfo.lastBackup) : '从未备份' }}</span>
          </el-form-item>
          <el-divider />
          <el-form-item label="数据管理">
            <div class="data-management">
              <el-button type="primary" @click="handleExportData">
                导出数据
              </el-button>
              <el-button type="warning" @click="handleImportData">
                导入数据
              </el-button>
              <el-popconfirm
                title="确定要清空所有数据吗？此操作不可恢复"
                @confirm="handleClearData"
              >
                <template #reference>
                  <el-button type="danger">清空数据</el-button>
                </template>
              </el-popconfirm>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>

    <!-- 修改本周任务分布对话框 -->
    <el-dialog
      v-model="showWeekDistribution"
      title="本周任务仪表盘"
      width="800px"
      destroy-on-close
    >
      <div class="week-stats">
        <div class="stats-header">
          <div class="stats-item">
            <div class="stats-label">总任务数</div>
            <div class="stats-value">{{ weekTasks.length }}</div>
          </div>
          <div class="stats-item">
            <div class="stats-label">已完成</div>
            <div class="stats-value success">{{ weekTasks.filter(t => t.completed).length }}</div>
          </div>
          <div class="stats-item">
            <div class="stats-label">待处理</div>
            <div class="stats-value warning">{{ weekTasks.filter(t => !t.completed).length }}</div>
          </div>
        </div>
        <el-divider />
        <div class="week-tasks">
          <div v-for="(tasks, day) in groupedWeekTasks" :key="day" class="day-group">
            <div class="day-header" @click="toggleDayTasks(day)">
              <div class="day-info">
                <span class="day-label">{{ day }}</span>
                <span class="task-count">({{ tasks.length }})</span>
              </div>
              <el-icon class="expand-icon" :class="{ 'is-active': expandedDays[day] }">
                <ArrowDown />
              </el-icon>
            </div>
            <div v-show="expandedDays[day]" class="day-tasks">
              <div v-for="task in tasks" :key="task.id" class="task-item" @click="openTaskDetail(task)">
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
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 修改本月任务分布对话框 -->
    <el-dialog
      v-model="showMonthDistribution"
      title="本月任务仪表盘"
      width="800px"
      destroy-on-close
    >
      <div class="month-stats">
        <div class="stats-header">
          <div class="stats-item">
            <div class="stats-label">总任务数</div>
            <div class="stats-value">{{ monthTasks.length }}</div>
          </div>
          <div class="stats-item">
            <div class="stats-label">已完成</div>
            <div class="stats-value success">{{ monthTasks.filter(t => t.completed).length }}</div>
          </div>
          <div class="stats-item">
            <div class="stats-label">待处理</div>
            <div class="stats-value warning">{{ monthTasks.filter(t => !t.completed).length }}</div>
          </div>
        </div>
        <el-divider />
        <div class="month-tasks">
          <div v-for="(weekTasks, weekLabel) in groupedMonthTasks" :key="weekLabel" class="week-group">
            <div class="week-header" @click="toggleWeekTasks(weekLabel)">
              <div class="week-info">
                <span class="week-label">{{ weekLabel }}</span>
                <span class="task-count">({{ weekTasks.totalTasks }})</span>
              </div>
              <el-icon class="expand-icon" :class="{ 'is-active': expandedWeeks[weekLabel] }">
                <ArrowDown />
              </el-icon>
            </div>
            <div v-show="expandedWeeks[weekLabel]" class="week-content">
              <div v-for="(dayTasks, dayLabel) in weekTasks.days" :key="dayLabel" class="day-group">
                <div class="day-header" @click="toggleDayTasks(dayLabel)">
                  <div class="day-info">
                    <span class="day-label">{{ dayLabel }}</span>
                    <span class="task-count">({{ dayTasks.length }})</span>
                  </div>
                  <el-icon class="expand-icon" :class="{ 'is-active': expandedDays[dayLabel] }">
                    <ArrowDown />
                  </el-icon>
                </div>
                <div v-show="expandedDays[dayLabel]" class="day-tasks">
                  <div v-for="task in dayTasks" :key="task.id" class="task-item" @click="openTaskDetail(task)">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 添加本季度任务分布对话框 -->
    <el-dialog
      v-model="showQuarterDistribution"
      title="本季度任务仪表盘"
      width="800px"
      destroy-on-close
    >
      <div class="quarter-stats">
        <div class="stats-header">
          <div class="stats-item">
            <div class="stats-label">总任务数</div>
            <div class="stats-value">{{ quarterTasks.length }}</div>
          </div>
          <div class="stats-item">
            <div class="stats-label">已完成</div>
            <div class="stats-value success">{{ quarterTasks.filter(t => t.completed).length }}</div>
          </div>
          <div class="stats-item">
            <div class="stats-label">待处理</div>
            <div class="stats-value warning">{{ quarterTasks.filter(t => !t.completed).length }}</div>
          </div>
        </div>
        <el-divider />
        <div class="quarter-tasks">
          <div v-for="(monthData, monthLabel) in groupedQuarterTasks" :key="monthLabel" class="month-group">
            <div class="month-header" @click="toggleMonthTasks(monthLabel)">
              <div class="month-info">
                <span class="month-label">{{ monthLabel }}</span>
                <span class="task-count">({{ monthData.totalTasks }})</span>
              </div>
              <el-icon class="expand-icon" :class="{ 'is-active': expandedMonths[monthLabel] }">
                <ArrowDown />
              </el-icon>
            </div>
            <div v-show="expandedMonths[monthLabel]" class="month-content">
              <div v-for="(weekData, weekLabel) in monthData.weeks" :key="weekLabel" class="week-group">
                <div class="week-header" @click="toggleWeekTasks(weekLabel)">
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
                    <div class="day-header" @click="toggleDayTasks(dayLabel)">
                      <div class="day-info">
                        <span class="day-label">{{ dayLabel }}</span>
                        <span class="task-count">({{ dayTasks.length }})</span>
                      </div>
                      <el-icon class="expand-icon" :class="{ 'is-active': expandedDays[dayLabel] }">
                        <ArrowDown />
                      </el-icon>
                    </div>
                    <div v-show="expandedDays[dayLabel]" class="day-tasks">
                      <div v-for="task in dayTasks" :key="task.id" class="task-item" @click="openTaskDetail(task)">
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 添加本年度任务分布对话框 -->
    <el-dialog
      v-model="showYearDistribution"
      title="本年度任务仪表盘"
      width="800px"
      destroy-on-close
    >
      <div class="year-stats">
        <div class="stats-header">
          <div class="stats-item">
            <div class="stats-label">总任务数</div>
            <div class="stats-value">{{ yearTasks.length }}</div>
          </div>
          <div class="stats-item">
            <div class="stats-label">已完成</div>
            <div class="stats-value success">{{ yearTasks.filter(t => t.completed).length }}</div>
          </div>
          <div class="stats-item">
            <div class="stats-label">待处理</div>
            <div class="stats-value warning">{{ yearTasks.filter(t => !t.completed).length }}</div>
          </div>
        </div>
        <el-divider />
        <div class="year-tasks">
          <div v-for="(monthData, monthLabel) in groupedYearTasks" :key="monthLabel" class="month-group">
            <div class="month-header" @click="toggleMonthTasks(monthLabel)">
              <div class="month-info">
                <span class="month-label">{{ monthLabel }}</span>
                <span class="task-count">({{ monthData.totalTasks }})</span>
              </div>
              <el-icon class="expand-icon" :class="{ 'is-active': expandedMonths[monthLabel] }">
                <ArrowDown />
              </el-icon>
            </div>
            <div v-show="expandedMonths[monthLabel]" class="month-content">
              <div v-for="(weekData, weekLabel) in monthData.weeks" :key="weekLabel" class="week-group">
                <div class="week-header" @click="toggleWeekTasks(weekLabel)">
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
                    <div class="day-header" @click="toggleDayTasks(dayLabel)">
                      <div class="day-info">
                        <span class="day-label">{{ dayLabel }}</span>
                        <span class="task-count">({{ dayTasks.length }})</span>
                      </div>
                      <el-icon class="expand-icon" :class="{ 'is-active': expandedDays[dayLabel] }">
                        <ArrowDown />
                      </el-icon>
                    </div>
                    <div v-show="expandedDays[dayLabel]" class="day-tasks">
                      <div v-for="task in dayTasks" :key="task.id" class="task-item" @click="openTaskDetail(task)">
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Plus, Setting, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useKeyboardShortcuts } from '../components/KeyboardShortcuts'

console.log('Tasks component setup starting')

// 添加类型声明
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

// 添加必要的类型定义
interface Task {
  id: number;
  name: string;
  completed: boolean;
  createdAt: string;
  deleted?: boolean;
  deletedAt?: string | null;
  description?: string;
  updatedAt?: string;
}

interface TaskStats {
  today?: Task[];
  week?: Task[];
  month?: Task[];
  quarter?: Task[];
  year?: Task[];
  deleted?: Task[];
}

interface TaskEvent {
  task?: Task;
  stats?: TaskStats;
}

interface RangeType {
  today: string;
  week: string;
  month: string;
  quarter: string;
  year: string;
  [key: string]: string;
}

interface WeekGroup {
  totalTasks: number;
  days: Record<string, Task[]>;
}

interface MonthGroup {
  totalTasks: number;
  weeks: Record<string, WeekGroup>;
}

// 闭回收站
const closeRecycleBin = () => {
  showRecycleBinDialog.value = false
}

// 修改删除任务的方法
const deleteTask = async (task: Task) => {
  console.log('Deleting task:', task)
  if (!task || task.deleted) return
  
  try {
    const deletedTask = await window.electron.ipcRenderer.invoke('delete-task', task.id)
    
    if (deletedTask) {
      // 更新本地状态
      const index = tasks.value.findIndex(t => t.id === task.id)
      if (index !== -1) {
        tasks.value = [
          ...tasks.value.slice(0, index),
          deletedTask,
          ...tasks.value.slice(index + 1)
        ]
        deletedTasks.value = [...deletedTasks.value, deletedTask]
      }
      
      // 重置选中状态
      selectedTaskIndex.value = -1
      viewingCompleted.value = false
      
      // 显示成功消息
      ElMessage.success(`任务"${task.name}"已移至回收站`)
      
      // 更新时间维度任务数量
      await initializeTaskStats()
    }
    
    // 确保根元素重新获得焦点
    nextTick(() => {
      tasksViewRef.value?.focus()
    })
  } catch (error) {
    handleError(error, 'deleteTask')
  }
}

// ��义响应式变量的类型
const tasks = ref<Task[]>([])
const todayTasks = ref<Task[]>([])
const weekTasks = ref<Task[]>([])
const monthTasks = ref<Task[]>([])
const deletedTasks = ref<Task[]>([])
const selectedTaskIndex = ref(-1)
const viewingCompleted = ref(false)
const showQuickAdd = ref(false)
const newTaskName = ref('')
const taskInput = ref<any>()
const isProcessingTask = ref(false)
const lastTaskAddTime = ref(0)
const quarterTasks = ref<Task[]>([])
const yearTasks = ref<Task[]>([])
const showTaskDashboard = ref(false)
const rangeTasks = ref<Task[]>([])
const rangeStats = ref({
  total: 0,
  completed: 0,
  pending: 0
})
const currentRange = ref('')
const taskDetailVisible = ref(false)
const currentTask = ref<Task | null>(null)
const taskDescription = ref('')
const taskTitle = ref('')
const showRecycleBinDialog = ref(false)
const viewingRecycleBin = ref(false)
const selectedDeletedTask = ref<Task | null>(null)
const selectedDeletedIndex = ref(-1)
const showWeekDistribution = ref(false)
const expandedDays = ref<{ [key: string]: boolean }>({})
const showMonthDistribution = ref(false)
const expandedWeeks = ref<{ [key: string]: boolean }>({})
const showQuarterDistribution = ref(false)
// const expandedMonths = ref<{ [key: string]: boolean }>({})

// 添加日期辅助函数
const isToday = (date: Date) => {
  const today = new Date()
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

// 计算属
const pendingTasks = computed(() => {
  // 获取所有未完成且未删除的任务
  const allPendingTasks = tasks.value
    .filter(task => !task.completed && !task.deleted)
    
  // 按创建时间降序排序
  return allPendingTasks.sort((a, b) => {
    // 首先按是否是今天的任务排序
    const aIsToday = isToday(new Date(a.createdAt))
    const bIsToday = isToday(new Date(b.createdAt))
    if (aIsToday && !bIsToday) return -1
    if (!aIsToday && bIsToday) return 1
    
    // 然后按创建时间降序
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
})

const completedTasks = computed(() => 
  tasks.value
    .filter(task => {
      if (!task.completed || task.deleted) return false
      // 检查任务的完成时间是否是今天
      const completedDate = task.updatedAt ? new Date(task.updatedAt) : new Date(task.createdAt)
      return isToday(completedDate)
    })
    .sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(a.createdAt)
      const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(b.createdAt)
      return dateB.getTime() - dateA.getTime()
    })
)

const completionRate = computed(() => {
  if (tasks.value.length === 0) return 0
  return Math.round((completedTasks.value.length / tasks.value.length) * 100)
})

const dashboardTitle = computed((): string => {
  const titles: RangeType = {
    today: '今日任务',
    week: '本周任务',
    month: '本月任务',
    quarter: '本季度任务',
    year: '本年度任务'
  }
  return titles[currentRange.value] || '任务仪表盘'
})

// 修改错误处理函数
const handleError = (error: unknown, context: string): void => {
  console.error(`Error in ${context}:`, error)
  let message = '操作失败'
  
  if (error instanceof Error) {
    message = error.message
  } else if (typeof error === 'string') {
    message = error
  }
  
  ElMessage.error(message)
}

// 修改处理任务添加的方法
const handleAddTask = async () => {
  const now = Date.now()
  if (isProcessingTask.value || !newTaskName.value.trim() || now - lastTaskAddTime.value < 1000) return
  
  try {
    isProcessingTask.value = true
    lastTaskAddTime.value = now
    const taskData = {
      name: newTaskName.value.trim(),
      completed: false,
      description: ''
    }
    
    const newTask = await window.electron.ipcRenderer.invoke('add-task', taskData)
    if (newTask) {
      tasks.value.push(newTask)
      newTaskName.value = ''
      showQuickAdd.value = false
      ElMessage.success('任务添加成功')
      
      // 更新时间维度任务数量
      await initializeTaskStats()
    }
    
    // 重置选中状态
    selectedTaskIndex.value = -1
    viewingCompleted.value = false
    
    // 确保根元素重新获得焦点
    nextTick(() => {
      tasksViewRef.value?.focus()
    })
  } catch (error) {
    handleError(error, 'handleAddTask')
  } finally {
    isProcessingTask.value = false
  }
}

// 修改处理对话框打开的方法
const handleDialogOpen = () => {
  console.log('Dialog opened')
  // 使用个 nextTick 确保在 DOM 完更新后再聚焦
  nextTick(() => {
    nextTick(() => {
      if (taskInput.value) {
        // 尝试多方式获取和聚焦输入框
        const input = taskInput.value.$el.querySelector('input') || taskInput.value.input || taskInput.value
        if (input && typeof input.focus === 'function') {
          input.focus()
          input.select()
          console.log('Input focused and selected')
        } else {
          console.warn('Could not focus input:', input)
        }
      } else {
        console.warn('Task input ref not found')
      }
    })
  })
}

// 处理对话框关���
const handleDialogClose = () => {
  console.log('Dialog closed')
  newTaskName.value = ''
  isProcessingTask.value = false
}

// 监听主程发来的新任务
const handleNewTask = (taskData: any) => {
  try {
    if (!taskData || typeof taskData.name !== 'string') {
      throw new Error('无效的任务数据')
    }
    const newTask = {
      id: Date.now(),
      name: taskData.name,
      completed: false,
      createdAt: taskData.createdAt || new Date().toISOString()
    }
    tasks.value.push(newTask)
  } catch (error) {
    handleError(error, 'handleNewTask')
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  try {
    if (!dateString) return '未知时间'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '无效日期'
    
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date)
  } catch (error) {
    console.error('Date formatting error:', error)
    return '无效日期'
  }
}

// 修改恢复任务的方法
const handleRestoreTask = async (task: Task) => {
  try {
    const restoredTask = await window.electron.ipcRenderer.invoke('restore-task', task.id)
    
    if (restoredTask) {
      // 更新本地状态
      const index = tasks.value.findIndex(t => t.id === task.id)
      if (index !== -1) {
        tasks.value = [
          ...tasks.value.slice(0, index),
          restoredTask,
          ...tasks.value.slice(index + 1)
        ]
        
        // 从回收站中移除
        const deletedIndex = deletedTasks.value.findIndex(t => t.id === task.id)
        if (deletedIndex !== -1) {
          deletedTasks.value.splice(deletedIndex, 1)
        }
      }
      
      // 重置选中状态
      selectedDeletedIndex.value = -1
      selectedDeletedTask.value = null
      
      // 显示成功消息
      ElMessage.success(`任务"${task.name}"已恢复`)
      
      // 更新时间维度任务数量
      await initializeTaskStats()
    }
    
    // 确保根元素重新获得焦点
    nextTick(() => {
      tasksViewRef.value?.focus()
    })
  } catch (error) {
    handleError(error, 'handleRestoreTask')
  }
}

// 显示不同时间范围的任务
const showRangeTasks = async (range: string) => {
  if (range === 'week') {
    showWeekDistribution.value = true
    return
  }
  if (range === 'month') {
    showMonthDistribution.value = true
    return
  }
  if (range === 'quarter') {
    showQuarterDistribution.value = true
    return
  }
  if (range === 'year') {
    showYearDistribution.value = true
    return
  }
  
  currentRange.value = range
  try {
    const data = await window.electron.ipcRenderer.invoke('get-range-tasks', range)
    if (data) {
      rangeTasks.value = data.tasks || []
      rangeStats.value = data.stats || { total: 0, completed: 0, pending: 0 }
      showTaskDashboard.value = true
    }
  } catch (error) {
    handleError(error, 'showRangeTasks')
  }
}

// 修改类型守卫函数
function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false
  const task = value as Partial<Task>
  return (
    typeof task.id === 'number' &&
    typeof task.name === 'string' &&
    typeof task.completed === 'boolean' &&
    typeof task.createdAt === 'string'
  )
}

// 修改任务更新处理函数
const handleTaskUpdate = (updatedTask: Task): void => {
  const index = tasks.value.findIndex(t => t.id === updatedTask.id)
  if (index !== -1) {
    tasks.value = tasks.value.map((task, i) => 
      i === index ? { ...updatedTask } : task
    )
  }
  
  if (currentTask.value && currentTask.value.id === updatedTask.id) {
    currentTask.value = { ...updatedTask }
  }
}

// 修改保存任务函数（统一保存标题和描述）
const handleSaveTask = async () => {
  if (!currentTask.value || !isTask(currentTask.value)) return
  
  try {
    const updatedTask: Task = {
      ...currentTask.value,
      name: taskTitle.value,
      description: taskDescription.value
    }
    
    const result = await window.electron.ipcRenderer.invoke('update-task', updatedTask)
    if (isTask(result)) {
      ElMessage.success('任务已保存')
      handleTaskUpdate(result)
    }
  } catch (error) {
    handleError(error, 'handleSaveTask')
  }
}

// 修改自保存函数
const handleAutoSave = () => {
  if (!currentTask.value || !isTask(currentTask.value) || !taskDetailVisible.value) return
  
  const updatedTask: Task = {
    ...currentTask.value,
    name: taskTitle.value,
    description: taskDescription.value
  }
  
  window.electron.ipcRenderer.invoke('update-task', updatedTask)
    .then((result) => {
      if (isTask(result)) {
        handleTaskUpdate(result)
      }
    })
    .catch((error) => {
      console.error('自动保存失败:', error)
    })
}

// 修改打��任务详情的方法
const openTaskDetail = (task: unknown) => {
  if (!isTask(task)) return
  currentTask.value = { ...task }
  taskTitle.value = task.name
  taskDescription.value = task.description || ''
  taskDetailVisible.value = true
}

// 处理删除任务
const handleHardDeleteTask = async (task: Task) => {
  try {
    const result = await window.electron.ipcRenderer.invoke('permanently-delete-task', task.id)
    if (result) {
      selectedDeletedIndex.value = -1
      selectedDeletedTask.value = null
      const index = deletedTasks.value.findIndex(t => t.id === task.id)
      if (index !== -1) {
        deletedTasks.value.splice(index, 1)
      }
      ElMessage.success(`任务"${task.name}"已永久删除`)
    }
  } catch (error) {
    handleError(error, 'handleHardDeleteTask')
  }
}

// 显示回收站
const showRecycleBin = () => {
  console.log('Showing recycle bin')
  showRecycleBinDialog.value = true
  viewingRecycleBin.value = true
  selectedTaskIndex.value = -1
}

// 选择已删除的任务
const selectDeletedTask = (task: Task, index: number) => {
  console.log('Selecting deleted task:', { task, index })
  selectedDeletedIndex.value = index
  selectedTaskIndex.value = -1
  selectedDeletedTask.value = task
  viewingCompleted.value = false
}

// 修改 watch 函数重置所有选状态
watch(showRecycleBinDialog, (newValue) => {
  console.log('Recycle bin dialog state changed:', newValue)
  if (!newValue) {
    console.log('Resetting selection states')
    viewingRecycleBin.value = false
    selectedTaskIndex.value = -1
    selectedDeletedIndex.value = -1
    selectedDeletedTask.value = null
    viewingCompleted.value = false
  }
})

// 修改选择任务的方法，使其互斥
const selectTask = (index: number, isCompleted: boolean = false) => {
  console.log('Selecting task:', { index, isCompleted })
  if (viewingRecycleBin.value) {
    console.log('Closing recycle bin before selecting task')
    viewingRecycleBin.value = false
    showRecycleBinDialog.value = false
  }
  selectedTaskIndex.value = index
  viewingCompleted.value = isCompleted
  selectedDeletedIndex.value = -1
  selectedDeletedTask.value = null
  
  // 确保根元素重新获得焦点
  nextTick(() => {
    tasksViewRef.value?.focus()
  })
}

// 更新任务完成状态
const updateTaskCompletion = async (task: Task) => {
  try {
    const updatedTask = {
      ...task,
      completed: !task.completed
    }
    const result = await window.electron.ipcRenderer.invoke('update-task', updatedTask)
    if (result) {
      ElMessage.success(`任务"${task.name}"已${result.completed ? '完成' : '取消完成'}`)
      
      // 更新本地任务状态
      const index = tasks.value.findIndex(t => t.id === task.id)
      if (index !== -1) {
        tasks.value[index] = result
      }
      
      // 重置选中状态
      selectedTaskIndex.value = -1
      viewingCompleted.value = false
      
      // 更新时间维度任务数量
      await initializeTaskStats()
    }
    
    // 确保根元素重新获得焦点
    nextTick(() => {
      tasksViewRef.value?.focus()
    })
  } catch (error) {
    handleError(error, 'updateTaskCompletion')
  }
}

// 初始快捷键
const keyboardState = computed(() => ({
  selectedTaskIndex: selectedTaskIndex.value,
  selectedDeletedIndex: selectedDeletedIndex.value,
  viewingRecycleBin: viewingRecycleBin.value,
  showQuickAdd: showQuickAdd.value,
  taskDetailVisible: taskDetailVisible.value,
  showTaskDashboard: showTaskDashboard.value,
  viewingCompleted: viewingCompleted.value
}))

const taskLists = computed(() => ({
  pendingTasks: pendingTasks.value,
  completedTasks: completedTasks.value,
  deletedTasks: deletedTasks.value
}))

const keyboardActions = {
  selectTask,
  selectDeletedTask,
  openTaskDetail,
  handleHardDeleteTask,
  handleRestoreTask,
  closeRecycleBin,
  updateTaskCompletion,
  deleteTask
}

const { handleKeydown: handleKeyboardShortcuts } = useKeyboardShortcuts(
  keyboardState,
  taskLists,
  keyboardActions
)

// 添加根元素引用
const tasksViewRef = ref<HTMLElement | null>(null)

// 加载配置
const loadConfig = async () => {
  try {
    const result = await window.electron.ipcRenderer.invoke('get-config')
    configInfo.value = result
  } catch (error) {
    console.error('Failed to load config:', error)
  }
}

// 选���数据路径
const handleSelectDataPath = async () => {
  try {
    const result = await window.electron.ipcRenderer.invoke('select-data-path')
    if (result) {
      configInfo.value = result
      ElMessage.success('数据存储路径已更新')
    }
  } catch (error) {
    console.error('Failed to select data path:', error)
    ElMessage.error('选择路径失败')
  }
}

// 导出数据
const handleExportData = () => {
  ElMessage.info('即将支持数据导出功能')
}

// 导入数据
const handleImportData = () => {
  ElMessage.info('即将支持数据导入功能')
}

// 空数据
const handleClearData = async () => {
  try {
    const result = await window.electron.ipcRenderer.invoke('clear-all-data')
    if (result.success) {
      // 清空本地状态
      tasks.value = []
      todayTasks.value = []
      weekTasks.value = []
      monthTasks.value = []
      quarterTasks.value = []
      yearTasks.value = []
      deletedTasks.value = []
      
      // 重置选中状态
      selectedTaskIndex.value = -1
      selectedDeletedIndex.value = -1
      selectedDeletedTask.value = null
      viewingCompleted.value = false
      
      // 关闭所有对话框
      showTaskDashboard.value = false
      taskDetailVisible.value = false
      showRecycleBinDialog.value = false
      showConfigDialog.value = false
      
      ElMessage({
        type: 'success',
        message: `数据已清空，备份已保存至: ${result.backupPath}`,
        duration: 5000
      })
      
      // 更新配置信息
      loadConfig()
    } else {
      throw new Error(result.error || '清空数据失败')
    }
  } catch (error) {
    console.error('Failed to clear data:', error)
    ElMessage.error(error.message || '清空数据失败')
  }
}

// 添加初始任务统计的方法
const initializeTaskStats = async (): Promise<void> => {
  try {
    // 加载各时间维度的任务
    const ranges = ['today', 'week', 'month', 'quarter', 'year'] as const
    for (const range of ranges) {
      const result = await window.electron.ipcRenderer.invoke('get-range-tasks', range)
      if (result && result.tasks) {
        switch (range) {
          case 'today':
            todayTasks.value = result.tasks
            break
          case 'week':
            weekTasks.value = result.tasks
            break
          case 'month':
            monthTasks.value = result.tasks
            break
          case 'quarter':
            quarterTasks.value = result.tasks
            break
          case 'year':
            yearTasks.value = result.tasks
            break
        }
      }
    }
  } catch (error) {
    handleError(error, 'initializeTaskStats')
  }
}

// 修改 onMounted 钩子
onMounted(async () => {
  console.log('Tasks component mounted')
  
  // 确保根元素可以接收键盘事件
  if (tasksViewRef.value) {
    tasksViewRef.value.focus()
  }

  // 请求初始任务数据
  try {
    const initialTasks = await window.electron.ipcRenderer.invoke('get-tasks')
    if (initialTasks) {
      tasks.value = initialTasks
    }
  } catch (error) {
    handleError(error, 'initial tasks loading')
  }

  // 初始化任务统计
  await initializeTaskStats()

  // 初始化事件监听
  window.electron.ipcRenderer.on('task-added', (_: unknown, data: TaskEvent) => {
    console.log('Task added event received:', data)
    if (data.task) {
      handleNewTask(data.task)
    }
    if (data.stats) {
      updateTaskStats(data.stats)
    }
  })

  window.electron.ipcRenderer.on('task-updated', (_: unknown, data: TaskEvent) => {
    console.log('Task updated event received:', data)
    if (data.task) {
      handleTaskUpdate(data.task)
    }
    if (data.stats) {
      updateTaskStats(data.stats)
    }
  })

  window.electron.ipcRenderer.on('task-deleted', (_: unknown, data: TaskEvent) => {
    console.log('Task deleted event received:', data)
    if (data.task) {
      const deletedTask = data.task
      const index = tasks.value.findIndex(t => t.id === deletedTask.id)
      if (index !== -1) {
        const taskWithDates = {
          ...deletedTask,
          deleted: true,
          deletedAt: deletedTask.deletedAt || new Date().toISOString(),
          createdAt: deletedTask.createdAt || new Date().toISOString()
        }
        tasks.value = tasks.value.map((task, i) => 
          i === index ? taskWithDates : task
        )
        
        // 检查任务是否已经在回收站中
        const existingIndex = deletedTasks.value.findIndex(t => t.id === deletedTask.id)
        if (existingIndex === -1) {
          deletedTasks.value = [...deletedTasks.value, taskWithDates]
        }
      }
    }
    if (data.stats) {
      updateTaskStats(data.stats)
    }
  })

  window.electron.ipcRenderer.on('task-restored', (_: unknown, data: TaskEvent) => {
    console.log('Task restored event received:', data)
    if (data.task) {
      const restoredTask = data.task
      const index = tasks.value.findIndex(t => t.id === restoredTask.id)
      if (index !== -1) {
        // 保留原始任务的所有数据
        const taskWithAllData = {
          ...tasks.value[index],
          ...restoredTask,
          deleted: false,
          deletedAt: null
        }
        tasks.value = tasks.value.map((task, i) => 
          i === index ? taskWithAllData : task
        )
        
        // 从回收站中移除
        const deletedIndex = deletedTasks.value.findIndex(t => t.id === restoredTask.id)
        if (deletedIndex !== -1) {
          deletedTasks.value = deletedTasks.value.filter((_, i) => i !== deletedIndex)
        }
      }
    }
    if (data.stats) {
      updateTaskStats(data.stats)
    }
  })

  // 添加 Command + I 快捷键处理
  const quickAddHandler = (e: KeyboardEvent) => {
    console.log('Quick add shortcut check:', e.key)
    if (e.metaKey && e.key.toLowerCase() === 'i' && !showQuickAdd.value && !taskDetailVisible.value) {
      e.preventDefault()
      showQuickAdd.value = true
      nextTick(() => {
        console.log('Focusing task input')
        if (taskInput.value) {
          taskInput.value.focus()
          taskInput.value.select()
        }
      })
    }
  }
  window.addEventListener('keydown', quickAddHandler)

  onUnmounted(() => {
    console.log('Tasks component unmounting, cleaning up listeners...')
    window.removeEventListener('keydown', quickAddHandler)
    window.electron.ipcRenderer.removeAllListeners('task-added')
    window.electron.ipcRenderer.removeAllListeners('task-updated')
    window.electron.ipcRenderer.removeAllListeners('task-deleted')
    window.electron.ipcRenderer.removeAllListeners('task-restored')
    window.electron.ipcRenderer.removeAllListeners('tasks-loaded')
    window.electron.ipcRenderer.removeAllListeners('tasks-stats-updated')
    window.electron.ipcRenderer.removeAllListeners('range-tasks-loaded')
  })
})

// 加配置相关的状态
const configInfo = ref({
  dataPath: '',
  version: '',
  lastBackup: null
})

// 显示配置对话框
const showConfigDialog = ref(false)

// 显示配置
const showConfig = async () => {
  try {
    const result = await window.electron.ipcRenderer.invoke('get-config')
    if (result) {
      configInfo.value = result
      showConfigDialog.value = true
    }
  } catch (error) {
    console.error('Failed to load config:', error)
    ElMessage.error('加载配置信息失败')
  }
}

// 修改任务统计更新函数
const updateTaskStats = (stats: TaskStats): void => {
  console.log('Updating task stats:', stats)
  if (stats.today) todayTasks.value = stats.today
  if (stats.week) weekTasks.value = stats.week
  if (stats.month) monthTasks.value = stats.month
  if (stats.quarter) quarterTasks.value = stats.quarter
  if (stats.year) yearTasks.value = stats.year
  if (stats.deleted) deletedTasks.value = stats.deleted
}

// 修改切换日任务显示函数
const toggleDayTasks = (day: string): void => {
  expandedDays.value = {
    ...expandedDays.value,
    [day]: !expandedDays.value[day]
  }
}

// 添加获取任务时间标签的函数
const getTaskTimeLabel = (createdAt: string): string => {
  const now = new Date()
  const taskDate = new Date(createdAt)

  // 重置时间为当天的 00:00:00
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const taskStartDate = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate())

  // 计算天数差
  const diffDays = Math.floor((nowDate.getTime() - taskStartDate.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return ''
  if (diffDays === 1) return '昨日任务'
  if (diffDays === 2) return '前日任务'
  if (diffDays <= 7) return `${diffDays}天前任务`
  if (diffDays <= 30) return `${Math.floor(diffDays / 7)}周前任务`
  if (diffDays <= 365) return `${Math.floor(diffDays / 30)}月前任务`
  return `${Math.floor(diffDays / 365)}年前任务`
}

// 添加时间格式化函数
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

// 修改按天分组的周任务计算属性
const groupedWeekTasks = computed(() => {
  const groups: { [key: string]: Task[] } = {}
  
  weekTasks.value.forEach(task => {
    const date = new Date(task.createdAt)
    const dayIndex = date.getDay()
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const dayName = days[dayIndex]
    if (!groups[dayName]) {
      groups[dayName] = []
    }
    groups[dayName].push(task)
  })
  
  // 对每天的任务按创建时间排序
  Object.keys(groups).forEach(day => {
    groups[day].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  })
  
  // 只返回有任务的日期
  const filteredGroups: { [key: string]: Task[] } = {}
  Object.entries(groups).forEach(([day, tasks]) => {
    if (tasks.length > 0) {
      filteredGroups[day] = tasks
    }
  })
  
  return filteredGroups
})

// 添加切换周任务显示的函数
const toggleWeekTasks = (weekLabel: string): void => {
  expandedWeeks.value = {
    ...expandedWeeks.value,
    [weekLabel]: !expandedWeeks.value[weekLabel]
  }
}

// 添加按月分组的任务计算属性
const groupedMonthTasks = computed(() => {
  const groups: { [key: string]: { totalTasks: number, days: { [key: string]: Task[] } } } = {}
  
  monthTasks.value.forEach(task => {
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
  
  // 对每天的任务按创建时间排序
  Object.keys(groups).forEach(weekLabel => {
    Object.keys(groups[weekLabel].days).forEach(dayLabel => {
      groups[weekLabel].days[dayLabel].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    })
  })
  
  return groups
})

// 添加获取周数的辅助函数
const getWeekNumber = (date: Date): string => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
  const dayOfWeek = firstDay.getDay()
  const weekNumber = Math.ceil((date.getDate() + dayOfWeek) / 7)
  return String(weekNumber)
}

// 添加格式化日期标签的辅助函数
const formatDayLabel = (date: Date): string => {
  const month = String(date.getMonth() + 1)
  const day = String(date.getDate())
  return `${month}月${day}日`
}

// 添加本季度任务分布相关的状态
// const showQuarterDistribution = ref(false)
const expandedMonths = ref<{ [key: string]: boolean }>({})

// 添加切换月任务显示的函数
const toggleMonthTasks = (monthLabel: string): void => {
  expandedMonths.value = {
    ...expandedMonths.value,
    [monthLabel]: !expandedMonths.value[monthLabel]
  }
}

// 添加按季度分组的任务计算属性
const groupedQuarterTasks = computed(() => {
  const groups: Record<string, MonthGroup> = {};

  quarterTasks.value.forEach(task => {
    const date = new Date(task.createdAt);
    const monthLabel = formatMonthLabel(date);
    const weekNumber = getWeekNumber(date);
    const weekLabel = `第${weekNumber}周`;
    const dayLabel = formatDayLabel(date);
    
    if (!groups[monthLabel]) {
      groups[monthLabel] = {
        totalTasks: 0,
        weeks: {}
      };
    }
    
    if (!groups[monthLabel].weeks[weekLabel]) {
      groups[monthLabel].weeks[weekLabel] = {
        totalTasks: 0,
        days: {}
      };
    }
    
    if (!groups[monthLabel].weeks[weekLabel].days[dayLabel]) {
      groups[monthLabel].weeks[weekLabel].days[dayLabel] = [];
    }
    
    groups[monthLabel].weeks[weekLabel].days[dayLabel].push(task);
    groups[monthLabel].weeks[weekLabel].totalTasks++;
    groups[monthLabel].totalTasks++;
  });
  
  // 对每个层级的任务按时间排序
  Object.keys(groups).forEach(monthLabel => {
    Object.keys(groups[monthLabel].weeks).forEach(weekLabel => {
      Object.keys(groups[monthLabel].weeks[weekLabel].days).forEach(dayLabel => {
        groups[monthLabel].weeks[weekLabel].days[dayLabel].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      });
    });
  });
  
  return groups;
});

// 添加格式化月份标签的辅助函数
const formatMonthLabel = (date: Date): string => {
  const month = String(date.getMonth() + 1)
  return `${month}月`
}

// 添加本年度任务分布相关的状态
const showYearDistribution = ref(false)

// 添加按年度分组的任务计算属性
const groupedYearTasks = computed(() => {
  const groups: Record<string, MonthGroup> = {};
  
  yearTasks.value.forEach(task => {
    const date = new Date(task.createdAt);
    const monthLabel = formatMonthLabel(date);
    const weekNumber = getWeekNumber(date);
    const weekLabel = `第${weekNumber}周`;
    const dayLabel = formatDayLabel(date);
    
    if (!groups[monthLabel]) {
      groups[monthLabel] = {
        totalTasks: 0,
        weeks: {}
      };
    }
    
    if (!groups[monthLabel].weeks[weekLabel]) {
      groups[monthLabel].weeks[weekLabel] = {
        totalTasks: 0,
        days: {}
      };
    }
    
    if (!groups[monthLabel].weeks[weekLabel].days[dayLabel]) {
      groups[monthLabel].weeks[weekLabel].days[dayLabel] = [];
    }
    
    groups[monthLabel].weeks[weekLabel].days[dayLabel].push(task);
    groups[monthLabel].weeks[weekLabel].totalTasks++;
    groups[monthLabel].totalTasks++;
  });
  
  // 对每个层级的任务按时间排序
  Object.keys(groups).forEach(monthLabel => {
    Object.keys(groups[monthLabel].weeks).forEach(weekLabel => {
      Object.keys(groups[monthLabel].weeks[weekLabel].days).forEach(dayLabel => {
        groups[monthLabel].weeks[weekLabel].days[dayLabel].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    });
  });
  
  return groups;
});

// 修改错误处理函数，添加类型声明


// 修改自动保存函数，确保它被使用
watch([taskTitle, taskDescription], () => {
  if (taskDetailVisible.value) {
    handleAutoSave();
  }
}, { deep: true });
</script>

<style lang="scss" scoped>
.tasks-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  outline: none; // 添加这行以移除点轮廓

  .statistics-cards {
    margin-bottom: 20px;

    .statistic-item {
      text-align: center;
      padding: 15px;  // 增加内边距
      transition: all 0.3s ease;  // 加过渡效果

      .title {
        color: var(--el-text-color-secondary);
        font-size: 14px;
        margin-bottom: 12px;  // 增加标题和数值间距
        font-weight: 500;  // 加粗标题
      }

      .value {
        font-size: 28px;  // 增大数字大小
        font-weight: bold;
        color: var(--el-color-primary);
        line-height: 1.2;  // 调整行高
      }
    }

    .el-card {
      border-radius: 8px;  // 增加圆角
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-5px);  // 悬浮时上移
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);  // 增强悬浮的阴影
        
        .value {
          transform: scale(1.1);  // 数字放大效果
        }
      }
    }
  }

  .tasks-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

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

.clickable {
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--el-box-shadow-light);
  }
}

.task-dashboard {
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
  }
}

.task-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .el-tag {
    opacity: 0.6;
  }
}

.task-detail {
  padding: 20px;
  
  h3 {
    margin: 0;
    color: var(--el-text-color-primary);
  }
  
  .task-description {
    margin: 20px 0;
  }
  
  .task-meta {
    color: var(--el-text-color-secondary);
    font-size: 14px;
    
    p {
      margin: 8px 0;
    }
  }
}

.task-title {
  margin-bottom: 20px;
  
  .el-input {
    font-size: 18px;
    font-weight: 500;
  }
}

.task-detail {
  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner) {
    box-shadow: none !important;
    border: 1px solid var(--el-border-color-light);
    
    &:hover, &:focus {
      border-color: var(--el-color-primary);
    }
  }
}

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
    &.deleted {
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
}

.recycle-bin-card {
  .value.danger {
    color: var(--el-color-danger);
  }
  
  &:hover {
    border-color: var(--el-color-danger);
    
    .value.danger {
      transform: scale(1.1);
    }
  }
}

.value {
  .el-icon {
    font-size: 24px;
    color: var(--el-color-primary);
  }
}

.config-container {
  padding: 20px;

  .path-selector {
    display: flex;
    gap: 12px;
    align-items: center;

    .el-input {
      flex: 1;
    }
  }

  .data-management {
    display: flex;
    gap: 12px;
  }
}

.task-info {
  .el-tag {
    margin-left: 8px;
    
    &.el-tag--warning.el-tag--dark {
      background-color: var(--el-color-warning-light-5);
      border-color: var(--el-color-warning-light-3);
      color: var(--el-color-warning-dark-2);
    }
  }
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

.time-distribution {
  padding: 20px;
  
  .distribution-header {
    display: flex;
    align-items: center;
    width: 100%;
    
    .day-label {
      min-width: 80px;
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
    
    .progress-wrapper {
      flex: 1;
      margin-left: 20px;
      
      .progress-bar {
        margin: 0;
      }
    }
  }
  
  .day-tasks {
    padding: 15px 0 5px 80px;
    
    .task-item-mini {
      padding: 12px 15px;
      margin-bottom: 10px;
      border-radius: 6px;
      background-color: var(--el-fill-color-light);
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background-color: var(--el-fill-color);
        transform: translateX(4px);
      }
      
      .task-info {
        .task-name {
          font-size: 14px;
          color: var(--el-text-color-primary);
          margin-bottom: 8px;
          display: block;
        }
        
        .task-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .el-tag {
            font-size: 12px;
          }
          
          .task-time {
            color: var(--el-text-color-secondary);
            font-size: 12px;
          }
        }
      }
    }
  }
}

:deep(.el-collapse) {
  border: none;
  
  .el-collapse-item {
    margin-bottom: 10px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    overflow: hidden;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .el-collapse-item__header {
      padding: 12px 15px;
      background-color: var(--el-bg-color);
      border-bottom: none;
      
      &:hover {
        background-color: var(--el-fill-color-light);
      }
    }
    
    .el-collapse-item__content {
      padding: 0 15px;
      background-color: var(--el-bg-color);
    }
  }
}

.week-stats {
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

  .week-tasks {
    .day-group {
      margin-bottom: 16px;
      border-radius: 8px;
      overflow: hidden;
      background: var(--el-bg-color-overlay);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      }

      .day-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 20px;
        background: var(--el-color-primary-light-9);
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          background: var(--el-color-primary-light-8);
        }

        .day-info {
          display: flex;
          align-items: center;
          gap: 8px;

          .day-label {
            font-weight: 600;
            color: var(--el-color-primary);
          }

          .task-count {
            color: var(--el-text-color-secondary);
            font-size: 14px;
          }
        }

        .expand-icon {
          font-size: 16px;
          color: var(--el-color-primary);
          transition: transform 0.3s ease;

          &.is-active {
            transform: rotate(180deg);
          }
        }
      }

      .day-tasks {
        padding: 0 20px;

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
      }
    }
  }
}

.month-stats {
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

  .month-tasks {
    .week-group {
      margin-bottom: 20px;
      border-radius: 8px;
      overflow: hidden;
      background: var(--el-bg-color-overlay);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

      .week-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        background: var(--el-color-primary-dark-2);
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          background: var(--el-color-primary);
        }

        .week-info {
          display: flex;
          align-items: center;
          gap: 12px;

          .week-label {
            font-weight: 600;
          }

          .task-count {
            opacity: 0.8;
          }
        }

        .expand-icon {
          font-size: 16px;
          transition: transform 0.3s ease;
          color: white;

          &.is-active {
            transform: rotate(180deg);
          }
        }
      }

      .week-content {
        padding: 10px;

        .day-group {
          margin-bottom: 10px;
          border-radius: 6px;
          overflow: hidden;
          background: var(--el-bg-color);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

          &:last-child {
            margin-bottom: 0;
          }

          .day-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 20px;
            background: var(--el-color-primary-light-9);
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              background: var(--el-color-primary-light-8);
            }

            .day-info {
              display: flex;
              align-items: center;
              gap: 8px;

              .day-label {
                font-weight: 500;
                color: var(--el-color-primary);
              }

              .task-count {
                color: var(--el-text-color-secondary);
                font-size: 14px;
              }
            }

            .expand-icon {
              font-size: 16px;
              color: var(--el-color-primary);
              transition: transform 0.3s ease;

              &.is-active {
                transform: rotate(180deg);
              }
            }
          }

          .day-tasks {
            padding: 0 20px;

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
          }
        }
      }
    }
  }
}

.quarter-stats {
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

  .quarter-tasks {
    .month-group {
      margin-bottom: 24px;
      border-radius: 8px;
      overflow: hidden;
      background: var(--el-bg-color-overlay);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

      .month-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: var(--el-color-primary-dark-2);
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          background: var(--el-color-primary);
        }

        .month-info {
          display: flex;
          align-items: center;
          gap: 12px;

          .month-label {
            font-weight: 600;
            font-size: 16px;
          }

          .task-count {
            opacity: 0.8;
          }
        }

        .expand-icon {
          font-size: 16px;
          transition: transform 0.3s ease;
          color: white;

          &.is-active {
            transform: rotate(180deg);
          }
        }
      }

      .month-content {
        padding: 12px;

        .week-group {
          margin-bottom: 16px;
          border-radius: 6px;
          overflow: hidden;
          background: var(--el-bg-color);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

          &:last-child {
            margin-bottom: 0;
          }

          .week-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px 20px;
            background: var(--el-color-primary-light-9);
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              background: var(--el-color-primary-light-8);
            }

            .week-info {
              display: flex;
              align-items: center;
              gap: 8px;

              .week-label {
                font-weight: 500;
                color: var(--el-color-primary);
              }

              .task-count {
                color: var(--el-text-color-secondary);
                font-size: 14px;
              }
            }

            .expand-icon {
              font-size: 16px;
              color: var(--el-color-primary);
              transition: transform 0.3s ease;

              &.is-active {
                transform: rotate(180deg);
              }
            }
          }

          .week-content {
            padding: 10px;

            .day-group {
              margin-bottom: 10px;
              border-radius: 6px;
              overflow: hidden;
              background: var(--el-bg-color);
              box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

              &:last-child {
                margin-bottom: 0;
              }

              .day-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 20px;
                background: var(--el-color-primary-light-9);
                cursor: pointer;
                transition: all 0.3s ease;

                &:hover {
                  background: var(--el-color-primary-light-8);
                }

                .day-info {
                  display: flex;
                  align-items: center;
                  gap: 8px;

                  .day-label {
                    font-weight: 500;
                    color: var(--el-color-primary);
                  }

                  .task-count {
                    color: var(--el-text-color-secondary);
                    font-size: 14px;
                  }
                }

                .expand-icon {
                  font-size: 16px;
                  color: var(--el-color-primary);
                  transition: transform 0.3s ease;

                  &.is-active {
                    transform: rotate(180deg);
                  }
                }
              }

              .day-tasks {
                padding: 0 20px;

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
              }
            }
          }
        }
      }
    }
  }
}

.year-stats {
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

  .year-tasks {
    .month-group {
      margin-bottom: 24px;
      border-radius: 8px;
      overflow: hidden;
      background: var(--el-bg-color-overlay);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

      .month-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: var(--el-color-primary-dark-2);
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          background: var(--el-color-primary);
        }

        .month-info {
          display: flex;
          align-items: center;
          gap: 12px;

          .month-label {
            font-weight: 600;
            font-size: 16px;
          }

          .task-count {
            opacity: 0.8;
          }
        }

        .expand-icon {
          font-size: 16px;
          transition: transform 0.3s ease;
          color: white;

          &.is-active {
            transform: rotate(180deg);
          }
        }
      }

      .month-content {
        padding: 12px;

        .week-group {
          margin-bottom: 16px;
          border-radius: 6px;
          overflow: hidden;
          background: var(--el-bg-color);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

          &:last-child {
            margin-bottom: 0;
          }

          .week-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px 20px;
            background: var(--el-color-primary-light-9);
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              background: var(--el-color-primary-light-8);
            }

            .week-info {
              display: flex;
              align-items: center;
              gap: 8px;

              .week-label {
                font-weight: 500;
                color: var(--el-color-primary);
              }

              .task-count {
                color: var(--el-text-color-secondary);
                font-size: 14px;
              }
            }

            .expand-icon {
              font-size: 16px;
              color: var(--el-color-primary);
              transition: transform 0.3s ease;

              &.is-active {
                transform: rotate(180deg);
              }
            }
          }

          .week-content {
            padding: 10px;

            .day-group {
              margin-bottom: 10px;
              border-radius: 6px;
              overflow: hidden;
              background: var(--el-bg-color);
              box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

              &:last-child {
                margin-bottom: 0;
              }

              .day-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 20px;
                background: var(--el-color-primary-light-9);
                cursor: pointer;
                transition: all 0.3s ease;

                &:hover {
                  background: var(--el-color-primary-light-8);
                }

                .day-info {
                  display: flex;
                  align-items: center;
                  gap: 8px;

                  .day-label {
                    font-weight: 500;
                    color: var(--el-color-primary);
                  }

                  .task-count {
                    color: var(--el-text-color-secondary);
                    font-size: 14px;
                  }
                }

                .expand-icon {
                  font-size: 16px;
                  color: var(--el-color-primary);
                  transition: transform 0.3s ease;

                  &.is-active {
                    transform: rotate(180deg);
                  }
                }
              }

              .day-tasks {
                padding: 0 20px;

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
              }
            }
          }
        }
      }
    }
  }
}
</style>