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
  app: http.Server;
}

export class Server extends events.EventEmitter {
  private pod: Pod;
  private httpServer?: http.Server;
  port: string | number;
  watcher?: chokidar.FSWatcher;

  static AUTORELOAD_PATHS = ['^/amagaki.(j|t)s', '^/plugins'];
  static PLUGINS_PATH = '/plugins';
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
          const routes = (await this.pod.router.routes())
            .filter(route => {
              return (
                route.url.path.endsWith('/') || route.url.path.endsWith('.html')
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

  /**
   * Starts the web server.
   */
  async start() {
    const app = await this.createApp();
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

  /** Resets the pod cache and reinitializes the router. */
  async resetCache() {
    // TODO: Clear based on dependency graph and file type.
    this.pod.cache.reset();
    // NOTE: Warm up the pod to ensure the router is populated for the dev
    // server. This is important when static files are added or removed or
    // when routes change via changes to `$path` or otherwise. This cannot
    // be done lazily at the moment because `router.getUrl` is sync whereas
    // warming up is async.
    await this.pod.warmup();
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
    this.watcher.on('change', async path => {
      const podPath = `/${path}`;
      if (podPath.match(reloadRegex)) {
        // TODO: Handle errors gracefully, so the developer can fix the error without
        // needing to manually restart the server.
        this.reload();
      } else {
        await this.resetCache();
      }
    });
  }

  /**
   * Reinstantiates the pod and restarts the server, which has the side effect
   * of reloading any changes from `amagaki.ts`.
   */
  async reload() {
    await this.stop();
    // Evict module cache to allow runtime reloading of plugins.
    const pluginsRoot = this.pod.getAbsoluteFilePath(Server.PLUGINS_PATH);
    Object.keys(require.cache).forEach(cacheKey => {
      if (cacheKey.startsWith(pluginsRoot)) {
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
