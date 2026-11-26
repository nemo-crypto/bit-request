import { useEffect, useRef } from 'react';

function loadingDeleyPlugin(fetchInstance, options) {
  const { loadingDeley, ready } = options;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const timerRef = useRef();

  const cancelTimeout = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  };

  // 配置关闭或改变时，旧请求的延迟回调也必须清理。
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => cancelTimeout, [loadingDeley]);

  if (!loadingDeley) {
    return {};
  }

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
