const cache = new Map();

const setCache = (key, cacheTime, cachedData) => {
  const currentCache = cache.get(key);
  if (currentCache?.timer) {
    clearTimeout(currentCache.timer);
  }

  let timer = undefined;

  if (cacheTime > -1) {
    // if cache out, clear it
    timer = setTimeout(() => {
      cache.delete(key);
    }, cacheTime);
  }

  cache.set(key, {
    ...cachedData,
    timer,
  });
};

const getCache = (key) => {
  return cache.get(key);
};

const clearCache = (key) => {
  const cacheKeys = key === undefined
    ? [...cache.keys()]
    : Array.isArray(key) ? key : [key];
  cacheKeys.forEach((cacheKey) => {
    const entry = cache.get(cacheKey);
    if (entry?.timer !== undefined) clearTimeout(entry.timer);
    cache.delete(cacheKey);
  });
};

export { clearCache, getCache, setCache };
