import * as _colors from 'colors';
import * as async from 'async';
import * as cliProgress from 'cli-progress';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as fsPath from 'path';
import * as os from 'os';
import * as stream from 'stream';
import * as util from 'util';
import * as utils from './utils';

import {Route, StaticRoute} from './router';

import {Pod} from './pod';

interface Artifact {
  tempPath: string;
  realPath: string;
}

interface PodPathSha {
  path: string;
  sha: string;
}

interface CommitAuthor {
  name: string;
  email: string;
}

interface Commit {
  sha: string;
  author: CommitAuthor;
  message: string;
}

interface BuildManifest {
  branch: string | null;
  built: string;
  commit: Commit | null;
  files: Array<PodPathSha>;
}

interface BuildDiffPaths {
  adds: Array<string>;
  edits: Array<string>;
  noChanges: Array<string>;
  deletes: Array<string>;
}

interface BuildMetrics {
  memoryUsage: number;
  numStaticRoutes: number;
  numDocumentRoutes: number;
  outputSizeStaticFiles: number;
  outputSizeDocuments: number;
}

interface BuildResult {
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

export class Builder {
  benchmarkPodPath: string;
  pod: Pod;
  manifestPodPath: string;
  outputDirectoryPodPath: string;
  controlDirectoryAbsolutePath: string;
  static DefaultOutputDirectory = 'build';
  static NumConcurrentBuilds = 40;
  static NumConcurrentCopies = 2000;
  static ShowMoveProgressBarThreshold = 1000;

