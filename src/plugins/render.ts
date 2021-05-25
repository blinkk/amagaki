import {PluginComponent} from '../plugins';
import {Pod} from '../pod';
import {TemplateContext} from '../document';
import {TemplateEngineComponent} from '../templateEngine';

export interface RenderPluginContext {
  context: TemplateContext;
  engine: TemplateEngineComponent;
  templateSource: string;
}

/**
 * Plugin providing access to template rendering lifecycle.
 *
 * Usage:
 * ```
 * const plugin = pod.plugins.get('RenderPlugin');
 *
 * plugin.addBeforeRenderStep(builder => {
 *   // Do something with the builder.
 * });
 *
 * plugin.addAfterRenderStep(buildResult => {
 *   // Do something with the build result.
 * });
 * ```
 */
export class RenderPlugin implements PluginComponent {
  config: Record<string, any>;
  pod: Pod;
  private beforeRenderCallbacks: Array<Function>;
  private afterRenderCallbacks: Array<Function>;

  constructor(pod: Pod, config: Record<string, any>) {
    this.pod = pod;
    this.config = config;
    this.beforeRenderCallbacks = [];
    this.afterRenderCallbacks = [];
  }

  addBeforeRenderStep(func: Function) {
    this.beforeRenderCallbacks.push(func);
  }

  addAfterRenderStep(func: Function) {
    this.afterRenderCallbacks.push(func);
  }

  async beforeRenderHook(renderPluginContext: RenderPluginContext) {
    for (const callback of this.beforeRenderCallbacks) {
      await callback(renderPluginContext);
    }
  }

  async afterRenderHook(html: string) {
    for (const callback of this.afterRenderCallbacks) {
      await callback(html);
    }
  }
}
