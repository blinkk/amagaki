import {GlobalOptions, getPodWithEnvironment} from './global';
import {Server, ServerListeningEvent} from '../server';

import chalk from 'chalk';

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
    const port = this.options.port || process.env.PORT || 8080;
    const pod = getPodWithEnvironment(path, this.globalOptions, {
      dev: true,
      host: 'localhost',
      name: this.globalOptions.env || 'default',
      port: `${port}`,
      scheme: 'http',
    });
    const server = new Server(pod, {
      port: port,
    });
    server.on(Server.Events.RELOAD, (e: ServerListeningEvent) => {
      console.log(
        chalk.greenBright('Reloaded:'),
        `${pod.env.scheme}://${pod.env.host}:${e.server.port}/`
      );
    });
    server.once(Server.Events.LISTENING, (e: ServerListeningEvent) => {
      console.log(chalk.green('🍊 Pod:'), `${pod.root}`);
      console.log(
        chalk.green('Server:'),
        `${pod.env.scheme}://${pod.env.host}:${e.server.port}/`
      );
      console.log(chalk.green(' Ready. Press ctrl+c to quit.'));
    });
    await server.start();
  }
}
