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

export class Pod {
  static DefaultLocale = 'en';
  builder: Builder;
  cache: Cache;
  env: Environment;
  readonly profiler: Profiler;
  root: string;
  router: Router;

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

  get defaultLocale() {
    return this.locale(Pod.DefaultLocale);
  }

  doc(path: string, locale?: Locale) {
    locale = locale || this.defaultLocale;
    const key = `${path}${locale.id}`;
    if (this.cache.docs[key]) {
      return this.cache.docs[key];
    }
    this.cache.docs[key] = new Document(this, path, locale);
    return this.cache.docs[key];
  }

  fileExists(path: string) {
    const timer = this.profiler.timer('file.exists', 'File exists');
    try {
      return existsSync(this.getAbsoluteFilePath(path));
    } finally {
      timer.stop();
    }
  }

  fileRead(path: string) {
    const timer = this.profiler.timer('file.read', 'File read');
    try {
      return readFileSync(this.getAbsoluteFilePath(path), 'utf8');
    } finally {
      timer.stop();
    }
  }

  getAbsoluteFilePath(path: string) {
    path = path.replace(/^\/+/, '');
    return join(this.root, path);
  }

  locale(id: string) {
    if (this.cache.locales[id]) {
      return this.cache.locales[id];
    }
    this.cache.locales[id] = new Locale(this, id);
    return this.cache.locales[id];
  }

  get locales(): Set<Locale> {
    // TODO: Replace with amagaki.yaml?locales.
    return new LocaleSet();
  }

  renderer(path: string) {
    const rendererClass = getRenderer(path);
    return new rendererClass(this);
  }

  staticFile(path: string) {
    if (this.cache.staticFiles[path]) {
      return this.cache.staticFiles[path];
    }
    this.cache.staticFiles[path] = new StaticFile(this, path);
    return this.cache.staticFiles[path];
  }

  string(options: StringOptions) {
    if (this.cache.strings[options.value]) {
      return this.cache.strings[options.value];
    }
    this.cache.strings[options.value] = new TranslationString(this, options);
    return this.cache.strings[options.value];
  }

  walk(path: string) {
    return utils.walk(this.getAbsoluteFilePath(path), [], this.root);
  }

  yamlRead(path: string) {
    if (this.cache.yamls[path]) {
      return this.cache.yamls[path];
    }

    const timer = this.profiler.timer('yaml.load', 'Yaml load');
    try {
      this.cache.yamls[path] = yaml.load(this.fileRead(path), {
        schema: this.yamlSchema,
      });
    } finally {
      timer.stop();
    }

    return this.cache.yamls[path];
  }

  yamlReadString(content: string, cacheKey: string) {
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
