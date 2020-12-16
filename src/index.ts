#!/usr/bin/env node

import {createCommand} from 'commander';
import {BuildCommand} from './commands/build';
import {ServeCommand} from './commands/serve';
import {getCurrentVersion, isNodeVersionSupported} from './sdk';

const program = createCommand();
program.version(getCurrentVersion().toString());

program.command('build [root]').action((path, options) => {
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
    if (!isNodeVersionSupported()) {
      return;
    }

    const cmd = new ServeCommand(options);
    cmd.run(path);
  });

program.parse(process.argv);
