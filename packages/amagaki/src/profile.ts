import Table = require('cli-table');

import {performance} from 'perf_hooks';

interface TimeParts {
  hours: number;
  milliseconds: number;
  minutes: number;
  seconds: number;
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
    const allKeys = Object.keys(this.timerTypes).sort();

    // When doing benchmarks, the individual build timers bloat the results.
    // They also do not provide much value for diffing benchmarks since they
    // are so small. For now, filter them out of the output file.
    const filteredKeys = allKeys.filter(key => {
      return !key.match(ProfileReport.EXCLUDE_FROM_BENCHMARK_REGEX);
    });

    for (const key of filteredKeys) {
      const timerType = this.timerTypes[key];
      metrics.push(
        `${key} x ${timerType.sum} ms ±0% (${timerType.length} runs sampled)`
      );
    }

    return `${metrics.join('\n')}\n`;
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
  static DEFAULT_THRESHOLD = 0.2;
  key: string;
  label?: string;
  meta?: any;
  threshold: number;
  timers: Array<Timer>;

  constructor(key: string, label?: string, meta?: any, threshold?: number) {
    this.timers = [];

    this.key = key;
    this.label = label;
    this.meta = meta;
    this.threshold = threshold || TimerType.DEFAULT_THRESHOLD;
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

  isOverThreshold(totalDuration: number): boolean {
    return this.sum / totalDuration >= this.threshold;
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
  static BUILD_REPORT_REGEX = /(^builder\.build\..*)|(^templates\.render\..*)/i;
  static EXCLUDE_FROM_BENCHMARK_REGEX = ProfileReport.BUILD_REPORT_REGEX;
  static HOOK_REPORT_REGEX = /^plugins\.hook\..*/;
  static HOOK_REPORT_SUB_REGEX = /^plugins\.hook\.[^\.]*\./;
  static IGNORED_THRESHOLDS = new Set([/^builder\.build\./]);
  static TEMPLATE_REPORT_REGEX = /^templates\.render\./;
  static MAX_WIDTH = 80;
  logMethod: Function;
  profiler: Profiler;

  constructor(profiler: Profiler, logMethod = console.log) {
    this.logMethod = logMethod;
    this.profiler = profiler;
  }

  filter(filterFunc: Function): Array<TimerType> {
    const filteredTimerTypes: Array<TimerType> = [];
    for (const timerKey of Object.keys(this.profiler.timerTypes).sort()) {
      const timerType = this.profiler.timerTypes[timerKey];
      if (filterFunc(timerType)) {
        filteredTimerTypes.push(timerType);
      }
    }
    return filteredTimerTypes;
  }

  output(showExpandedReport = false) {
    const shownTimerKeys: Set<string> = new Set();
    this.reportThreshold(shownTimerKeys);

    if (!showExpandedReport) {
      return;
    }

    this.reportHooks(shownTimerKeys);
    this.reportTimers(shownTimerKeys);
    this.reportSlowBuilds(shownTimerKeys);
    this.reportTemplates(shownTimerKeys);
  }

  reportHooks(shownTimerKeys: Set<string>) {
    const duration = this.profiler.duration;
    const filteredTimerTypes = this.filter((timerType: TimerType) => {
      return ProfileReport.HOOK_REPORT_REGEX.test(timerType.key);
    });

    // Mark timerType keys as being shown.
    filteredTimerTypes.forEach((timerType: TimerType) =>
      shownTimerKeys.add(timerType.key)
    );

    const reportSection = new ProfileReportSection(
      'Hooks',
      filteredTimerTypes,
      duration
    );
    reportSection.labelFunc = (timerType: TimerType): string => {
      // Indent the plugin hook information.
      if (ProfileReport.HOOK_REPORT_SUB_REGEX.test(timerType.key)) {
        return `  ${timerType.meta.plugin}`;
      }
      return timerType.meta.hook;
    };

    const reportOutput = reportSection.toString();
    if (reportOutput) {
      this.logMethod(reportOutput);
    }
  }

  reportTemplates(shownTimerKeys: Set<string>) {
    const duration = this.profiler.duration;
    const filteredTimerTypes = this.filter((timerType: TimerType) => {
      return ProfileReport.TEMPLATE_REPORT_REGEX.test(timerType.key);
    });
    for (const timerType of filteredTimerTypes) {
      shownTimerKeys.add(timerType.key);
    }
    const reportSection = new ProfileReportSection(
      'Templates',
      filteredTimerTypes,
      duration
    );

    // Show the longest timers first.
    reportSection.timerTypes.sort(
      (a: TimerType, b: TimerType) => b.duration - a.duration
    );

    // Use the podPath as the label.
    reportSection.labelFunc = (timerType: TimerType): string =>
      timerType.meta.podPath;

    const reportOutput = reportSection.toString(12);
    if (reportOutput) {
      this.logMethod(reportOutput);
    }
  }

  reportSlowBuilds(shownTimerKeys: Set<string>) {
    const duration = this.profiler.duration;
    const filteredTimerTypes = this.filter((timerType: TimerType) => {
      return ProfileReport.BUILD_REPORT_REGEX.test(timerType.key);
    });
    for (const timerType of filteredTimerTypes) {
      shownTimerKeys.add(timerType.key);
    }
    const reportSection = new ProfileReportSection(
      'Slowest builds',
      filteredTimerTypes,
      duration
    );

    // Show the longest timers first.
    reportSection.timerTypes.sort(
      (a: TimerType, b: TimerType) => b.duration - a.duration
    );

    // Use the url as the label.
    reportSection.labelFunc = (timerType: TimerType): string =>
      timerType.meta.urlPath;

    // Custom table structure.
    reportSection.table = new Table({
      head: [reportSection.title, 'Time'],
      colAligns: ['left', 'right'],
      chars: {mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': ''},
    });

    // Custom row display.
    reportSection.rowFunc = (timerType: TimerType) => {
      const labelValue = timerType.label || timerType.key;
      return [
        reportSection.labelFunc
          ? reportSection.labelFunc(timerType, labelValue)
          : labelValue,
        timeFormat(timerType.sum),
      ];
    };

    const reportOutput = reportSection.toString(12);
    if (reportOutput) {
      this.logMethod(reportOutput);
    }
  }

  reportThreshold(shownTimerKeys: Set<string>) {
    const duration = this.profiler.duration;
    const filteredTimerTypes = this.filter((timerType: TimerType) => {
      if (shownTimerKeys.has(timerType.key)) {
        return false;
      }

      // Ignore thresholds for certain keys.
      for (const ignorePattern of ProfileReport.IGNORED_THRESHOLDS) {
        if (ignorePattern.test(timerType.key)) {
          return false;
        }
      }
      return timerType.isOverThreshold(duration) && timerType.sum !== duration;
    });

    // Mark timerType keys as being shown.
    filteredTimerTypes.forEach((timerType: TimerType) =>
      shownTimerKeys.add(timerType.key)
    );

    const reportSection = new ProfileReportSection(
      'Over threshold',
      filteredTimerTypes,
      duration
    );

    const reportOutput = reportSection.toString();
    if (reportOutput) {
      this.logMethod(reportOutput);
    }
  }

  reportTimers(shownTimerKeys: Set<string>) {
    const duration = this.profiler.duration;
    const filteredTimerTypes = this.filter((timerType: TimerType) => {
      return (
        !ProfileReport.BUILD_REPORT_REGEX.test(timerType.key) &&
        !shownTimerKeys.has(timerType.key)
      );
    });

    // Mark timerType keys as being shown.
    filteredTimerTypes.forEach((timerType: TimerType) =>
      shownTimerKeys.add(timerType.key)
    );

    const reportSection = new ProfileReportSection(
      'Timers',
      filteredTimerTypes,
      duration
    );

    const reportOutput = reportSection.toString();
    if (reportOutput) {
      this.logMethod(reportOutput);
    }
  }
}

export class ProfileReportSection {
  labelFunc?: (timerType: TimerType, defaultLabel: string) => string;
  rowFunc: (
    timerType: TimerType,
    labelFunc?: (timerType: TimerType, defaultLabel: string) => string
  ) => Array<any>;
  table: Table;
  timerTypes: Array<TimerType>;
  title: string;
  totalDuration: number;

  constructor(
    title: string,
    timerTypes: Array<TimerType>,
    totalDuration: number
  ) {
    this.title = title;
    this.timerTypes = timerTypes;
    this.totalDuration = totalDuration;

    // Default table structure.
    this.table = new Table({
      head: [title, '%', 'Time', 'Stats'],
      colAligns: ['left', 'right', 'right', 'left'],
      chars: {mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': ''},
    });

    // Default row display.
    this.rowFunc = (timerType: TimerType) => {
      const labelValue = timerType.label || timerType.key;
      const statsValue = `${timerType.length} calls, ${timeFormat(
        timerType.maximum
      )} max, ${timeFormat(timerType.average)} avg`;
      return [
        this.labelFunc ? this.labelFunc(timerType, labelValue) : labelValue,
        `${((timerType.sum / this.totalDuration) * 100).toFixed(2)}%`,
        timeFormat(timerType.sum),
        timerType.length > 1 ? statsValue : '1 call',
      ];
    };
  }

  toString(limit?: number): string {
    // Ignore when no matching timer types.
    if (!this.timerTypes.length) {
      return '';
    }

    let count = 0;
    for (const timerType of this.timerTypes) {
      this.table.push(this.rowFunc(timerType));
      if (limit && ++count > limit) {
        break;
      }
    }

    return this.table.toString();
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
