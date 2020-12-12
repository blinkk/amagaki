import {Builder} from './builder';
import {Document} from './document';
import {readFileSync} from 'fs';
import {Router} from './router';
import {join} from 'path';
import {getRenderer} from './renderer';
import {Environment} from './environment';
import {Collection} from './collection';
import * as yaml from 'js-yaml';
import * as utils from './utils';
import {StaticFile} from './static';

export class Pod {
  builder: Builder;
  root: string;
  router: Router;
  env: Environment;
  private _yamlSchema: any;
  private _docCache: any;
  private _staticFileCache: any;
  private _yamlCache: any;

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
    this._docCache = {};
    this._yamlCache = {};
    this._staticFileCache = {};
  }

  doc(path: string) {
    if (this._docCache[path]) {
      return this._docCache[path];
    }
    this._docCache[path] = new Document(this, path);
    return this._docCache[path];
  }

  staticFile(path: string) {
    if (this._staticFileCache[path]) {
      return this._staticFileCache[path];
    }
    this._staticFileCache[path] = new StaticFile(this, path);
    return this._staticFileCache[path];
  }

  collection(path: string) {
    return new Collection(this, path);
  }

  renderer(path: string) {
    const rendererClass = getRenderer(path);
    return new rendererClass(this);
  }

  readFile(path: string) {
    return readFileSync(this.getAbsoluteFilePath(path), 'utf8');
  }

  readYaml(path: string) {
    if (this._yamlCache[path]) {
      return this._yamlCache[path];
    }
    this._yamlCache[path] = yaml.load(this.readFile(path), {
      schema: this.yamlSchema,
    });
    return this._yamlCache[path];
  }

  get yamlSchema() {
    if (this._yamlSchema) {
      return this._yamlSchema;
    }
    this._yamlSchema = utils.createYamlSchema(this);
    return this._yamlSchema;
  }

  getAbsoluteFilePath(path: string) {
    path = path.replace(/^\/+/, '');
    return join(this.root, path);
  }

  walk(path: string) {
    return utils.walk(this.getAbsoluteFilePath(path), [], this.root);
  }
}
