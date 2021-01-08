import {CustomYamlTypes} from './utils';
import Pod from './pod';
import {Renderer} from './renderer';

export interface PluginComponent {
  key: string;
  name: string;
  createRenderer?: (renderer: Renderer) => void;
  createYamlTypes?: (customTypes: CustomYamlTypes) => void;
  [x: string]: any; // Allows for referencing arbitrary indexes.
}

export interface PluginConstructor {
  new (pod: Pod, config: Record<string, any>): PluginComponent;
}

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
   */
  register(PluginClass: PluginConstructor, config: Record<string, any>) {
    this.plugins.push(new PluginClass(this.pod, config));
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

    const eventMethodName = `${eventName}${Plugins.HookPostfix}`;

    try {
      for (const plugin of this.plugins) {
        if (plugin[eventMethodName]) {
          const pluginTimer = this.pod.profiler.timer(
            `plugins.trigger.${eventName}.${plugin.key}`,
            `${plugin.name} plugin trigger: ${eventName}`,
            {
              trigger: eventName,
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
