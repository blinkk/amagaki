import * as fsPath from 'path';
import * as git from 'isomorphic-git';

import fs from 'fs';

export interface GitAuthor {
  email: string;
  name: string;
  timestamp: number;
}

export interface GitCommit {
  message: string;
  author: GitAuthor;
  sha: string;
}

export interface GitData {
  branch: string;
  commit: GitCommit;
}

export async function getGitData(path: string): Promise<GitData> {
  path = fsPath.resolve(path);
  const root = await git.findRoot({
    fs,
    filepath: path,
  });
  const log = await git.log({
    fs,
    dir: root,
    depth: 1,
    ref: 'HEAD',
  });
  const branch =
    process.env.BRANCH_NAME ||
    process.env.CIRCLE_BRANCH ||
    (await git.currentBranch({
      fs,
      dir: root,
      fullname: false,
    })) ||
    '';
  if (!log || !log[0]) {
    throw new Error(`Failed to retrieve Git data from path: ${path}`);
  }
  const commit = log[0].commit;
  const cleanMessage = commit.message.slice(0, 128);
  return {
    branch: branch,
    commit: {
      sha: log[0].oid,
      message: cleanMessage,
      author: {
        timestamp: commit.committer.timestamp,
        name: commit.author.name,
        email: commit.author.email,
      },
    },
  };
}
