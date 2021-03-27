import * as utils from './utils';
import * as yaml from 'js-yaml';

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
import {Collection} from './collection';
import {Document} from './document';
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
  meta: MetadataConfig;
  localization?: LocalizationConfig;
  staticRoutes?: Array<StaticDirConfig>;
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
        scheme: 'http',
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

  /**
   * Returns a collection object. If no `_collection.yaml` file is found within
   * the requested directory, the directory will be walked upwards until finding
   * a directory containing a `_collection.yaml` file. If no `_collection.yaml`
   * is found, no collection will be returned.
   * @param path The podPath to the collection.
   */
  collection(path: string) {
    if (this.cache.collections[path]) {
      return this.cache.collections[path];
    }
    const collection = Collection.find(this, path);
    if (!collection) {
      return null;
    }
    this.cache.collections[path] = collection;
    return this.cache.collections[path];
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
   * @param path The podPath to the document.
   * @param locale The document's locale. If not provided, the pod's default
   * locale will be used to return the document.
   */
  doc(path: string, locale?: Locale) {
    locale = locale || this.defaultLocale;
    const key = `${path}${locale.id}`;
    if (this.cache.docs[key]) {
      return this.cache.docs[key];
    }
    this.cache.docs[key] = new Document(this, path, locale);
    return this.cache.docs[key];
  }

  /**
   * Returns whether a file exists within the pod.
   * @param path The podPath to the file.
   */
  fileExists(path: string) {
    const timer = this.profiler.timer('file.exists', 'File exists');
    try {
      return existsSync(this.getAbsoluteFilePath(path));
    } finally {
      timer.stop();
    }
  }

  /**
   * Returns the absolute file path on the file system.
   * @param path The podPath to the file or directory.
   */
  getAbsoluteFilePath(path: string) {
    path = path.replace(/^\/+/, '');
    return join(this.root, path);
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
    return new LocaleSet(
      (this.localization.locales || []).map((locale: string) => {
        return this.locale(locale);
      })
    );
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

  readYaml(path: string) {
    if (this.cache.yamls[path]) {
      return this.cache.yamls[path];
    }

    const timer = this.profiler.timer('yaml.load', 'Yaml load');
    try {
      this.cache.yamls[path] = yaml.load(this.readFile(path), {
        schema: this.yamlSchema,
      });
    } finally {
      timer.stop();
    }

    return this.cache.yamls[path];
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
   * @param path The podPath to the static file.
   */
  staticFile(path: string) {
    if (this.cache.staticFiles[path]) {
      return this.cache.staticFiles[path];
    }
    this.cache.staticFiles[path] = new StaticFile(this, path);
    return this.cache.staticFiles[path];
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
   * Walks a podPath directory an returns a flattened list of podPaths within
   * that directory, recursively in a flat list. For example, if walking
   * `/content/pages/`, it might return: `/content/pages/index.yaml`,
   * `/content/pages/subpages/index.yaml`, etc. */
  walk(path: string) {
    return utils.walk(this.getAbsoluteFilePath(path), [], this.root);
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
