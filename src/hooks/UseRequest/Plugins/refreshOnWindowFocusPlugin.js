import { useEffect, useRef } from 'react';
import limit from '../../utils/limit';
import subscribeFocus from '../../utils/subscribeFocus';

const refreshOnWindowFocusPlugin = (
  fetchInstance,
  { refreshOnWindowFocus, focusTimespan = 1000 * 10 },
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const unsubscribeRef = useRef();

  const stopSubscribe = () => {
    unsubscribeRef.current?.();
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (refreshOnWindowFocus) {
      const limitRefresh = limit(
        fetchInstance.refresh.bind(fetchInstance),
        focusTimespan,
      );
      unsubscribeRef.current = subscribeFocus(() => {
        limitRefresh();
      });
    }
    return () => {
      stopSubscribe();
    };
  }, [refreshOnWindowFocus, focusTimespan]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    return () => {
      stopSubscribe();
    };
  }, []);

  return {};
};

export default refreshOnWindowFocusPlugin;
