import { useEffect, useRef } from 'react';
import useCreation from '../../UseCreation';
import { getCache, setCache } from '../../utils/cache';
import { getCachePromise, setCachePromise } from '../../utils/cachePromise';
import { subscribe, trigger } from '../../utils/cacheSubscribe';

const cachePlugin = (
  fetchInstance,
  {
    cacheKey,
    cacheTime = 5 * 60 * 1000,
    staleTime = 0,
    setCache: customSetCache,
    getCache: customGetCache,
  },
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const previousKeyRef = useRef(cacheKey);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const currentPromiseRef = useRef();

  const _setCache = (key, cachedData) => {
    if (customSetCache) {
      customSetCache(cachedData);
    } else {
      setCache(key, cacheTime, cachedData);
    }
    trigger(key, cachedData.data);
  };

  const _getCache = (key, params) => {
    if (customGetCache) {
      return customGetCache(params);
    }
    return getCache(key);
  };
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useCreation(() => {
    if (!cacheKey) {
      return;
    }

    // get data from cache when init
    const cacheData = _getCache(cacheKey);
    if (cacheData && Object.hasOwnProperty.call(cacheData, 'data')) {
      fetchInstance.state.data = cacheData.data;
      fetchInstance.state.params = cacheData.params;
      if (
        staleTime === -1 ||
        new Date().getTime() - cacheData.time <= staleTime
      ) {
        fetchInstance.state.loading = false;
      }
    }

  }, []);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (previousKeyRef.current !== cacheKey) {
      // 旧请求的结果不应写入新缓存键；同时清除旧键的数据和错误状态。
      fetchInstance.cancel();
      currentPromiseRef.current = undefined;
      const cached = cacheKey ? _getCache(cacheKey) : undefined;
      fetchInstance.setState({ data: cached?.data, params: cached?.params, error: undefined, loading: false });
      previousKeyRef.current = cacheKey;
    }
    if (!cacheKey) return;
    return subscribe(cacheKey, data => fetchInstance.setState({ data }));
  }, [cacheKey]);

  if (!cacheKey) {
    return {};
  }

  return {
    onBefore: (params) => {
      const cacheData = _getCache(cacheKey, params);

      if (!cacheData || !Object.hasOwnProperty.call(cacheData, 'data')) {
        return {};
      }

      // If the data is fresh, stop request
      if (
        staleTime === -1 ||
        new Date().getTime() - cacheData.time <= staleTime
      ) {
        return {
          loading: false,
          data: cacheData?.data,
          error: undefined,
          returnNow: true,
        };
      } else {
        // If the data is stale, return data, and request continue
        return {
          data: cacheData?.data,
          error: undefined,
        };
      }
    },
    onRequest: (service, args) => {
      let servicePromise = getCachePromise(cacheKey);

      // If has servicePromise, and is not trigger by self, then use it
      if (servicePromise && servicePromise !== currentPromiseRef.current) {
        return { servicePromise };
      }

      servicePromise = service(...args);
      currentPromiseRef.current = servicePromise;
      setCachePromise(cacheKey, servicePromise);
      return { servicePromise };
    },
    onSuccess: (data, params) => {
      if (cacheKey) {
        _setCache(cacheKey, {
          data,
          params,
          time: new Date().getTime(),
        });
      }
    },
    onMutate: (data) => {
      if (cacheKey) {
        _setCache(cacheKey, {
          data,
          params: fetchInstance.state.params,
          time: new Date().getTime(),
        });
      }
    },
  };
};

export default cachePlugin;
