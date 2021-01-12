import * as yaml from 'js-yaml';
import {CustomYamlTypes} from '../utils';
import {PluginComponent} from '../plugins';
import {Pod} from '../pod';

/**
 * Plugin providing built-in custom yaml types.
 */
export class YamlPlugin implements PluginComponent {
  config: Record<string, any>;
  pod: Pod;

  constructor(pod: Pod, config: Record<string, any>) {
    this.pod = pod;
    this.config = config;
  }

  createYamlTypesHook(customTypes: CustomYamlTypes) {
    customTypes.addType(
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

    customTypes.addType(
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

    customTypes.addType(
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

    customTypes.addType(
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
  }
}
