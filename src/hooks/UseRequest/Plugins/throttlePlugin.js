import { throttle } from 'lodash';
import { useEffect, useRef } from 'react';

function throttlePlugin(fetchInstance, options) {
  const { throttleWait } = options;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const throttleRef = useRef();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (throttleWait) {
      const _originRunAsync = fetchInstance.runAsync.bind(fetchInstance);

      throttleRef.current = throttle((callback) => {
        callback();
      }, throttleWait);

      fetchInstance.runAsync = (...args) => {
        return new Promise((resolve, reject) => {
          throttleRef.current?.(() => {
            _originRunAsync(...args)
              .then(resolve)
              .catch(reject);
          });
        });
      };

      return () => {
        throttleRef.current?.cancel();
        fetchInstance.runAsync = _originRunAsync;
      };
    }
  }, [throttleWait]);

  if (!throttleWait) {
    return {};
  }

  return {
    onCancel: () => {
      throttleRef.current?.cancel();
    },
  };
}

export default throttlePlugin;
