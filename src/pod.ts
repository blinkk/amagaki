import * as utils from './utils';
import * as yaml from 'js-yaml';

import {Collection, CollectionListOptions} from './collection';
import {Document, DocumentListOptions} from './document';
import {Environment, EnvironmentOptions} from './environment';
import {Locale, LocaleSet} from './locale';
import {PluginConstructor, Plugins} from './plugins';
import {Router, StaticDirConfig} from './router';
import {StringOptions, TranslationString} from './string';
import {YamlPlugin, YamlTypeManager} from './plugins/yaml';
import {existsSync, readFileSync} from 'fs';
import {join, resolve} from 'path';

import {Builder} from './builder';
import {Cache} from './cache';
import {NunjucksPlugin} from './plugins/nunjucks';
import {Profiler} from './profile';
import {ServerPlugin} from './plugins/server';
import {StaticFile} from './static';
import {TemplateEngineManager} from './templateEngine';

export interface LocalizationConfig {
  defaultLocale?: string;
  locales?: Array<string>;
}

export interface MetadataConfig {
  name: string;
  [x: string]: any;
}

export interface PodConfig {
  basePath?: string;
  localization?: LocalizationConfig;
  meta: MetadataConfig;
  staticRoutes?: Array<StaticDirConfig>;
  environments?: Record<string, EnvironmentOptions>;
}

/**
 * Pods are the "command center" for all operations within a site. Pods hold
 * references to things like the build environment, template engines, file
 * system accessors, routes, etc. Pods provide an interaction model for accessing
 * the different elements of a site and operating on them.
 */
export class Pod {
  static BuiltInPlugins: Array<PluginConstructor> = [
    NunjucksPlugin,
    ServerPlugin,
    YamlPlugin,
  ];
  static DefaultLocalization: LocalizationConfig = {
    defaultLocale: 'en',
    locales: ['en'],
  };
  static DefaultConfigFile = 'amagaki.js';
  static DefaultContentPodPath = '/content/';
  readonly builder: Builder;
  readonly cache: Cache;
  config: PodConfig;
  readonly engines: TemplateEngineManager;
  readonly env: Environment;
  readonly profiler: Profiler;
  readonly plugins: Plugins;
  readonly root: string;
  readonly router: Router;

  constructor(root: string, environmentOptions?: EnvironmentOptions) {
    // Anything that occurs in the Pod constructor must be very lightweight.
    // Instantiating a pod should have no side effects and must be immediate.
    this.root = resolve(root);
    this.profiler = new Profiler();
    this.plugins = new Plugins(this);
    this.engines = new TemplateEngineManager(this);
    this.builder = new Builder(this);
    this.router = new Router(this);
    this.env = new Environment(
      environmentOptions || {
        host: 'localhost',
        name: 'default',
        scheme: 'https',
        dev: false,
      }
    );
    this.config = {
      meta: {
        name: 'Amagaki pod',
      },
    };
    this.cache = new Cache(this);

    // Register built-in plugins before the amagaki.js config to be consistent with
    // external plugin hooks and allow external plugins to work with the built-in
    // plugins.
    for (const BuiltInPlugin of Pod.BuiltInPlugins) {
      this.plugins.register(BuiltInPlugin, {});
    }

    // Setup the pod using the amagaki.js file.
    if (this.fileExists(Pod.DefaultConfigFile)) {
      const configFilename = this.getAbsoluteFilePath(Pod.DefaultConfigFile);
      // tslint:disable-next-line
      const amagakiConfigFunc: Function = require(configFilename);
      amagakiConfigFunc(this);
    }
  }

  toString() {
    return `[Pod: ${this.root}]`;
  }

  /**
   * Returns a collection object. If no `_collection.yaml` file is found within
   * the requested directory, the directory will be walked upwards until finding
   * a directory containing a `_collection.yaml` file. If no `_collection.yaml`
   * is found, no collection will be returned.
   * @param podPath The podPath to the collection.
   */
  collection(podPath: string) {
    if (this.cache.collections[podPath]) {
      return this.cache.collections[podPath];
    }
    const collection = Collection.find(this, podPath);
    if (!collection) {
      return null;
    }
    this.cache.collections[podPath] = collection;
    return this.cache.collections[podPath];
  }

