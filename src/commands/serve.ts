import * as _colors from 'colors';
import * as fs from 'fs';

import {GlobalOptions} from './global';
import {Pod} from '../pod';
import {Server} from '../server';
import {Watcher} from '../watcher';

interface ServeOptions {
  fcd?: string;
  ref?: string;
  port?: number;
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
    // Create pod.
    const port = this.options.port || process.env.PORT || 8080;
    const pod = new Pod(fs.realpathSync(path), {
      dev: true,
      host: 'localhost',
      name: 'default',
      port: `${port}`,
      scheme: 'http',
    });
    if (this.globalOptions.env) {
      pod.setEnvironment(this.globalOptions.env);
    }
    // Create server.
    const server = new Server(pod, {
      port: port,
    });
    server.start();
    server?.httpServer?.once('listening', () => {
      console.log('   Pod:'.green, `${pod.root}`);
      console.log(
        'Server:'.green,
        `${pod.env.scheme}://${pod.env.host}:${port}/`
      );
      console.log(' Ready. Press ctrl+c to quit.'.green);
      // Watch for changes to critical files.
      const watcher = new Watcher(pod, server);
      watcher.start();
    });
  }
}
