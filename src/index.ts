#!/usr/bin/env node

import {createCommand} from 'commander';
import {BuildCommand} from './commands/build';
import {ServeCommand} from './commands/serve';

const program = createCommand();

program.command('build [root]').action((path, options) => {
  // The builder requires Node.js 10+.
  if (!isNodeVersionSupported()) {
    return;
  }
  const cmd = new BuildCommand(options);
  cmd.run(path);
});

program
  .command('serve [root]')
  .description('Runs the server')
  .action((path, options) => {
    const cmd = new ServeCommand(options);
    cmd.run(path);
  });

program.parse(process.argv);

function isNodeVersionSupported(): boolean {
  const version = Number(process.version.slice(1).split('.')[0]);
  if (version < 10) {
    console.error(
      `Amagaki requires Node.js 10.x or higher. You are currently running ${process.version}, which is not supported.`
    );
    return false;
  }
  return true;
}
