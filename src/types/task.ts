export interface Task {
  id: number;
  name: string;
  completed: boolean;
  createdAt: string;
  deleted?: boolean;
  deletedAt?: string | null;
  description?: string;
}

export interface TaskStats {
  today?: Task[];
  week?: Task[];
  month?: Task[];
  quarter?: Task[];
  year?: Task[];
  deleted?: Task[];
}

export interface TaskEvent {
  task?: Task;
  stats?: TaskStats;
}

export type RangeType = 'today' | 'week' | 'month' | 'quarter' | 'year';
export type ViewRangeType = Exclude<RangeType, 'today'>;

export interface Stats {
  total: number;
  completed: number;
  pending: number;
}

export interface DayTasks {
  tasks: Task[];
  length: number;
}

export interface WeekData {
  totalTasks: number;
  days: Record<string, Task[]>;
}

export interface MonthData {
  totalTasks: number;
  weeks: Record<string, WeekData>;
}

export interface QuarterOrYearData {
  totalTasks: number;
  weeks: Record<string, {
    totalTasks: number;
    days: Record<string, Task[]>;
  }>;
}

export type GroupedTasks = Record<string, Task[]> | Record<string, WeekData> | Record<string, QuarterOrYearData>; 