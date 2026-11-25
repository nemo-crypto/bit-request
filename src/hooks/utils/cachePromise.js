const cachePromise = new Map();

const getCachePromise = (cacheKey) => {
  return cachePromise.get(cacheKey);
};

const setCachePromise = (cacheKey, promise) => {
  // Should cache the same promise, cannot be promise.finally
  // Because the promise.finally will change the reference of the promise
  cachePromise.set(cacheKey, promise);

  // 仅清理当前请求拥有的条目，旧请求完成不能删除后来的请求。
  const release = () => {
    if (cachePromise.get(cacheKey) === promise) cachePromise.delete(cacheKey);
  };
  promise.then(release, release);
};

export { getCachePromise, setCachePromise };
