import test from 'node:test';
import assert from 'node:assert/strict';
import {loadSource} from './helpers/load-source.mjs';
function translate(search) {
  const previous = globalThis.window;
  globalThis.window = {location: {search}};
  try { return loadSource('../../src/i18n.js').default('err.400'); }
  finally { if (previous === undefined) delete globalThis.window; else globalThis.window = previous; }
}
test('unknown query locale falls back to English instead of crashing import', () => {
  assert.match(translate('?hl=unknown'), /Bad Request/);
  assert.match(translate('?hl=..%2Fpackage'), /Bad Request/);
});
test('supported query locale is retained', () => {
  assert.equal(translate('?hl=zh_CN'), '错误请求：服务器无法理解该请求。');
});
