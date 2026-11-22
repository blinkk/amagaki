import ansi from './ansi';

export interface ProgressBarPayload {
  customDuration?: string;
}

/**
 * Minimal TTY progress bar replacing `cli-progress`.
 */
export class ProgressBar {
  private readonly isTTY: boolean;
  private readonly label: string;
  private active = false;
  private total = 0;
  private value = 0;

  constructor(label: string) {
    this.label = label;
    this.isTTY = Boolean(process.env.TERM !== 'dumb' && process.stdout.isTTY);
  }

  start(total: number, startValue = 0, payload?: ProgressBarPayload): void {
    this.total = total;
    this.value = startValue;
    this.active = true;
    this.render(payload);
  }

  increment(
    deltaOrPayload?: number | ProgressBarPayload,
    payload?: ProgressBarPayload
  ): void {
    if (typeof deltaOrPayload === 'number') {
      this.value += deltaOrPayload;
      this.render(payload);
    } else {
      this.value += 1;
      this.render(deltaOrPayload);
    }
  }

  update(value: number, payload?: ProgressBarPayload): void {
    this.value = value;
    this.render(payload);
  }

  stop(): void {
    if (!this.active) {
      return;
    }
    this.active = false;
    if (this.isTTY) {
      process.stdout.write('\n');
    }
  }

  private render(payload?: ProgressBarPayload): void {
    if (!this.active || !this.isTTY) {
      return;
    }
    const width = 32;
    const ratio =
      this.total > 0 ? Math.min(1, Math.max(0, this.value / this.total)) : 1;
    const filled = Math.round(ratio * width);
    const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(width - filled);
    const duration = payload?.customDuration
      ? ` Total: ${payload.customDuration}`
      : '';
    const line =
      ansi.green(`${this.label} (${this.value}/${this.total}): `) +
      `${bar}${duration}`;
    process.stdout.write(`\r${line}\x1b[K`);
  }
}
