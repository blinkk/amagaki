import { Pod, Router } from '../../src';
import { Route } from '../../src/routes';

export interface SampleRouteOptions {
  slug: string;
  view: string;
}

export class SampleRoute extends Route {
  fields: Record<string, any>;
  options: SampleRouteOptions;
  view: string;
  pod: Pod;

  constructor(router: Router, options: SampleRouteOptions) {
    super(router);
    this.pod = router.pod;
    this.options = options;
    this.view = options.view;
    this.fields = {
      slug: options.slug,
    };
  }

  get urlPath() {
    return `/samples/${this.fields.slug}/`;
  }

  async build() {
    const context = {
      doc: this.fields,
      env: this.pod.env,
      pod: this.pod,
      process: process,
    };
    const templateEngine = this.pod.engines.getEngineByFilename(this.view);
    return templateEngine.render(this.view, context);
  }
}

export default function (pod: Pod) {
  ['rex', 'cody', 'jesse'].map(slug => {
    const route = new SampleRoute(pod.router, {
      slug: slug,
      view: '/views/base.njk',
    });
    pod.router.addRoute(route.url.path, route);
  });
}
