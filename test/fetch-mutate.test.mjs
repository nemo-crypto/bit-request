import assert from 'node:assert/strict';
import test from 'node:test';
import Fetch from '../src/hooks/UseRequest/Fetch.js';

test('mutate accepts a replacement value and notifies consumers', () => {
  let updates = 0;
  const fetch = new Fetch({ current: async () => null }, { manual: true }, () => { updates += 1; }, { data: 'old' });
  const received = [];
  fetch.plugins = [{ onMutate: (value) => received.push(value) }];
  fetch.mutate('new');
  assert.equal(fetch.state.data, 'new');
  assert.equal(updates, 1);
  assert.deepEqual(received, ['new']);
});

test('functional mutation receives current data and supports falsy replacements', () => {
  const fetch = new Fetch({ current: async () => null }, { manual: true }, () => {}, { data: 2 });
  fetch.mutate((previous) => previous * 3);
  assert.equal(fetch.state.data, 6);
  fetch.mutate(() => 0);
  assert.equal(fetch.state.data, 0);
  fetch.mutate(null);
  assert.equal(fetch.state.data, null);
});
