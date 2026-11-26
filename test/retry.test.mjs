import assert from 'node:assert/strict';
import test from 'node:test';
import { loadSource } from './helpers/load-source.mjs';
const { AxiosRetry } = loadSource('../../src/Request/retry.js');

test('retry resolves with the retried response and preserves request headers', async () => {
  const retry = new AxiosRetry();
  retry.delay = async () => {};
  const config = { requestOptions: { retryRequest: 1 }, headers: { Authorization: 'Bearer fixture' } };
  const response = { status: 200, data: 'recovered' };
  let received;
  assert.equal(await retry.retry(async (next) => { received = next; return response; }, { config }), response);
  assert.equal(received.headers.Authorization, 'Bearer fixture');
  assert.equal(received.__retryCount, 1);
});

test('disabled, exhausted, invalid, and unconfigured retries reject the original error', async () => {
  const retry = new AxiosRetry();
  let calls = 0;
  const dispatch = async () => { calls += 1; };
  for (const option of [false, 0, { count: 0 }, -1, NaN, Infinity]) {
    const error = Object.assign(new Error('offline'), { config: { requestOptions: { retryRequest: option } } });
    await assert.rejects(retry.retry(dispatch, error), (value) => value === error);
  }
  const missing = new Error('no request configuration');
  await assert.rejects(retry.retry(dispatch, missing), (value) => value === missing);
  const exhausted = Object.assign(new Error('exhausted'), { config: { requestOptions: { retryRequest: 1 }, __retryCount: 1 } });
  await assert.rejects(retry.retry(dispatch, exhausted), (value) => value === exhausted);
  assert.equal(calls, 0);
});

test('retry forwards downstream failures rather than resolving undefined', async () => {
  const retry = new AxiosRetry();
  retry.delay = async () => {};
  const failure = new Error('still unavailable');
  const error = { config: { requestOptions: { retryRequest: 1 } } };
  await assert.rejects(retry.retry(async () => { throw failure; }, error), (value) => value === failure);
});

test('the browser response interceptor returns the retry result to its caller', async (t) => {
  const previous = globalThis.window;
  globalThis.window = { location: { search: '' } };
  let transform;
  try { ({ transform } = loadSource('../../src/Request/transform.js')); }
  finally {
    if (previous === undefined) delete globalThis.window;
    else globalThis.window = previous;
  }
  t.mock.timers.enable({ apis: ['setTimeout'] });
  t.mock.method(Math, 'random', () => 0);
  const response = { status: 200, data: 'retry result' };
  const error = Object.assign(new Error('temporary'), { config: { method: 'get', requestOptions: { retryRequest: 1, errorMessageMode: 'none' } } });
  const result = transform.responseInterceptorsCatch(async () => response, error);
  t.mock.timers.tick(1000);
  assert.equal(await result, response);
});
