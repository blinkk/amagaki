class ExamplePlugin {
  constructor(pod, config) {
    this.pod = pod;
    this.config = config;
    this.key = 'example';
    this.name = 'Example';
  }

  createRendererHook(renderer) {
    if (renderer.kind === 'nunjucks') {
      renderer.env.addFilter('testPluginFilter', value => {
        return `${value}--TESTING`;
      });
    }
  }
}

module.exports = ExamplePlugin;
