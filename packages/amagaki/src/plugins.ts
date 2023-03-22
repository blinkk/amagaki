import express = require('express');

import {BuildResult, Builder} from './builder';
import {TemplateEngineComponent, TemplateEngineRenderResult} from './templateEngine';

import {Pod} from './pod';
import {YamlTypeManager} from './plugins/yaml';
import {Timer} from './profile';

/**
 * Interface for defining plugins to work with Amagaki.
 */
export interface PluginComponent {
  /**
   * Hook for working with the build result after a build is complete.
   */
  afterBuildHook?: (result: BuildResult) => Promise<void>;
  /**
   * Hook for modifying the content after rendering.
   *
   * Note: This hook is called from the Template Engine, not all template
   * engines support this hook.
   */
  afterRenderHook?: (result: TemplateEngineRenderResult) => Promise<void>;
  /**
   * Hook for working with the builder before the build is executed.
   */
  beforeBuildHook?: (builder: Builder) => Promise<void>;
  /**
   * Hook for interfacing with the Express server.
   */
  createServerHook?: (app: express.Express) => Promise<void>;
  /**
   * Hook for manipulating the template engine after it is initially created.
   *
   * Used for creating template filters, globals, macros, etc.
   */
  createTemplateEngineHook?: (
    templateEngine: TemplateEngineComponent,
    extension: string
  ) => void;
  /**
   * Hook for defining custom yaml types for the yaml schema.
   * @see {@link YamlTypeManager} for adding custom yaml types.
   */
  createYamlTypesHook?: (yamlTypeManager: YamlTypeManager) => void;
  /**
   * Hook for extending the URL path interpolation context.
   */
  updatePathFormatContextHook?: (context: Record<string, any>) => void;
}

export interface PluginConstructor {
  new (pod: Pod, config: Record<string, any>): PluginComponent;
}

/**
 * Plugins allow for extending out the functionality of Amagaki.
 *
 * The plugins class allow for registering new plugins and triggering
 * hooks from within Amagaki to allow plugin interaction.
 */
export class Plugins {
  static HookPostfix = 'Hook';

  readonly pod: Pod;
  readonly plugins: Array<PluginComponent>;

  constructor(pod: Pod) {
    this.pod = pod;
    this.plugins = [];
  }

  /**
   * Retrieve the first instance of a plugin by class name if it exists.
   * @param name Plugin class name for locating existing plugin.
   */
  get(name: string): PluginComponent | null {
    for (const plugin of this.plugins) {
      if (plugin.constructor.name === name) {
        return plugin;
      }
    }

    return null;
  }

  /**
   * Register a new plugin.
   * @param PluginClass Class for the plugin.
   * @param config Configuration object passed to the new plugin instance.
   */
  register(PluginClass: PluginConstructor, config: Record<string, any>) {
    this.plugins.push(new PluginClass(this.pod, config));
  }

  /**
   * Triggers a hook handler on each of the registered plugins passing along
   * the provided arguments.
   * @param hookName Name of the hook being triggered.
   * @param args Any arguments that need to be passed to the triggered event handler.
   */
  async trigger(hookName: string, ...args: any[]): Promise<void> {
    const triggerTimer = this.pod.profiler.timer(
      `plugins.hook.${hookName}`,
      `Hook: ${hookName}`,
      {
        hook: hookName,
      }
    );
    const eventMethodName = `${hookName}${Plugins.HookPostfix}`;

    try {
      // Start the triggering of the async hooks.
      const triggerPromises = this.plugins.map((plugin): Promise<void> => {
        if (plugin[eventMethodName]) {
          const timer = this.pod.profiler.timer(
            `plugins.hook.${hookName}.${plugin.constructor.name}`,
            `${plugin.constructor.name} hook: ${hookName}`,
            {
              hook: hookName,
              plugin: plugin.constructor.name,
            }
          );
          // Use a containing async function to stop the timer directly after
          // the plugin is finished and still allow for all promises to resolve
          // before finishing the triggering process.
          const timedTrigger = async function (timer: Timer) {
            await plugin[eventMethodName](...args);
            timer.stop();
          };
          return timedTrigger(timer);
        } else {
          return Promise.resolve();
        }
      });

      // Wait for the triggered promises to finish.
      await Promise.all(triggerPromises);
    } finally {
      triggerTimer.stop();
    }
  }

  /**
   * Triggers a hook handler on each of the registered plugins passing along
   * the provided arguments.
   * @param hookName Name of the hook being triggered.
   * @param args Any arguments that need to be passed to the triggered event handler.
   */
  triggerSync(hookName: string, ...args: any[]) {
    const triggerTimer = this.pod.profiler.timer(
      `plugins.hook.${hookName}`,
      `Hook: ${hookName}`,
      {
        hook: hookName,
      }
    );

    const eventMethodName = `${hookName}${Plugins.HookPostfix}`;

    try {
      for (const plugin of this.plugins) {
        if ((plugin as any)[eventMethodName]) {
          const pluginTimer = this.pod.profiler.timer(
            `plugins.hook.${hookName}.${plugin.constructor.name}`,
            `${plugin.constructor.name} hook: ${hookName}`,
            {
              hook: hookName,
              plugin: plugin.constructor.name,
            }
          );
          try {
            (plugin as any)[eventMethodName](...args);
          } finally {
            pluginTimer.stop();
          }
        }
      }
    } finally {
      triggerTimer.stop();
    }
  }
}
