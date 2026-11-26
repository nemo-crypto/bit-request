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
