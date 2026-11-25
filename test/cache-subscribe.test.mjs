import assert from 'node:assert/strict';
import test from 'node:test';
import { subscribe, trigger } from '../src/hooks/utils/cacheSubscribe.js';

test('repeated cleanup does not unsubscribe another consumer', () => {
  const calls = [];
  const stopA = subscribe('cleanup', () => calls.push('a'));
  const stopB = subscribe('cleanup', () => calls.push('b'));
  stopA();
  stopA();
  trigger('cleanup', 1);
  assert.deepEqual(calls, ['b']);
  stopB();
});

test('cache keys can match Object prototype properties', () => {
  for (const key of ['__proto__', 'constructor', 'toString']) {
    const values = [];
    const stop = subscribe(key, (value) => values.push(value));
    trigger(key, 42);
    stop();
    trigger(key, 43);
    assert.deepEqual(values, [42]);
  }
});

test('self-unsubscription does not skip the next consumer', () => {
  const calls = [];
  const stopA = subscribe('dispatch', () => { calls.push('a'); stopA(); });
  const stopB = subscribe('dispatch', () => calls.push('b'));
  trigger('dispatch', 1);
  trigger('dispatch', 2);
  assert.deepEqual(calls, ['a', 'b', 'b']);
  stopB();
});

test('each subscription is independent even when callbacks are shared', () => {
  let calls = 0;
  const listener = () => { calls += 1; };
  const stopA = subscribe('shared', listener);
  const stopB = subscribe('shared', listener);
  stopA();
  stopA();
  trigger('shared');
  assert.equal(calls, 1);
  stopB();
  const stopC = subscribe('shared', listener);
  stopA();
  trigger('shared');
  assert.equal(calls, 2);
  stopC();
});

test('new subscriptions during dispatch join the next notification only', () => {
  const values = [];
  let stopLate;
  const stopFirst = subscribe('late-subscriber', (value) => {
    values.push(`first:${value}`);
    stopLate ??= subscribe('late-subscriber', (next) => values.push(`late:${next}`));
  });
  trigger('late-subscriber', 1);
  assert.deepEqual(values, ['first:1']);
  trigger('late-subscriber', 2);
  assert.deepEqual(values, ['first:1', 'first:2', 'late:2']);
  stopFirst();
  stopLate();
  trigger('late-subscriber', 3);
  assert.equal(values.length, 3);
});
