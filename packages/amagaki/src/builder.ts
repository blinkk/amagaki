import * as async from 'async';
import * as cliProgress from 'cli-progress';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as fsPath from 'path';
import * as stream from 'stream';
import * as util from 'util';
import * as utils from './utils';

import { GitCommit, getGitData } from './gitData';
import {Route, StaticRoute} from './router';

import {Pod} from './pod';
import {TranslationString} from './string';
import chalk from 'chalk';
import minimatch from 'minimatch';

interface Artifact {
  tempPath: string;
  realPath: string;
}

interface PodPathSha {
  path: string;
  sha: string;
}

export interface BuildManifest {
  branch: string | null;
  built: string;
  commit: GitCommit | null;
  files: Array<PodPathSha>;
}

export interface BuildDiffPaths {
  adds: Array<string>;
  edits: Array<string>;
  noChanges: Array<string>;
  deletes: Array<string>;
}

type LocalesToNumMissingTranslations = Record<string, number>;
type LocalesToMissingTranslations = Record<string, TranslationString[]>;

export interface BuildMetrics {
  memoryUsage: number;
  localesToNumMissingTranslations: LocalesToNumMissingTranslations;
  numMissingTranslations: number;
  numDocumentRoutes: number;
  numStaticRoutes: number;
  outputSizeDocuments: number;
  outputSizeStaticFiles: number;
}

export interface BuildResult {
  metrics: BuildMetrics;
  manifest: BuildManifest;
  diff: BuildDiffPaths;
}

interface CreatedPath {
  route: Route;
  tempPath: string;
  normalPath: string;
  realPath: string;
}

export interface BuildOptions {
  patterns?: string[];
  writeLocales?: Boolean;
}
export interface ExportOptions {
  buildDir?: string;
  exportDir: string;
  exportControlDir?: string;
}

export class Builder {
  benchmarkPodPath: string;
  pod: Pod;
  manifestPath: string;
  metricsPodPath: string;
  missingTranslationsPodPath: string;
  outputDirectoryPodPath: string;
  controlDirectoryAbsolutePath: string;
  static DefaultOutputDirectory = 'build';
  static NumConcurrentBuilds = 40;
  static NumConcurrentCopies = 2000;
  static ShowMoveProgressBarThreshold = 1000;

  /** When the builder was initialized. */
  private date: Date;

  constructor(pod: Pod) {
    this.pod = pod;
    this.outputDirectoryPodPath = Builder.DefaultOutputDirectory;
    this.controlDirectoryAbsolutePath = this.pod.getAbsoluteFilePath(
      fsPath.join(this.outputDirectoryPodPath, '.amagaki')
    );
    this.manifestPath = this.pod.getAbsoluteFilePath(
      fsPath.join(this.outputDirectoryPodPath, '.amagaki', 'manifest.json')
    );
    this.metricsPodPath = fsPath.join(
      this.outputDirectoryPodPath,
      '.amagaki',
      'metrics.json'
    );
    this.benchmarkPodPath = fsPath.join(
      this.outputDirectoryPodPath,
      '.amagaki',
      'benchmark.txt'
    );
    this.missingTranslationsPodPath = fsPath.join(
      this.outputDirectoryPodPath,
      '.amagaki',
      'locales'
    );
    this.date = new Date();
  }

  static normalizePath(path: string) {
    if (path.endsWith('/')) {
      return `${path}index.html`;
    }
    return fsPath.extname(path) ? path : `${path}/index.html`;
  }

  async getFileSha(outputPath: string) {
    const pipeline = util.promisify(stream.pipeline);
    const hash = crypto.createHash('sha1');
    hash.setEncoding('hex');
    await pipeline(fs.createReadStream(outputPath), hash);
    return hash.read();
  }

