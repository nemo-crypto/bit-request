import { debounce } from 'lodash';
import { useEffect, useRef } from 'react';

function debouncePlugin(fetchInstance, options) {
  const { debounceWait } = options;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const debouncedRef = useRef();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (debounceWait) {
      const _originRunAsync = fetchInstance.runAsync.bind(fetchInstance);

      debouncedRef.current = debounce((callback) => {
        callback();
      }, debounceWait);

      fetchInstance.runAsync = (...args) => {
        return new Promise((resolve, reject) => {
          debouncedRef.current?.(() => {
            _originRunAsync(...args)
              .then(resolve)
              .catch(reject);
          });
        });
      };

      return () => {
        debouncedRef.current?.cancel();
        fetchInstance.runAsync = _originRunAsync;
      };
    }
  }, [debounceWait]);

  if (!debounceWait) {
    return {};
  }

  return {
    onCancel: () => {
      debouncedRef.current?.cancel();
    },
  };
}

export default debouncePlugin;
