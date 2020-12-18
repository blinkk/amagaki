import * as fs from 'fs';
import {Pod} from '../pod';

interface BuildOptions {
  outputDirectory?: string;
}

export class BuildCommand {
  constructor(private readonly options: BuildOptions) {
    this.options = options;
  }

  async run(path = './') {
    const pod = new Pod(fs.realpathSync(path));
    await pod.builder.export();
  }
}
