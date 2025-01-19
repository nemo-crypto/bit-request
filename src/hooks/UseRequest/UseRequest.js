import { useEffect, useRef } from 'react';
import useCreation from '../UseCreation';
import useMemoizedFn from '../UseMemoizedFn';
import useUpdate from '../UseUpdate';
import Fetch from './Fetch';

function useRequest(service, options, plugins) {
  const { manual = false, ...rest } = options || {};

  const serviceRef = useRef(service);

  const update = useUpdate();

  const fetchOptions = { manual, ...rest };

  const fetchInstance = useCreation(() => {
    /**
     * {loading, data, params, error}
     */
    const initState = plugins
      .map((p) => p?.onInit?.(fetchOptions))
      .filter(Boolean);

    return new Fetch(
      serviceRef,
      fetchOptions,
      update,
      Object.assign({}, ...initState),
    );
  }, []);

  fetchInstance.options = fetchOptions;

  fetchInstance.plugins = plugins.map((p) => p(fetchInstance, fetchOptions));

  useEffect(() => {
    if (!manual) {
      const params = fetchInstance.state.params || options.defaultParams || [];
      fetchInstance.run(...params);
    }
    return () => {
      fetchInstance.cancel();
    };
  }, []);

  return {
    loading: fetchInstance.state.loading,
    data: fetchInstance.state.data,
    error: fetchInstance.state.error,
    params: fetchInstance.state.params || [],
    cancel: useMemoizedFn(fetchInstance.cancel.bind(fetchInstance)),
    refresh: useMemoizedFn(fetchInstance.refresh.bind(fetchInstance)),
    refreshAsync: useMemoizedFn(fetchInstance.refreshAsync.bind(fetchInstance)),
    run: useMemoizedFn(fetchInstance.run.bind(fetchInstance)),
    runAsync: useMemoizedFn(fetchInstance.runAsync.bind(fetchInstance)),
    mutate: useMemoizedFn(fetchInstance.mutate.bind(fetchInstance)),
  };
}

export default useRequest;
