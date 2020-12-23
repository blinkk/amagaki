import {NunjucksRenderer, Renderer} from './renderer';

import {Pod} from './pod';

/**
 * The plugin manager provides a mechanism for sites to use a defined interface
 * for extending Amagaki functionality. By adding an `amagaki.js` file to the
 * site root, sites have access to run custom code when pods are instantiated.
 *
 * The primary purpose of doing so is to allow the custom code to interact with
 * pods through the plugin manager, which provides a guaranteed way for sites to
 * extend Amagaki functionality.
 *
 * While sites can reach into the pod structure and manipulate it, the
 * preferred/stable way extend functionality is through methods of this
 * `PluginManager` class, as we will attempt to preserve functionality offered
 * through this interface across Amagaki versions, and provide new supported
 * ways to interact with pods over time.
 */
export class PluginManager {
  pod: Pod;
  renderers: Record<string, Renderer>;

  constructor(pod: Pod) {
    this.pod = pod;
    this.renderers = {};
  }

  // TODO(jeremydw): Rename this to `addTemplateEngine`. I think we want to call
  // "renderers" template engines as that is a more generally understood term
  // for this in the JavaScript community.
  /**
   * Adds a custom renderer to the pod that can be used to render templates or
   * dynamic data.
   * @param extension The file extension the renderer supports, including
   * leading dot (e.g. `.njk`).
   * @param rendererClass A subclass of `renderer.Renderer`. The renderer must
   * implement an async `render` method.
   */
  addRenderer(extension: string, rendererClass: typeof Renderer) {
    this.renderers[extension] = new rendererClass(this.pod);
  }

  /**
   * Adds a filter to the inbuilt Nunjucks environment.
   * @param name The name of the filter to register. For example, if the name is
   * "foo", it is callable within Nunjucks as `{{"Hello World"|foo}}`.
   * @param filterFunction The filter function.
   */
  addNunjucksFilter(name: string, filterFunction: (...args: any[]) => any) {
    (this.renderers['.njk'] as NunjucksRenderer).env.addFilter(
      name,
      filterFunction
    );
  }

  // TODO: Implement additional plugin methods like `addRouteProvider`.
  // TODO: Implement `addYamlType`.
}
