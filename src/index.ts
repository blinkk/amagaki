#!/usr/bin/env node

import {createCommand} from 'commander';
import {BuildCommand} from './commands/build';
import {ServeCommand} from './commands/serve';

const program = createCommand();

program.command('build').action((path, options) => {
  const cmd = new BuildCommand(options);
  cmd.run(path);
});

program
  .command('serve')
  .description('Runs the server')
  .action((path, options) => {
    const cmd = new ServeCommand(options);
    cmd.run(path);
  });

program.parse(process.argv);
