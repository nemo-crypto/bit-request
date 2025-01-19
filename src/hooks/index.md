# useRequest

api: `{data, error, loading, params, cancel, refresh, run } = useRequest(service, options)`;

## 基础用法

使用`useRequest(service, options)`来自动管理服务端状态；

```jsx
/**
 * defaultShowCode: true
 */
import { request, useRequest } from '@bit/request';

const service = (...params) =>
  request.get('/api/exchange-web/web/activity/getUserLoginStatus', ...params);

export default () => {
  const { data, loading, error } = useRequest(service);
  return (
    <div>
      userName:{' '}
      {loading ? 'loading' : error ? error.message : JSON.stringify(data?.data)}
    </div>
  );
};
```

使用`useRequest([url, config, requestOptions], options)`；

```jsx
/**
 * defaultShowCode: true
 */
import { request, useRequest } from '@bit/request';

export default () => {
  const { data, loading, error } = useRequest([
    '/api/exchange-web/web/coin/symbolForAsset',
    { method: 'GET', params: {} },
  ]);

  return (
    <div style={{ wordWrap: 'break-word' }}>
      symbols:{' '}
      {loading
        ? 'loading'
        : error
        ? error.message
        : JSON.stringify(Object.keys(data))}
    </div>
  );
};
```

## 失败/成功回调

通过设置`options.onSuccess`和`options.onError`触发请求回调

```jsx
/**
 * defaultShowCode: true
 */
import { request, useRequest } from '@bit/request';

const service = (...params) =>
  request.get('/api/exchange-web/web/activity/getUserLoginStatus', ...params);

export default () => {
  const { data, loading, error, run } = useRequest(service, {
    onSuccess: (res, params) => {
      console.log(res, params);
    },
    onError: (error, params) => {
      console.log(error, params);
    },
    manual: true,
  });

  const fetchUserInfo = () => {
    if (loading) return;
    run();
  };
  return (
    <div>
      <button onClick={fetchUserInfo}>Get UserName</button>
      <div>
        userName:
        {loading
          ? 'loading'
          : error
          ? error.message
          : JSON.stringify(data?.data)}
      </div>
    </div>
  );
};
```

## 手动触发

通过设置`options.manual = true`手动触发请求

```jsx
/**
 * defaultShowCode: true
 */
import { request, useRequest } from '@bit/request';

const service = (...params) =>
  request.get('/api/exchange-web/web/activity/getUserLoginStatus', ...params);

export default () => {
  const { data, loading, error, run } = useRequest(service, { manual: true });

  const fetchUserInfo = () => {
    if (loading) return;
    run();
  };

  return (
    <div>
      <button onClick={fetchUserInfo}>Get UserName</button>
      <div>
        userName:{' '}
        {loading
          ? 'loading'
          : error
          ? error.message
          : JSON.stringify(data?.data)}
      </div>
    </div>
  );
};
```

## 延迟 loading

通过设置`options.loadingDeley = 3000`延迟 loading 加载效果, 适合无感知状态切换,减少用户等待的焦灼感

```jsx
/**
 * defaultShowCode: true
 */
import { useState, useRef, useCallback } from 'react';
import { request, useRequest } from '@bit/request';

const service = (...params) =>
  request.get('/api/exchange-web/web/activity/getUserLoginStatus', ...params);

export default () => {
  const [loadingDeley, setLoadingDeley] = useState(false);
  const loadingDeleyRef = useRef(0);
  const { data, loading, error, run } = useRequest(service, {
    loadingDeley: loadingDeleyRef.current,
    manual: true,
  });

  const setDeley = useCallback(() => {
    setLoadingDeley(!loadingDeley);
    loadingDeleyRef.current = !loadingDeley ? 2000 : 0;
  }, [loadingDeley]);

  const runRequest = () => run();

  return (
    <div>
      <button onClick={setDeley}>
        {loadingDeley ? '延迟加载' : '正常加载'}
      </button>
      <br />
      <button onClick={runRequest}>run</button>
      <div>
        userName:{' '}
        {loading
          ? 'loading'
          : error
          ? error.message
          : JSON.stringify(data?.data)}
      </div>
    </div>
  );
};
```

## 依赖更新自动加载

支持`option.ready`和`option.refreshDeps`两种依赖更新方式,设置了 ready 后，manual 请求需要在 ready 为 true 的状态下，run 才会发起请求。
`option.refreshDeps`会在初始化和依赖项发生变化时触发请求。

```jsx
/**
 * defaultShowCode: true
 */
import { useState, useRef, useCallback } from 'react';
import { request, useRequest } from '@bit/request';

const service = (...params) =>
  request.get('/api/exchange-web/web/activity/getUserLoginStatus', ...params);

export default () => {
  const [ready, setReady] = useState(false);
  const [count, setCount] = useState(0);
  const { data, loading, error } = useRequest(service, {
    ready: ready,
  });

  const {
    data: data1,
    loading: loading1,
    error: error1,
  } = useRequest(service, {
    ready: ready,
    refreshDeps: [count],
  });

  const handleReady = () => {
    setReady(true);
  };

  const handleCount = useCallback(() => {
    setCount(count + 1);
  }, [count]);

  return (
    <div>
      <div>
        <button onClick={handleReady}>Ready</button>
        <p>ready:{`${ready}`}</p>
        <div>
          userName:{' '}
          {loading
            ? 'loading'
            : error
            ? error.message
            : JSON.stringify(data?.data)}
        </div>
      </div>
      <br />
      <div>
        <button onClick={handleCount}>Add Count</button>
        <p>count:{count}</p>
        <div>
          userName:{' '}
          {loading1
            ? 'loading'
            : error1
            ? error1.message
            : JSON.stringify(data1?.data)}
        </div>
      </div>
    </div>
  );
};
```

