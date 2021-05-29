import * as fs from 'fs';
import * as path from 'path';

import {ExecutionContext} from 'ava';
import {Pod} from './pod';
import test from 'ava';

const fixturesDir = path.join(__dirname, '..', 'fixtures');
const fixtures = fs
  .readdirSync(fixturesDir, {withFileTypes: true})
  .map(item => item.name)
  .filter(item => !item.startsWith('.'));

for (const fixture of fixtures) {
  test(`Build fixture: ${fixture}`, async (t: ExecutionContext) => {
    const pod = new Pod(`./fixtures/${fixture}/`);
    const routes = await pod.router.routes();
    if (!routes.length) {
      t.pass(
        `NOTE: Skipped testing fixture ${fixture} as no routes were found.`
      );
      return;
    }
    const result = await pod.builder.export();
    t.true(result.manifest.files.length > 0);
  });
}

test('Build example', async (t: ExecutionContext) => {
  const pod = new Pod('./example/');
  const result = await pod.builder.export();
  t.true(result.manifest.files.length > 0);
});
