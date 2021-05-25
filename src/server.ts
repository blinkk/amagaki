import * as fsPath from 'path';
import * as nunjucks from 'nunjucks';

import {Pod} from './pod';
import {StaticRoute} from './router';
import {Watcher} from './watcher';

import express = require('express');

export class Server {
  private pod: Pod;
  private app: express.Application;
  private watcher: Watcher;

  constructor(pod: Pod) {
    this.pod = pod;
    this.watcher = new Watcher(pod);
    this.app = express();
    this.app.disable('x-powered-by');
  }

  createApp() {
    this.pod.plugins.trigger('createServer', this.app);
    this.app.all('/*', async (req: express.Request, res: express.Response) => {
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
          express: this.app,
        });
        res.status(500).render('error-generic.njk', {
          error: err,
        });
      }
    });
    return this.app;
  }

  start(port: string | number) {
    const app = this.createApp();
    app.listen(port, () => {
      console.log('   Pod:'.green, `${this.pod.root}`);
      console.log(
        'Server:'.green,
        `${this.pod.env.scheme}://${this.pod.env.host}:${port}/`
      );
      console.log(' Ready. Press ctrl+c to quit.'.green);
      this.watcher.start();
    });
  }
}
