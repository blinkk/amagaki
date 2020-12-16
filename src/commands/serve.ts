import {createApp} from '../server';
import {Pod} from '../pod';
import * as colors from 'colors';
import * as fs from 'fs';
import Watcher from '../watcher';

interface ServeOptions {
  site: string;
  ref?: string;
  fcd?: string;
}

export class ServeCommand {
  constructor(private readonly options: ServeOptions) {
    this.options = options;
  }

  async run(path: string = './') {
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
