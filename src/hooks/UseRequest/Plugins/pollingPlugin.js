import { useEffect, useRef } from 'react';

function pollingPlugin(fetchInstance, options) {
  const { pollingInterval } = options;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const timerRef = useRef();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const countRef = useRef(0);

  const stopPolling = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!pollingInterval) {
      stopPolling();
    }
  }, [pollingInterval]);

  if (!pollingInterval) {
    return {};
  }

  return {
    onBefore: () => {
      stopPolling();
    },
    onError: () => {
      countRef.current += 1;
    },
    onSuccess: () => {
      countRef.current = 0;
    },
    onFinally: () => {
      if (countRef.current === 0) {
        // 轮询失败关闭轮询
        timerRef.current = setTimeout(() => {
          fetchInstance.refresh();
        }, pollingInterval);
      } else {
        countRef.current = 0;
      }
    },
    onCancel: () => {
      stopPolling();
    },
  };
}

export default pollingPlugin;
