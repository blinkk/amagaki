import {ExecutionContext} from 'ava';
import {Pod} from './pod';
import {Route} from './router';
import test from 'ava';

test('Environment fields', async (t: ExecutionContext) => {
  const pod = new Pod('./fixtures/environment/');
  const route = (await pod.router.resolve('/')) as Route;
  t.is('default,,http://localhost/', await route.build());
  pod.setEnvironment('prod');
  t.is('prod,foo,https://prod.com/', await route.build());
  pod.setEnvironment('staging');
  t.is('staging,bar,https://example.com/', await route.build());
});
