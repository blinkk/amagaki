import * as fsPath from 'path';
import * as http from 'http';
import * as nunjucks from 'nunjucks';

import {Pod} from './pod';
import {StaticRoute} from './router';

import express = require('express');

interface ServerOptions {
  port: string | number;
}

export class Server {
  private pod: Pod;
  httpServer?: http.Server;
  port: string | number;

  constructor(pod: Pod, options: ServerOptions) {
    this.pod = pod;
    this.port = options.port;
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
  start() {
    const app = this.createApp();
    this.httpServer = app.listen(this.port);
  }

  /**
   * Reinstantiates the pod and restarts the server, which has the side effect
   * of reloading any changes from `amagaki.ts`.
   */
  reload() {
    this.httpServer && this.httpServer.close();
    this.pod = new Pod(this.pod.root, this.pod.env);
    this.start();
  }
}
