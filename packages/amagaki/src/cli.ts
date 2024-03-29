#!/usr/bin/env node

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: File is located two directories down when packed.
import * as packageData from '../../package.json';

import {BuildCommand} from './commands/build';
import {ExportCommand} from './commands/export';
import {ServeCommand} from './commands/serve';
import {createCommand} from 'commander';

export const VERSION = packageData.version;
export const MIN_NODE_VERSION = 14;

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
  .description('build the site')
  .option('-p, --pattern <patterns...>', 'patterns for an incremental build')
  .option(
    '-l, --write-locales',
    'whether to write locale files with missing translations to the build directory'
  )
  .action((path, options) => {
    if (!isNodeVersionSupported()) {
      return;
    }
    const cmd = new BuildCommand(program.opts(), options);
    cmd.run(path);
  });

program
  .command('export [root]')
  .description('export a build to another directory')
  .requiredOption('-o, --exportDir <path>', 'export directory')
  .option('-b, --buildDir <path>', 'build directory', 'build')
  .option('-c, --exportControlDir <path>', 'export control directory')
  .action((path, options) => {
    if (!isNodeVersionSupported()) {
      return;
    }
    const cmd = new ExportCommand(program.opts(), options);
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
      `Amagaki requires Node.js 14.x or higher. You are currently running ${process.version}, which is not supported.`
    );
    return false;
  }
  return true;
}
