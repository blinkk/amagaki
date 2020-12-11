import {Pod} from './pod';
import * as nunjucks from 'nunjucks';

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

export class NunjucksRenderer extends Renderer {
  configure() {
    nunjucks.configure(this.pod.root, {autoescape: true});
  }

  async render(template: string, context: any): Promise<string> {
    return nunjucks.renderString(template, context);
  }
}

export class JavaScriptRenderer extends Renderer {}

export function getRenderer(path: string) {
  if (path.endsWith('.njk')) {
    return NunjucksRenderer;
  } else if (path.endsWith('.njk')) {
    return JavaScriptRenderer;
  } // TODO: Raise if no renderer available.
  return NunjucksRenderer;
}
