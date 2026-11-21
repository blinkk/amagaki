export interface SimpleTableOptions {
  head?: string[];
  colAligns?: Array<'left' | 'right' | 'middle'>;
  chars?: Record<string, string>;
}

/**
 * Lightweight column-aligned ASCII table replacing `cli-table`.
 */
export class SimpleTable {
  private readonly head: string[];
  private readonly colAligns: Array<'left' | 'right' | 'middle'>;
  private readonly rows: string[][] = [];

  constructor(options: SimpleTableOptions = {}) {
    this.head = options.head ?? [];
    this.colAligns = options.colAligns ?? [];
  }

  push(row: Array<unknown>): number {
    return this.rows.push(row.map(cell => String(cell ?? '')));
  }

  toString(): string {
    const colCount = Math.max(
      this.head.length,
      ...this.rows.map(row => row.length),
      0
    );
    if (colCount === 0) {
      return '';
    }
    const widths = new Array<number>(colCount).fill(0);
    const updateWidths = (row: string[]) => {
      for (let i = 0; i < row.length; i++) {
        widths[i] = Math.max(widths[i], row[i].length);
      }
    };
    if (this.head.length) {
      updateWidths(this.head);
    }
    for (const row of this.rows) {
      updateWidths(row);
    }

    const formatCell = (text: string, idx: number): string => {
      const width = widths[idx] ?? 0;
      const align = this.colAligns[idx] ?? 'left';
      if (align === 'right') {
        return text.padStart(width, ' ');
      }
      if (align === 'middle') {
        const pad = Math.max(0, width - text.length);
        const left = Math.floor(pad / 2);
        return ' '.repeat(left) + text + ' '.repeat(pad - left);
      }
      return text.padEnd(width, ' ');
    };

    const border = (left: string, mid: string, right: string) =>
      `${left}${widths.map(w => '─'.repeat(w + 2)).join(mid)}${right}`;
    const formatRow = (row: string[]) =>
      `│ ${widths
        .map((_, i) => formatCell(row[i] ?? '', i))
        .join(' │ ')} │`;

    const lines: string[] = [border('┌', '┬', '┐')];
    if (this.head.length) {
      lines.push(formatRow(this.head));
      lines.push(border('├', '┼', '┤'));
    }
    for (const row of this.rows) {
      lines.push(formatRow(row));
    }
    lines.push(border('└', '┴', '┘'));
    return lines.join('\n');
  }
}
