import { useRef } from 'react';
import useUpdateEffect from '../../UseUpdateEffect';

function autoRunPlugin(
  fetchInstance,
  { manual, ready = true, defaultParams = [], refreshDeps = [] },
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const hasAutoRun = useRef(false);
  hasAutoRun.current = false;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useUpdateEffect(() => {
    if (!manual && ready) {
      hasAutoRun.current = true;
      fetchInstance.run(...defaultParams);
    }
  }, [ready]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useUpdateEffect(() => {
    if (hasAutoRun.current) {
      return;
    }
    if (!manual) {
      hasAutoRun.current = true;
      fetchInstance.refresh();
    }
  }, [...refreshDeps]);

  return {
    onBefore: () => {
      if (!ready) {
        return {
          stopNow: true,
        };
      }
    },
  };
}

autoRunPlugin.onInit = ({ ready = true, manual }) => {
  return {
    loading: !manual && ready,
  };
};

export default autoRunPlugin;
