#!/usr/bin/env node

import * as packageData from '../package.json';
import {BuildCommand} from './commands/build';
import {ServeCommand} from './commands/serve';
import {createCommand} from 'commander';

export const VERSION = packageData.version;
export const MIN_NODE_VERSION = 10;

const program = createCommand();
program.version(VERSION);

program
  .command('build [root]')
  .description('build the website')
  .action((path, options) => {
    if (!isNodeVersionSupported()) {
      return;
    }

    const cmd = new BuildCommand(options);
    cmd.run(path);
  });

program
  .command('serve [root]')
  .description('start the development server')
  .action((path, options) => {
    if (!isNodeVersionSupported()) {
      return;
    }

    const cmd = new ServeCommand(options);
    cmd.run(path);
  });

program.parse(process.argv);

export function isNodeVersionSupported(): boolean {
  const version = Number(process.version.slice(1).split('.')[0]);
  if (version < MIN_NODE_VERSION) {
    console.error(
      `Amagaki requires Node.js 10.x or higher. You are currently running ${process.version}, which is not supported.`
    );
    return false;
  }
  return true;
}
