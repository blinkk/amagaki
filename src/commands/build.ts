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
    const timer = pod.profiler.timer('command.build', 'Build command');
    try {
      await pod.builder.export();
    } finally {
      timer.stop();
    }

    pod.profiler.report([], this.globalOptions.profile);
    await pod.builder.exportBenchmark();
  }
}
