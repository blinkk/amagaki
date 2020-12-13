import {asyncify, mapLimit, mapValuesLimit} from 'async';
import {Pod} from './pod';
import {Route, StaticRoute} from './router';
import {extname, dirname, join} from 'path';
import * as cliProgress from 'cli-progress';
import * as fs from 'fs';
import * as os from 'os';
import * as utils from './utils';

interface Artifact {
  tempPath: string;
  realPath: string;
}

export class Builder {
  pod: Pod;
  outputDirectoryPodPath: string;
  static DefaultOutputDirectory = 'build';
  static DefaultNumConcurrentBuilds = 10;
  static DefaultNumConcurrentCopies = 10;

  constructor(pod: Pod) {
    this.pod = pod;
    // TODO: Right now, this is limited to a sub-directory within the pod. We
    // want that to be the default, but we should also permit building to
    // directories external to the pod.
    this.outputDirectoryPodPath = Builder.DefaultOutputDirectory;
  }

  static normalizePath(path: string) {
    if (path.endsWith('/')) {
      return `${path}index.html`;
    }
    return extname(path) ? path : `${path}/index.html`;
  }

  static ensureDirectoryExists(path: string) {
    const dirPath = dirname(path);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, {recursive: true});
    }
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
    const bar = Builder.createProgressBar();
    const artifacts: Array<Artifact> = [];
    // TODO: Cleanly handle errors.
    const tempDirRoot = fs.mkdtempSync(
      join(fs.realpathSync(os.tmpdir()), 'amagaki-build-')
    );
    try {
      bar.start(this.pod.router.routes.length, artifacts.length);
      await mapLimit(
        this.pod.router.routes,
        Builder.DefaultNumConcurrentBuilds,
        asyncify(async (route: Route) => {
          // TODO: Allow changing output dir.
          const normalPath = Builder.normalizePath(route.url.path);
          const tempPath = join(
            tempDirRoot,
            this.outputDirectoryPodPath,
            normalPath
          );
          if (route.provider.type === 'static_file') {
            this.copyFile(tempPath, (route as StaticRoute).staticFile.podPath);
          } else {
            const content = await route.build();
            this.writeFile(tempPath, content);
          }
          artifacts.push({
            tempPath: tempPath,
            realPath: this.pod.getAbsoluteFilePath(
              join(this.outputDirectoryPodPath, normalPath)
            ),
          });
          bar.increment();
        })
      );
      await mapLimit(
        artifacts,
        Builder.DefaultNumConcurrentCopies,
        asyncify(async (artifact: Artifact) => {
          Builder.ensureDirectoryExists(artifact.realPath);
          fs.renameSync(artifact.tempPath, artifact.realPath);
        })
      );
    } finally {
      bar.stop();
      fs.rmdirSync(tempDirRoot, {recursive: true});
    }
    console.log(
      'Memory usage: '.blue + utils.formatBytes(process.memoryUsage().heapUsed)
    );
  }

  copyFile(outputPath: string, podPath: string) {
    Builder.ensureDirectoryExists(outputPath);
    fs.copyFileSync(this.pod.getAbsoluteFilePath(podPath), outputPath);
  }

  writeFile(outputPath: string, content: string) {
    Builder.ensureDirectoryExists(outputPath);
    fs.writeFileSync(outputPath, content);
  }
}
