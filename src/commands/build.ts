import {Pod} from '../pod';
import * as fs from 'fs';

interface BuildOptions {}

export class BuildCommand {
  constructor(private readonly options: BuildOptions) {
    this.options = options;
  }

  async run(path: string = './') {
    const pod = new Pod(fs.realpathSync(path));
    await pod.builder.export();
  }
}
