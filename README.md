# @bit/request · 请求客户端与 React Hook

基于Axios的请求封装，提供默认request、可配置createRequest以及useRequest Hook。现有长示例保留在下文，本节补齐源码入口、默认行为和接入条件。

## 模块与工程命令

| 入口 | 作用 |
|---|---|
| [src/index.js](src/index.js) | 导出request、createRequest与useRequest |
| [src/Request/index.js](src/Request/index.js) | 默认实例与选项合并 |
| `src/Request/` | 请求、重试、取消、转换和状态检查 |
| `src/hooks/UseRequest/` | Hook状态、缓存与请求执行 |
| `docs/` | 文档内容，使用dumi运行 |

本地开发执行npm install后，可运行npm run dev、npm run build、npm run docs:build与npm run doctor，均来自实际package.json。prepare会安装husky并执行dumi setup，需在合适的开发环境准备Git与文档工具；当前没有锁定文件和test脚本。

## 默认行为与宿主适配

createRequest默认baseURL为 `/`；服务环境超时5秒、浏览器6秒；默认表单Content-Type、withCredentials为false，并开启默认公共参数、错误提示、重复请求处理与重试选项。是否适合真实接口应逐项核实src/Request内的transform与retry实现。

下文示例中的业务路径依赖原宿主后端，并非本目录附带的测试服务。接入时替换baseURL、鉴权、响应结构、公共参数和提示UI；写接口重试需确认实际幂等语义。

本轮仅核对入口、默认配置和脚本，不安装依赖、不访问原业务接口；原有API演示继续保留如下。

## Development 

```bash
# install dependencies
$ yarn install

# develop library by docs demo
$ yarn start

# build library source code
$ yarn run build

# build library source code in watch mode
$ yarn run build:watch

# build docs
$ yarn run docs:build

# check your project for potential problems
$ yarn run doctor
```

## Request API

```jsx
import { request } from '@bit/request';
import { useEffect, useState } from 'react';

export default () => {
  const [json, setJson] = useState(null);
  const [data, setData] = useState(null);
  const [data1, setPostData] = useState(null);
  const [data2, setPostFormData] = useState(null);

  const fetchJson = () => {
    request
      .get('/json/languse/test/assetexport/en_US.json')
      .then((res) => {
        setJson(JSON.stringify(res));
      });
  };

  const fetchData = () => {
    request
      .get('/api/exchange-web/web/activity/getUserLoginStatus', { test: true })
      .then((res) => {
        setData(JSON.stringify(res));
      });
  };

  const postData = () => {
    request
      .post('/feapi/fe-co-api/common/public_info', {
        securityInfo: '',
        type: '1,2,3',
        uaTime: new Date(),
      })
      .then((res) => {
        setPostData(JSON.stringify(res));
      });
  };

  const postFormData = () => {
    request
      .post(
        '/feapi/fe-co-api/common/public_info',
        {
          securityInfo: '',
          type: '1,2,3',
          uaTime: new Date(),
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          },
        },
      )
      .then((res) => {
        setPostFormData(JSON.stringify(res));
      });
  };

  return (
    <div>
      <div>
        <button onClick={fetchJson}>getJson</button>
        <b>json:</b>
        <br />
        {json}
      </div>
      <br />
      <div>
        <button onClick={fetchData}>getData</button>
        <b>data:</b>
        <br />
        {data}
      </div>
      <br />
      <div>
        <button onClick={postData}>postData</button>
        <b>data:</b>
        <br />
        {data1}
      </div>
      <br />
      <div>
        <button onClick={postFormData}>postFormData</button>
        <b>data:</b>
        <br />
        {data2}
      </div>
    </div>
  );
};
```

## request 请求方法

`get(url, params, config, options)`

`post(url, data, config, options)`

`put(url, config, options)`

`delete(url, config, options)`

`upload(url, params, config)` 上传 params 中必须包含 file 属性

## options

| 参数                   | 说明                  | 类型                 | 默认值            |
| ---------------------- | --------------------- | -------------------- | ----------------- |
| publicParams           | 请求携带的公共参数     | Boolean/Object       | 见下 publicparams |
| urlPrefix              | 请求前缀              | String               | ''                |
| isReturnNativeResponse | 是否返回原生 response | Boolean              | false             |
| errorMessageMode       | 错误消息提示类型       | 'toast'/'log'/'none' | 'none'            |
| ignoreCancelToken      | 允许重复请求          | Boolean              | false             |
| retryRequest           | 失败是否重试          | Boolean/Number       | true              |

## 公共业务参数 publicparams

浏览器环境登录用户默认携带设备参数

| 参数               | 含义                   | 默认值                     |
| ------------------ | ----------------------| -------------------------- |
| token              | token                 | token_url                  |
| appName            | 浏览器名称             | navigator.appName          |
| appCodeName        | 浏览器代码名称          | navigator.appCodeName      |
| appVersion         | 浏览器版本号            | navigator.appVersion       |
| userAgent          | 浏览器版本信息          | navigator.userAgent        |
| cookieEnabled      | 浏览器是否启用 cookie   | navigator.cookieEnabled    |
| platform           | 客户端操作系统          | navigator.platform         |
| userLanguage       | 浏览器语言             | navigator.language          |
| vendor             | 浏览器厂商             | navigator.vendor            |
| onLine             | 浏览器是否连接网络      | navigator.onLine            |
| product            | 浏览器产品名称         | navigator.product            |
| productSub         | 浏览器产品其他信息      | navigator.productSub        |
| mimeTypesLen       | 浏览器的 MIME 类型数量  | navigator.mimeTypes.length  |
| pluginsLen         | 浏览器的插件数量        | navigator.plugins.length    |
| javaEnbled         | 浏览器是否启用 JAVA     | navigator.javaEnabled()    |
| windowScreenWidth  | 屏幕分辨率 - 宽        | window.screen.width         |
| windowScreenHeight | 屏幕分辨率 - 高        | window.screen.width         |
| windowColorDepth   | 屏幕色彩位数           | window.screen.colorDepth    |

