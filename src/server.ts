import express = require('express');
import {Pod} from './pod';
export class Server {
  constructor() {}
}

export function createApp(pod: Pod) {
  console.log('Starting server');

  const app = express();
  app.disable('x-powered-by');
  app.all('/*', async (req: express.Request, res: express.Response) => {
    const [route, params] = pod.router.resolve(req.path);
    if (!route) {
      res.sendStatus(404);
      return;
    }
    const content = await route.build();
    res.set('Content-Type', route.getContentType());
    res.send(content);
  });

  return app;
}
