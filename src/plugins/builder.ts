import {BuildResult, Builder} from '../builder';

import {PluginComponent} from '../plugins';
import {Pod} from '../pod';

/**
 * Plugin providing access to build steps.
 *
 * Usage:
 * ```
 * const plugin = pod.plugins.get('BuilderPlugin');
 *
 * plugin.addBeforeBuildStep(builder => {
 *   // Do something with the builder.
 * });
 *
 * plugin.addAfterBuildStep(buildResult => {
 *   // Do something with the build result.
 * });
 * ```
 */
export class BuilderPlugin implements PluginComponent {
  config: Record<string, any>;
  pod: Pod;
  private beforeBuildCallbacks: Array<Function>;
  private afterBuildCallbacks: Array<Function>;

  constructor(pod: Pod, config: Record<string, any>) {
    this.pod = pod;
    this.config = config;
    this.beforeBuildCallbacks = [];
    this.afterBuildCallbacks = [];
  }

  addBeforeBuildStep(func: Function) {
    this.beforeBuildCallbacks.push(func);
  }

  addAfterBuildStep(func: Function) {
    this.afterBuildCallbacks.push(func);
  }

  beforeBuildHook(builder: Builder) {
    this.beforeBuildCallbacks.forEach(callback => {
      callback(builder);
    });
  }

  afterBuildHook(buildResult: BuildResult) {
    this.afterBuildCallbacks.forEach(callback => {
      callback(buildResult);
    });
  }
}
