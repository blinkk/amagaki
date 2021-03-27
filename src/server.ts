import * as fsPath from 'path';
import * as nunjucks from 'nunjucks';

import {Pod} from './pod';
import {StaticRoute} from './router';

import express = require('express');

export class Server {
  constructor() {}
}

export function createApp(pod: Pod) {
  const app = express();
  app.disable('x-powered-by');
  pod.plugins.trigger('createServer', app);
  app.all('/*', async (req: express.Request, res: express.Response) => {
    try {
      const route = pod.router.resolve(req.path);
      if (!route) {
        res
          .status(404)
          .sendFile(fsPath.join(__dirname, './static/', 'error-no-route.html'));
        return;
      }
      if (route.provider.type === 'static_dir') {
        res.sendFile(
          pod.getAbsoluteFilePath((route as StaticRoute).staticFile.podPath)
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