  /**
   * Configures a configuration update on the pod based on the provided
   * config. Should only be called once on a pod.
   * @param config Pod configuration value.
   */
  configure(config: PodConfig) {
    // TODO: Validate the configuration.
    this.config = config;

    if (this.config.staticRoutes) {
      // Remove the default static routes.
      this.router.providers['static_dir'] = [];
      this.router.addStaticDirectoryRoutes(this.config.staticRoutes);
    }
  }

  /**
   * Returns the base URL path where the site is "mounted". This property is
   * meant to be used in conjunction with the `$path` configuration in content.
   *
   * For example, if you want to generate your site to: `/mysite/`,
   * `/mysite/about/`, `/mysite/static/main.css`, etc. You would use in
   * `_collection.yaml`:
   *
   * $path: /${pod.basePath}/${doc.basename}/
   */
  get basePath() {
    return this.config?.basePath;
  }

  /**
   * Returns the default locale for the pod. The default locale can be
   * overwritten in `amagaki.js`.
   */
  get defaultLocale() {
    return this.locale(
      this.localization.defaultLocale ||
        (Pod.DefaultLocalization.defaultLocale as string)
    );
  }

  /**
   * Returns a document object.
   * @param podPath The podPath to the document.
   * @param locale The document's locale. If not provided, the pod's default
   * locale will be used to return the document.
   */
  doc(podPath: string, locale?: Locale) {
    locale = locale || this.defaultLocale;
    const key = `${podPath}${locale.id}`;
    if (this.cache.docs[key]) {
      return this.cache.docs[key];
    }
    this.cache.docs[key] = new Document(this, podPath, locale);
    return this.cache.docs[key];
  }

  /**
   * Lists collections using glob patterns, as outlined by the [`glob`
   * module](https://github.com/isaacs/node-glob#glob-primer).
   *
   * Various techniques can be used to list collections depending on your needs:
   *
   * ```
   * // All top-level collections:
   * pod.collections('/content/**')
   *
   * // All top-level collections, sorted by the field "order":
   * pod.collections('/content/**', {sort: 'order'})
   *
   * // Both the "pages" and "posts" collections:
   * pod.collections(['/content/posts/*', '/content/pages/*'])
   *
   * @param patterns A list of glob patterns or a single glob pattern. If
   * nothing is supplied, all docs within the pod will be returned.
   */
  collections(patterns?: string[], options?: CollectionListOptions) {
    return Collection.list(this, patterns, options);
  }

  /**
   * Lists documents using glob patterns, as outlined by the [`glob`
   * module](https://github.com/isaacs/node-glob#glob-primer).
   *
   * Note the following behavior:
   * - Files prefixed with `_` are ignored.
   * - Only files with supported doc extensions are returned.
   *
   * Various techniques can be used to list docs depending on your needs:
   *
   * ```
   * // All docs within the "pages" collection:
   * pod.docs('/content/pages/**')
   *
   * // Only Markdown docs within the "pages" collection:
   * pod.docs('/content/pages/**\/*.md')
   *
   * // All docs within both the "pages" and "posts" collections:
   * pod.docs(['/content/pages/**', '/content/posts/**'])
   *
   * // All Markdown docs within the entire pod:
   * pod.docs('**\/*.md')
   *
   * // All docs named `index.yaml` within the entire pod:
   * pod.docs('**\/index.yaml')
   * ```
   * @param patterns A list of glob patterns or a single glob pattern. If
   * nothing is supplied, all docs within the pod will be returned.
   */
  docs(patterns?: string[] | string, options?: DocumentListOptions) {
    return Document.list(this, patterns, options);
  }

  /**
   * Returns whether a file exists within the pod.
   * @param podPath The podPath to the file.
   */
  fileExists(podPath: string) {
    const timer = this.profiler.timer('file.exists', 'File exists');
    try {
      return existsSync(this.getAbsoluteFilePath(podPath));
    } finally {
      timer.stop();
    }
  }

  /**
   * Returns the absolute file path on the file system.
   * @param podPath The podPath to the file or directory.
   */
  getAbsoluteFilePath(podPath: string) {
    podPath = podPath.replace(/^\/+/, '');
    return join(this.root, podPath);
  }

