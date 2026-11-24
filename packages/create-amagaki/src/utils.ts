/* eslint-disable no-empty */

import * as fs from 'fs';

import {builtinModules} from 'module';
import {Readable} from 'stream';
import {pipeline} from 'stream/promises';
import {execSync} from 'child_process';
import path from 'path';
import * as tar from 'tar';

const SCOPED_PACKAGE_REGEX = /^(?:@([^/]+?)[/])?([^/]+?)$/;
const NODE_BUILTINS = new Set(
  builtinModules.map(name => name.replace(/^node:/, '').toLowerCase())
);
const BLOCKLIST = new Set(['node_modules', 'favicon.ico']);

const useColor =
  Boolean(process.stdout.isTTY) && !('NO_COLOR' in process.env);

const wrap = (code: number) => (s: string) =>
  useColor ? `\x1b[${code}m${s}\x1b[39m` : s;

export const ansi = {
  cyan: wrap(36),
  green: wrap(32),
  red: wrap(31),
};

export interface GitHubRepoInfo {
  owner: string;
  project: string;
  branch?: string;
  subdir?: string;
}

export async function retry<T>(
  fn: () => Promise<T>,
  retries = 3
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

export async function downloadAndExtractRepo(
  root: string,
  repo: GitHubRepoInfo
): Promise<void> {
  const url = `https://codeload.github.com/${repo.owner}/${
    repo.project
  }/tar.gz/${repo.branch || 'main'}`;
  const res = await fetch(url);
  if (!res.ok || !res.body) {
    throw new Error(`Failed to download ${url}: HTTP ${res.status}`);
  }
  const subdirParts = repo.subdir
    ? repo.subdir.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean)
    : [];
  const subdirPrefix = subdirParts.length ? `${subdirParts.join('/')}/` : '';
  await pipeline(
    Readable.fromWeb(res.body as any),
    tar.extract({
      cwd: root,
      strip: 1 + subdirParts.length,
      filter: subdirPrefix
        ? entryPath => {
            const firstSlash = entryPath.indexOf('/');
            if (firstSlash === -1) {
              return false;
            }
            const rel = entryPath.slice(firstSlash + 1);
            return rel.startsWith(subdirPrefix) && rel.length > subdirPrefix.length;
          }
        : undefined,
    })
  );
}

export function validateName(name: string): {
  valid: boolean;
  problems?: string[];
} {
  const problems: string[] = [];

  if (typeof name !== 'string' || !name.length) {
    return {valid: false, problems: ['name length must be greater than zero']};
  }
  if (name.startsWith('.')) {
    problems.push('name cannot start with a period');
  }
  if (name.startsWith('_')) {
    problems.push('name cannot start with an underscore');
  }
  if (name.trim() !== name) {
    problems.push('name cannot contain leading or trailing spaces');
  }
  if (BLOCKLIST.has(name.toLowerCase())) {
    problems.push(`${name} is a blacklisted name`);
  }
  if (NODE_BUILTINS.has(name.toLowerCase())) {
    problems.push(`${name} is a core module name`);
  }
  if (name.length > 214) {
    problems.push('name can no longer contain more than 214 characters');
  }
  if (name.toLowerCase() !== name) {
    problems.push('name can no longer contain capital letters');
  }
  if (/[~'!()*]/.test(name.split('/').slice(-1)[0])) {
    problems.push('name can no longer contain special characters ("~\'!()*")');
  }
  if (encodeURIComponent(name) !== name) {
    const match = name.match(SCOPED_PACKAGE_REGEX);
    if (match) {
      const [, user, pkg] = match;
      if (
        !user ||
        encodeURIComponent(user) !== user ||
        encodeURIComponent(pkg) !== pkg
      ) {
        problems.push('name can only contain URL-friendly characters');
      }
    } else {
      problems.push('name can only contain URL-friendly characters');
    }
  }

  return problems.length ? {valid: false, problems} : {valid: true};
}

export async function isDirectoryEmpty(dirPath: string) {
  try {
    const files = fs.readdirSync(dirPath);
    return files.length === 0;
  } catch (err) {
    if (err) {
      console.log(err);
      return false;
    }
  }
}

export async function isWritable(directory: string): Promise<boolean> {
  try {
    await fs.promises.access(directory, (fs.constants || fs).W_OK);
    return true;
  } catch (err) {
    return false;
  }
}

export function makeDir(root: string, options = {recursive: true}) {
  return fs.promises.mkdir(root, options);
}

export function installSync(root: string) {
  const command = 'npm install --no-fund --loglevel error';
  return execSync(command, {
    stdio: 'inherit',
    cwd: root,
  });
}

export function isInGitRepository(): boolean {
  try {
    execSync('git rev-parse --is-inside-work-tree', {stdio: 'ignore'});
    return true;
  } catch (_) {}
  return false;
}

export function gitInit(root: string): boolean {
  let initted = false;
  try {
    execSync('git --version', {stdio: 'ignore'});
    if (isInGitRepository()) {
      return false;
    }
    execSync('git init -b main', {stdio: 'ignore'});
    initted = true;
    execSync('git add -A', {stdio: 'ignore'});
    execSync('git commit -m "Initial commit from Create Amagaki"', {
      stdio: 'ignore',
    });
    return true;
  } catch (e) {
    if (initted) {
      try {
        fs.rmSync(path.join(root, '.git'), {recursive: true, force: true});
      } catch (_) {}
    }
    return false;
  }
}

export function getRepo(url: string): GitHubRepoInfo {
  const repoUrl = new URL(url);
  if (repoUrl.origin !== 'https://github.com') {
    throw new Error(
      `Invalid URL: ${ansi.red(
        `"${url}"`
      )}. Only GitHub repositories are supported. Please use a GitHub URL and try again.`
    );
  }
  const parts = repoUrl.pathname
    .replace(/^\/+|\/+$/g, '')
    .replace(/\.git$/, '')
    .split('/');
  if (parts.length < 2 || !parts[0] || !parts[1]) {
    throw new Error(`Unable to parse GitHub details from URL: ${repoUrl}`);
  }
  const branch = parts[2] === 'tree' && parts[3] ? parts[3] : undefined;
  const subdir =
    parts[2] === 'tree' && parts.length > 4
      ? parts.slice(4).join('/')
      : undefined;
  return {
    owner: parts[0],
    project: parts[1],
    branch,
    subdir,
  };
}

export async function cleanInstalledStarter(root: string, name: string) {
  // Clean package JSON.
  const packageJsonPath = path.join(root, 'package.json');
  const jsonData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  delete jsonData.repository;
  jsonData.name = name;
  fs.writeFileSync(packageJsonPath, JSON.stringify(jsonData, null, 2));
}
