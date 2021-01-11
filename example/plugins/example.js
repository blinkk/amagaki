const yaml = require('js-yaml');

class ExamplePlugin {
  constructor(pod, config) {
    this.pod = pod;
    this.config = config;
  }

  createRendererHook(renderer) {
    if (renderer.constructor.name === 'NunjucksRenderer') {
      renderer.env.addFilter('testPluginFilter', value => {
        return `${value}--TESTING`;
      });
    }
  }

  createYamlTypesHook(customTypes) {
    customTypes.addType(
      new yaml.Type('!a.Foo', {
        kind: 'scalar',
        resolve: () => {
          return true;
        },
        construct: value => {
          return `Foo: ${value}`;
        },
        represent: value => value,
      })
    );
  }
}

module.exports = ExamplePlugin;
