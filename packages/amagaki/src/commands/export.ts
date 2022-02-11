import * as fs from 'fs';

import {GlobalOptions} from './global';
import {Pod} from '../pod';
import {ProfileReport} from '../profile';

interface ExportOptions {
  outputDirectory?: string;
  includeAmagakiDir?: boolean;
}

export class ExportCommand {
  private readonly globalOptions: GlobalOptions;
  private readonly options: ExportOptions;

  constructor(globalOptions: GlobalOptions, options: ExportOptions) {
    this.globalOptions = globalOptions;
    this.options = options;
  }

  async run(path = './') {
    const pod = new Pod(
      fs.realpathSync(path),
      this.globalOptions.env ? {name: this.globalOptions.env} : undefined
    );
    if (this.globalOptions.env) {
      pod.setEnvironment(this.globalOptions.env);
    }
    const timer = pod.profiler.timer('command.export', 'Export command');
    try {
      await pod.builder.export({
        patterns: this.options.pattern,
        writeLocales: this.options.writeLocales,
      });
    } finally {
      timer.stop();
    }

    const report = new ProfileReport(pod.profiler);
    report.output(this.globalOptions.profile);

    await pod.builder.exportBenchmark();
  }
}
