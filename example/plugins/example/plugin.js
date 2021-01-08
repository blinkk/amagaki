class ExamplePlugin {
  constructor(pod, config) {
    this.pod = pod;
    this.config = config;
  }

  onRendererCreate(renderer) {
    if (renderer.kind === 'nunjucks') {
      renderer.env.addFilter('testPluginFilter', value => {
        return `${value}--TESTING`;
      });
    }
  }
}

module.exports = {
  default: ExamplePlugin,
  plugin: ExamplePlugin,
};
