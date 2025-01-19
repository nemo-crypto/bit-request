import { isArray, isFunction } from 'lodash';
import { default as request } from '../../Request';
import autoRunPlugin from './Plugins/autoRunPlugin';
import cachePlugin from './Plugins/catchPlugin';
import debouncePlugin from './Plugins/debouncePlugin';
import loadingDeleyPlugin from './Plugins/loadingDeleyPlugin';
import pollingInterval from './Plugins/pollingPlugin';
import refreshOnWindowFocusPlugin from './Plugins/refreshOnWindowFocusPlugin';
import throttlePlugin from './Plugins/throttlePlugin';
import { default as requestHook } from './UseRequest';

const fetch = (service) => () => {
  const [url, config, options] = service;
  return request.request({ url, method: 'GET', ...config }, options);
};

function useRequest(service, options, plugins) {
  let servicefn = () => new Promise(() => {});
  if (isFunction(service)) {
    servicefn = service;
  } else if (isArray(service)) {
    servicefn = fetch(service);
  }
  return requestHook(servicefn, options || {}, [
    ...(plugins || []),
    autoRunPlugin,
    cachePlugin,
    loadingDeleyPlugin,
    pollingInterval,
    throttlePlugin,
    debouncePlugin,
    refreshOnWindowFocusPlugin,
  ]);
}

export default useRequest;
