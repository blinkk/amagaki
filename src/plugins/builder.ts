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
 * plugin.addPreBuildStep(builder => {
 *   // Do something with the builder.
 * });
 *
 * plugin.addPostBuildStep(buildResult => {
 *   // Do something with the build result.
 * });
 * ```
 */
export class BuilderPlugin implements PluginComponent {
  config: Record<string, any>;
  pod: Pod;
  private preBuildCallbacks: Array<Function>;
  private postBuildCallbacks: Array<Function>;

  constructor(pod: Pod, config: Record<string, any>) {
    this.pod = pod;
    this.config = config;
    this.preBuildCallbacks = [];
    this.postBuildCallbacks = [];
  }

  addPreBuildStep(func: Function) {
    this.preBuildCallbacks.push(func);
  }

  addPostBuildStep(func: Function) {
    this.postBuildCallbacks.push(func);
  }

  preBuildHook(builder: Builder) {
    this.preBuildCallbacks.forEach(callback => {
      callback(builder);
    });
  }

  postBuildHook(buildResult: BuildResult) {
    this.postBuildCallbacks.forEach(callback => {
      callback(buildResult);
    });
  }
}
