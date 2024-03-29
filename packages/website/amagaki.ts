/* eslint-disable node/no-unpublished-import */

import * as codeTabs from './plugins/codeTabs';
import * as githubContributors from './plugins/githubContributors';

import {
  Document,
  NunjucksPlugin,
  NunjucksTemplateEngine,
  Pod,
  Url,
  interpolate,
} from '@amagaki/amagaki';

export default (pod: Pod) => {
  pod.configure({
    meta: {
      siteTitle: 'Amagaki',
      githubEditRoot: 'https://github.com/blinkk/amagaki/edit/main/packages/website',
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
    return interpolate(pod, value, this.ctx);
  });
};
