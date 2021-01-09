import * as nunjucks from 'nunjucks';
import * as utils from './utils';
import {Pod} from './pod';
import marked from 'marked';

export class Renderer {
  pod: Pod;

  constructor(pod: Pod) {
    this.pod = pod;
  }

  configure() {}

  async render(template: string, context: any): Promise<string> {
    throw new Error();
  }
}

export function getRenderer(path: string) {
  if (path.endsWith('.njk')) {
    return NunjucksRenderer;
  } else if (path.endsWith('.js')) {
    return JavaScriptRenderer;
  } // TODO: Raise if no renderer available.
  return NunjucksRenderer;
}

export class JavaScriptRenderer extends Renderer {
  constructor(pod: Pod) {
    super(pod);
  }
}

export class NunjucksRenderer extends Renderer {
  env: nunjucks.Environment;

  constructor(pod: Pod) {
    super(pod);
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
      return utils.getLocalizedValue(this.ctx.doc, parent, key);
    });
    this.env.addFilter('formatBytes', value => {
      return utils.formatBytes(value);
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
