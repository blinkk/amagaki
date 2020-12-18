import * as cliProgress from 'cli-progress';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as fsPath from 'path';
import * as os from 'os';
import * as stream from 'stream';
import * as util from 'util';
import * as utils from './utils';
import {Route, StaticRoute} from './router';
import {asyncify, mapLimit} from 'async';
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

export class Builder {
  pod: Pod;
  manifestPodPath: string;
  outputDirectoryPodPath: string;
  controlDirectoryAbsolutePath: string;
  static DefaultOutputDirectory = 'build';
  static DefaultNumConcurrentBuilds = 10;
  static DefaultNumConcurrentCopies = 10;

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

  copyFile(outputPath: string, podPath: string) {
    Builder.ensureDirectoryExists(outputPath);
    fs.copyFileSync(this.pod.getAbsoluteFilePath(podPath), outputPath);
  }

  moveFile(beforePath: string, afterPath: string) {
    Builder.ensureDirectoryExists(afterPath);
    fs.renameSync(beforePath, afterPath);
  }

  writeFile(outputPath: string, content: string) {
    Builder.ensureDirectoryExists(outputPath);
    fs.writeFileSync(outputPath, content);
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

  getExistingManifest(): BuildManifest | null {
    const path = this.manifestPodPath;
    if (this.pod.fileExists(path)) {
      return JSON.parse(this.pod.fileRead(this.manifestPodPath));
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

  static createProgressBar() {
    return new cliProgress.SingleBar(
      {
        format:
          'Building ({value}/{total}): '.green +
          '{bar} Total: {duration_formatted}',
      },
      cliProgress.Presets.shades_classic
    );
  }

  async export() {
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
    const bar = Builder.createProgressBar();
    const artifacts: Array<Artifact> = [];
    // TODO: Cleanly handle errors.
    const tempDirRoot = fs.mkdtempSync(
      fsPath.join(fs.realpathSync(os.tmpdir()), 'amagaki-build-')
    );
    try {
      bar.start(this.pod.router.routes.length, artifacts.length);
      // Build all routes to a temporary location.
      await mapLimit(
        this.pod.router.routes,
        Builder.DefaultNumConcurrentBuilds,
        asyncify(async (route: Route) => {
          const normalPath = Builder.normalizePath(route.url.path);
          const tempPath = fsPath.join(
            tempDirRoot,
            this.outputDirectoryPodPath,
            normalPath
          );
          if (route.provider.type === 'static_file') {
            // Copy static files.
            this.copyFile(tempPath, (route as StaticRoute).staticFile.podPath);
            buildMetrics.numStaticRoutes += 1;
            buildMetrics.outputSizeStaticFiles += fs.statSync(tempPath).size;
          } else {
            // Build (render) everything else.
            const content = await route.build();
            this.writeFile(tempPath, content);
            buildMetrics.numDocumentRoutes += 1;
            buildMetrics.outputSizeDocuments += fs.statSync(tempPath).size;
          }
          artifacts.push({
            tempPath: tempPath,
            realPath: this.pod.getAbsoluteFilePath(
              fsPath.join(this.outputDirectoryPodPath, normalPath)
            ),
          });
          buildManifest.files.push({
            path: normalPath,
            sha: await this.getFileSha(tempPath),
          });
          bar.increment();
        })
      );
      // Once build is complete, move files from temporary folder to destination.
      await mapLimit(
        artifacts,
        Builder.DefaultNumConcurrentCopies,
        asyncify(async (artifact: Artifact) => {
          this.moveFile(artifact.tempPath, artifact.realPath);
        })
      );
    } finally {
      bar.stop();
      this.writeFile(
        this.pod.getAbsoluteFilePath(this.manifestPodPath),
        JSON.stringify(buildManifest, null, 2)
      );
      this.deleteDirectoryRecursive(tempDirRoot);
    }

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
    console.log(
      'Changes: '.blue +
        `${buildDiff.adds.length} adds `.green +
        `${buildDiff.edits.length} edits `.yellow +
        `${buildDiff.deletes.length} deletes`.red
    );
  }
}
