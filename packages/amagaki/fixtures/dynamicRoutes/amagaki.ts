import {Pod, RouterPlugin} from '../../src';
import { BuildRouteOptions } from '../../src/routes';

export default function (pod: Pod) {
  pod.router.add('/:slug', {
    urlPath: '/:slug',
    build: async (options: BuildRouteOptions) => `<title>${options.params.slug}</title>`,
    // Will be built, but not served.
    getStaticPaths: async () => {
      return ['/static-1/', '/static-2/', '/static-3/'];
    }
  });
}
