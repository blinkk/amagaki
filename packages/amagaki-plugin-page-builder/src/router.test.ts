import {Pod, Route} from '@amagaki/amagaki';

import {ExecutionContext} from 'ava';
import test from 'ava';

test('Page builder UI files', async (t: ExecutionContext) => {
  const pod = new Pod('./example', {dev: true, name: 'staging'});
  await pod.router.warmup();
  const paths = [
    '/_page-builder/page-builder-ui.min.js',
    '/_page-builder/page-builder-ui.min.css',
    '/_page-builder/assets/check-lg.svg',
  ];
  for (const path of paths) {
    const resp = await (await pod.router.resolve(path) as Route).build();
    t.truthy(resp);
  }
});
