import * as nunjucks from 'nunjucks';
import {formatBytes, getLocalizedValue} from '../utils';
import {PluginComponent} from '../plugins';
import {Pod} from '../pod';
import {TemplateEngineComponent} from '../templateEngine';
import marked from 'marked';

/**
 * Plugin providing support for the nunjucks template engine.
 */
export class NunjucksPlugin implements PluginComponent {
  config: Record<string, any>;
  pod: Pod;

  constructor(pod: Pod, config: Record<string, any>) {
    this.pod = pod;
    this.config = config;

    // Associate the engine during creation of pod.
    this.pod.engines.associate('.njk', NunjucksTemplateEngine);
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
    this.env = new nunjucks.Environment([loader], {
      autoescape: true,
    });
    this.env.addFilter('t', function (value) {
      // Use `function` to preserve scope. `this` is the Nunjucks template.
      // @ts-ignore
      return this.ctx.doc.locale.getTranslation(value, this.ctx.doc);
    });
    this.env.addFilter('localize', function (parent, key) {
      // Use `function` to preserve scope. `this` is the Nunjucks template.
      // @ts-ignore
      return getLocalizedValue(this.ctx.doc, parent, key);
    });
    this.env.addFilter('formatBytes', value => {
      return formatBytes(value);
    });
    this.env.addFilter('markdown', value => {
      if (!value) {
        return '';
      }
      return marked(value);
    });
  }

  async render(path: string, context: any): Promise<string> {
    return this.env.render(path, context);
  }
}

/**
 * Loader for loading files from the pod for the nunjucks template engine.
 */
class NunjucksPodLoader extends nunjucks.Loader {
  pod: Pod;

  constructor(pod: Pod) {
    super();
    this.pod = pod;
  }

  getSource(name: string) {
    return {
      src: this.pod.readFile(name),
      path: name,
      noCache: false,
    };
  }
}