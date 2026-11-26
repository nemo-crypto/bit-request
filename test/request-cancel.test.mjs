import assert from 'node:assert/strict';
import test from 'node:test';
import axios from 'axios';
import { loadSource } from './helpers/load-source.mjs';
const { Request } = loadSource('../../src/Request/request.js');
const settle = (promise) => Promise.race([
  promise.then((value) => ({ value }), (error) => ({ error })),
  new Promise((resolve) => setTimeout(() => resolve({ pending: true }), 50)),
]);

test('a pre-aborted request rejects instead of leaving the caller pending', async () => {
  const controller = new AbortController();
  controller.abort();
  const request = new Request({});
  const result = await settle(request.get('/cancelled', {}, { signal: controller.signal }));
  assert.equal(result.pending, undefined);
  assert.ok(axios.isCancel(result.error));
});
