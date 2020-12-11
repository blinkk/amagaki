#!/usr/bin/env node

import {createCommand} from 'commander';
import {BuildCommand} from './commands/build';
import {ServeCommand} from './commands/serve';
import {join} from 'path';

const program = createCommand();

program.command('build [root]').action((path, options) => {
  const cmd = new BuildCommand(options);
  cmd.run(path);
});

program
  .command('serve [root]')
  .description('Runs the server')
  .action((path, options) => {
    const root = process.cwd();
    path = path ? join(root, path) : root;
    const cmd = new ServeCommand(options);
    cmd.run(path);
  });

program.parse(process.argv);
