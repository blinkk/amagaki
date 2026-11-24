import * as fs from 'fs';
import * as fsPath from 'path';

export interface GlobFilesOptions {
  cwd: string;
  ignoreUnderscore?: boolean;
}

/**
 * Lists files matching a glob pattern relative to `cwd` using Node's built-in
 * `fs.globSync`. Leading slashes are treated as relative to `cwd` (matching
 * `node-glob`'s `root: cwd` behavior), directories are excluded, and resolved
 * paths are verified to stay within `cwd`.
 */
export function globFiles(
  pattern: string,
  options: GlobFilesOptions
): string[] {
  const normalizedPattern = pattern.replace(/^\/+/, '');
  const resolvedRoot = fsPath.resolve(options.cwd);
  const matches = fs.globSync(normalizedPattern, {
    cwd: resolvedRoot,
  });
  const files: string[] = [];
  for (const relPath of matches) {
    if (
      options.ignoreUnderscore &&
      relPath.split(/[\\/]/).some(segment => segment.startsWith('_'))
    ) {
      continue;
    }
    const absPath = fsPath.resolve(resolvedRoot, relPath);
    if (
      absPath !== resolvedRoot &&
      !absPath.startsWith(`${resolvedRoot}${fsPath.sep}`)
    ) {
      continue;
    }
    try {
      if (fs.statSync(absPath).isFile()) {
        files.push(relPath);
      }
    } catch {
      // Ignore broken symlinks or files removed concurrently.
    }
  }
  return files.sort();
}

/**
 * Matches a path against a glob pattern using Node's built-in
 * `path.matchesGlob`, with optional `matchBase` support (matching against the
 * basename when the pattern contains no path separator).
 */
export function matchesGlob(
  target: string,
  pattern: string,
  options?: {matchBase?: boolean}
): boolean {
  if (options?.matchBase && !pattern.includes('/')) {
    return fsPath.matchesGlob(fsPath.basename(target), pattern);
  }
  return fsPath.matchesGlob(target, pattern);
}
