import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer from 'react-test-renderer';
import {loadSource} from './helpers/load-source.mjs';
const {act, create} = TestRenderer;
const {default: useRequest} = loadSource('../../src/hooks/UseRequest/index.js');
test('fresh cache hits never activate delayed loading', async t => {
  t.mock.timers.enable({apis: ['setTimeout']});
  let current, root, calls = 0;
  function Probe() {
    current = useRequest(async () => { calls++; return 'cached'; }, {
      manual: true, cacheKey: 'delay-cache-hit', cacheTime: -1, staleTime: -1, loadingDeley: 100,
    });
    return null;
  }
  try {
    await act(async () => { root = create(React.createElement(Probe)); });
    await act(async () => { await current.runAsync(); });
    await act(async () => { assert.equal(await current.runAsync(), 'cached'); });
    act(() => t.mock.timers.tick(200));
    assert.equal(calls, 1);
    assert.equal(current.loading, false);
  } finally { if (root) act(() => root.unmount()); }
});
