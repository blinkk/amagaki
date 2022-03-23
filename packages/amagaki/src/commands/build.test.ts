import {BuildCommand} from './build';
import {ExecutionContext} from 'ava';
import fs from 'fs';
import path from 'path';
import test from 'ava';

const root = path.join(__dirname, '..', '..', 'fixtures', 'simple');

test('Build simple fixture', async (t: ExecutionContext) => {
  const cmd = new BuildCommand({}, {});
  await cmd.run(root);
  t.pass();
});

test('Build simple fixture with patterns', async (t: ExecutionContext) => {
  const cmd = new BuildCommand(
    {},
    {
      pattern: ['**/index.yaml'],
    }
  );
  await cmd.run(root);
  t.pass();
});

test('Build with environment', async (t: ExecutionContext) => {
  const root = path.join(__dirname, '..', '..', 'fixtures', 'environment');
  const cmd = new BuildCommand({env: 'prod'}, {});
  await cmd.run(root);
  const html = fs.readFileSync(path.join(root, 'build', 'index.html'), 'utf8');
  t.true(html.includes('prod.com'));
});
