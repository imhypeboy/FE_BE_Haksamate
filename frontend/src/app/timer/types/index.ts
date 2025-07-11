export type TimerState = "idle" | "running" | "paused";
export type StopwatchState = "idle" | "running" | "paused";
export type ActiveTab = "alarm" | "stopwatch" | "timer";

export interface AlarmItem {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
  days: string[];
}

export interface LapTime {
  id: string;
  time: number;
  lapNumber: number;
}

export interface TimerConfig {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface StopwatchConfig {
  targetTime: number;
  targetEnabled: boolean;
  intervalTime: number;
  intervalEnabled: boolean;
  soundEnabled: boolean;
}

export interface TimeDisplay {
  hours: string;
  minutes: string;
  seconds: string;
  display: string;
}

export interface StopwatchDisplay {
  minutes: string;
  seconds: string;
  milliseconds: string;
  display: string;
} 