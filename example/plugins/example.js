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
}

module.exports = ExamplePlugin;
