import {Document} from './document';
import {Pod} from './pod';
import {Route} from './router';
import {StaticFile} from './static';
import * as yaml from 'js-yaml';
import {Collection} from './collection';
import {Locale} from './locale';

export default class Cache {
  pod: Pod;
  docs!: Record<string, Document>;
  collections!: Record<string, Collection>;
  routes!: Array<Route>;
  staticFiles!: Record<string, StaticFile>;
  locales!: Record<string, Locale>;
  yamls!: Record<string, any>;
  yamlSchema!: yaml.Schema | null;

  constructor(pod: Pod) {
    this.pod = pod;
    this.clearAll();
  }

  clearAll() {
    this.collections = {};
    this.docs = {};
    this.locales = {};
    this.routes = [];
    this.staticFiles = {};
    this.yamls = {};
    this.yamlSchema = null;
  }

  reset(podPath: string) {
    // TODO: Clear based on dependency graph and file type.
    this.clearAll();
  }
}
