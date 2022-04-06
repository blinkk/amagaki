import {
  Document,
  Pod,
  Route,
  RouteProvider,
  Router,
  TemplateContext,
  Url,
  interpolate,
  splitFrontMatter,
} from '@amagaki/amagaki';
import {PageBuilder, PageBuilderOptions} from './page-builder';

import fs from 'fs';
import path from 'path';

interface PartialPreviewRouteProviderOptions {
  pageBuilderOptions: PageBuilderOptions;
}

interface PartialPreviewRouteOptions {
  partial: Partial;
  pageBuilderOptions: PageBuilderOptions;
}

interface Partial {
  basename: string;
  name: string;
  podPath: string;
}

interface PartialGalleryRouteOptions {
  partials: Partial[];
  pageBuilderOptions: PageBuilderOptions;
}

export class PartialPreviewRouteProvider extends RouteProvider {
  options: PartialPreviewRouteProviderOptions;
  partialsBasePath: string;
  type: string;
  pod: Pod;

  constructor(router: Router, options: PartialPreviewRouteProviderOptions) {
    super(router);
    this.type = 'partialPreview';
    this.options = options;
    this.partialsBasePath = this.pod.fileExists('/src/partials') ? '/src/partials' : '/views/partials';
  }

  static register(pod: Pod, options: PartialPreviewRouteProviderOptions) {
    const provider = new PartialPreviewRouteProvider(pod.router, options);
    pod.router.addProvider(provider);
    return provider;
  }

  get partialNames() {
    return fs.readdirSync(this.pod.getAbsoluteFilePath(this.partialsBasePath)).map(filename => filename.split('.')[0]);
  }

  async routes(): Promise<Route[]> {
    const pathFormats = this.options?.pageBuilderOptions?.partialPaths?.view ?? ['/views/partials/${partial.partial}.njk'];
    const routes: Route[] = [];
    const partials = [];
    for (const filename of this.partialNames) {
      const podPath = PageBuilder.selectPodPath(this.pod, pathFormats, filename);
      if (podPath) {
        partials.push({
          podPath: podPath,
          name: filename.split('.')[0],
          basename: filename,
        });
      }
    };
    routes.push(new PartialGalleryRoute(this, {
      partials: partials,
      pageBuilderOptions: this.options.pageBuilderOptions,
    }));
    partials.forEach(partial => {
      routes.push(
        new PartialPreviewRoute(this, {
          partial: partial,
          pageBuilderOptions: this.options.pageBuilderOptions,
        })
      );
    });
    return routes;
  }
}

class PartialGalleryRoute extends Route {
  options: PartialGalleryRouteOptions;
  provider: PartialPreviewRouteProvider;
  pod: Pod;

  constructor(provider: PartialPreviewRouteProvider, options: PartialGalleryRouteOptions) {
    super(provider);
    this.provider = provider;
    this.options = options;
  }

  get path() {
    return this.urlPath;
  }

  get urlPath() {
    return '/preview/';
  }

  async build() {
    const partial = path.join(__dirname, 'ui', 'partial-preview-gallery.njk');
    const partials: Record<string, any>[] = [
      {
        partial: {
          partial: 'partial-preview-gallery',
          includeInspector: false,
          absolutePath: partial,
        },
        partials: this.provider.partialNames,
      },
    ];
    const fakeDoc = {
      constructor: {name: 'Document'},
      pod: this.provider.pod,
      podPath: '',
      locales: [],
      fields: {
        title: `Preview Gallery`,
        partials: partials,
      },
      defaultLocale: this.pod.locale('en'),
      locale: this.pod.locale('en'),
      url: new Url({
        path: this.urlPath,
        env: this.pod.env,
      }),
    } as unknown as Document; 
    const context: TemplateContext = {
      doc: fakeDoc,
      env: this.provider.pod.env,
      pod: this.provider.pod,
      process: process,
    };
    const builder = new PageBuilder(fakeDoc, context, this.options.pageBuilderOptions);
    return await builder.buildDocument();
  }
}


const findMockInstances = async (pod: Pod, partial: string) => {
  const docs = pod.docs('/content/**');
  const mocks = [];
  for (const doc of docs) {
    if (!doc?.fields?.partials) {
      continue;
    }
    // @ts-ignore
    await doc.resolveFields();
    for (const item of doc.fields.partials) {
      if (item.partial === partial) {
        mocks.push(item);
      }
    }
  }
  return mocks;
};


class PartialPreviewRoute extends Route {
  options: PartialPreviewRouteOptions;
  pod: Pod;
  provider: RouteProvider;

  constructor(provider: RouteProvider, options: PartialPreviewRouteOptions) {
    super(provider);
    this.provider = provider;
    this.options = options;
  }
  get path() {
    return this.urlPath;
  }
  get urlPath() {
    return `/preview/${this.options.partial.name}/`;
  }
  async build() {
    const {frontMatter} = splitFrontMatter(
      this.provider.pod.readFile(this.options.partial.podPath)
    );
    const mockData = frontMatter ? this.pod.readYamlString(frontMatter) || {} : {};
    const mocks = [
      ...(mockData?.mocks ?? []),
      ...(await findMockInstances(this.pod, this.options.partial.name)),
    ];
    const partials = [];
    const partial = path.join(__dirname, 'ui', 'partial-preview-spacer.njk');
    partials.push({
      partial: {
        partial: 'preview-spacer',
        includeInspector: false,
        absolutePath: partial,
      },
    });
    for (const [mockName, mockData] of Object.entries(mocks)) {
      const mock = {
        partial: this.options.partial.name,
      };
      partials.push(Object.assign(mock, mockData));
      partials.push({
        partial: {
          partial: 'preview-spacer',
          includeInspector: false,
          absolutePath: partial,
        },
      });
    }
    const fakeDoc = ({
      constructor: {name: 'Document'},
      pod: this.provider.pod,
      podPath: '',
      locales: [],
      fields: {
        title: `${this.options.partial.name} – Preview`,
        partials: partials,
      },
      defaultLocale: this.pod.locale('en'),
      locale: this.pod.locale('en'),
      url: new Url({
        path: this.urlPath,
        env: this.pod.env,
      }),
    } as unknown) as Document;
    const context: TemplateContext = {
      doc: fakeDoc,
      env: this.provider.pod.env,
      pod: this.provider.pod,
      process: process,
    };
    const builder = new PageBuilder(
      fakeDoc,
      context,
      this.options.pageBuilderOptions
    );
    return await builder.buildDocument();
  }
}
