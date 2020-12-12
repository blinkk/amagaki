import {asyncify, mapLimit, mapValuesLimit} from 'async';
import {Pod} from './pod';
import {Route, StaticRoute} from './router';
import {extname, dirname, join} from 'path';
import * as cliProgress from 'cli-progress';
import * as fs from 'fs';
import * as os from 'os';

interface Artifact {
  tempPath: string;
  realPath: string;
}

export class Builder {
  pod: Pod;

  constructor(pod: Pod) {
    this.pod = pod;
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
        format: 'Building ({value}/{total}): {bar} Total: {duration_formatted}',
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
        10,
        asyncify(async (route: Route) => {
          // TODO: Allow changing output dir.
          const normalPath = Builder.normalizePath(route.url.path);
          const tempPath = join(tempDirRoot, 'build', normalPath);
          if (route.provider.type === 'static_file') {
            this.copyFile(tempPath, (route as StaticRoute).staticFile.podPath);
          } else {
            const content = await route.build();
            this.writeFile(tempPath, content);
          }
          artifacts.push({
            tempPath: tempPath,
            realPath: this.pod.getAbsoluteFilePath(join('/build/', normalPath)),
          });
          bar.increment();
        })
      );
      await mapLimit(
        artifacts,
        10,
        asyncify(async (artifact: Artifact) => {
          Builder.ensureDirectoryExists(artifact.realPath);
          fs.renameSync(artifact.tempPath, artifact.realPath);
        })
      );
    } finally {
      bar.stop();
      fs.rmdirSync(tempDirRoot, {recursive: true});
    }
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
