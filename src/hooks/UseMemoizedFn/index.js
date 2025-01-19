import { useMemo, useRef } from 'react';

function useMemoizedFn(fn) {
  const fnRef = useRef(fn);

  fnRef.current = useMemo(() => fn, [fn]);

  const memoizedFn = useRef();

  if (!memoizedFn.current) {
    memoizedFn.current = function (...args) {
      return fnRef.current.apply(this, args);
    };
  }
  return memoizedFn.current;
}

export default useMemoizedFn;
