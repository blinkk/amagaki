import Pod from './pod';

export interface PluginConfig {
  key: string;
}

export interface PluginComponent {
  config: PluginConfig;
  [x: string]: any;
}

export interface PluginConstructor {
  new (pod: Pod, config: PluginConfig): PluginComponent;
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
  registerPlugin(pluginConfig: PluginConfig, PluginClass: PluginConstructor) {
    this.plugins.push(new PluginClass(this.pod, pluginConfig));
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
      `Plugins trigger: ${eventName}`,
      {
        trigger: eventName,
      }
    );

    try {
      const triggerHandlerName = `on${eventName
        .charAt(0)
        .toUpperCase()}${eventName.slice(1)}`;

      for (const plugin of this.plugins) {
        if (plugin[triggerHandlerName]) {
          const pluginTimer = this.pod.profiler.timer(
            `plugins.trigger.${eventName}.${plugin.config.key}`,
            `Plugins trigger: ${eventName}.${plugin.config.key}`,
            {
              trigger: eventName,
              plugin: plugin.config.key,
            }
          );
          try {
            plugin[triggerHandlerName](...args);
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
