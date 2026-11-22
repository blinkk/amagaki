#!/usr/bin/env node
/* eslint-disable no-process-exit */

import {Command} from 'commander';
import {createSite} from './create-site';
import packageJson from '../package.json';
import path from 'path';
import readline from 'readline';
import {ansi, validateName} from './utils';

let projectPath = '';

const program = new Command(packageJson.name)
  .version(packageJson.version)
  .arguments('[project-directory]')
  .usage(`${ansi.green('<project-directory>')} [options]`)
  .action(name => {
    if (name) {
      projectPath = name;
    }
  })
  .option(
    '-s, --starter [github-url]',
    'the starter to use for the project',
    'https://github.com/blinkk/amagaki-starter'
  )
  .allowUnknownOption()
  .parse(process.argv);

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

async function run(): Promise<void> {
  if (typeof projectPath === 'string') {
    projectPath = projectPath.trim();
  }

  if (!projectPath) {
    while (!projectPath) {
      const answer = (await ask('What is the project named? (my-site) ')).trim();
      const candidate = answer || 'my-site';
      const validation = validateName(path.basename(path.resolve(candidate)));
      if (validation.valid) {
        projectPath = candidate;
      } else {
        console.error(
          `Specify another project name. Yours was invalid: ${
            validation.problems![0]
          }`
        );
      }
    }
  }

  if (!projectPath) {
    console.log();
    console.log('Specify the project directory:');
    console.log(
      `  ${ansi.cyan(program.name())} ${ansi.green('<project-directory>')}`
    );
    console.log();
    console.log('Example:');
    console.log(`  ${ansi.cyan(program.name())} ${ansi.green('my-site')}`);
    console.log();
    console.log(
      `Use ${ansi.cyan(`${program.name()} --help`)} to see all options.`
    );
    process.exit(1);
  }

  const opts = program.opts();
  await createSite({
    sitePath: path.resolve(projectPath),
    starter: opts.starter,
  });
}

run().catch(async reason => {
  console.log();
  console.log('Aborting.');
  if (reason.command) {
    console.log(`  ${ansi.cyan(reason.command)} has failed.`);
  } else {
    console.log(
      ansi.red(
        'Unexpected error. Please report it at https://github.com/blinkk/amagaki/issues.'
      )
    );
    console.log(reason);
  }
  console.log();
  process.exit(1);
});
