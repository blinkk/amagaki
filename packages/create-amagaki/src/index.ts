#!/usr/bin/env node
/* eslint-disable no-process-exit */

import Commander from 'commander';
import chalk from 'chalk';
import {createSite} from './create-site';
import packageJson from '../package.json';
import path from 'path';
import prompts from 'prompts';
import {validateName} from './utils';

let projectPath = '';

const program = new Commander.Command(packageJson.name)
  .version(packageJson.version)
  .arguments('<project-directory>')
  .usage(`${chalk.green('<project-directory>')} [options]`)
  .action(name => {
    projectPath = name;
  })
  .option(
    '-s, --starter [github-url]',
    'the starter to use for the project',
    'https://github.com/blinkk/amagaki-starter'
  )
  .allowUnknownOption()
  .parse(process.argv);

async function run(): Promise<void> {
  if (typeof projectPath === 'string') {
    projectPath = projectPath.trim();
  }

  if (!projectPath) {
    const res = await prompts({
      type: 'text',
      name: 'path',
      message: 'What is the project named?',
      initial: 'my-site',
      validate: name => {
        const validation = validateName(path.basename(path.resolve(name)));
        if (validation.valid) {
          return true;
        }
        return `Specify another project name. Yours was invalid: ${
          validation.problems![0]
        }`;
      },
    });
    projectPath = typeof res.path === 'string' ? res.path.trim() : res.path;
  }

  if (!projectPath) {
    console.log();
    console.log('Specify the project directory:');
    console.log(
      `  ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}`
    );
    console.log();
    console.log('Example:');
    console.log(`  ${chalk.cyan(program.name())} ${chalk.green('my-site')}`);
    console.log();
    console.log(
      `Use ${chalk.cyan(`${program.name()} --help`)} to see all options.`
    );
    process.exit(1);
  }

  await createSite({
    sitePath: path.resolve(projectPath),
    starter: program.starter,
  });
}

run().catch(async reason => {
  console.log();
  console.log('Aborting.');
  if (reason.command) {
    console.log(`  ${chalk.cyan(reason.command)} has failed.`);
  } else {
    console.log(
      chalk.red(
        'Unexpected error. Please report it at https://github.com/blinkk/amagaki/issues.'
      )
    );
    console.log(reason);
  }
  console.log();
  process.exit(1);
});
