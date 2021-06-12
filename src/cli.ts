#!/usr/bin/env node

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: File is located two directories down when packed.
import * as packageData from '../../package.json';

import {BuildCommand} from './commands/build';
import {ServeCommand} from './commands/serve';
import {createCommand} from 'commander';

export const VERSION = packageData.version;
export const MIN_NODE_VERSION = 10;

// Make sure that unhandled promises causes the command to fail.
process.on('unhandledRejection', up => {
  throw up;
});

const program = createCommand();
program.version(VERSION);
program.option('--profile', 'profile the command');
program.option('-e, --env <name>', 'environment name');

program
  .command('build [root]')
  .description('build the website')
  .action((path, options) => {
    if (!isNodeVersionSupported()) {
      return;
    }

    const cmd = new BuildCommand(program.opts(), options);
    cmd.run(path);
  });

program
  .command('serve [root]')
  .description('start the development server')
  .option('-p, --port <number>', 'development server port', '8080')
  .action((path, options) => {
    if (!isNodeVersionSupported()) {
      return;
    }

    const cmd = new ServeCommand(program.opts(), options);
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
