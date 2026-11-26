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
