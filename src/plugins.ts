import {PluginConfig, Pod} from './pod';
import {join} from 'path';

export default class Plugins {
  static DefaultPluginsDir = 'plugins';
  static DefaultPluginsFilename = 'plugin.js';

  readonly pod: Pod;
  readonly plugins: any[];

  constructor(pod: Pod) {
    this.pod = pod;
    this.plugins = [];
  }

  /**
   * Register plugins based on a plugin configuration. Normally from the amagaki.yaml file.
   */
  async registerPlugins(pluginConfigs?: Array<PluginConfig>) {
    if (!pluginConfigs) {
      return;
    }

    for (const pluginConfig of pluginConfigs) {
      const localePluginPath = join(
        Plugins.DefaultPluginsDir,
        pluginConfig.key,
        Plugins.DefaultPluginsFilename
      );

      // Check for local plugin definition.
      if (this.pod.fileExists(localePluginPath)) {
        const pluginImport = await import(
          this.pod.getAbsoluteFilePath(localePluginPath)
        );
        const PluginClass =
          pluginImport.plugin || pluginImport.default || pluginImport;

        this.plugins.push(new PluginClass(this.pod, pluginConfig));
        continue;
      }

      // TODO: Check for plugin in the node_modules.
    }
  }

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
