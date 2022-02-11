import {Pod} from '../../src/pod';
import {TemplateContext} from '../../src/document';
import {YamlPlugin} from '../../src/plugins/yaml';

export default function (pod: Pod) {
  pod.configure({
    meta: {
      foo: {
        bar: 'value',
      },
    },
    environments: {
      default: {},
      prod: {},
    },
    localization: {
      locales: ['en', 'de'],
    },
  });

  const yamlPlugin = pod.plugins.get('YamlPlugin') as YamlPlugin;
  yamlPlugin.addType('!async', {
    kind: 'scalar',
    construct: (value: string) => {
      return async (context: TemplateContext) => {
        if (typeof value !== 'string') {
          throw new Error('Value must be a string.');
        }
        return `${value.toUpperCase()} from ${context.doc.podPath}`;
      };
    },
  });
}
