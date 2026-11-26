import assert from 'node:assert/strict';
import test from 'node:test';
import { loadSource } from './helpers/load-source.mjs';
const { Request } = loadSource('../../src/Request/request.js');

test('partial transforms do not convert transport errors into successful undefined values', async () => {
  const failure = new Error('network unavailable');
  const request = new Request({
    transform: {}, requestOptions: { ignoreCancelToken: true },
    adapter: async () => { throw failure; },
  });
  await assert.rejects(request.get('/failed'), (error) => error === failure);
});
