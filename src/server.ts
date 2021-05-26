import * as fsPath from 'path';
import * as http from 'http';
import * as nunjucks from 'nunjucks';

import {Pod} from './pod';
import {StaticRoute} from './router';
import {Watcher} from './watcher';

import express = require('express');

interface ServerStartOptions {
  log: boolean;
  watch: boolean;
}

export class Server {
  private pod: Pod;
  private httpServer?: http.Server;
  private watcher: Watcher;
  private port: string | number;

  constructor(pod: Pod, port: string | number) {
    this.pod = pod;
    this.port = port;
    this.watcher = new Watcher(pod, this);
  }

  /**
   * Returns the `Express` server application.
   */
  createApp() {
    const app = express();
    this.pod.plugins.trigger('createServer', app);
    app.disable('x-powered-by');
    app.all('/*', async (req: express.Request, res: express.Response) => {
      try {
        const route = this.pod.router.resolve(req.path);
        if (!route) {
          res
            .status(404)
            .sendFile(
              fsPath.join(__dirname, './static/', 'error-no-route.html')
            );
          return;
        }
        if (route.provider.type === 'static_dir') {
          res.sendFile(
            this.pod.getAbsoluteFilePath(
              (route as StaticRoute).staticFile.podPath
            )
          );
          return;
        } else {
          const content = await route.build();
          res.set('Content-Type', route.contentType);
          res.send(content);
        }
      } catch (err) {
        nunjucks.configure(fsPath.join(__dirname, './static/'), {
          autoescape: true,
          express: app,
        });
        res.status(500).render('error-generic.njk', {
          error: err,
        });
      }
    });
    return app;
  }

  /**
   * Starts the web server.
   */
  start(options: ServerStartOptions) {
    const app = this.createApp();
    this.httpServer = app.listen(this.port, () => {
      // Only output first time server is started.
      if (options.log) {
        console.log('   Pod:'.green, `${this.pod.root}`);
        console.log(
          'Server:'.green,
          `${this.pod.env.scheme}://${this.pod.env.host}:${this.port}/`
        );
        console.log(' Ready. Press ctrl+c to quit.'.green);
      }
    });
    options.watch && this.watcher.start();
  }

  /**
   * Reinstantiates the pod, which has the effect of reloading any dependencies
   * defined within `amagaki.ts`.
   */
  reloadPod() {
    this.httpServer && this.httpServer.close();
    console.log('Reloaded:'.green, `${this.pod.root}`);
    this.pod = new Pod(this.pod.root, this.pod.env);
    this.start({
      log: false,
      watch: false,
    });
  }
}
