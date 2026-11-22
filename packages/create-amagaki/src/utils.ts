/* eslint-disable no-empty */

import * as fs from 'fs';

import {Readable} from 'stream';
import {pipeline} from 'stream/promises';
import {execSync} from 'child_process';
import path from 'path';
import * as tar from 'tar';
import validateProjectName from 'validate-npm-package-name';

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
  await pipeline(
    Readable.fromWeb(res.body as any),
    tar.extract({
      cwd: root,
      strip: 1,
    })
  );
}

export function validateName(name: string): {
  valid: boolean;
  problems?: string[];
} {
  const nameValidation = validateProjectName(name);
  if (nameValidation.validForNewPackages) {
    return {valid: true};
  }

  return {
    valid: false,
    problems: [
      ...(nameValidation.errors || []),
      ...(nameValidation.warnings || []),
    ],
  };
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
  const branch =
    parts[2] === 'tree' && parts[3] ? parts.slice(3).join('/') : undefined;
  return {
    owner: parts[0],
    project: parts[1],
    branch,
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
