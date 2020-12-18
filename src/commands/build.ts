import {Pod} from '../pod';
import * as fs from 'fs';
import profiler from '../profile';

interface BuildOptions {
  outputDirectory?: string;
}

export class BuildCommand {
  private readonly globalOptions: Record<string, any>;
  private readonly options: BuildOptions;

  constructor(globalOptions: Record<string, any>, options: BuildOptions) {
    this.globalOptions = globalOptions;
    this.options = options;
  }

  async run(path = './') {
    const pod = new Pod(fs.realpathSync(path));
    const commandTimers = profiler.timersFor('command.build', 'Build command');
    const command = commandTimers.wrapAsync(pod.builder.export, pod.builder);
    await command();

    if (this.globalOptions.profile) {
      profiler.report();
    }
  }
}
