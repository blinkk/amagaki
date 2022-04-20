import * as chokidar from 'chokidar';
import * as events from 'events';
import * as fsPath from 'path';
import * as http from 'http';
import * as nunjucks from 'nunjucks';

import {Pod} from './pod';
import {StaticRoute} from './routes';

import {debounce} from './utils';
import express = require('express');
import chalk from 'chalk';
import compression from 'compression';

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

  static AUTORELOAD_PATHS_REGEX = /^\/amagaki.(j|t)s$|^\/plugins/;
  static CLEAR_MODULE_CACHE_PATH_REGEX = /.*.js$|.*ts$|.*tsx$|.*jsx$/;
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
    app.use(compression());
    nunjucks.configure(fsPath.join(__dirname, './static/'), {
      autoescape: true,
      express: app,
    });
    app.all('/*', async (req: express.Request, res: express.Response) => {
      try {
        const [route, params] = await this.pod.router.resolve(req.path);
        if (!route) {
          const ext = req.path.split('.').pop();
          const routes = (await this.pod.router.routes())
            .filter(route => {
              return (
                route.type != 'default' && (
                route.url.path.endsWith('/') ||
                route.url.path.endsWith('.html') ||
                (ext && route.url.path.endsWith(ext)))
              );
            })
            .slice(0, 1000); // Show 1000 files max.
          res.status(404).render('error-no-route.njk', {
            pod: this.pod,
            routes: routes,
          });
          return;
        }
        if (route.type === 'staticDir') {
          res.sendFile(
            this.pod.getAbsoluteFilePath(
              (route as StaticRoute).staticFile.podPath
            )
          );
          return;
        } else {
          const content = await route.build({
            req: req,
            params: params,
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
  async start(options: {incrementPort?: Boolean} = {incrementPort: true}) {
    let retryCount = 0;
    const app = await this.createApp();
    this.httpServer = app.listen(this.port, () => this.onListen());
    this.httpServer.on('error', (err: NodeJS.ErrnoException) => {
      if (this.pod.env.dev && retryCount < 10 && err.code === 'EADDRINUSE') {
        // Use `incrementPort` to find a free port when starting the server the
        // first time. When the server is reloaded, avoid incrementing the port,
        // because we need to restart the server and listen on the original port
        // that was opened. Server reloading may be triggered several times in a
        // row.
        if (options?.incrementPort) {
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
        }
      } else {
        throw err;
      }
    });
    await this.safeWarmup();
    if (!this.watcher) {
      this.watch();
    }
  }

  private onchange(path: string) {
    const podPath = `/${path}`;
    // Server needs to be fully restarted; e.g. if `amagaki.ts` changed.
    if (Server.AUTORELOAD_PATHS_REGEX.test(podPath)) {
      this.reload();
    } else {
      // Module cache needs to be reloaded (e.g. to reload `.tsx` templates)
      if (Server.CLEAR_MODULE_CACHE_PATH_REGEX.test(podPath)) {
        this.clearModuleCache();
      }
      // Cache needs to be reset (e.g. to update routes).
      this.pod.cache.reset();
      this.safeWarmup();
    }
  }

  async safeWarmup() {
    // Catch errors so they can be fixed without restarting the server. Errors
    // are displayed interactively when rendering pages so they can be fixed
    // without restarting the server.
    try {
      await this.pod.warmup();
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Initializes a watcher and handles autoreloading and cache resetting.
   */
  watch() {
    this.watcher = chokidar.watch(this.pod.root, {
      cwd: this.pod.root,
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**'],
      ignoreInitial: true,
    });

    // Reload the server or reset the cache when necessary.
    // Throttle changes to once within 200ms windows.
    const callback = debounce(this.onchange.bind(this), 200, true);
    this.watcher.on('add', callback);
    this.watcher.on('change', callback);
    this.watcher.on('unlink', callback);
  }

  /** Clears module cache to allow runtime reloading of plugins and .TS templates. */
  clearModuleCache() {
    // Evict module cache to allow runtime reloading of plugins.
    const pluginsRoot = this.pod.getAbsoluteFilePath(Server.PLUGINS_PATH);
    const srcRoot = this.pod.getAbsoluteFilePath(Server.SRC_PATH);
    Object.keys(require.cache).forEach(cacheKey => {
      if (cacheKey.startsWith(pluginsRoot) || cacheKey.startsWith(srcRoot)) {
        delete require.cache[cacheKey];
      }
    });
  }

  /**
   * Reinstantiates the pod and restarts the server, which has the side effect
   * of reloading any changes from `amagaki.ts`.
   */
  async reload() {
    if (this.httpServer?.listening) {
      await this.stop();
    }
    this.clearModuleCache();
    if (!this.httpServer?.listening) {
      let newPod;
      try {
        newPod = new Pod(this.pod.root, this.pod.env);
      } catch (err) {
        console.log('An error occurred while reloading the pod.');
        console.error(err);
      }
      if (newPod) {
        this.pod = newPod;
        await this.start({incrementPort: false});
        this.emit(Server.Events.RELOAD, <ServerListeningEvent>{
          app: this.httpServer,
          server: this,
        });
      }
    }
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
