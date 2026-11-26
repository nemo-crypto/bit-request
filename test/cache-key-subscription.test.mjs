import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer from 'react-test-renderer';
import {loadSource} from './helpers/load-source.mjs';
const {act, create} = TestRenderer;
const {default: useRequest} = loadSource('../../src/hooks/UseRequest/index.js');
function setup(prefix) {
  let current, sourceA, sourceB, root;
  function Probe({cacheKey}) {
    const options = {manual: true, cacheTime: -1, staleTime: -1};
    current = useRequest(async () => 'network', {...options, cacheKey});
    sourceA = useRequest(async () => 'a', {...options, cacheKey: prefix + 'a'});
    sourceB = useRequest(async () => 'b', {...options, cacheKey: prefix + 'b'});
    return null;
  }
  act(() => {root = create(React.createElement(Probe, {cacheKey: prefix + 'a'}));});
  return {get current() {return current;}, get a() {return sourceA;}, get b() {return sourceB;},
    change(key) {act(() => root.update(React.createElement(Probe, {cacheKey: key})));},
    close() {act(() => root.unmount());}};
}
test('changing cacheKey replaces both the visible data and subscription', () => {
  const h = setup('key-switch-');
  try {
    act(() => {h.a.mutate('old'); h.b.mutate('new');});
    h.change('key-switch-b');
    assert.equal(h.current.data, 'new');
    act(() => h.a.mutate('old-update'));
    assert.equal(h.current.data, 'new');
    act(() => h.b.mutate('new-update'));
    assert.equal(h.current.data, 'new-update');
  } finally {h.close();}
});

test('disabling and re-enabling a cache key cleans up and restores subscriptions', () => {
  const h = setup('key-enable-');
  try {
    act(() => h.a.mutate('before'));
    h.change(undefined);
    assert.equal(h.current.data, undefined);
    act(() => h.a.mutate('after'));
    assert.equal(h.current.data, undefined);
    h.change('key-enable-a');
    assert.equal(h.current.data, 'after');
    act(() => h.a.mutate('live'));
    assert.equal(h.current.data, 'live');
  } finally {h.close();}
});
