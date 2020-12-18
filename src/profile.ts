import {performance} from 'perf_hooks';

interface TimeParts {
  hours: number;
  milliseconds: number;
  minutes: number;
  seconds: number;
}

const DEFAULT_REPORT_KEYS = [/file\..*/, /yaml\..*/];
const DEFAULT_THRESHOLD = 0.2;

export class Profiler {
  private timerTypes: Record<string, TimerType>;

  constructor() {
    this.timerTypes = {};
  }

  get duration(): number {
    return this.end - this.begin;
  }

  // Get the last end time for all timers.
  get end(): number {
    let maxEnd = 0;
    for (const key of Object.keys(this.timerTypes)) {
      if (this.timerTypes[key].end > maxEnd) {
        maxEnd = this.timerTypes[key].end;
      }
    }
    return maxEnd;
  }

  // Get the first start time for all timers.
  get begin(): number {
    let minBegin = Number.MAX_SAFE_INTEGER;
    for (const key of Object.keys(this.timerTypes)) {
      if (this.timerTypes[key].begin < minBegin) {
        minBegin = this.timerTypes[key].begin;
      }
    }
    return minBegin;
  }

  report(
    keys?: Array<string> | Array<RegExp>,
    showExpandedReport = false,
    logMethod: Function = console.log,
    warnMethod: Function = console.warn
  ) {
    const totalDuration = this.duration;
    const shownTimerKeys: Array<string> = [];

    // Show timers that are over threshold first.
    for (const timerKey of Object.keys(this.timerTypes).sort()) {
      if (this.timerTypes[timerKey].isOverThreshold(totalDuration)) {
        this.timerTypes[timerKey].report(totalDuration, warnMethod);
        shownTimerKeys.push(timerKey);
      }
    }

    if (!showExpandedReport) {
      return;
    }

    // Show the timers that match the key expressions.
    if (!keys || keys.length === 0) {
      keys = DEFAULT_REPORT_KEYS;
    }
    for (const timerKey of Object.keys(this.timerTypes).sort()) {
      if (shownTimerKeys.includes(timerKey)) {
        continue;
      }

      for (let keyExp of keys) {
        // TODO: use datatype class.
        if (!(typeof keyExp === 'object' && keyExp.constructor !== RegExp)) {
          keyExp = new RegExp(keyExp);
        }
        if (keyExp.test(timerKey)) {
          this.timerTypes[timerKey].report(totalDuration, logMethod);
        }
      }
    }
  }

  timer(key: string, label?: string, meta?: any): Timer {
    if (!this.timerTypes[key]) {
      this.timerTypes[key] = new TimerType(key, label, meta);
    }
    // Auto start the timer, but it can be called again to reset the start time.
    return this.timerTypes[key].timer().start();
  }

  timersFor(key: string, label?: string, meta?: any): TimerType {
    if (!this.timerTypes[key]) {
      this.timerTypes[key] = new TimerType(key, label, meta);
    }
    return this.timerTypes[key];
  }
}

export class TimerType {
  key: string;
  label?: string;
  meta?: any;
  threshold: number;
  private timers: Array<Timer>;

  constructor(key: string, label?: string, meta?: any) {
    this.timers = [];
    this.threshold = DEFAULT_THRESHOLD;

    this.key = key;
    this.label = label;
    this.meta = meta;
  }

  get average(): number {
    const durations = [];
    for (const timer of this.timers) {
      durations.push(timer.duration);
    }
    if (durations.length < 2) {
      return durations.length === 1 ? durations[0] : 0;
    }
    return durations.reduce((a, b) => a + b) / durations.length;
  }

  get duration(): number {
    return this.end - this.begin;
  }

  // Get the last end time for all timers.
  get end(): number {
    let maxEnd = 0;
    for (const timer of this.timers) {
      if (timer?.end ?? 0 > maxEnd) {
        maxEnd = timer.end || 0;
      }
    }
    return maxEnd;
  }

  // Get the first start time for all timers.
  get begin(): number {
    let minBegin = Number.MAX_SAFE_INTEGER;
    for (const timer of this.timers) {
      if (timer.begin || Number.MAX_SAFE_INTEGER < minBegin) {
        minBegin = timer.begin || Number.MAX_SAFE_INTEGER;
      }
    }
    return minBegin;
  }

  get sum(): number {
    let sum = 0;
    for (const timer of this.timers) {
      sum += timer.duration;
    }
    return sum;
  }

  isOverThreshold(totalDuration: number): boolean {
    return this.sum / totalDuration >= this.threshold;
  }

  report(duration: number, logMethod: Function = console.log) {
    const sumDuration = this.sum;
    let percent = (sumDuration / duration).toFixed(2);
    if (duration === 0) {
      percent = '100';
    }

    logMethod(
      `${this.label || this.key} took ${timeFormat(
        sumDuration
      )} (${percent}% called ${this.timers.length}x, ${timeFormat(
        this.average
      )} each)`
    );
  }

  timer(): Timer {
    const nextTimer = new Timer();
    this.timers.push(nextTimer);
    return nextTimer;
  }

  toString(): string {
    if (this.label) {
      return `[TimerType: ${this.key} - ${this.label} (${this.duration})]`;
    }
    return `[TimerType: ${this.key} (${this.duration})]`;
  }
}

export class Timer {
  begin?: number;
  end?: number;

  get duration() {
    if (!this.begin) {
      this.begin = performance.now();
    }

    if (!this.end) {
      this.end = performance.now();
    }

    return this.end - this.begin;
  }

  start(): Timer {
    this.begin = performance.now();
    return this;
  }

  stop(): Timer {
    if (this.end) {
      throw new Error('Timer has already been stopped');
    }
    this.end = performance.now();
    return this;
  }

  toString(): string {
    return `[Timer: ${this.duration}]`;
  }
}

function timeFormat(value: number): string {
  const parts: TimeParts = {
    hours: 0,
    milliseconds: value,
    minutes: 0,
    seconds: 0,
  };

  if (value < 0.1) {
    return `${(parts.milliseconds * 1000).toFixed(2)}µs`;
  }

  if (parts.milliseconds >= 1000) {
    parts.seconds = Math.floor(parts.milliseconds / 1000);
    parts.milliseconds -= parts.seconds * 1000;
  }

  let result = '';

  if (parts.hours > 0) {
    result = `${parts.hours < 10 ? '0' : ''}${parts.hours}`;
    result += `:${parts.minutes < 10 ? '0' : ''}${parts.minutes}`;
    result += `:${parts.seconds < 10 ? '0' : ''}${parts.seconds}`;
    result += `:${parts.milliseconds < 10 ? '0' : ''}${parts.milliseconds}`;
    return result;
  }

  if (parts.seconds > 0) {
    result = `${parts.seconds} sec`;

    if (parts.minutes > 0) {
      result = `${parts.minutes} min, ${result}`;
    }
  }

  return result
    ? `${result}, ${parts.milliseconds.toFixed(1)}ms`
    : `${parts.milliseconds.toFixed(1)}ms`;
}
