import {
  Builder,
  DocumentRoute,
  Locale,
  NunjucksTemplateEngine,
  PluginComponent,
  Pod,
  Route,
  RouteProvider,
  Router,
} from '@amagaki/amagaki';

export interface PartialLibraryPluginConfig {
  /**
   * Options for how the document is parsed for gathering partials.
   */
  document?: {
    /**
     * Document field key to use for finding the partials.
     *
     * @default 'partials'
     */
    key?: string;
  };

  /**
   * Options for how the partials are parsed.
   */
  parsing?: {
    /**
     * Directory containing the partials definitions.
     *
     * @default '/views/partials/'
     */
    partialDirectory?: string;
    /**
     * Partial directory contains sub directories of partials.
     *
     * @default false
     */
    partialsInSubDirectories?: boolean;
  };

  /**
   * Options for how the partials are parsed.
   */
  partial?: {
    /**
     * Partial key to use for identifying the partial in use.
     *
     * @default 'partial'
     */
    key?: string;
    /**
     * Ignored partial keys.
     *
     * These partials will not be tracked at all in the library.
     */
    ignored?: string[];
    /**
     * Tracking only partial keys.
     *
     * These partials will not have the full data tracked, just the usage.
     */
    tracked?: string[];
  };

  /**
   * Options for how the partials are served during build.
   */
  serving?: {
    /**
     * Path prefix to build the library at.
     *
     * @default '/library/'
     */
    pathPrefix?: string;
    /**
     * Template to use when building the library.
     *
     * If not provided a default, styleless template will be used.
     */
    template?: string;
    /**
     * Title for the partial library.
     *
     * @default 'Partial Library'
     */
    title?: string;
  };
}

/**
 * Track instances information for a partial.
 */
export class PartialLibraryInstance {
  constructor(
    public readonly config?: Record<string, any>,
    public readonly urlPath?: string,
    public readonly locale?: Locale
  ) {}
}

/**
 * Track all information about the partial and how it is used in the pod.
 */
export class PartialLibraryPartial {
  instances: PartialLibraryInstance[] = [];

  constructor(public readonly key: string) {}

  addInstance(config?: Record<string, any>, urlPath?: string, locale?: Locale) {
    this.instances.push(new PartialLibraryInstance(config, urlPath, locale));
  }

  get length() {
    return this.instances.length;
  }

  get lengthByLocale(): Record<string, number> {
    const result: Record<string, number> = {};

    for (const instance of this.instances) {
      const localeKey = instance.locale?.id ?? 'default';

      if (!result[localeKey]) {
        result[localeKey] = 0;
      }

      result[localeKey]++;
    }

    return result;
  }
}

/**
 * Plugin for tracking and reporting on partials.
 */
export class PartialLibraryPlugin implements PluginComponent {
  /**
   * Helper method for registering the plugin.
   *
   * @param pod Pod instance
   * @param options Options for the partial library
   * @returns Options for the partial library
   */
  static register(
    pod: Pod,
    config: PartialLibraryPluginConfig
  ): PartialLibraryPluginConfig {
    // Ignore the library on prod.
    if (pod.env.name === 'prod') {
      return undefined;
    }

    pod.plugins.register(PartialLibraryPlugin, config ?? {});
    return config;
  }

  constructor(public pod: Pod, public config: PartialLibraryPluginConfig) {
    // Add the route provider for the partial library.
    const provider = new PartialLibraryRouteProvider(
      this.pod.router,
      this.config
    );
    pod.router.addProvider(provider);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async beforeBuildHook(builder: Builder) {
    // Stub to be recognized as a plugin component.
  }
}

class PartialLibraryPartialTracker {
  partials: Record<string, PartialLibraryPartial> = {};

  constructor(public config: PartialLibraryPluginConfig) {}

  addPartialInstance(
    key: string,
    partialConfig: Record<string, any>,
    urlPath?: string,
    locale?: Locale
  ) {
    if (!(key in this.partials)) {
      this.partials[key] = new PartialLibraryPartial(key);
    }

    // Ignore the ignored partials.
    if (this.config.partial?.ignored?.includes(key)) {
      return;
    }

    // Track only (no config) for the tracked partials.
    if (this.config.partial?.tracked?.includes(key)) {
      this.partials[key].addInstance(undefined, urlPath, locale);
      return;
    }

    this.partials[key].addInstance(partialConfig, urlPath, locale);
  }
}

/**
 * Custom route provider for the partial library.
 */
class PartialLibraryRouteProvider extends RouteProvider {
  constructor(router: Router, public config: PartialLibraryPluginConfig) {
    super(router);
    this.type = 'partialLibrary';
  }

