import * as yaml from 'js-yaml';

import {Environment} from '../environment';
import {PluginComponent} from '../plugins';
import {Pod} from '../pod';

interface YamlTypeArguments {
  tag: string;
  options: yaml.TypeConstructorOptions;
}

/**
 * Plugin providing built-in custom yaml types.
 */
export class YamlPlugin implements PluginComponent {
  config: Record<string, any>;
  pod: Pod;
  private shortcutTypes: Array<YamlTypeArguments>;

  constructor(pod: Pod, config: Record<string, any>) {
    this.pod = pod;
    this.config = config;
    this.shortcutTypes = [];
  }

  // Shortcut for adding custom yaml types without creating a full plugin.
  addType(tag: string, options: yaml.TypeConstructorOptions) {
    this.shortcutTypes.push({
      tag: tag,
      options: options,
    });
  }

  createYamlTypesHook(yamlTypeManager: YamlTypeManager) {
    yamlTypeManager.addType(
      new yaml.Type('!a.Doc', {
        kind: 'scalar',
        resolve: data => {
          // TODO: Validate this is in the content folder.
          return data !== null && data.startsWith('/');
        },
        construct: podPath => {
          return this.pod.doc(podPath);
        },
        represent: doc => {
          return doc;
        },
      })
    );

    yamlTypeManager.addType(
      new yaml.Type('!a.IfEnvironment', {
        kind: 'mapping',
        resolve: data => {
          return typeof data === 'object';
        },
        construct: value => {
          return value[this.pod.env.name] || Environment.DefaultName;
        },
        represent: value => {
          return value;
        },
      })
    );

    yamlTypeManager.addType(
      new yaml.Type('!a.Static', {
        kind: 'scalar',
        resolve: data => {
          // TODO: Add more validation?
          return data !== null && data.startsWith('/');
        },
        construct: podPath => {
          return this.pod.staticFile(podPath);
        },
        represent: staticFile => {
          return staticFile;
        },
      })
    );

    yamlTypeManager.addType(
      new yaml.Type('!a.String', {
        kind: 'mapping',
        resolve: data => {
          return (
            typeof data === 'string' ||
            (typeof data === 'object' && 'value' in data)
          );
        },
        construct: value => {
          return this.pod.string(value);
        },
        represent: string => {
          return string;
        },
      })
    );

    yamlTypeManager.addType(
      new yaml.Type('!a.Yaml', {
        kind: 'scalar',
        resolve: data => {
          // TODO: Add more validation?
          return data !== null && data.startsWith('/');
        },
        construct: value => {
          // value can be: /content/partials/base.yaml
          // value can be: /content/partials/base.yaml?foo
          // value can be: /content/partials/base.yaml?foo.bar.baz
          const parts = value.split('?');
          const podPath = parts[0];
          let result = this.pod.readYaml(podPath);
          if (parts.length > 1) {
            const query = parts[1].split('.');
            while (query.length > 0) {
              const key = query.shift();
              result = result[key];
              if (result === undefined) {
                break;
              }
            }
          }
          return result;
        },
        represent: string => {
          return string;
        },
      })
    );

    for (const shortcutType of this.shortcutTypes) {
      yamlTypeManager.addType(
        new yaml.Type(shortcutType.tag, shortcutType.options)
      );
    }
  }
}

/**
 * Custom yaml type manager for adding custom yaml types.
 */
export class YamlTypeManager {
  types: Array<yaml.Type>;

  constructor() {
    this.types = [];
  }

  addType(yamlType: yaml.Type) {
    this.types.push(yamlType);
  }
}
