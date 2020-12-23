import {NunjucksRenderer, Renderer} from './renderer';
import {Pod} from './pod';

export class PluginManager {
  pod: Pod;
  renderers: Record<string, Renderer>;

  constructor(pod: Pod) {
    this.pod = pod;
    this.renderers = {};
  }

  addRenderer(extension: string, rendererClass: typeof Renderer) {
    this.renderers[extension] = new rendererClass(this.pod);
  }

  addNunjucksFilter(name: string, filterFunction: (...args: any[]) => any) {
    (this.renderers['.njk'] as NunjucksRenderer).env.addFilter(
      name,
      filterFunction
    );
  }
}
