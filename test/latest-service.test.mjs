import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import TestRenderer from 'react-test-renderer';
import { loadSource } from './helpers/load-source.mjs';
const { act, create } = TestRenderer;
const { default: useRequest } = loadSource('../../src/hooks/UseRequest/index.js');

test('rerendered hooks invoke the latest service callback', async () => {
  let current, root;
  const calls = [];
  function Probe({ service }) { current = useRequest(service, { manual: true }); return null; }
  const first = async (id) => { calls.push(`old:${id}`); return 'old'; };
  const next = async (id) => { calls.push(`new:${id}`); return 'new'; };
  try {
    await act(async () => { root = create(React.createElement(Probe, { service: first })); });
    await act(async () => { await current.runAsync(1); });
    await act(async () => { root.update(React.createElement(Probe, { service: next })); });
    await act(async () => { await current.runAsync(2); });
    assert.deepEqual(calls, ['old:1', 'new:2']);
    assert.equal(current.data, 'new');
  } finally { if (root) act(() => root.unmount()); }
});