  /**
   * Returns a locale object.
   * @param id The locale identifier code.
   */
  locale(id: string) {
    if (this.cache.locales[id]) {
      return this.cache.locales[id];
    }
    this.cache.locales[id] = new Locale(this, id);
    return this.cache.locales[id];
  }

  /**
   * Returns a set of the pod's global locales. Global locales are defined in
   * `amagaki.js`.
   */
  get locales(): Set<Locale> {
    return LocaleSet.fromIds(this.localization.locales || [], this);
  }

  /**
   * Returns the pod's global localization configuration.
   */
  get localization(): LocalizationConfig {
    return this.config.localization || Pod.DefaultLocalization;
  }

  /**
   * Returns the meta information from the pod config.
   */
  get meta(): MetadataConfig {
    return this.config.meta;
  }

  readFile(path: string) {
    const timer = this.profiler.timer('file.read', 'File read');
    try {
      return readFileSync(this.getAbsoluteFilePath(path), 'utf8');
    } finally {
      timer.stop();
    }
  }

  readYaml(podPath: string) {
    if (this.cache.yamls[podPath]) {
      return this.cache.yamls[podPath];
    }

    const timer = this.profiler.timer('yaml.load', 'Yaml load');
    try {
      this.cache.yamls[podPath] = yaml.load(this.readFile(podPath), {
        schema: this.yamlSchema,
      });
    } finally {
      timer.stop();
    }

    return this.cache.yamls[podPath];
  }

  readYamlString(content: string, cacheKey: string) {
    if (this.cache.yamlStrings[cacheKey]) {
      return this.cache.yamlStrings[cacheKey];
    }

    const timer = this.profiler.timer('yaml.load', 'Yaml load');
    try {
      this.cache.yamlStrings[cacheKey] = yaml.load(content, {
        schema: this.yamlSchema,
      });
    } finally {
      timer.stop();
    }

    return this.cache.yamlStrings[cacheKey];
  }

  /**
   * Returns a static file object.
   * @param podPath The podPath to the static file.
   */
  staticFile(podPath: string) {
    if (this.cache.staticFiles[podPath]) {
      return this.cache.staticFiles[podPath];
    }
    this.cache.staticFiles[podPath] = new StaticFile(this, podPath);
    return this.cache.staticFiles[podPath];
  }

  /**
   * Returns a translation string object.
   * @param options The options of the translation string.
   */
  string(options: StringOptions, locale?: Locale) {
    locale = locale || this.defaultLocale;
    if (this.cache.strings[options.value]) {
      return this.cache.strings[options.value];
    }
    this.cache.strings[options.value] = new TranslationString(
      this,
      options,
      locale
    );
    return this.cache.strings[options.value];
  }

  /**
   * Sets the environment using settings specified from one of the
   * preconfigured environments in `amagaki.js`. This is useful for changing
   * behavior depending on your build environment, such as outputting different
   * content between dev, staging, and prod.
   */
  setEnvironment(name: string) {
    if (!this.config.environments?.[name]) {
      throw new Error(`Environment ${name} is not configured in amagaki.js.`);
    }
    this.env.name = name;
    this.env.updateFromConfig(this.config.environments[name]);
  }

  /**
   * Walks a podPath directory an returns a flattened list of podPaths within
   * that directory, recursively in a flat list. For example, if walking
   * `/content/pages/`, it might return: `/content/pages/index.yaml`,
   * `/content/pages/subpages/index.yaml`, etc. */
  walk(podPath: string) {
    return utils.walk(this.getAbsoluteFilePath(podPath), [], this.root);
  }

  /**
   * Returns the YAML schema used to serialize and deserialize all YAML
   * documents that go through the pod.
   */
  get yamlSchema(): yaml.Schema {
    if (this.cache.yamlSchema) {
      return this.cache.yamlSchema;
    }

    const timer = this.profiler.timer('yaml.schema', 'Yaml schema');
    try {
      const yamlTypeManager = new YamlTypeManager();
      this.plugins.trigger('createYamlTypes', yamlTypeManager);
      this.cache.yamlSchema = yaml.DEFAULT_SCHEMA.extend(yamlTypeManager.types);
    } finally {
      timer.stop();
    }

    return this.cache.yamlSchema as yaml.Schema;
  }
}
