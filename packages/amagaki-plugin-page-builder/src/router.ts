import {Pod, RouteProvider} from '@amagaki/amagaki';

import fs from 'fs';
import path from 'path';

/**
 * Serves the static files required by the page builder UI.
 */
export class PageBuilderStaticRouteProvider extends RouteProvider {
  static urlBase = '/_page-builder';

  static scripts = ['page-builder-ui.min.js'];

  static files = [
    ...PageBuilderStaticRouteProvider.scripts,
    'page-builder-ui.min.css',
  ];

  static dirs = ['assets'];

  static register(pod: Pod) {
    // TODO: This may be better implemented as a refactor of the
    // StaticDirectoryRouteProvider. That route provider, however, only supports
    // files contained within the pod (and not external to the pod), so it
    // cannot be used here without being refactored.
    pod.router.addRoutes('pageBuilder', async (provider: RouteProvider) => {
      const files = [
        ...PageBuilderStaticRouteProvider.files,
        ...fs
          .readdirSync(path.join(__dirname, 'ui', 'assets'))
          .map(file => `assets/${file}`),
      ];
      for (const file of files) {
        provider.addRoute({
          urlPath: `${PageBuilderStaticRouteProvider.urlBase}/${file}`,
          build: async () => {
            return fs.readFileSync(path.join(__dirname, 'ui', file), 'utf8');
          },
        });
      }
    });
  }
}
