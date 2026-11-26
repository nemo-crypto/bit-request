import test from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';
import {loadSource} from './helpers/load-source.mjs';
const {createRequest} = loadSource('../../src/Request/index.js');
function harness() {
  const pending = [];
  const request = createRequest({adapter: config => new Promise(resolve => {
    pending.push({config, finish: () => resolve({status: 200, data: {code: 0}, config, headers: {}})});
  })});
  const start = async config => {
    const promise = request.get('/same', {}, config).then(value => ({value}), error => ({error}));
    await new Promise(resolve => setImmediate(resolve));
    return {promise, ...pending.at(-1)};
  };
  return {start};
}
test('separate request clients never cancel each other', async () => {
  const a = await harness().start();
  const b = await harness().start();
  a.finish(); b.finish();
  assert.equal((await a.promise).error, undefined);
  assert.equal((await b.promise).error, undefined);
});
test('a cancelled old response cannot unregister its replacement', async () => {
  const h = harness();
  const a = await h.start();
  const b = await h.start();
  a.finish();
  assert.ok(axios.isCancel((await a.promise).error));
  const c = await h.start();
  b.finish(); c.finish();
  assert.ok(axios.isCancel((await b.promise).error));
  assert.equal((await c.promise).error, undefined);
});
test('caller signals retain cancellation while duplicate suppression still works', async () => {
  const h = harness(), controller = new AbortController();
  const a = await h.start({signal: controller.signal});
  const b = await h.start();
  a.finish(); b.finish();
  assert.ok(axios.isCancel((await a.promise).error));
  assert.equal(controller.signal.aborted, false);
  assert.equal((await b.promise).error, undefined);
  const c = await h.start({signal: controller.signal});
  controller.abort(); c.finish();
  assert.ok(axios.isCancel((await c.promise).error));
});
