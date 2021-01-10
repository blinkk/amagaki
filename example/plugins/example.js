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
}

module.exports = ExamplePlugin;
