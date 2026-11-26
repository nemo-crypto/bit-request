import test from 'node:test';
import assert from 'node:assert/strict';
import { loadSource } from './helpers/load-source.mjs';
const { createRequest } = loadSource('../../src/Request/index.js');
function client(status, data) {
  return createRequest({adapter: async config => ({status, data, config, headers: {}, statusText: ''})});
}
test('created and accepted responses resolve their data', async () => {
  for (const status of [201, 202, 206]) {
    const data = {code: 0, id: 7};
    assert.deepEqual(await client(status, data).post('/items', {}), data);
  }
});
test('no-content responses and falsy JSON payloads remain successful', async () => {
  for (const [status, data] of [[204, ''], [200, false], [200, 0], [200, null], [200, 'ok']]) {
    assert.equal(await client(status, data).get('/payload.json'), data);
  }
});

test('native responses retain headers and failed statuses still reject', async () => {
  const native = await client(204, '').get('/empty', {}, {}, {isReturnNativeResponse: true});
  assert.equal(native.status, 204);
  for (const status of [300, 400, 503]) {
    await assert.rejects(client(status, {code: 1}).get('/error'), error => error.status === status);
  }
});
