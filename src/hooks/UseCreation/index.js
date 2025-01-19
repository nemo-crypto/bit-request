import { useRef } from 'react';

function depsAreSame(oldDeps, deps) {
  if (oldDeps === deps) return true;
  for (let i = 0; i < oldDeps.length; i++) {
    if (!Object.is(oldDeps[i], deps[i])) return false;
  }
  return true;
}

function useCreation(factory, deps) {
  const { current } = useRef({
    deps,
    obj: undefined,
    initialized: false,
  });

  if (current.initialized === false || !depsAreSame(current.deps, deps)) {
    current.deps = deps;
    current.obj = factory();
    current.initialized = true;
  }
  return current.obj;
}

export default useCreation;
