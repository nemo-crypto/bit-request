import test from 'node:test';
import assert from 'node:assert/strict';
import {loadSource} from './helpers/load-source.mjs';
const {getParameterByName} = loadSource('../../src/utils.js');
test('parameter names are matched literally and fragments are excluded', () => {
  assert.equal(getParameterByName('a.b', '?axb=wrong&a.b=right'), 'right');
  assert.equal(getParameterByName('a+b', '?a+b=encoded-space&a%2Bb=literal'), 'literal');
  assert.equal(getParameterByName('x', 'https://example.com/#?x=fragment'), '');
});
test('malformed encodings and missing browser globals do not crash parsing', () => {
  assert.equal(getParameterByName('hl', '?hl=%ZZ'), '%ZZ');
  assert.equal(getParameterByName('x'), '');
  assert.equal(getParameterByName('x', ''), '');
});

test('browser fallback, repeated values and explicit empty URLs stay distinct', () => {
  const previous = globalThis.window;
  globalThis.window = {location: {search: '?x=first+value&x=second&empty='}};
  try {
    assert.equal(getParameterByName('x'), 'first value');
    assert.equal(getParameterByName('x', ''), '');
    assert.equal(getParameterByName('empty'), '');
    assert.equal(getParameterByName('absent'), '');
  } finally { if (previous === undefined) delete globalThis.window; else globalThis.window = previous; }
});
