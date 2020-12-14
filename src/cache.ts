import {Document} from './document';
import {Pod} from './pod';
import {Route} from './router';
import {StaticFile} from './static';
import * as yaml from 'js-yaml';
import {Collection} from './collection';
import {Locale} from './locale';

export default class Cache {
  pod: Pod;
  collections!: Record<string, Collection>;
  docs!: Record<string, Document>;
  interpolations!: Record<string, Function>;
  locales!: Record<string, Locale>;
  routeMap!: Record<string, Route>;
  routes!: Array<Route>;
  urlPaths!: Map<Document, string>;
  staticFiles!: Record<string, StaticFile>;
  yamls!: Record<string, any>;
  yamlSchema!: yaml.Schema | null;

  constructor(pod: Pod) {
    this.pod = pod;
    this.clearAll();
  }

  clearAll() {
    this.collections = {};
    this.docs = {};
    this.interpolations = {};
    this.locales = {};
    this.routeMap = {};
    this.routes = [];
    this.staticFiles = {};
    this.urlPaths = new Map();
    this.yamls = {};
    this.yamlSchema = null;
  }

  reset(podPath: string) {
    // TODO: Clear based on dependency graph and file type.
    this.clearAll();
  }
}
