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

test('request-hook failures preserve their identity when no rejection hook is configured', async () => {
  const failure = new Error('cannot prepare request');
  let sent = false;
  const request = new Request({ transform: {}, adapter: async () => { sent = true; } });
  request.setRequestHooks({ beforeRequestHook: () => { throw failure; } });
  await assert.rejects(request.get('/prepare'), (error) => error === failure);
  assert.equal(sent, false);
});

test('an explicit response rejection hook can still recover with a response', async () => {
  const response = { status: 200, data: 'fallback' };
  const request = new Request({
    transform: { responseInterceptorsCatch: () => response },
    adapter: async () => { throw new Error('network unavailable'); },
  });
  assert.equal(await request.get('/fallback'), response);
});
