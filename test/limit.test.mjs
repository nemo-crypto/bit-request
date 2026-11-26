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

test('successful refreshes retain the rate limit and forward arguments', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const calls = [];
  const refresh = limit((...args) => calls.push(args), 20);
  refresh('first', 1);
  refresh('ignored', 2);
  t.mock.timers.tick(19);
  refresh('still ignored');
  assert.deepEqual(calls, [['first', 1]]);
  t.mock.timers.tick(1);
  refresh('next', 3);
  assert.deepEqual(calls, [['first', 1], ['next', 3]]);
});
