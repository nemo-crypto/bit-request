import { useRef } from 'react';

function loadingDeleyPlugin(fetchInstance, options) {
  const { loadingDeley, ready } = options;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const timerRef = useRef();

  if (!loadingDeley) {
    return {};
  }

  const cancelTimeout = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  return {
    onBefore: () => {
      cancelTimeout();
      if (ready !== false) {
        timerRef.current = setTimeout(() => {
          fetchInstance.setState({
            loading: true,
          });
        }, loadingDeley);
      }

      return {
        loading: false,
      };
    },
    onFinally: () => {
      cancelTimeout();
    },
    onCancel: () => {
      cancelTimeout();
    },
  };
}

export default loadingDeleyPlugin;
