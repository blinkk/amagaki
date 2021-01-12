import Table from 'cli-table';
import {performance} from 'perf_hooks';

interface TimeParts {
  hours: number;
  milliseconds: number;
  minutes: number;
  seconds: number;
}

interface ProfileReportItem {
  average: number;
  sum: number;
  key: string;
  label: string;
  count: number;
  maximum: number;
  minimum: number;
}

export class Profiler {
  timerTypes: Record<string, TimerType>;

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

  get benchmarkOutput(): string {
    const metrics = [];

    for (const key of Object.keys(this.timerTypes).sort()) {
      const timerType = this.timerTypes[key];
      metrics.push(
        `${key} x ${timerType.sum} ms ±0% (${timerType.length} runs sampled)`
      );
    }

    return metrics.join('\n');
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
  timers: Array<Timer>;

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

  /**
   * The longest timer duration.
   */
  get maximum(): number {
    let maxDuration = 0;
    for (const timer of this.timers) {
      if (timer.duration > maxDuration) {
        maxDuration = timer.duration;
      }
    }
    return maxDuration;
  }

  /**
   * The shortest timer duration.
   */
  get minimum(): number {
    let minDuration = Number.MAX_SAFE_INTEGER;
    for (const timer of this.timers) {
      if (timer.duration || Number.MAX_SAFE_INTEGER < minDuration) {
        minDuration = timer.duration || Number.MAX_SAFE_INTEGER;
      }
    }
    return minDuration;
  }

  get length(): number {
    return this.timers.length;
  }

  get sum(): number {
    let sum = 0;
    for (const timer of this.timers) {
      sum += timer.duration;
    }
    return sum;
  }

  isOverThreshold(totalDuration: number, threshold: number): boolean {
    return this.sum / totalDuration >= threshold;
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

export class ProfileReport {
  static HOOK_REPORT_REGEX = /^plugins\.trigger\..*/;
  static HOOK_REPORT_SUB_REGEX = /^plugins\.trigger\.[^\.]*\./;
  static THRESHOLD = 0.2;
  static MAX_WIDTH = 80;
  logMethod: Function;
  profiler: Profiler;
  reportItems: Record<string, ProfileReportItem>;

  constructor(profiler: Profiler, logMethod = console.log) {
    this.logMethod = logMethod;
    this.profiler = profiler;
    this.reportItems = {};

    for (const timerKey of Object.keys(this.profiler.timerTypes).sort()) {
      const timerType = this.profiler.timerTypes[timerKey];
      this.reportItems[timerKey] = {
        average: timerType.average,
        sum: timerType.sum,
        key: timerKey,
        label: timerType.label || timerType.key,
        count: timerType.length,
        maximum: timerType.maximum,
        minimum: timerType.minimum,
      };
    }
  }

  filter(filterFunc: Function): Record<string, TimerType> {
    const filteredTimerTypes: Record<string, TimerType> = {};
    for (const timerKey of Object.keys(this.profiler.timerTypes).sort()) {
      const timerType = this.profiler.timerTypes[timerKey];
      if (filterFunc(timerKey, timerType)) {
        filteredTimerTypes[timerKey] = timerType;
      }
    }
    return filteredTimerTypes;
  }

  output(showExpandedReport = false) {
    const reportOutput = this.toString(showExpandedReport);

    // Ignore the output when there is nothing to show.
    if (reportOutput.length) {
      this.logMethod(reportOutput);
    }
  }

  sectionToString(
    title: string,
    timerTypes: Record<string, TimerType>,
    labelFunc?: Function
  ): string {
    // Ignore when no matching timer types.
    if (!Object.keys(timerTypes).length) {
      return '';
    }

    const outputTable = new Table({
      head: [title, '%', 'Time', 'Stats'],
      colAligns: ['left', 'right', 'right', 'left'],
      chars: {mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': ''},
    });

    const totalDuration = this.profiler.duration;

    for (const timerKey of Object.keys(timerTypes).sort()) {
      const timerType = timerTypes[timerKey];
      const labelValue = timerType.label || timerType.key;
      outputTable.push([
        labelFunc ? labelFunc(timerKey, timerType, labelValue) : labelValue,
        `${((timerType.sum / totalDuration) * 100).toFixed(2)}%`,
        timeFormat(timerType.sum),
        `Called ${timerType.timers.length}x, ${timeFormat(
          timerType.average
        )} avg`,
      ]);
    }

    return outputTable.toString();
  }

  toString(showExpandedReport = false): string {
    let reportOutput = '';

    // Reset shown keys.
    const shownTimerKeys = new Set();

    // Display timers over threshold.
    const duration = this.profiler.duration;
    const threshold = duration * ProfileReport.THRESHOLD;
    let filteredTimerTypes = this.filter(
      (timerKey: string, timerType: TimerType) => {
        if (shownTimerKeys.has(timerKey)) {
          return false;
        }
        return timerType.sum >= threshold && timerType.sum !== duration;
      }
    );
    for (const timerKey of Object.keys(filteredTimerTypes)) {
      shownTimerKeys.add(timerKey);
    }
    reportOutput += this.sectionToString(
      `Over threshold (>=${ProfileReport.THRESHOLD * 100}%)`,
      filteredTimerTypes
    );

    if (!showExpandedReport) {
      return reportOutput;
    }

    // Show hook timers.
    filteredTimerTypes = this.filter((timerKey: string) => {
      if (shownTimerKeys.has(timerKey)) {
        return false;
      }
      return ProfileReport.HOOK_REPORT_REGEX.test(timerKey);
    });
    for (const timerKey of Object.keys(filteredTimerTypes)) {
      shownTimerKeys.add(timerKey);
    }
    reportOutput += this.sectionToString(
      'Hook timers',
      filteredTimerTypes,
      (timerKey: string, timerType: TimerType, label: string) => {
        // Indent the plugin hook information.
        if (ProfileReport.HOOK_REPORT_SUB_REGEX.test(timerKey)) {
          return `  ${label}`;
        }
        return label;
      }
    );

    // Show all remaining timers.
    filteredTimerTypes = this.filter(
      (timerKey: string) => !shownTimerKeys.has(timerKey)
    );
    if (reportOutput.length) {
      reportOutput += '\n';
    }
    reportOutput += this.sectionToString('Timers', filteredTimerTypes);

    return reportOutput;
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
