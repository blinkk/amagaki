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
import {Router} from './router';
import {StaticFile} from './static';
import {getRenderer} from './renderer';
import {join} from 'path';
import profiler from './profile';

const storageExistsTimers = profiler.timersFor(
  'storage.exists',
  'Storage exists'
);
const storageExistsFunc = storageExistsTimers.wrap(existsSync);
const storageReadTimers = profiler.timersFor('storage.read', 'Storage read');
const storageReadFunc = storageReadTimers.wrap(readFileSync);
const yamlLoadTimers = profiler.timersFor('yaml.load', 'Yaml load');
const yamlLoadFunc = yamlLoadTimers.wrap(yaml.load);

export class Pod {
  static DefaultLocale = 'en';
  builder: Builder;
  cache: Cache;
  env: Environment;
  root: string;
  router: Router;

  constructor(root: string) {
    // Anything that occurs in the Pod constructor must be very lightweight.
    // Instantiating a pod should have no side effects and must be immediate.
    this.root = root;
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
    return storageExistsFunc(this.getAbsoluteFilePath(path));
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

  readFile(path: string) {
    return storageReadFunc(this.getAbsoluteFilePath(path), 'utf8');
  }

  readYaml(path: string) {
    if (this.cache.yamls[path]) {
      return this.cache.yamls[path];
    }
    this.cache.yamls[path] = yamlLoadFunc(this.readFile(path), {
      schema: this.yamlSchema,
    });
    return this.cache.yamls[path];
  }

  readYamlString(content: string, cacheKey: string) {
    if (this.cache.yamlStrings[cacheKey]) {
      return this.cache.yamlStrings[cacheKey];
    }

    this.cache.yamlStrings[cacheKey] = yamlLoadFunc(content, {
      schema: this.yamlSchema,
    });
    return this.cache.yamlStrings[cacheKey];
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

  get yamlSchema() {
    if (this.cache.yamlSchema) {
      return this.cache.yamlSchema;
    }
    this.cache.yamlSchema = utils.createYamlSchema(this);
    return this.cache.yamlSchema;
  }
}
