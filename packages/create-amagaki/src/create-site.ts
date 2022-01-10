/* eslint-disable no-process-exit */

import {
  cleanInstalledStarter,
  downloadAndExtractRepo,
  getRepo,
  gitInit,
  installSync,
  isDirectoryEmpty,
  isWritable,
  makeDir,
} from './utils';

import chalk from 'chalk';
import path from 'path';
import retry from 'async-retry';

export async function createSite({
  sitePath,
  starter,
}: {
  sitePath: string;
  starter: string;
}): Promise<void> {
  const root = path.resolve(sitePath);

  if (!(await isWritable(path.dirname(root)))) {
    console.error(
      `Unable to write to "${root}". Check permissions and try again.`
    );
    process.exit(1);
  }

  const siteName = path.basename(root);

  await makeDir(root);
  if (!(await isDirectoryEmpty(root))) {
    console.error(`The directory "${root}" already exists and is not empty.`);
    process.exit(1);
  }

  const originalDir = process.cwd();
  console.log(`Creating a new 🍊 Amagaki site in ${chalk.green(root)}.`);
  await makeDir(root);
  process.chdir(root);

  try {
    const repo = getRepo(starter);
    console.log(
      `Downloading from ${chalk.cyan(
        starter
      )}. This might take a few seconds...`
    );
    await retry(() => downloadAndExtractRepo(root, repo), {
      retries: 3,
    });
  } catch (reason) {
    throw new Error((reason as any)?.message ?? reason + '');
  }

  console.log('Installing dependencies. This might take a few minutes...');
  installSync(root);
  cleanInstalledStarter(root, siteName);
  console.log();

  if (gitInit(root)) {
    console.log('Initialized a Git repository.');
    console.log();
  }

  const cdPath =
    path.join(originalDir, siteName) === sitePath ? siteName : sitePath;
  console.log(
    `${chalk.green('🍊 Success!')} Created ${siteName} at ${sitePath}`
  );
  console.log('From that directory, you can run:');
  console.log();
  console.log(chalk.cyan('  npm run dev'));
  console.log('    Starts the development server.');
  console.log();
  console.log(chalk.cyan('  npm run build'));
  console.log('    Builds the static site for production.');
  console.log();
  console.log('Get started by typing:');
  console.log();
  console.log(chalk.cyan('  cd'), cdPath);
  console.log(chalk.cyan('  npm run dev'));
  console.log();
}
