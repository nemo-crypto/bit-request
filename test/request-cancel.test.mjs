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

test('cancellation after the adapter starts also rejects with the original error', async () => {
  const controller = new AbortController();
  let started;
  const ready = new Promise((resolve) => { started = resolve; });
  const cancellation = new axios.CanceledError('cancelled by caller');
  const request = new Request({ adapter: (config) => new Promise((_resolve, reject) => {
    config.signal.addEventListener('abort', () => reject(cancellation), { once: true });
    started();
  }) });
  const response = request.get('/slow', {}, { signal: controller.signal });
  await ready;
  controller.abort();
  const result = await settle(response);
  assert.equal(result.pending, undefined);
  assert.equal(result.error, cancellation);
});
