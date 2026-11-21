const useColor = (): boolean =>
  process.env.NO_COLOR === undefined &&
  process.env.TERM !== 'dumb' &&
  Boolean(process.stdout.isTTY);

const wrap = (code: number) => (text: string): string =>
  useColor() ? `\x1b[${code}m${text}\x1b[39m` : text;

export const ansi = {
  blue: wrap(34),
  cyan: wrap(36),
  gray: wrap(90),
  green: wrap(32),
  greenBright: wrap(92),
  red: wrap(31),
  yellow: wrap(33),
};

export default ansi;
