const yaml = require('js-yaml');

class ExamplePlugin {
  constructor(pod, config) {
    this.pod = pod;
    this.config = config;
  }

  createTemplateEngineHook(templateEngine, extension) {
    if (templateEngine.constructor.name === 'NunjucksTemplateEngine') {
      templateEngine.env.addFilter('testPluginFilter', value => {
        return `${value}--TESTING`;
      });
    }
  }

  createYamlTypesHook(yamlTypeManager) {
    yamlTypeManager.addType(
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
