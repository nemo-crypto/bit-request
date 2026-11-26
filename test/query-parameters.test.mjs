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
