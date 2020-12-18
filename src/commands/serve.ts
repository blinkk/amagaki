import {createApp} from '../server';
import {Pod} from '../pod';
import * as _colors from 'colors';
import * as fs from 'fs';
import Watcher from '../watcher';

interface ServeOptions {
  fcd?: string;
  ref?: string;
  site: string;
}

export class ServeCommand {
  private readonly globalOptions: Record<string, any>;
  private readonly options: ServeOptions;

  constructor(globalOptions: Record<string, any>, options: ServeOptions) {
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
