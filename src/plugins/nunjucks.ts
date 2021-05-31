import * as nunjucks from 'nunjucks';
import * as utils from '../utils';

import {formatBytes} from '../utils';

import marked from 'marked';

import {PluginComponent} from '../plugins';
import {Pod} from '../pod';
import {TemplateEngineComponent} from '../templateEngine';
import {Document} from '../document';
import {Url} from '../url';

/**
 * Plugin providing support for the nunjucks template engine.
 */
export class NunjucksPlugin implements PluginComponent {
  config: Record<string, any>;
  pod: Pod;
  private shortcutFilters: Record<string, Function>;
  private shortcutGlobals: Record<string, Function>;

  constructor(pod: Pod, config: Record<string, any>) {
    this.pod = pod;
    this.config = config;
    this.shortcutFilters = {};
    this.shortcutGlobals = {};

    // Associate the engine during creation of pod.
    this.pod.engines.associate('.njk', NunjucksTemplateEngine);
  }

  addFilter(filterName: string, filterMethod: Function) {
    this.shortcutFilters[filterName] = filterMethod;
  }

  addGlobal(globalName: string, globalMethod: Function) {
    this.shortcutGlobals[globalName] = globalMethod;
  }

  createTemplateEngineHook(
    templateEngine: TemplateEngineComponent,
    extension: string
  ) {
    if (templateEngine.constructor.name === 'NunjucksTemplateEngine') {
      // Add in the shortcut filters.
      for (const key of Object.keys(this.shortcutFilters)) {
        (templateEngine as NunjucksTemplateEngine).env.addFilter(
          key,
          this.shortcutFilters[key] as any
        );
      }

      // Add in the shortcut globals.
      for (const key of Object.keys(this.shortcutGlobals)) {
        (templateEngine as NunjucksTemplateEngine).env.addGlobal(
          key,
          this.shortcutGlobals[key]
        );
      }
    }
  }
}

/**
 * Template engine providing support for the nunjucks templating.
 */
export class NunjucksTemplateEngine implements TemplateEngineComponent {
  env: nunjucks.Environment;
  pod: Pod;

  constructor(pod: Pod) {
    this.pod = pod;
    const loader = new NunjucksPodLoader(this.pod);
    this.env = new nunjucks.Environment(loader, {
      autoescape: true,
    });
    this.env.addFilter('t', function (this: any, value) {
      // Use `function` to preserve scope. `this` is the Nunjucks template.
      return this.ctx.doc.locale.getTranslation(value, this.ctx.doc);
    });
    this.env.addFilter('formatBytes', value => {
      return formatBytes(value);
    });
    this.env.addFilter(
      'await',
      async (func, callback) => {
        try {
          callback(null, await func);
        } catch (err) {
          callback(err);
        }
      },
      true
    );
    this.env.addFilter('markdown', value => {
      if (!value) {
        return '';
      }
      return marked(value);
    });
    this.env.addFilter(
      'relative',
      function (this: any, value: Document | string) {
        return Url.relative(value, this.ctx.doc);
      }
    );
  }

  render(path: string, context: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.env.render(path, context, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res || '');
      });
    });
  }

  renderFromString(template: string, context: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.env.renderString(template, context, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res || '');
      });
    });
  }
}

/**
 * Loader for loading files from the pod for the nunjucks template engine.
 */
class NunjucksPodLoader extends nunjucks.Loader {
  private readonly pod: Pod;
  async = true;

  constructor(pod: Pod) {
    super();
    this.pod = pod;
  }

  getSource(name: string): nunjucks.LoaderSource;
  getSource(
    name: string,
    callback: nunjucks.Callback<Error, nunjucks.LoaderSource>
  ): void;
  getSource(
    name: string,
    callback?: nunjucks.Callback<Error, nunjucks.LoaderSource>
  ): nunjucks.LoaderSource | void {
    const res: nunjucks.LoaderSource = {
      src: '',
      path: '',
      noCache: this.pod.env.dev, // Avoid caching Nunjucks templates in dev.
    };
    const content = this.pod.readFile(name);
    const parts = utils.splitFrontMatter(content);
    res.src = parts.body || '';
    res.path = name;
    if (callback) {
      callback(null, res);
      return;
    }
    return res;
  }
}
