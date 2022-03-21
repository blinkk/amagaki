import {BuildRouteOptions, Pod, Route, RouteProvider} from '@amagaki/amagaki';
import { PageBuilder, PageBuilderDocumentFields } from './page-builder';

import {ExecutionContext} from 'ava';
import test from 'ava';

test('PageBuilder', async (t: ExecutionContext) => {
  const pod = new Pod('./example');
  await pod.router.warmup();
  const html = await (await pod.router.resolve('/pages/') as Route).build();
  t.true(html.includes('<title>Homepage | Example</title>'));
  t.true(html.includes('<link href="http://localhost/pages/" hreflang="x-default" rel="alternate">'));
  t.true(html.includes('<link href="http://localhost/ja/pages/" hreflang="ja" rel="alternate">'));
  t.true(html.includes('<page-module'));
  t.true(html.includes('<page-module partial="header"'));
  t.true(html.includes('<page-module partial="custom-footer"'));
  t.true(html.includes('<page-module-container'));
  t.false(html.includes('<page-inspector'));
  t.false(html.includes('<page-module-context'));
  t.false(html.includes('<page-module-inspector'));
  t.false(html.includes('page-builder-ui.min.js'));
});

test('PageBuilder dev', async (t: ExecutionContext) => {
  const pod = new Pod('./example', {dev: true, name: 'test'});
  await pod.router.warmup();
  const html = await (await pod.router.resolve('/pages/') as Route).build();
  t.true(html.includes('<link href="http://localhost/pages/" hreflang="x-default" rel="alternate">'));
  t.true(html.includes('<link href="http://localhost/ja/pages/" hreflang="ja" rel="alternate">'));
  t.true(html.includes('<page-module'));
  t.true(html.includes('<page-module partial="header"'));
  t.true(html.includes('<page-module partial="custom-footer"'));
  t.true(html.includes('<page-inspector'));
  t.true(html.includes('<page-module-context'));
  t.true(html.includes('<page-module-inspector'));
  t.true(html.includes('page-builder-ui.min.js'));
});


test('Building custom routes', async(t: ExecutionContext) => {
  const pod = new Pod('./example');
  pod.router.addRoutes('custom', async (provider: RouteProvider) => {
    provider.addRoute({
      urlPath: '/custom/',
      build: async (options) => {
        const fields: PageBuilderDocumentFields = {
          title: 'Custom Page',
          partials: [{
            partial: 'hero',
            title: 'Hello World',
          }]
        }
        return PageBuilder.buildFromRoute(pod, '/custom/', fields, options);
      }
    });
  });
  const html = await (await pod.router.resolve('/custom/') as Route).build();
  t.true(html.includes('<title>Custom Page | Example</title>'));
  t.true(html.includes('<h1>Hello World</h1>'));
});
