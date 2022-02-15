import * as yaml from 'js-yaml';

import {Collection} from './collection';
import {Document} from './document';
import {Locale} from './locale';
import {Pod} from './pod';
import {Route} from './router';
import {StaticFile} from './staticFile';
import {TranslationString} from './string';

export class Cache {
  pod: Pod;
  collections!: Record<string, Collection>;
  docs!: Record<string, Document>;
  fileExists!: Record<string, Boolean>;
  interpolations!: Record<string, Function>;
  locales!: Record<string, Locale>;
  routeMap!: Record<string, Route>;
  routes!: Array<Route>;
  urlPaths!: Map<Document, string>;
  staticFiles!: Record<string, StaticFile>;
  strings!: Record<string, TranslationString>;
  yamls!: Record<string, any>;
  yamlSchema!: yaml.Schema | null;
  yamlStrings!: Record<string, any>;

  constructor(pod: Pod) {
    this.pod = pod;
    this.clearAll();
  }

  clearAll() {
    this.collections = {};
    this.docs = {};
    this.fileExists = {};
    this.interpolations = {};
    this.locales = {};
    this.routeMap = {};
    this.routes = [];
    this.staticFiles = {};
    this.strings = {};
    this.urlPaths = new Map();
    this.yamls = {};
    this.yamlStrings = {};
    this.yamlSchema = null;
    this.pod.router.reset();
  }

  reset() {
    // TODO: Clear based on dependency graph and file type.
    this.clearAll();
  }
}
