import {BuildResult, Builder} from '../builder';

import {PluginComponent} from '../plugins';
import {Pod} from '../pod';

export type afterBuildCallback = (result: BuildResult) => Promise<void>;
export type beforeBuildCallback = (builder: Builder) => Promise<void>;

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
export class RouterPlugin implements PluginComponent {
  config: Record<string, any>;
  pod: Pod;
  private afterBuildCallbacks: Array<afterBuildCallback>;
  private beforeBuildCallbacks: Array<beforeBuildCallback>;

  constructor(pod: Pod, config: Record<string, any>) {
    this.pod = pod;
    this.config = config;
    this.afterBuildCallbacks = [];
    this.beforeBuildCallbacks = [];
  }

  addRouteProvider(func: afterBuildCallback) {
    this.afterBuildCallbacks.push(func);
  }

  addBeforeBuildStep(func: beforeBuildCallback) {
    this.beforeBuildCallbacks.push(func);
  }

  async afterBuildHook(buildResult: BuildResult): Promise<void> {
    for (const callback of this.afterBuildCallbacks) {
      await callback(buildResult);
    }
  }

  async beforeBuildHook(builder: Builder): Promise<void> {
    for (const callback of this.beforeBuildCallbacks) {
      await callback(builder);
    }
  }
}
