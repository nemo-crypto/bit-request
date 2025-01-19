import { useEffect, useRef } from 'react';

function useUpdateEffect(effect, deps) {
  const isMounted = useRef(false);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      return effect();
    }
  }, deps);
}

export default useUpdateEffect;
