import {BuildCommand} from './build';
import {ExecutionContext} from 'ava';
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
