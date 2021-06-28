import {Pod, Router} from '../../src';
import {Route, RouteProvider} from '../../src/providers/provider';

export interface SampleRouteProviderOptions {
  slugs: string[];
  view: string;
}

export interface SampleRouteOptions {
  slug: string;
  view: string;
}

export class SampleRouteProvider extends RouteProvider {
  options: SampleRouteProviderOptions;
  static type = 'sample';

  constructor(router: Router, options: SampleRouteProviderOptions) {
    super(router);
    this.options = options;
  }

  async init() {
    this.router.trie.add('/samples/:slug', this);
  }

  async getRoute(params: any): Promise<Route | undefined> {
    return new SampleRoute(this, {
      slug: params.slug,
      view: this.options.view,
    });
  }

  async routes(): Promise<SampleRoute[]> {
    return this.options.slugs.map(slug => {
      return new SampleRoute(this, {
        slug: slug,
        view: this.options.view,
      });
    });
  }
}

export class SampleRoute extends Route {
  fields: Record<string, any>;
  options: SampleRouteOptions;
  view: string;

  constructor(provider: RouteProvider, options: SampleRouteOptions) {
    super(provider);
    this.options = options;
    this.view = options.view;
    this.fields = {
      slug: options.slug,
    };
    this.urlPath = `/samples/${this.fields.slug}/`;
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
  const provider = new SampleRouteProvider(pod.router, {
    slugs: ['rex', 'cody', 'jesse'],
    view: '/views/base.njk',
  });
  pod.router.addProvider(provider);
}
