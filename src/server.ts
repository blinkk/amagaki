import * as chokidar from 'chokidar';
import * as events from 'events';
import * as fsPath from 'path';
import * as http from 'http';
import * as nunjucks from 'nunjucks';

import {Pod} from './pod';
import {StaticRoute} from './router';

import express = require('express');
import chalk from 'chalk';

interface ServerOptions {
  port: string | number;
}

export interface ServerListeningEvent {
  app: http.Server;
  server: Server;
}

export class Server extends events.EventEmitter {
  private pod: Pod;
  private httpServer?: http.Server;
  port: number;
  watcher?: chokidar.FSWatcher;

  static AUTORELOAD_PATHS = ['^/amagaki.(j|t)s', '^/plugins'];
  static PLUGINS_PATH = '/plugins';
  static SRC_PATH = '/src';
  static Events = {
    RELOAD: 'reload',
    LISTENING: 'listening',
  };

  constructor(pod: Pod, options: ServerOptions) {
    super();
    this.pod = pod;
    this.port = parseInt(options.port as string);
  }

  /**
   * Returns the `Express` server application.
   */
  async createApp(): Promise<express.Express> {
    const app = express();
    await this.pod.plugins.trigger('createServer', app);
    app.disable('x-powered-by');
    nunjucks.configure(fsPath.join(__dirname, './static/'), {
      autoescape: true,
      express: app,
    });
    app.all('/*', async (req: express.Request, res: express.Response) => {
      try {
        const route = await this.pod.router.resolve(req.path);
        if (!route) {
          const ext = req.path.split('.').pop();
          const routes = (await this.pod.router.routes())
            .filter(route => {
              return (
                route.url.path.endsWith('/') ||
                route.url.path.endsWith('.html') ||
                (ext && route.url.path.endsWith(ext))
              );
            })
            .slice(0, 100);
          res.status(404).render('error-no-route.njk', {
            pod: this.pod,
            routes: routes,
          });
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
          const content = await route.build({
            req: req,
          });
          res.set('Content-Type', route.contentType);
          res.send(content);
        }
      } catch (err) {
        res.status(500).render('error-generic.njk', {
          pod: this.pod,
          error: err,
        });
      }
    });
    return app;
  }

  private onListen() {
    this.emit(Server.Events.LISTENING, <ServerListeningEvent>{
      app: this.httpServer,
      server: this,
    });
  }

  /**
   * Starts the web server.
   */
  async start() {
    let retryCount = 0;
    const app = await this.createApp();
    this.httpServer = app.listen(this.port, () => this.onListen());
    this.httpServer.on('error', (err: NodeJS.ErrnoException) => {
      if (this.pod.env.dev && retryCount < 10 && err.code === 'EADDRINUSE') {
        console.warn(
          chalk.yellow(
            `Warning: Port ${this.port} is in use, trying ${
              this.port + 1
            } instead`
          )
        );
        this.port += 1;
        retryCount += 1;
        this.httpServer = app.listen(this.port, () => this.onListen());
      } else {
        throw err;
      }
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

  private onchange(path: string) {
    const reloadRegex = new RegExp(Server.AUTORELOAD_PATHS.join('|'));
    const podPath = `/${path}`;
    if (podPath.match(reloadRegex)) {
      // TODO: Handle errors gracefully, so the developer can fix the error without
      // needing to manually restart the server.
      this.reload();
    } else {
      this.pod.cache.reset();
    }
  }

  /**
   * Initializes a watcher and handles autoreloading and cache resetting.
   */
  watch() {
    this.watcher = chokidar.watch(this.pod.root, {
      cwd: this.pod.root,
      ignored: ['**/node_modules/**', '**/.git/**'],
      ignoreInitial: true,
    });

    // Reload the server or reset the cache when necessary.
    this.watcher.on('add', this.onchange.bind(this));
    this.watcher.on('change', this.onchange.bind(this));
    this.watcher.on('unlink', this.onchange.bind(this));
  }

  /**
   * Reinstantiates the pod and restarts the server, which has the side effect
   * of reloading any changes from `amagaki.ts`.
   */
  async reload() {
    await this.stop();
    // Evict module cache to allow runtime reloading of plugins.
    const pluginsRoot = this.pod.getAbsoluteFilePath(Server.PLUGINS_PATH);
    const srcRoot = this.pod.getAbsoluteFilePath(Server.SRC_PATH);
    Object.keys(require.cache).forEach(cacheKey => {
      if (cacheKey.startsWith(pluginsRoot) || cacheKey.startsWith(srcRoot)) {
        delete require.cache[cacheKey];
      }
    });
    this.pod = new Pod(this.pod.root, this.pod.env);
    await this.start();
    this.emit(Server.Events.RELOAD);
  }

  /** Stops the web server. */
  async stop() {
    return new Promise<void>((resolve, reject) => {
      this.httpServer?.close(err => {
        err ? reject(err) : resolve();
      });
      // Connections are closed when the server emits the `close` event. This
      // allows the server to be restarted cleanly.
      // https://stackoverflow.com/a/36830072
      setImmediate(() => {
        this.httpServer?.emit('close');
      });
    });
  }
}