## 防抖

通过设置`option.debounceWait=300`开启请求防抖

```jsx
/**
 * defaultShowCode: true
 */
import { useState, useRef, useCallback } from 'react';
import { request, useRequest } from '@bit/request';

const service = (...params) =>
  request.get('/api/exchange-web/web/activity/getUserLoginStatus', ...params);

export default () => {
  const [value, setValue] = useState(undefined);
  const [ready, setReady] = useState(false);
  const { data, loading, error } = useRequest(service, {
    ready,
    refreshDeps: [value],
    debounceWait: 300,
  });

  const handleInput = (e) => {
    const value = e.target.value;
    setReady(true);
    setValue(value);
  };

  return (
    <div>
      <input value={value} onChange={handleInput} />
      <div>
        userName:{' '}
        {loading
          ? 'loading'
          : error
          ? error.message
          : JSON.stringify(data?.data)}
      </div>
    </div>
  );
};
```

## 节流

通过设置`option.throttleWait=300`开启请求节流

```jsx
/**
 * defaultShowCode: true
 */
import { useState, useRef, useCallback } from 'react';
import { request, useRequest } from '@bit/request';

const service = (...params) =>
  request.get('/api/exchange-web/web/activity/getUserLoginStatus', ...params);

export default () => {
  const { data, loading, error, run } = useRequest(service, {
    manual: true,
    throttleWait: 1000 * 2,
  });

  const handleMouse = (e) => {
    run();
  };

  return (
    <div>
      <div
        style={{ background: '#e3e3e3', height: 300 }}
        onMouseMove={handleMouse}
      ></div>
      <div>
        userName:{' '}
        {loading
          ? 'loading'
          : error
          ? error.message
          : JSON.stringify(data?.data)}
      </div>
    </div>
  );
};
```

## 缓存

通过设置`option.cacheKey`开启请求缓存,通过设置`option.catchTime`设置缓存时间，超出这个时间会清空缓存，通过设置`option.staleTime`设置数据保鲜时间，在这个时间内不会重新发起请求，直接返回缓存数据；超过`staleTime`保鲜时间但是小于`catchTime`的请求会正常发起，但是会优先返回缓存数据，等请求数据返回后自动更新状态;同一个`cacheKey`的内容，在全局是共享的。
默认值:`option.catchTime = 5 * 60 * 1000`, `option.staleTime = 0`;

```jsx
/**
 * defaultShowCode: true
 */
import { useState, useRef, useCallback } from 'react';
import { request, useRequest } from '@bit/request';

const service = (...params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: Math.random() * 100,
        time: new Date().toString(),
      });
    }, 1000);
  });
};

export default () => {
  const currRef = useRef(new Date().getTime());
  const [duration, setDuration] = useState(0);
  const { data, loading, error, run } = useRequest(service, {
    cacheKey: 'random',
    catchTime: 1000 * 60,
    staleTime: 1000 * 30,
    manual: true,
  });

  const handleRefresh = () => {
    const Now = new Date().getTime();
    setDuration(Now - currRef.current);
    run();
  };

  const handleRun = () => {
    const Now = new Date().getTime();
    currRef.current = Now;
    run();
  };

  return (
    <div>
      <button onClick={handleRun}>run</button>
      <button onClick={handleRefresh}>refresh</button>
      <div>request Interval: {duration}</div>
      <div>
        data: {loading && !data ? 'loading' : JSON.stringify(data?.data)}
      </div>
      <div>
        time: {loading && !data ? 'loading' : JSON.stringify(data?.time)}
      </div>
    </div>
  );
};
```

## 轮询

通过设置`option.pollingInterval=3000`开启请求轮训

```jsx
/**
 * defaultShowCode: true
 */
import { useState, useRef, useCallback } from 'react';
import { request, useRequest } from '@bit/request';

const service = (...params) =>
  request.get('/api/exchange-web/web/activity/getUserLoginStatus', ...params);

export default () => {
  const { data, loading, error, run, cancel } = useRequest(service, {
    manual: true,
    pollingInterval: 1000 * 5,
  });

  const handleStartPolling = () => {
    run();
  };

  const handleStopPolling = () => {
    cancel();
  };

  return (
    <div>
      <button onClick={handleStartPolling}>start polling</button>
      <button onClick={handleStopPolling}>stop polling</button>
      <div>
        userName:{' '}
        {loading
          ? 'loading'
          : error
          ? error.message
          : JSON.stringify(data?.data)}
      </div>
    </div>
  );
};
```

## 屏幕重新聚焦自动请求

通过设置`option.refreshOnWindowFocus=true`，在浏览器窗口 refocus 和 revisible 时，会重新发起请求。默认间隔是 1000 \* 10ms, 可以通过设置`option.focusTimespan`改变间隔时间

```jsx
/**
 * defaultShowCode: true
 */

import { useState, useRef, useCallback } from 'react';
import { request, useRequest } from '@bit/request';

const service = (...params) =>
  request.get('/api/exchange-web-gateway/hackerCompensate/info', ...params);

export default () => {
  const { data, loading, error } = useRequest(service, {
    refreshOnWindowFocus: true,
  });

  return (
    <div style={{ wordWrap: 'break-word' }}>
      info:{' '}
      {loading ? 'loading' : error ? error.message : JSON.stringify(data?.data)}
    </div>
  );
};
```
