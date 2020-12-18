import * as _colors from 'colors';
import * as fs from 'fs';
import {GlobalOptions} from './global';
import {Pod} from '../pod';
import Watcher from '../watcher';
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
    const pod = new Pod(fs.realpathSync(path));
    const watcher = new Watcher(pod);
    const app = createApp(pod);
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log('   Pod:'.green, `${pod.root}`);
      console.log(
        'Server:'.green,
        `${pod.env.scheme}://${pod.env.host}:${PORT}/`
      );
      console.log(' Ready. Press ctrl+c to quit.'.green);
      watcher.start();
    });
  }
}
