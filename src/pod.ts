import * as utils from './utils';
import * as yaml from 'js-yaml';
import {Locale, LocaleSet} from './locale';
import {StringOptions, TranslationString} from './string';
import {existsSync, readFileSync} from 'fs';
import {Builder} from './builder';
import Cache from './cache';
import {Collection} from './collection';
import {Document} from './document';
import {Environment} from './environment';
import {Profiler} from './profile';
import {Router} from './router';
import {StaticFile} from './static';
import {getRenderer} from './renderer';
import {join} from 'path';

/**
 * Pods are the "command center" for all operations within a site. Pods hold
 * references to things like the build environment, template engines, file
 * system accessors, routes, etc. Pods provide an interaction model for accessing
 * the different elements of a site and operating on them.
 */
export class Pod {
  static DefaultLocale = 'en';
  readonly builder: Builder;
  readonly cache: Cache;
  readonly env: Environment;
  readonly profiler: Profiler;
  readonly root: string;
  readonly router: Router;

  constructor(root: string) {
    // Anything that occurs in the Pod constructor must be very lightweight.
    // Instantiating a pod should have no side effects and must be immediate.
    this.root = root;
    this.profiler = new Profiler();
    this.builder = new Builder(this);
    this.router = new Router(this);
    this.env = new Environment({
      host: 'localhost',
      name: 'default',
      scheme: 'http',
      dev: true,
    });
    this.cache = new Cache(this);
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
   * Returns the default locale for the pod. The default locale can be
   * overwritten in `amagaki.yaml`.
   */
  get defaultLocale() {
    return this.locale(Pod.DefaultLocale);
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
   * `amagaki.yaml`.
   */
  get locales(): Set<Locale> {
    // TODO: Replace with amagaki.yaml?locales.
    return new LocaleSet();
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
   * Returns a template renderer used for a template engine.
   * @param path The renderer's file extension, without a leading dot. Example: "njk".
   */
  renderer(path: string) {
    const rendererClass = getRenderer(path);
    return new rendererClass(this);
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
  string(options: StringOptions) {
    if (this.cache.strings[options.value]) {
      return this.cache.strings[options.value];
    }
    this.cache.strings[options.value] = new TranslationString(this, options);
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
  get yamlSchema() {
    if (this.cache.yamlSchema) {
      return this.cache.yamlSchema;
    }

    const timer = this.profiler.timer('yaml.schema', 'Yaml schema');
    try {
      this.cache.yamlSchema = utils.createYamlSchema(this);
    } finally {
      timer.stop();
    }

    return this.cache.yamlSchema;
  }
}
