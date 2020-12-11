export function interpolate(string: string, params: any) {
  const names = Object.keys(params);
  const vals = Object.values(params);
  return new Function(...names, `return \`${string}\`;`)(...vals);
}

export function basename(path: string) {
  return path.split('/').reverse()[0];
}
