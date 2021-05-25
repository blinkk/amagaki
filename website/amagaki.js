const codeTabs = require('./plugins/codeTabs');
const fetch = require('node-fetch');
const fsPath = require('path');

module.exports = function (pod) {
  pod.configure({
    metadata: {
      siteTitle: 'Amagaki',
      githubEditRoot: 'https://github.com/blinkk/amagaki/edit/main/website',
    },
    staticRoutes: [
      {
        path: '/static/css/',
        staticDir: '/dist/css/',
      },
    ],
  });

  codeTabs.register(pod);

  const yamlPlugin = pod.plugins.get('YamlPlugin');
  yamlPlugin.addType('!GetGithubContributors', {
    kind: 'scalar',
    construct: project => {
      const cache = {};
      return async () => {
        if (cache[project]) {
          return cache[project];
        }
        const resp = await fetch(
          `https://api.github.com/repos/${project}/contributors`,
          {
            headers: {Authorization: `token: ${process.env.GITHUB_TOKEN}`},
          }
        );
        const result = await resp.json();
        cache[project] = result;
        return result;
      };
    },
  });

  const nunjucksPlugin = pod.plugins.get('NunjucksPlugin');

  nunjucksPlugin.addFilter('url', value => {
    if (value.doc) {
      return value.doc.url.path;
    } else {
      return value.url;
    }
  });

  nunjucksPlugin.addFilter('render', function (value, context) {
    const nunjucksEngine = pod.engines.getEngineByExtension('.njk');
    const defaultContext = Object.assign(this.ctx, context || {});
    return nunjucksEngine.env.renderString(value, defaultContext);
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
    if (!result || result === '/') {
      return './';
    }
    return value.endsWith('/') ? `./${result}/` : `./${result}`;
  });
};