  async routes() {
    const routes = [];
    const partialDirectory =
      this.config.parsing?.partialDirectory ?? '/views/partials';
    const podPaths = this.pod.walk(partialDirectory);
    const partials: Set<string> = new Set();
    for (const podPath of podPaths) {
      const useSubDirectories =
        this.config.parsing?.partialsInSubDirectories ?? false;

      // Some pods use the directory as the name of the partial.
      // Ex: /src/partials/<partialName>/...
      if (useSubDirectories) {
        const dirParts = podPath.replace(partialDirectory, '').split('/');

        // If does not have multiple parts it is a single file, ignore it.
        if (dirParts.length > 1) {
          const partialKey = dirParts[0];

          // Ignore the ignored partials.
          if (!this.config.partial?.ignored?.includes(partialKey)) {
            partials.add(partialKey);
          }
        }
      } else {
        const partialKey = podPath.split('/').pop().split('.')[0];

        // Ignore the ignored partials.
        if (!this.config.partial?.ignored?.includes(partialKey)) {
          partials.add(partialKey);
        }
      }
    }
    routes.push(new PartialLibraryRoute(this, this.config, {}));
    partials.forEach(partial => {
      routes.push(
        new PartialLibraryReviewRoute(this, this.config, {
          partial: partial,
        })
      );
    });
    return routes;
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface PartialLibraryRouteOptions {}

interface PartialLibraryReviewRouteOptions extends PartialLibraryRouteOptions {
  partial: string;
}

class PartialLibraryRoute extends Route {
  constructor(
    public provider: RouteProvider,
    public config: PartialLibraryPluginConfig,
    public options: PartialLibraryRouteOptions
  ) {
    super(provider);
  }

  get path() {
    return this.urlPath;
  }

  get urlPath() {
    return this.urlPathBase;
  }

  get urlPathBase() {
    return this.config.serving?.pathPrefix ?? '/library/';
  }

  // Search through the routes to find all documents and pull out the partials.
  async trackPartials(): Promise<PartialLibraryPartialTracker> {
    const tracker = new PartialLibraryPartialTracker(this.config);
    const routes = await this.pod.router.routes();

    // Routes are not sorted by default, but we want to sort the partial usage
    // by path.
    const pathToRoute: Record<string, DocumentRoute> = {};

    for (const route of routes) {
      if (route.provider.type === 'collection' && route.urlPath) {
        pathToRoute[route.urlPath] = route as DocumentRoute;
      }
    }

    // Sort the routes by path and find all partials.
    for (const urlPath of Object.keys(pathToRoute).sort()) {
      const docRoute = pathToRoute[urlPath];
      const docPartials =
        docRoute.doc.fields[this.config.document?.key ?? 'partials'] ?? [];

      for (const partialConfig of docPartials) {
        const partialKey = this.config.partial?.key ?? 'partial';
        const partial = partialConfig[partialKey];
        tracker.addPartialInstance(
          partial,
          partialConfig,
          docRoute.urlPath,
          docRoute.locale
        );
      }
    }

    return tracker;
  }

  async build() {
    const tracker = await this.trackPartials();
    return await this.buildFake({
      partials: tracker.partials,
    });
  }

  async buildFake(fields: Record<string, any>) {
    const fakeDoc = {
      fields: {
        ...fields,
        title: this.config.serving?.title ?? 'Partial Library',
        library: {
          url: {
            path: this.urlPathBase,
          },
        },
      },
      locale: this.pod.locale('en'),
      url: {
        path: this.urlPath,
      },
    };
    const template = this.config.serving?.template ?? '/views/base.njk';
    const engine = this.provider.pod.engines.getEngineByFilename(
      template
    ) as NunjucksTemplateEngine;
    return await engine.render(template, {
      doc: fakeDoc,
      env: this.provider.pod.env,
      pod: this.provider.pod,
      process: process,
    });
  }
}

class PartialLibraryReviewRoute extends PartialLibraryRoute {
  constructor(
    public provider: RouteProvider,
    public config: PartialLibraryPluginConfig,
    public options: PartialLibraryReviewRouteOptions
  ) {
    super(provider, config, options);
  }

  get urlPath() {
    return `${this.urlPathBase}${this.options.partial}/`;
  }

  async build() {
    const tracker = await this.trackPartials();
    return await this.buildFake({
      partials: tracker.partials,
      partial: this.options.partial,
    });
  }
}
