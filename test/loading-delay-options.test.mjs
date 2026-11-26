import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer from 'react-test-renderer';
import { loadSource } from './helpers/load-source.mjs';
const { act, create } = TestRenderer;
const { default: useRequest } = loadSource('../../src/hooks/UseRequest/index.js');

test('disabling loading delay while a request is pending cannot leave loading stuck after success', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let current, root, resolve;
  function Probe({ delay }) {
    current = useRequest(() => new Promise(r => { resolve = r; }), { manual: true, loadingDeley: delay });
    return null;
  }
  try {
    await act(async () => { root = create(React.createElement(Probe, { delay: 100 })); });
    let request;
    act(() => { request = current.runAsync(); });
    act(() => { root.update(React.createElement(Probe, { delay: 0 })); });
    await act(async () => { resolve('done'); await request; });
    act(() => t.mock.timers.tick(200));
    assert.equal(current.data, 'done');
    assert.equal(current.loading, false);
  } finally { if (root) act(() => root.unmount()); }
});

test('disabling delay before a failed request and unmount also clears its pending timer', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let current, root, reject;
  function Probe({ delay }) {
    current = useRequest(() => new Promise((_, r) => { reject = r; }), { manual: true, loadingDeley: delay });
    return null;
  }
  try {
    await act(async () => { root = create(React.createElement(Probe, { delay: 100 })); });
    let request;
    act(() => { request = current.runAsync().catch(error => error); });
    act(() => root.update(React.createElement(Probe, { delay: 0 })));
    await act(async () => { reject(new Error('offline')); await request; });
    act(() => t.mock.timers.tick(200));
    assert.equal(current.loading, false);
    assert.equal(current.error.message, 'offline');
    act(() => root.update(React.createElement(Probe, { delay: 100 })));
    act(() => current.run());
    act(() => root.unmount());
    root = null;
    act(() => t.mock.timers.tick(200));
  } finally { if (root) act(() => root.unmount()); }
});
