import {GlobalOptions, getPodWithEnvironment} from './global';

import {ExportOptions} from '../builder';

export class ExportCommand {
  private readonly globalOptions: GlobalOptions;
  private readonly options: ExportOptions;

  constructor(globalOptions: GlobalOptions, options: ExportOptions) {
    this.globalOptions = globalOptions;
    this.options = options;
  }

  async run(path = './') {
    const pod = getPodWithEnvironment(path, this.globalOptions);
    const timer = pod.profiler.timer('command.export', 'Export command');
    try {
      await pod.builder.export(this.options);
    } finally {
      timer.stop();
    }
  }
}
