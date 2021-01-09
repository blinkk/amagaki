import {CustomYamlTypes} from './utils';
import Pod from './pod';
import {Renderer} from './renderer';

/**
 * Interface for defining plugins to work with amagaki.
 */
export interface PluginComponent {
  /**
   * Key to uniquely identify the plugin. Should be alpha-numeric and start with a
   * lowercase letter.
   */
  key: string;
  /**
   * Name to identify the plugin. Used when providing console logs and profiling
   * reports for the plugin.
   */
  name: string;
  /**
   * Hook for manipulating the renderer after it is initially created.
   */
  createRendererHook?: (renderer: Renderer) => void;
  /**
   * Hook for defining custom yaml types for the yaml schema.
   * @see {@link CustomYamlTypes} for adding custom yaml types.
   */
  createYamlTypesHook?: (customTypes: CustomYamlTypes) => void;
  [x: string]: any; // Allows for referencing arbitrary indexes.
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
export default class Plugins {
  static HookPostfix = 'Hook';

  readonly pod: Pod;
  readonly plugins: Array<PluginComponent>;

  constructor(pod: Pod) {
    this.pod = pod;
    this.plugins = [];
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
  trigger(hookName: string, ...args: any[]) {
    const triggerTimer = this.pod.profiler.timer(
      `plugins.trigger.${hookName}`,
      `Trigger: ${hookName}`,
      {
        trigger: hookName,
      }
    );

    const eventMethodName = `${hookName}${Plugins.HookPostfix}`;

    try {
      for (const plugin of this.plugins) {
        if (plugin[eventMethodName]) {
          const pluginTimer = this.pod.profiler.timer(
            `plugins.trigger.${hookName}.${plugin.key}`,
            `${plugin.name} plugin trigger: ${hookName}`,
            {
              trigger: hookName,
              plugin: plugin.key,
            }
          );
          try {
            plugin[eventMethodName](...args);
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
