import assert from 'node:assert/strict';
import test from 'node:test';
import limit from '../src/hooks/utils/limit.js';

test('a throwing refresh does not permanently disable future refreshes', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let calls = 0;
  const refresh = limit(() => { calls += 1; if (calls === 1) throw new Error('offline'); }, 20);
  assert.throws(() => refresh(), /offline/);
  refresh();
  assert.equal(calls, 1);
  t.mock.timers.tick(20);
  refresh();
  assert.equal(calls, 2);
});
