import {
  Pod,
  RouteProvider,
  ServerPlugin,
} from '@amagaki/amagaki';

import express from 'express';

export class PageBuilderStaticRouteProvider extends RouteProvider {

  static urlBase = '/_page-builder';

  static scripts = [
    'page-builder-ui.min.js',
  ]
  
  static register(pod: Pod) {
    const server = pod.plugins.get('ServerPlugin') as ServerPlugin;
    server.register(async (app) => {
      app.use(PageBuilderStaticRouteProvider.urlBase, express.static(__dirname + '/ui'));
    });
  }
}