## 自定义拦截器

`request.setRequestHooks()` 可以设置自定义 hooks;

| 自定义 hook        | trigger        | 参数                                 | 返回值          |
| ----------------- | ---------------| ----------------------------------- | ---------------|
| beforeRequestHook | request 发起前  | (config, option) => {return config} | 返回最新 config  |
| afterRequestHook  | response 返回后 | (res, option) => {return res}       | 返回最终 res     |

```jsx
import { request } from '@bit/request';
import { useEffect, useState } from 'react';
export default () => {
  const [hooks, setHooks] = useState(false);
  const [json, setJson] = useState(null);

  const fetchJson = () => {
    request
      .get('/json/languse/tets/assetexport/en_US.json')
      .then((res) => {
        setJson(JSON.stringify(res));
      });
  };

  const setHook = () => {
    setHooks(true);
    const beforeRequestHook = (config, options) => {
      config.cusHook = true;
      return config;
    };
    const afterRequestHook = (res) => {
      res.cusHook = true;
      return res;
    };

    request.setRequestHooks({
      beforeRequestHook,
      afterRequestHook,
    });
  };

  return (
    <div>
      <button onClick={setHook}>setCustomeHooks:{`${hooks}`}</button>
      <div>
        <button onClick={fetchJson}>getJson</button>
        <b>json:</b>
        <br />
        {json}
      </div>
    </div>
  );
};
```

## response 数据格式

统一数据格式 `{code:0, data, msg}`，对于响应数据格式不符合要求的接口，请联系服务端调整接口数据格式，或者通过 transformData 手动更改响应数据

## transformData

```jsx
import { request } from '@bit/request';
import { useEffect, useState } from 'react';
export default () => {
  const [hooks, setHooks] = useState(false);
  const [json, setJson] = useState(null);

  const fetchJson = () => {
    request
      .get('/json/languse/test/assetexport/en_US.json', null, null, {
        transformData: (res) => {
          return {
            code: 0,
            data: res,
            message: 'success',
          };
        },
      })
      .then((res) => {
        setJson(JSON.stringify(res));
      })
      .catch((err) => {});
  };

  return (
    <div>
      <div>
        <button onClick={fetchJson}>getJson</button>
        <b>json:</b>
        <br />
        {json}
      </div>
    </div>
  );
};
```

## 文件上传

```jsx
import { request } from '@bit/request';
import { useRef } from 'react';
export default () => {
  const fileRef = useRef();

  const handleUpload = (e) => {
    e.preventDefault();
    const file = fileRef.current.files[0];
    if (file) {
      request
        .upload('/api/exchange-web/web/userCenterGoogle/handleFileUpload', {
          file: file,
        })
        .then((res) => {
          console.log(res);
        });
    }
  };

  return (
    <div>
      <form enctype="multipart/form-data" onSubmit={handleUpload}>
        <input type="file" name="myfile" ref={fileRef} />
        <input type="submit" />
      </form>
    </div>
  );
};
```

## 异常流处理

```jsx
import { request } from '@bit/request';
import { useEffect, useState } from 'react';

export default () => {
  const [errorMode, setErrorMode] = useState('none');
  const [error, setError] = useState(null);

  const fetchJson = () => {
    request
      .get('/json/languse/test/assetexport/en_US1.json', null, null, {
        errorMessageMode: errorMode,
      })
      .then((res) => {
        // ...
      })
      .catch((err) => {
        setError(err);
      });
  };

  const fetchData = () => {
    request
      .get('/api/exchange-web/web/activity/notgetUserLoginStatus', null, null, {
        errorMessageMode: errorMode,
      })
      .then((res) => {
        // ...
      })
      .catch((err) => {
        setError(err);
      });
  };

  const postData = () => {
    request
      .post(
        '/feapi/fe-co-api/common/public_info1',
        {
          securityInfo: '',
          type: '1,2,3',
          uaTime: new Date(),
        },
        null,
        { errorMessageMode: errorMode },
      )
      .then((res) => {
        // ...
      })
      .catch((err) => {
        setError(err);
      });
  };

  const switchErrorMode = (mode) => () => setErrorMode(mode);

  return (
    <div>
      <div>
        <div>errorMode: {errorMode}</div>
        <br />
        <div>errorStatus: {JSON.stringify(error)}</div>
        <br />
        <button onClick={switchErrorMode('none')}>errorMode:none</button>
        <button onClick={switchErrorMode('log')}>errorMode:log</button>
        <button onClick={switchErrorMode('toast')}>errorMode:toast</button>
      </div>
      <br />
      <div>
        <button onClick={fetchJson}>getErrorJson</button>
      </div>
      <br />
      <div>
        <button onClick={fetchData}>getErrorData</button>
      </div>
      <br />
      <div>
        <button onClick={postData}>postErrorData</button>
      </div>
    </div>
  );
};
```

