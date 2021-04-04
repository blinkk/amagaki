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
    const result = await pod.builder.export();
    t.true(result.manifest.files.length > 0);
  });
}
