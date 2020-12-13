import {Builder} from './builder';
import {Document} from './document';
import {existsSync, readFileSync} from 'fs';
import {Router} from './router';
import {join} from 'path';
import {getRenderer} from './renderer';
import {Environment} from './environment';
import {Collection} from './collection';
import * as yaml from 'js-yaml';
import * as utils from './utils';
import {StaticFile} from './static';
import Cache from './cache';
import {Locale} from './locale';

export class Pod {
  builder: Builder;
  root: string;
  router: Router;
  env: Environment;
  cache: Cache;
  static DefaultLocale = 'en';

  constructor(root: string) {
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

  locale(id: string) {
    return new Locale(this, id);
  }

  doc(path: string) {
    if (this.cache.docs[path]) {
      return this.cache.docs[path];
    }
    this.cache.docs[path] = new Document(this, path);
    return this.cache.docs[path];
  }

  staticFile(path: string) {
    if (this.cache.staticFiles[path]) {
      return this.cache.staticFiles[path];
    }
    this.cache.staticFiles[path] = new StaticFile(this, path);
    return this.cache.staticFiles[path];
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

  renderer(path: string) {
    const rendererClass = getRenderer(path);
    return new rendererClass(this);
  }

  readFile(path: string) {
    return readFileSync(this.getAbsoluteFilePath(path), 'utf8');
  }

  fileExists(path: string) {
    return existsSync(this.getAbsoluteFilePath(path));
  }

  readYaml(path: string) {
    if (this.cache.yamls[path]) {
      return this.cache.yamls[path];
    }
    this.cache.yamls[path] = yaml.load(this.readFile(path), {
      schema: this.yamlSchema,
    });
    return this.cache.yamls[path];
  }

  getAbsoluteFilePath(path: string) {
    path = path.replace(/^\/+/, '');
    return join(this.root, path);
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

  get defaultLocale() {
    return this.locale(Pod.DefaultLocale);
  }

  get locales() {
    return [];
  }
}
