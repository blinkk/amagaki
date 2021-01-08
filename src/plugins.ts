import {CustomYamlTypes} from './utils';
import Pod from './pod';
import {Renderer} from './renderer';

export interface PluginComponent {
  key: string;
  name: string;
  createYamlTypes?: (customTypes: CustomYamlTypes) => void;
  createRenderer?: (renderer: Renderer) => void;
  [x: string]: any; // Allows for referencing arbitrary indexes.
}

export default class Plugins {
  static DefaultPluginsDir = 'plugins';
  static DefaultPluginsFilename = 'plugin.js';

  readonly pod: Pod;
  readonly plugins: Array<PluginComponent>;

  constructor(pod: Pod) {
    this.pod = pod;
    this.plugins = [];
  }

  /**
   * Register a new plugin.
   */
  registerPlugin(plugin: PluginComponent) {
    this.plugins.push(plugin);
  }

  /**
   * Triggers an event handler on each of the registered plugins passing along
   * the provided arguments.
   * @param eventName Name of the event being triggered.
   * @param args Any arguments that need to be passed to the triggered event handler.
   */
  trigger(eventName: string, ...args: any[]) {
    const triggerTimer = this.pod.profiler.timer(
      `plugins.trigger.${eventName}`,
      `Trigger: ${eventName}`,
      {
        trigger: eventName,
      }
    );

    try {
      for (const plugin of this.plugins) {
        if (plugin[eventName]) {
          const pluginTimer = this.pod.profiler.timer(
            `plugins.trigger.${eventName}.${plugin.key}`,
            `${plugin.name} plugin trigger: ${eventName}`,
            {
              trigger: eventName,
              plugin: plugin.key,
            }
          );
          try {
            plugin[eventName](...args);
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
