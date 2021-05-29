import * as codeTabs from './plugins/codeTabs';
import * as fsPath from 'path';
import * as githubContributors from './plugins/githubContributors';

import {
  NunjucksPlugin,
  NunjucksTemplateEngine,
} from 'amagaki/src/plugins/nunjucks';

import {Document} from 'amagaki/src/document';
import {Pod} from 'amagaki/src/pod';
import {Url} from 'amagaki/src/url';

export default (pod: Pod) => {
  pod.configure({
    meta: {
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
  githubContributors.register(pod);

  const nunjucksPlugin = pod.plugins.get('NunjucksPlugin') as NunjucksPlugin;

  nunjucksPlugin.addFilter('url', (value: Record<string, Document | Url>) => {
    if (value.doc) {
      return (value.doc as Document).url.path;
    } else {
      return value.url;
    }
  });

  nunjucksPlugin.addFilter('render', function (value: string, context: Object) {
    const nunjucksEngine = pod.engines.getEngineByExtension(
      '.njk'
    ) as NunjucksTemplateEngine;
    const defaultContext = Object.assign(this.ctx, context || {});
    return nunjucksEngine.env.renderString(value, defaultContext);
  });

  nunjucksPlugin.addFilter('interpolate', function (value: string) {
    const utils = require('amagaki/src/utils');
    return utils.interpolate(pod, value, this.ctx);
  });

  nunjucksPlugin.addFilter('relative', function (value: string | undefined) {
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
