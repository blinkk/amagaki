import {asyncify, mapLimit, mapValuesLimit} from 'async';
import {Pod} from './pod';
import {Route} from './router';
import {extname, dirname, join} from 'path';
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

  async export() {
    const artifacts: Array<Artifact> = [];
    // TODO: Cleanly handle errors.
    const tempDirRoot = join(
      fs.realpathSync(os.tmpdir()),
      fs.mkdtempSync('amagaki-build-')
    );
    try {
      await mapLimit(
        this.pod.router.routes,
        10,
        asyncify(async (route: Route) => {
          const content = await route.build();
          // TODO: Allow changing output dir.
          const normalPath = Builder.normalizePath(route.url.path);
          const tempPath = join(tempDirRoot, 'build', normalPath);
          this.writeFile(tempPath, content);
          artifacts.push({
            tempPath: tempPath,
            realPath: this.pod.getAbsoluteFilePath(join('/build/', normalPath)),
          });
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
      fs.rmdirSync(tempDirRoot, {recursive: true});
    }
  }

  writeFile(outputPath: string, content: string) {
    Builder.ensureDirectoryExists(outputPath);
    fs.writeFileSync(outputPath, content);
    console.log(`Saved ${outputPath}`);
  }
}
