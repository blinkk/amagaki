import * as _colors from 'colors';
import * as fs from 'fs';

import {GlobalOptions} from './global';
import {Pod} from '../pod';
import {Watcher} from '../watcher';
import {createApp} from '../server';

interface ServeOptions {
  fcd?: string;
  ref?: string;
  site: string;
}

export class ServeCommand {
  private readonly globalOptions: GlobalOptions;
  private readonly options: ServeOptions;

  constructor(globalOptions: GlobalOptions, options: ServeOptions) {
    this.globalOptions = globalOptions;
    this.options = options;
  }

  async run(path = './') {
    const port = process.env.PORT || '8080';
    const pod = new Pod(fs.realpathSync(path), {
      dev: true,
      host: 'localhost',
      name: 'default',
      port: port,
      scheme: 'http',
    });
    await pod.injector.warmup();
    const watcher = new Watcher(pod);
    const app = createApp(pod);
    app.listen(port, () => {
      console.log('   Pod:'.green, `${pod.root}`);
      console.log(
        'Server:'.green,
        `${pod.env.scheme}://${pod.env.host}:${port}/`
      );
      console.log(' Ready. Press ctrl+c to quit.'.green);
      watcher.start();
    });
  }
}
