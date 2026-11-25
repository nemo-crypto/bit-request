import assert from 'node:assert/strict';
import test from 'node:test';
import { clearCache, getCache, setCache } from '../src/hooks/utils/cache.js';

test('clearing a key cancels its expiry before the key is reused', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  t.after(() => clearCache());
  setCache('reused', 10, { data: 'old' });
  clearCache('reused');
  setCache('reused', -1, { data: 'new' });
  t.mock.timers.tick(10);
  assert.equal(getCache('reused').data, 'new');
});
