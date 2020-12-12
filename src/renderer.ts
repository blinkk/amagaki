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
  env: nunjucks.Environment;

  constructor(pod: Pod) {
    super(pod);
    const loader = new NunjucksPodLoader(this.pod);
    this.env = new nunjucks.Environment([loader], {
      autoescape: true,
    });
  }

  async render(path: string, context: any): Promise<string> {
    return this.env.render(path, context);
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
      noCache: true,
    };
  }
}
