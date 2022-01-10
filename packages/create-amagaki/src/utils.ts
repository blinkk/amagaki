/* eslint-disable no-empty */

import * as fs from 'fs';

import {Stream} from 'stream';
import chalk from 'chalk';
import {execSync} from 'child_process';
import got from 'got';
import parseGithubRepoUrl from 'parse-github-repo-url';
import path from 'path';
import {promisify} from 'util';
import rimraf from 'rimraf';
import tar from 'tar';
import validateProjectName from 'validate-npm-package-name';

const pipeline = promisify(Stream.pipeline);

export interface GitHubRepoInfo {
  owner: string;
  project: string;
  branch?: string;
}

export function downloadAndExtractRepo(
  root: string,
  repo: GitHubRepoInfo
): Promise<void> {
  // TODO: Support additional repo URL formats.
  return pipeline(
    got.stream(
      `https://codeload.github.com/${repo.owner}/${repo.project}/tar.gz/${
        repo.branch || 'main'
      }`
    ),
    tar.extract({
      cwd: root,
      strip: 1,
    })
  );
}

export function validateName(
  name: string
): {
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

export function makeDir(
  root: string,
  options = {recursive: true}
): Promise<void> {
  return fs.promises.mkdir(root, options);
}

export function installSync(root: string) {
  const command = 'npm install --also=dev --no-fund --loglevel error';
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
        rimraf.sync(path.join(root, '.git'));
      } catch (_) {}
    }
    return false;
  }
}

export function getRepo(url: string) {
  // TODO: Support additional repo URL formats.
  const repoUrl = new URL(url);
  if (repoUrl.origin !== 'https://github.com') {
    throw new Error(
      `Invalid URL: ${chalk.red(
        `"${url}"`
      )}. Only GitHub repositories are supported. Please use a GitHub URL starting and try again.`
    );
  }
  const result = parseGithubRepoUrl(repoUrl.toString());
  if (!result) {
    throw new Error(`Unable to parse GitHub details from URL: ${repoUrl}`);
  }
  return {
    owner: result[0],
    project: result[1],
    branch: result[2],
  };
}

export async function cleanInstalledStarter(root: string, name: string) {
  // Clean package JSON.
  const packageJsonPath = path.join(root, 'package.json');
  const jsonData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  delete jsonData.repository;
  jsonData.name = name;
  await fs.writeFileSync(packageJsonPath, JSON.stringify(jsonData, null, 2));
}
