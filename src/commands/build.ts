import * as fs from 'fs';
import {GlobalOptions} from './global';
import {Pod} from '../pod';

interface BuildOptions {
  outputDirectory?: string;
}

export class BuildCommand {
  private readonly globalOptions: GlobalOptions;
  private readonly options: BuildOptions;

  constructor(globalOptions: GlobalOptions, options: BuildOptions) {
    this.globalOptions = globalOptions;
    this.options = options;
  }

  async run(path = './') {
    const pod = new Pod(fs.realpathSync(path));
    const command = pod.profiler
      .timersFor('command.build', 'Build command')
      .wrapAsync(pod.builder.export.bind(pod.builder));
    await command();
    pod.profiler.report([], this.globalOptions.profile);
  }
}