  constructor(pod: Pod) {
    this.pod = pod;
    // TODO: Right now, this is limited to a sub-directory within the pod. We
    // want that to be the default, but we should also permit building to
    // directories external to the pod.
    this.outputDirectoryPodPath = Builder.DefaultOutputDirectory;
    this.controlDirectoryAbsolutePath = this.pod.getAbsoluteFilePath(
      fsPath.join(this.outputDirectoryPodPath, '.amagaki')
    );
    this.manifestPodPath = fsPath.join(
      this.outputDirectoryPodPath,
      '.amagaki',
      'manifest.json'
    );
    this.benchmarkPodPath = fsPath.join(
      this.outputDirectoryPodPath,
      '.amagaki',
      'benchmark.txt'
    );
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
    return fs.promises.rename(beforePath, afterPath).catch(err => {
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
      filePaths.forEach(filePath => {
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

  deleteOutputFiles(paths: Array<string>) {
    paths.forEach(outputPath => {
      // Delete the file.
      const absOutputPath = fsPath.join(
        this.outputDirectoryPodPath,
        outputPath
      );
      fs.unlinkSync(absOutputPath);
      // Delete the directory if it is empty.
      const dirPath = fsPath.dirname(absOutputPath);
      const innerPaths = fs.readdirSync(dirPath);
      if (innerPaths.length === 0) {
        fs.rmdirSync(dirPath);
      }
    });
  }

  getExistingManifest(): BuildManifest | null {
    const path = this.manifestPodPath;
    if (this.pod.fileExists(path)) {
      return JSON.parse(this.pod.readFile(this.manifestPodPath));
    }
    return null;
  }

  cleanOutputUsingManifests(
    existingManifest: BuildManifest | null,
    newManifest: BuildManifest
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
      existingManifest.files.forEach(pathSha => {
        if (!(pathSha.path in newPathShas)) {
          buildDiffPaths.deletes.push(pathSha.path);
        }
      });
    }
    return buildDiffPaths;
  }

  static createProgressBar(label: string) {
    return new cliProgress.SingleBar(
      {
        format:
          `${label} ({value}/{total}): `.green +
          '{bar} Total: {customDuration}',
      },
      cliProgress.Presets.shades_classic
    );
  }

  async export(): Promise<BuildResult> {
    const existingManifest = this.getExistingManifest();
    const buildManifest: BuildManifest = {
      branch: null,
      commit: null,
      built: new Date().toString(),
      files: [],
    };
    const buildMetrics: BuildMetrics = {
      numStaticRoutes: 0,
      numDocumentRoutes: 0,
      memoryUsage: 0,
      outputSizeDocuments: 0,
      outputSizeStaticFiles: 0,
    };
    const bar = Builder.createProgressBar('Building');
    const startTime = new Date().getTime();
    const artifacts: Array<Artifact> = [];
    const tempDirRoot = fs.mkdtempSync(
      fsPath.join(fs.realpathSync(os.tmpdir()), 'amagaki-build-')
    );

    bar.start(this.pod.router.routes.length, artifacts.length, {
      customDuration: Builder.formatProgressBarTime(0),
    });
    const createdPaths: Array<CreatedPath> = [];

    if (this.pod.router.routes.length === 0) {
      throw new Error(
        `Nothing to build. No routes found for pod rooted at: ${this.pod.root}. Ensure this is the right directory, and ensure that there is either content or static files to build.`
      );
    }

    // Collect the routes and assemble the temporary directory mapping.
    this.pod.router.routes.forEach(route => {
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
    });

    // Copy all static files and build all other routes.
    await async.eachLimit(
      createdPaths,
      Builder.NumConcurrentBuilds,
      async createdPath => {
        try {
          // Copy the file, or build it if it's a dynamic route.
          if (createdPath.route.provider.type === 'static_dir') {
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
                path: createdPath.route.path,
                type: createdPath.route.provider.type,
                urlPath: createdPath.route.urlPath,
              }
            );
            let content = '';
            try {
              content = await createdPath.route.build();
            } finally {
              timer.stop();
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
      async createdPath => {
        // Start by building the manifest (and getting file shas).
        buildManifest.files.push({
          path: createdPath.normalPath,
          sha: await this.getFileSha(createdPath.tempPath),
        });
        return Promise.all([
          // Then, update the metrics by getting file sizes.
          fs.promises.stat(createdPath.tempPath).then(statResult => {
            if (createdPath.route.provider.type === 'static_dir') {
              buildMetrics.numStaticRoutes += 1;
              buildMetrics.outputSizeStaticFiles += statResult.size;
            } else {
              buildMetrics.numDocumentRoutes += 1;
              buildMetrics.outputSizeDocuments += statResult.size;
            }
          }),
          // Finally, move the files from the temporary to final locations.
          this.moveFileAsync(createdPath.tempPath, createdPath.realPath),
        ]).then(() => {
          // When done with each file step, increment the progress bar.
          if (showMoveProgressBar) {
            moveBar.increment({
              customDuration: Builder.formatProgressBarTime(
                new Date().getTime() - moveStartTime
              ),
            });
          }
        });
      }
    );

    if (showMoveProgressBar) {
      moveBar.stop();
    }

    // Write the manifest.
    await this.writeFileAsync(
      this.pod.getAbsoluteFilePath(this.manifestPodPath),
      JSON.stringify(buildManifest, null, 2)
    );

    // Clean up.
    this.deleteDirectoryRecursive(tempDirRoot);

    // Output build metrics.
    console.log(
      'Memory usage: '.blue + utils.formatBytes(process.memoryUsage().heapUsed)
    );
    if (buildMetrics.numDocumentRoutes) {
      console.log(
        'Documents: '.blue +
          `${buildMetrics.numDocumentRoutes} (${utils.formatBytes(
            buildMetrics.outputSizeDocuments
          )})`
      );
    }
    if (buildMetrics.numStaticRoutes) {
      console.log(
        'Static files: '.blue +
          `${buildMetrics.numStaticRoutes} (${utils.formatBytes(
            buildMetrics.outputSizeStaticFiles
          )})`
      );
    }
    let numMissingTranslations = 0;
    let numMissingLocales = 0;
    Object.values(this.pod.cache.locales).forEach(locale => {
      numMissingTranslations += locale.recordedStrings.size;
      if (locale.recordedStrings.size) {
        numMissingLocales += 1;
      }
    });
    if (numMissingTranslations) {
      console.log(
        'Missing translations: '.blue +
          `${numMissingTranslations} (across ${numMissingLocales} locales)`
      );
    }

    const buildDiff = this.cleanOutputUsingManifests(
      existingManifest,
      buildManifest
    );

    // After diff has been computed, actually delete files.
    this.deleteOutputFiles(buildDiff.deletes);

    console.log(
      'Changes: '.blue +
        `${buildDiff.adds.length} adds, `.green +
        `${buildDiff.edits.length} edits, `.yellow +
        `${buildDiff.deletes.length} deletes`.red
    );

    return {
      diff: buildDiff,
      manifest: buildManifest,
      metrics: buildMetrics,
    };
  }

  async exportBenchmark() {
    // Write the profile benchmark.
    await this.writeFileAsync(
      this.pod.getAbsoluteFilePath(this.benchmarkPodPath),
      this.pod.profiler.benchmarkOutput
    );
  }
}
