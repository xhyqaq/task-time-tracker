export const isToday = (date: Date): boolean => {
  const today = new Date()
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

export const formatDate = (dateString: string): string => {
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

export const getTaskTimeLabel = (createdAt: string): string => {
  const now = new Date()
  const taskDate = new Date(createdAt)
  const diffDays = Math.floor((now.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return ''
  if (diffDays === 1) return '昨日任务'
  if (diffDays === 2) return '前日任务'
  if (diffDays <= 7) return `${diffDays}天前任务`
  if (diffDays <= 30) return `${Math.floor(diffDays / 7)}周前任务`
  if (diffDays <= 365) return `${Math.floor(diffDays / 30)}月前任务`
  return `${Math.floor(diffDays / 365)}年前任务`
}

export const getWeekNumber = (date: Date): string => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
  const dayOfWeek = firstDay.getDay()
  const weekNumber = Math.ceil((date.getDate() + dayOfWeek) / 7)
  return String(weekNumber)
} 