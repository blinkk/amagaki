import {GlobalOptions, getPodWithEnvironment} from './global';
import {ProfileReport} from '../profile';

interface BuildOptions {
  outputDirectory?: string;
  pattern?: string[];
  writeLocales?: boolean;
}

export class BuildCommand {
  private readonly globalOptions: GlobalOptions;
  private readonly options: BuildOptions;

  constructor(globalOptions: GlobalOptions, options: BuildOptions) {
    this.globalOptions = globalOptions;
    this.options = options;
  }

  async run(path = './') {
    const pod = getPodWithEnvironment(path, this.globalOptions);
    const timer = pod.profiler.timer('command.build', 'Build command');
    try {
      await pod.builder.build({
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
