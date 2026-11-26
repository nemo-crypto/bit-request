import test from 'node:test';
import assert from 'node:assert/strict';
import {loadSource} from './helpers/load-source.mjs';
function browser(t, online) {
  const events = {};
  const document = {createElement() {}, visibilityState: 'visible'};
  for (const [name, value] of Object.entries({document, navigator: online === undefined ? {} : {onLine: online}, window: {document, addEventListener(name, callback) {events[name] = callback;}}})) {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, {configurable: true, writable: true, value});
    t.after(() => {if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name];});
  }
  const subscribe = loadSource('../../src/hooks/utils/subscribeFocus.js').default;
  return {subscribe, events, document};
}
test('focus refresh works when navigator.onLine is unavailable', t => {
  const b = browser(t);
  let calls = 0;
  b.subscribe(() => calls++);
  b.events.focus();
  assert.equal(calls, 1);
});
test('unsubscribing during focus notification does not skip other listeners', t => {
  const b = browser(t, true), calls = [];
  const off = b.subscribe(() => {calls.push('first'); off();});
  b.subscribe(() => calls.push('second'));
  b.events.focus();
  assert.deepEqual(calls, ['first', 'second']);
  b.events.focus();
  assert.deepEqual(calls, ['first', 'second', 'second']);
});

test('hidden or offline documents suppress refresh until active again', t => {
  const b = browser(t, false);
  let calls = 0;
  b.subscribe(() => calls++);
  b.events.focus();
  assert.equal(calls, 0);
  navigator.onLine = true;
  b.document.visibilityState = 'hidden';
  b.events.visibilitychange();
  assert.equal(calls, 0);
  b.document.visibilityState = 'visible';
  b.events.visibilitychange();
  assert.equal(calls, 1);
});
