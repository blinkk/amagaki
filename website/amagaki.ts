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

import {PageBuilder} from '@amagaki/amagaki-plugin-page-builder';

export default (pod: Pod) => {
  PageBuilder.register(pod, {
    head: {
      siteName: 'Amagaki',
      twitterSite: '@amagakicode',
      icon:
        'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2022.73%2022.7%22%3E%3Cpath%20d%3D%22M23.07%2C12.76h0A10.84%2C10.84%2C0%2C0%2C0%2C12.22%2C1.91h0A10.85%2C10.85%2C0%2C0%2C0%2C1.37%2C12.76h0V13A20.77%2C20.77%2C0%2C0%2C0%2C3.3%2C21.68h0A20.77%2C20.77%2C0%2C0%2C0%2C12%2C23.61h.19A10.85%2C10.85%2C0%2C0%2C0%2C23.07%2C12.76Z%22%20transform%3D%22translate%28-1.37%20-0.91%29%22%20style%3D%22fill%3A%23e27f24%22%2F%3E%3Cpath%20d%3D%22M22.33%2C12.46a3.32%2C3.32%2C0%2C0%2C0-2.55-3.6L19%2C8.68V8.36l1%2C.09a.81.81%2C0%2C0%2C0%2C.78-1.2l-1.11-2-2-1.11a.81.81%2C0%2C0%2C0-1.2.78l.09%2C1h-.33l-.17-.74a3.31%2C3.31%2C0%2C0%2C0-3.6-2.54l-1.13.13-.12%2C1.12a3.31%2C3.31%2C0%2C0%2C0%2C2.54%2C3.6l.74.18v.28l-1.32-.13a2.37%2C2.37%2C0%2C0%2C0-2.57%2C2.84l.62%2C3%2C3%2C.63a2.38%2C2.38%2C0%2C0%2C0%2C2.85-2.57L17%2C10.43h.28l.17.74a3.33%2C3.33%2C0%2C0%2C0%2C3.61%2C2.54l1.12-.12Z%22%20transform%3D%22translate%28-1.37%20-0.91%29%22%20style%3D%22fill%3A%232d542d%22%2F%3E%3Cline%20x1%3D%2219.56%22%20y1%3D%223.22%22%20x2%3D%2215.73%22%20y2%3D%227.05%22%20style%3D%22fill%3Anone%3Bstroke%3A%23688248%3Bstroke-linecap%3Around%3Bstroke-miterlimit%3A10%22%2F%3E%3Cpath%20d%3D%22M23.63%2C8.49a11.23%2C11.23%2C0%2C0%2C0-7.16-7.1%22%20transform%3D%22translate%28-1.37%20-0.91%29%22%20style%3D%22fill%3Anone%3Bstroke%3A%2391b166%3Bstroke-miterlimit%3A10%22%2F%3E%3C%2Fsvg%3E',
      scripts: [pod.staticFile('/dist/js/main.min.js')],
      stylesheets: [
        'https://fonts.googleapis.com/css2?family=Manrole:wght@300;400;600;800&amp;display=swap',
        'https://fonts.googleapis.com/icon?family=Material+Icons',
        pod.staticFile('/dist/css/main.css'),
      ],
    },
  });
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
    return interpolate(pod, value, this.ctx);
  });
};
