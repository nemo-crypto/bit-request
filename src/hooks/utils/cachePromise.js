const cachePromise = new Map();

const getCachePromise = (cacheKey) => {
  return cachePromise.get(cacheKey);
};

const setCachePromise = (cacheKey, promise) => {
  // Should cache the same promise, cannot be promise.finally
  // Because the promise.finally will change the reference of the promise
  cachePromise.set(cacheKey, promise);

  // no use promise.finally for compatibility
  promise
    .then((res) => {
      cachePromise.delete(cacheKey);
      return res;
    })
    .catch(() => {
      cachePromise.delete(cacheKey);
    });
};

export { getCachePromise, setCachePromise };
