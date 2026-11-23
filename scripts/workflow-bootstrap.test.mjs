import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { posix } from 'node:path';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

// Exercise the unchanged upstream template without cloning repositories or
// modifying the developer's real machine. Only its Node built-ins are replaced.
const source = readFileSync(new URL('./workflow-bootstrap.mjs', import.meta.url), 'utf8')
  .replace(/^import .+ from "node:[^"]+";\r?$/gm, '');

function bootstrap({ env = {}, present = true, throws = false, failed = false } = {}) {
  const calls = [];
  const errors = [];
  runInNewContext(source, {
    process: { env, execPath: '/node' },
    homedir: () => '/home/test',
    join: posix.join,
    existsSync: () => present,
    spawnSync: (...args) => {
      calls.push(args);
      if (throws) throw new Error('offline');
      return { status: failed ? 1 : 0 };
    },
    console: { error: message => errors.push(message) },
  });
  return { calls, errors };
}

test('npm prepare invokes the shared bootstrap', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.scripts.prepare, 'node scripts/workflow-bootstrap.mjs');
});

test('CI and explicit skip perform no machine setup', () => {
  for (const env of [{ CI: 'true' }, { WORKFLOW_BOOTSTRAP_SKIP: '1' }]) {
    assert.deepEqual(bootstrap({ env }), { calls: [], errors: [] });
  }
});

test('an existing managed copy runs bootstrap without cloning', () => {
  const { calls, errors } = bootstrap();
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], '/node');
  assert.deepEqual(Array.from(calls[0][1]), ['/home/test/.workflow/bin/delivery.mjs', 'bootstrap']);
  assert.equal(calls[0][2].timeout, 120_000);
  assert.equal(errors.length, 0);
});

test('a missing copy attempts only the trusted upstream clone', () => {
  const { calls, errors } = bootstrap({ present: false });
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], 'git');
  assert.deepEqual(Array.from(calls[0][1]), [
    'clone', '--quiet', 'https://github.com/timurproko/MyWorkflows.git', '/home/test/.workflow',
  ]);
  assert.equal(errors.length, 1);
});

test('a failed command does not fail dependency installation', () => {
  assert.doesNotThrow(() => bootstrap({ failed: true }));
});

test('unexpected setup errors are reported without failing the caller', () => {
  const { errors } = bootstrap({ throws: true });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /shared workflow bootstrap skipped: offline/);
});
