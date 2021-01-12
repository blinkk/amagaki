import * as yaml from 'js-yaml';
import {PluginComponent} from '../plugins';
import {Pod} from '../pod';

/**
 * Plugin providing built-in custom yaml types.
 */
export class YamlPlugin implements PluginComponent {
  config: Record<string, any>;
  pod: Pod;
  private shortcutTypes: Array<yaml.Type>;

  constructor(pod: Pod, config: Record<string, any>) {
    this.pod = pod;
    this.config = config;
    this.shortcutTypes = [];
  }

  // Shortcut for adding custom yaml types without creating a full plugin.
  addType(type: yaml.Type) {
    this.shortcutTypes.push(type);
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
          const result = this.pod.readYaml(podPath);
          if (parts.length > 1) {
            const query = parts[1].split('.');
            // TODO: Implement nested lookups.
            return result[query[0]];
          } else {
            return result;
          }
        },
        represent: string => {
          return string;
        },
      })
    );

    for (const shortcutType of this.shortcutTypes) {
      yamlTypeManager.addType(shortcutType);
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
