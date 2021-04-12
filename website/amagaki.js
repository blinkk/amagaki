const fsPath = require('path');

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

  nunjucksPlugin.addFilter('relative', function (value) {
    if (
      !value ||
      typeof value !== 'string' ||
      value.startsWith('http') ||
      !this.ctx.doc
    ) {
      return value;
    }
    const result = fsPath.relative(this.ctx.doc.url.path, value);
    if (!result || result === '/' || result === '') {
      return './';
    }
    return (value.endsWith('/') ? `./${result}/` : `./${result}`).replace(
      '//',
      '/'
    );
  });
};
