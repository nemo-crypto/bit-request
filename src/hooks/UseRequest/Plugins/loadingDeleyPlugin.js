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
      return { loading: false };
    },
    // 缓存直接返回时不会发出请求，也不应启动 loading 定时器。
    onRequest: () => {
      if (ready !== false) {
        timerRef.current = setTimeout(() => {
          fetchInstance.setState({
            loading: true,
          });
        }, loadingDeley);
      }

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
