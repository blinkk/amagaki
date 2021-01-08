class ExamplePlugin {
  constructor(pod) {
    this.pod = pod;
    this.key = 'example';
    this.name = 'Example';
  }

  onRendererCreate(renderer) {
    if (renderer.kind === 'nunjucks') {
      renderer.env.addFilter('testPluginFilter', value => {
        return `${value}--TESTING`;
      });
    }
  }
}

module.exports = ExamplePlugin;
