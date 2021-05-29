import * as chokidar from 'chokidar';
import * as events from 'events';
import * as fsPath from 'path';
import * as http from 'http';
import * as nunjucks from 'nunjucks';

import {Pod} from './pod';
import {StaticRoute} from './router';

import express = require('express');

interface ServerOptions {
  port: string | number;
}

export interface ServerListeningEvent {
  app: Express.Application;
}

export class Server extends events.EventEmitter {
  private pod: Pod;
  private httpServer?: http.Server;
  port: string | number;
  watcher?: chokidar.FSWatcher;

  static AUTORELOAD_PATHS = ['^/amagaki.(j|t)s', '^/plugins'];
  static Events = {
    RELOAD: 'reload',
    LISTENING: 'listening',
  };

  constructor(pod: Pod, options: ServerOptions) {
    super();
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
        const route = await this.pod.router.resolve(req.path);
        if (!route) {
          res
            .status(404)
            .sendFile(
              fsPath.join(__dirname, './static/', 'error-no-route.html')
            );
          return;
        }
        if (route.provider.type === 'staticDir') {
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
  async start() {
    const app = this.createApp();
    this.httpServer = app.listen(this.port);
    this.emit(Server.Events.LISTENING, <ServerListeningEvent>{
      app: this.httpServer,
    });
    // Catch errors so they can be fixed without restarting the server. Errors
    // are displayed interactively when rendering pages so they can be fixed
    // without restarting the server.
    try {
      await this.pod.warmup();
    } catch (err) {
      console.error(err);
    }
    if (!this.watcher) {
      this.watch();
    }
  }

  /**
   * Initializes a watcher and handles autoreloading and cache resetting.
   */
  watch() {
    this.watcher = chokidar.watch(this.pod.root, {
      ignored: /node_modules/,
      cwd: this.pod.root,
    });

    // Reload the server or reset the cache when necessary.
    const reloadRegex = new RegExp(Server.AUTORELOAD_PATHS.join('|'));
    this.watcher.on('change', path => {
      const podPath = `/${path}`;
      if (podPath.match(reloadRegex)) {
        // TODO: Handle errors gracefully, so the developer can fix the error without
        // needing to manually restart the server.
        this.reload();
      } else {
        // TODO: Clear based on dependency graph and file type.
        this.pod.cache.reset();
      }
    });
  }

  /**
   * Reinstantiates the pod and restarts the server, which has the side effect
   * of reloading any changes from `amagaki.ts`.
   */
  async reload() {
    this.stop();
    this.pod = new Pod(this.pod.root, this.pod.env);
    await this.start();
    this.emit(Server.Events.RELOAD);
  }

  /** Stops the web server. */
  stop() {
    this.httpServer?.close();
  }
}
