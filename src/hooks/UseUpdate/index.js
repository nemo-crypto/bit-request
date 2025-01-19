import { useCallback, useState } from 'react';

function useUpdate() {
  const [_, setState] = useState({});
  return useCallback(() => setState({}), []);
}

export default useUpdate;