  static ensureDirectoryExists(path: string) {
    const dirPath = fsPath.dirname(path);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, {recursive: true});
    }
  }

  static formatProgressBarTime(t: number) {
    const s = t / 1000;
    if (s > 3600) {
      return Math.floor(s / 3600) + 'h ' + Math.round((s % 3600) / 60) + 'm';
    } else if (s > 60) {
      return Math.floor(s / 60) + 'm ' + Math.round(s % 60) + 's';
    } else if (s > 10) {
      return s.toFixed(1) + 's';
    }
    return s.toFixed(2) + 's';
  }

  copyFileAsync(outputPath: string, podPath: string) {
    Builder.ensureDirectoryExists(outputPath);
    return fs.promises.copyFile(
      this.pod.getAbsoluteFilePath(podPath),
      outputPath
    );
  }

  moveFileAsync(beforePath: string, afterPath: string) {
    Builder.ensureDirectoryExists(afterPath);
    return fs.promises
      .rename(beforePath, afterPath)
      .catch((err: NodeJS.ErrnoException) => {
        // Handle scenario where temporary directory is on a different device than
        // the destination directory. In this situation, Node cannot move files,
        // but copying files is OK. The temporary directory is cleaned up later by
        // the builder.
        if (err.code === 'EXDEV') {
          return fs.promises.copyFile(beforePath, afterPath);
        }
        throw err;
      });
  }

  writeFileAsync(outputPath: string, content: string) {
    Builder.ensureDirectoryExists(outputPath);
    return fs.promises.writeFile(outputPath, content);
  }

  deleteDirectoryRecursive(path: string) {
    // NOTE: {recursive: true} arg on fs.rmdirSync was not reliable.
    let filePaths = [];
    if (fs.existsSync(path)) {
      filePaths = fs.readdirSync(path);
      filePaths.forEach((filePath: string) => {
        const curPath = fsPath.join(path, filePath);
        if (fs.lstatSync(curPath).isDirectory()) {
          this.deleteDirectoryRecursive(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  }

  deleteOutputFiles(paths: Array<string>, outputRootDir: string) {
    paths.forEach(outputPath => {
      // Delete the file.
      const absOutputPath = fsPath.join(outputRootDir, outputPath.replace(/^\//, ''));
      try {
        fs.unlinkSync(absOutputPath);
      } catch (err: any) {
        if (err.errno === -2) {
          console.warn(
            `Warning: The Amagaki builder was unable to delete a file while cleaning the build output directory. Avoid manually deleting files outside of the Amagaki build process. -> ${absOutputPath}.`
          );
        } else {
          throw err;
        }
      }
      // Delete the directory if it is empty.
      const dirPath = fsPath.dirname(absOutputPath);
      if (!fs.existsSync(dirPath)) {
        return;
      }
      const innerPaths = fs.readdirSync(dirPath);
      if (innerPaths.length === 0) {
        fs.rmdirSync(dirPath);
      }
    });
  }

  getManifest(filePath: string): BuildManifest | null {
    return fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      : null;
  }

  cleanOutputUsingManifests(
    existingManifest: BuildManifest | null,
    newManifest: BuildManifest,
    options?: BuildOptions
  ) {
    const buildDiffPaths: BuildDiffPaths = {
      adds: [],
      edits: [],
      noChanges: [],
      deletes: [],
    };
    // No existing manifest, everything is an "add".
    if (!existingManifest) {
      buildDiffPaths.adds = newManifest.files.map(pathSha => {
        return pathSha.path;
      });
    } else {
      // Build adds, edits, and no changes.
      const existingPathShas: Record<string, string> = {};
      existingManifest.files.forEach(pathSha => {
        existingPathShas[pathSha.path] = pathSha.sha;
      });
      newManifest.files.forEach(newPathSha => {
        if (newPathSha.path in existingPathShas) {
          if (newPathSha.sha === existingPathShas[newPathSha.path]) {
            buildDiffPaths.noChanges.push(newPathSha.path);
          } else {
            buildDiffPaths.edits.push(newPathSha.path);
          }
        } else {
          buildDiffPaths.adds.push(newPathSha.path);
        }
      });
      // Build deletes.
      const newPathShas: Record<string, string> = {};
      newManifest.files.forEach(pathSha => {
        newPathShas[pathSha.path] = pathSha.sha;
      });
      // Incremental builds don't support deletes.
      if (!options?.patterns) {
        existingManifest.files.forEach(pathSha => {
          if (!(pathSha.path in newPathShas)) {
            buildDiffPaths.deletes.push(pathSha.path);
          }
        });
      }
    }
    return buildDiffPaths;
  }

  static createProgressBar(label: string) {
    const isTTY = Boolean(process.env.TERM !== 'dumb' && process.stdin.isTTY);
    const options: cliProgress.Options = {
      format:
        chalk.green(`${label} ({value}/{total}): `) +
        '{bar} Total: {customDuration}',
      noTTYOutput: isTTY,
    };
    return new cliProgress.SingleBar(
      options,
      cliProgress.Presets.shades_classic
    );
  }

  async export(options: ExportOptions): Promise<BuildDiffPaths> {
    const buildDir = options.buildDir ?? this.pod.getAbsoluteFilePath(this.outputDirectoryPodPath);
    const buildManifestPath = fsPath.join(buildDir, '.amagaki', 'manifest.json');
    const exportManifestPath = options.exportControlDir
      ? fsPath.join(options.exportControlDir, 'manifest.json')
      : fsPath.join(options.exportDir, '.amagaki', 'manifest.json');
    const buildManifest = this.getManifest(buildManifestPath);
    const exportManifest = this.getManifest(exportManifestPath);
    if (!buildManifest) {
      throw new Error(
        `Could not find build manifest at ${buildManifestPath}.`
      );
    }

    const filesToExport = buildManifest.files;
    const existingFiles = exportManifest?.files;

    // Collect adds, edits, and deletes.
    const result: BuildDiffPaths = {
      adds: [],
      edits: [],
      noChanges: [],
      deletes: [],
    }
    if (!existingFiles) {
      result.adds = buildManifest.files.map(pathSha => pathSha.path);
    } else {
      const existingPathsToShas: Record<string, string> = {};
      for (const pathSha of existingFiles) {
        existingPathsToShas[pathSha.path] = pathSha.sha;
      }
      const buildPathsToShas: Record<string, string> = {};
      for (const pathSha of filesToExport) {
        buildPathsToShas[pathSha.path] = pathSha.sha;
      }
      for (const pathSha of buildManifest.files) {
        if (pathSha.path in existingPathsToShas) {
          if (pathSha.sha !== existingPathsToShas[pathSha.path]) {
            result.edits.push(pathSha.path);
          } else {
            result.noChanges.push(pathSha.path);
          }
        } else {
          result.adds.push(pathSha.path);
        }
      }
      for (const pathSha of existingFiles) {
        if (!(pathSha.path in buildPathsToShas)) {
          result.deletes.push(pathSha.path);
        }
      }
    }

    if (exportManifest?.commit) {
      console.log(chalk.yellow(`Previous export:`), `${exportManifest.built} by ${exportManifest.commit.author.email} (${exportManifest.commit.sha.slice(0, 6)})`);
    }
    if (buildManifest?.commit) {
      console.log(chalk.yellow(`  Current build:`), `${buildManifest.built} by ${buildManifest.commit.author.email} (${buildManifest.commit.sha.slice(0, 6)})`);
    }

    const numOperations = result.adds.length + result.edits.length + result.deletes.length;
    if (numOperations === 0) {
      console.log(
        chalk.blue('No changes since last export: ') +
          this.pod.getAbsoluteFilePath(options.exportDir)
      );
      return result;
    }

    const moveBar = Builder.createProgressBar('Exporting');
    const showMoveProgressBar =
      numOperations >= Builder.ShowMoveProgressBarThreshold;
    const moveStartTime = new Date().getTime();
    if (showMoveProgressBar) {
      moveBar.start(numOperations, 0, {
        customDuration: Builder.formatProgressBarTime(0),
      });
    }

    // Copy adds and edits.
    const moveFiles = [...result.adds, ...result.edits];
    await async.mapLimit(moveFiles, Builder.NumConcurrentCopies, async (filePath: string) => {
      const relativePath = filePath.replace(/^\//, '');
      const source = fsPath.join(buildDir, relativePath);
      const destination = fsPath.join(options.exportDir, relativePath);;
      Builder.ensureDirectoryExists(destination);
      moveBar.increment();
      return fs.promises.copyFile(
        source, destination
      );
    });

    // Delete deleted files.
    this.deleteOutputFiles(result.deletes, options.exportDir);
    moveBar.stop();

    // Write the manifest.
    await Promise.all([
      this.writeFileAsync(
        exportManifestPath,
        JSON.stringify(buildManifest, null, 2)
      ),
    ]);

    console.log(
      chalk.blue('Changes: ') +
        chalk.green(`${result.adds.length} adds, `) +
        chalk.yellow(`${result.edits.length} edits, `) +
        chalk.red(`${result.deletes.length} deletes`)
    );
    console.log(
      chalk.blue('Export complete: ') +
        this.pod.getAbsoluteFilePath(options.exportDir)
    );

    return result;
  }

  async build(options?: BuildOptions): Promise<BuildResult> {
    await this.pod.plugins.trigger('beforeBuild', this);
    const existingManifest = this.getManifest(this.manifestPath);
    const gitData = await getGitData(this.pod.root);
    const buildManifest: BuildManifest = {
      branch: gitData.branch,
      commit: gitData.commit,
      built: new Date().toString(),
      files: [],
    };
    const localesToMissingTranslations: LocalesToMissingTranslations = {};
    const buildMetrics: BuildMetrics = {
      localesToNumMissingTranslations: {},
      memoryUsage: 0,
      numDocumentRoutes: 0,
      numMissingTranslations: 0,
      numStaticRoutes: 0,
      outputSizeDocuments: 0,
      outputSizeStaticFiles: 0,
    };
    const bar = Builder.createProgressBar('Building');
    const startTime = new Date().getTime();
    const artifacts: Array<Artifact> = [];
    // Keep the temp directory within the output directory to ensure files are
    // written to the same volume as the output directory.
    const tempDirRoot = fsPath.join(
      this.outputDirectoryPodPath,
      '.tmp',
      `amagaki-build-${(Math.random() + 1).toString(36).substring(6)}`
    );
    let routes = await this.pod.router.routes();

    // Only build routes matching patterns.
    if (options?.patterns) {
      routes = routes.filter(route =>
        options.patterns?.some(
          pattern =>
            route.podPath &&
            minimatch(
              route.podPath.replace(/^\//, ''),
              pattern.replace(/^\//, ''),
              {
                matchBase: true,
              }
            )
        )
      );
    }

    bar.start(routes.length, artifacts.length, {
      customDuration: Builder.formatProgressBarTime(0),
    });
    const createdPaths: Array<CreatedPath> = [];

    if (routes.length === 0) {
      throw new Error(
        `Nothing to build. No routes found for pod rooted at: ${this.pod.root}. Ensure this is the right directory, and ensure that there is either content or static files to build.`
      );
    }

    // Collect the routes and assemble the temporary directory mapping.
    for (const route of routes) {
      const normalPath = Builder.normalizePath(route.url.path);
      const tempPath = fsPath.join(
        tempDirRoot,
        this.outputDirectoryPodPath,
        normalPath
      );
      const realPath = this.pod.getAbsoluteFilePath(
        fsPath.join(this.outputDirectoryPodPath, normalPath)
      );
      createdPaths.push({
        route: route,
        tempPath: tempPath,
        normalPath: normalPath,
        realPath: realPath,
      });
    }

    // Copy all static files and build all other routes.
    const errors: Error[] = [];
    const errorRoutes: Route[] = [];
    await async.eachLimit(
      createdPaths,
      Builder.NumConcurrentBuilds,
      async createdPath => {
        try {
          // Copy the file, or build it if it's a dynamic route.
          if (createdPath.route.provider.type === 'staticDir') {
            return this.copyFileAsync(
              createdPath.tempPath,
              (createdPath.route as StaticRoute).staticFile.podPath
            );
          } else {
            // Use the url path as a unique timer key.
            const urlPathStub = createdPath.route.urlPath.replace(/\//g, '.');
            const timer = this.pod.profiler.timer(
              `builder.build${urlPathStub}`,
              `Build: ${createdPath.route.urlPath}`,
              {
                path: createdPath.route.podPath,
                type: createdPath.route.provider.type,
                urlPath: createdPath.route.urlPath,
              }
            );
            let content = '';
            try {
              content = await createdPath.route.build();
            } catch (err) {
              errors.push(err as Error);
              errorRoutes.push(createdPath.route);
            } finally {
              timer.stop();
            }
            if (errors.length) {
              bar.stop();
              console.error(
                chalk.yellow(
                  `\nFound ${errors.length} errors building the following routes.\n`
                )
              );
              errorRoutes.map(route => {
                console.error(`    ${route.urlPath}`);
              });
              console.error(chalk.yellow('\nThe first error was:'));
              if (errors[0].message) {
                console.log(`\n${errors[0].message}\n`);
              }
              throw errors[0];
            }
            return this.writeFileAsync(createdPath.tempPath, content);
          }
        } finally {
          artifacts.push({
            tempPath: createdPath.tempPath,
            realPath: createdPath.realPath,
          });
          bar.increment({
            customDuration: Builder.formatProgressBarTime(
              new Date().getTime() - startTime
            ),
          });
        }
      }
    );
    bar.stop();

    // Moving files is pretty fast, but when the number of files is sufficiently
    // large, we want to communicate progress to the user with the progress bar.
    // If less than X files need to be moved, don't show the progress bar,
    // because the operation completes quickly enough.
    const moveBar = Builder.createProgressBar('  Moving'); // Pad the label so it lines up with "Building".
    const showMoveProgressBar =
      artifacts.length >= Builder.ShowMoveProgressBarThreshold;
    const moveStartTime = new Date().getTime();
    if (showMoveProgressBar) {
      moveBar.start(artifacts.length, 0, {
        customDuration: Builder.formatProgressBarTime(0),
      });
    }

    await async.mapLimit(
      createdPaths,
      Builder.NumConcurrentCopies,
      async (createdPath: CreatedPath) => {
        // Start by building the manifest (and getting file shas).
        buildManifest.files.push({
          path: createdPath.normalPath,
          sha: await this.getFileSha(createdPath.tempPath),
        });
        // Then, update the metrics by getting file sizes.
        const statResult = await fs.promises.stat(createdPath.tempPath);
        if (createdPath.route.provider.type === 'staticDir') {
          buildMetrics.numStaticRoutes += 1;
          buildMetrics.outputSizeStaticFiles += statResult.size;
        } else {
          buildMetrics.numDocumentRoutes += 1;
          buildMetrics.outputSizeDocuments += statResult.size;
        }
        // Finally, move the files from the temporary to final locations.
        await this.moveFileAsync(createdPath.tempPath, createdPath.realPath);
        // When done with each file step, increment the progress bar.
        if (showMoveProgressBar) {
          moveBar.increment({
            customDuration: Builder.formatProgressBarTime(
              new Date().getTime() - moveStartTime
            ),
          });
        }
      }
    );

    buildMetrics.memoryUsage = process.memoryUsage().heapUsed;

    if (showMoveProgressBar) {
      moveBar.stop();
    }

    // Clean up.
    this.deleteDirectoryRecursive(tempDirRoot);

    const localesToNumMissingTranslations: LocalesToNumMissingTranslations = {};
    for (const locale of Object.values(this.pod.cache.locales)) {
      if (
        locale === this.pod.defaultLocale ||
        locale.recordedStrings.size === 0
      ) {
        continue;
      }
      localesToNumMissingTranslations[locale.id] = locale.recordedStrings.size;
      buildMetrics.numMissingTranslations += locale.recordedStrings.size;
      if (localesToMissingTranslations[locale.id] === undefined) {
        const strings: TranslationString[] = [];
        localesToMissingTranslations[locale.id] = strings;
      }
      for (const [string] of locale.recordedStrings) {
        localesToMissingTranslations[locale.id].push(string);
      }
    }
    buildMetrics.localesToNumMissingTranslations =
      localesToNumMissingTranslations;

    // Write the manifest and metrics.
    await Promise.all([
      this.writeFileAsync(
        this.manifestPath,
        JSON.stringify(buildManifest, null, 2)
      ),
      this.writeFileAsync(
        this.pod.getAbsoluteFilePath(this.metricsPodPath),
        JSON.stringify(buildMetrics, null, 2)
      ),
    ]);

    const buildDiff = this.cleanOutputUsingManifests(
      existingManifest,
      buildManifest,
      options
    );

    // After diff has been computed, actually delete files. Incremental builds
    // don't support deletes, so avoid deleting files if building incrementally.
    if (!options?.patterns) {
      const outputRootDir = this.pod.getAbsoluteFilePath(
        fsPath.join(this.outputDirectoryPodPath)
      );
      this.deleteOutputFiles(buildDiff.deletes, outputRootDir);
    }
    const result: BuildResult = {
      diff: buildDiff,
      manifest: buildManifest,
      metrics: buildMetrics,
    };
    if (buildMetrics.numMissingTranslations && options?.writeLocales) {
      await this.writeLocales(localesToMissingTranslations);
    }
    this.logResult(buildDiff, buildMetrics, options);
    await this.pod.plugins.trigger('afterBuild', result);
    return result;
  }

  logResult(
    buildDiff: BuildDiffPaths,
    buildMetrics: BuildMetrics,
    options?: BuildOptions
  ) {
    console.log(
      chalk.blue('Memory usage: ') + utils.formatBytes(buildMetrics.memoryUsage)
    );
    if (buildMetrics.numDocumentRoutes) {
      console.log(
        chalk.blue('Documents: ') +
          `${buildMetrics.numDocumentRoutes} (${utils.formatBytes(
            buildMetrics.outputSizeDocuments
          )}) ${options?.patterns ? '*incremental build' : ''}`
      );
    }
    if (buildMetrics.numStaticRoutes) {
      console.log(
        chalk.blue('Static files: ') +
          `${buildMetrics.numStaticRoutes} (${utils.formatBytes(
            buildMetrics.outputSizeStaticFiles
          )})`
      );
    }
    if (buildMetrics.numMissingTranslations) {
      console.log(
        chalk.blue('Missing translations: ') +
          Object.entries(buildMetrics.localesToNumMissingTranslations)
            .map(([locale, numMissingTranslations]) => {
              return `${locale} (${numMissingTranslations})`;
            })
            .join(', ')
      );
      if (options?.writeLocales) {
        console.log(
          chalk.blue('Saved locales: ') +
            this.pod.getAbsoluteFilePath(this.missingTranslationsPodPath)
        );
      }
    }
    console.log(
      chalk.blue('Changes: ') +
        chalk.green(`${buildDiff.adds.length} adds, `) +
        chalk.yellow(`${buildDiff.edits.length} edits, `) +
        chalk.red(`${buildDiff.deletes.length} deletes`)
    );
    console.log(
      chalk.blue('Build complete: ') +
        this.pod.getAbsoluteFilePath(this.outputDirectoryPodPath)
    );
  }

  async writeLocales(
    localesToMissingTranslations: LocalesToMissingTranslations
  ) {
    for (const [localeId, strings] of Object.entries(
      localesToMissingTranslations
    )) {
      const translations: Record<string, string> = {};
      for (const string of strings) {
        translations[string.prefer || string.value] = '';
      }
      const localePath = fsPath.join(
        this.missingTranslationsPodPath,
        `${localeId}.yaml`
      );
      await this.writeFileAsync(
        this.pod.getAbsoluteFilePath(localePath),
        this.pod.dumpYaml({
          translations: translations,
        })
      );
    }
  }

  async exportBenchmark() {
    // Write the profile benchmark.
    await this.writeFileAsync(
      this.pod.getAbsoluteFilePath(this.benchmarkPodPath),
      this.pod.profiler.benchmarkOutput
    );
  }
}
