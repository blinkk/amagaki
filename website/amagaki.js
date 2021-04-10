module.exports = function (pod) {
  pod.configure({
    metadata: {
      siteTitle: 'Amagaki',
      githubEditRoot: 'https://github.com/blinkkcode/amagaki/edit/main',
    },
    staticRoutes: [
      {
        path: '/static/css/',
        staticDir: '/dist/css/',
      },
    ],
  });

  const nunjucksPlugin = pod.plugins.get('NunjucksPlugin');

  nunjucksPlugin.addFilter('url', value => {
    if (value.doc) {
      return value.doc.url.path;
    } else {
      return value.url;
    }
  });

  nunjucksPlugin.addFilter('render', function (value) {
    const nunjucksEngine = pod.engines.getEngineByExtension('.njk');
    return nunjucksEngine.env.renderString(value, this.ctx);
  });

  nunjucksPlugin.addFilter('interpolate', function (value) {
    const utils = require('amagaki/src/utils');
    return utils.interpolate(pod, value, this.ctx);
  });
};
