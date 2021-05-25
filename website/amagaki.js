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
    kind: 'sequence',
    construct: projects => {
      const cache = {};
      return async () => {
        const cacheKey = projects.join(',');
        if (cache[cacheKey]) {
          return cache[cacheKey];
        }
        const headers = process.env.GITHUB_TOKEN
          ? {Authorization: `token ${process.env.GITHUB_TOKEN}`}
          : {};
        const result = projects.map(project => {
          return fetch(`https://api.github.com/repos/${project}/contributors`, {
            headers: headers,
          }).then(
            resp => resp.json(),
            err => console.error(err)
          );
        });
        // Flatten contributors from multiple projects into a single array.
        // Remove duplicates and exclude bots.
        const allContributors = [].concat.apply([], await Promise.all(result));
        const contributors = new Map();
        for (const contributor of allContributors) {
          if (
            !contributors.has(contributor.login) &&
            !contributor.login.endsWith('[bot]')
          ) {
            contributors.set(contributor.login, contributor);
          }
        }
        cache[cacheKey] = contributors.values();
        return cache[cacheKey];
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
