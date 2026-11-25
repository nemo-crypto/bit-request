import assert from 'node:assert/strict';
import test from 'node:test';
import { getCachePromise, setCachePromise } from '../src/hooks/utils/cachePromise.js';

const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};

test('an older request resolving does not evict its in-flight replacement', async () => {
  const first = deferred();
  const next = deferred();
  setCachePromise('replace', first.promise);
  setCachePromise('replace', next.promise);
  first.resolve('old');
  await first.promise;
  assert.equal(getCachePromise('replace'), next.promise);
  next.resolve('new');
  await next.promise;
  assert.equal(getCachePromise('replace'), undefined);
});
