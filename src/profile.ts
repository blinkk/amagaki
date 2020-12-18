import {utils} from 'mocha';
import {performance} from 'perf_hooks';

interface TimeParts {
  hours: number;
  milliseconds: number;
  minutes: number;
  seconds: number;
}

const DEFAULT_REPORT_KEYS = [/storage\..*/, /yaml\..*/];

export class Profiler {
  private timerTypes: Record<string, TimerType>;

  constructor() {
    this.timerTypes = {};
  }

  get duration(): number {
    return this.end - this.start;
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
  get start(): number {
    let minStart = Number.MAX_SAFE_INTEGER;
    for (const key of Object.keys(this.timerTypes)) {
      if (this.timerTypes[key].end < minStart) {
        minStart = this.timerTypes[key].end;
      }
    }
    return minStart;
  }

  report(
    keys?: Array<string> | Array<RegExp>,
    outMethod: Function = console.log
  ) {
    const totalDuration = this.duration;
    keys = keys || DEFAULT_REPORT_KEYS;
    for (const timerKey of Object.keys(this.timerTypes).sort()) {
      for (let keyExp of keys) {
        // TODO: use datatype class.
        if (!(typeof keyExp === 'object' && keyExp.constructor !== RegExp)) {
          keyExp = new RegExp(keyExp);
        }
        if (keyExp.test(timerKey)) {
          this.timerTypes[timerKey].report(totalDuration, outMethod);
        }
      }
    }
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
  private timers: Array<Timer>;

  constructor(key: string, label?: string, meta?: any) {
    this.timers = [];

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
    return this.end - this.start;
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
  get start(): number {
    let minStart = Number.MAX_SAFE_INTEGER;
    for (const timer of this.timers) {
      if (timer.start < minStart) {
        minStart = timer.start;
      }
    }
    return minStart;
  }

  get sum(): number {
    let sum = 0;
    for (const timer of this.timers) {
      sum += timer.duration;
    }
    return sum;
  }

  report(duration: number, outMethod: Function = console.log) {
    const sumDuration = this.sum;
    let percent = (sumDuration / duration).toFixed(2);
    if (duration === 0) {
      percent = '100';
    }

    outMethod(
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

  wrap(method: Function): Function {
    return (...args: any) => {
      const timer = this.timer();
      try {
        return method(...args);
      } finally {
        timer.stop();
      }
    };
  }

  wrapAsync(method: Function, thisRef?: any): Function {
    return async (...args: any) => {
      const timer = this.timer();
      try {
        if (thisRef) {
          return await method.apply(thisRef, ...args);
        }
        return await method(...args);
      } finally {
        timer.stop();
      }
    };
  }
}

export class Timer {
  start: number;
  end?: number;

  constructor() {
    this.start = performance.now();
  }

  get duration() {
    if (!this.end) {
      this.end = performance.now();
    }

    return this.end - this.start;
  }

  stop() {
    if (this.end) {
      throw new Error('Timer has already been stopped');
    }
    this.end = performance.now();
  }

  toString(): string {
    return `[Timer: ${this.duration}]`;
  }
}

const profiler = new Profiler();
export default profiler;

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
