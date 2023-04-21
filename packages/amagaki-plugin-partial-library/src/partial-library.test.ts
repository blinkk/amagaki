import {BuildRouteOptions, Pod, Route, RouteProvider} from '@amagaki/amagaki';
import { PartialLibraryPlugin } from './partial-library';

import {ExecutionContext} from 'ava';
import test from 'ava';

test('PageBuilder', async (t: ExecutionContext) => {
  // TODO: Test that the partial library is registered and contains information
  // about the partials used in a page.
  t.true(true);

  // const pod = new Pod('./example');
  // await pod.router.warmup();
  // const html = await (await pod.router.resolve('/pages/') as Route).build();
  // t.true(html.includes('<title>Homepage | Example</title>'));
  // t.true(html.includes('<link href="http://localhost/pages/" hreflang="x-default" rel="alternate">'));
  // t.true(html.includes('<link href="http://localhost/ja/pages/" hreflang="ja" rel="alternate">'));
  // t.true(html.includes('<page-module'));
  // t.true(html.includes('<page-module partial="header"'));
  // t.true(html.includes('<page-module partial="custom-footer"'));
  // t.true(html.includes('<page-module-container'));
});