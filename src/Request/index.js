import { deepMerge } from '../utils';
import { CONTENTTYPE } from './constant';
import { device } from './env';
import { Request } from './request';
import { transform } from './transform';

// requestOptions

function createRequest(opt = {}) {
  const requestInstance = new Request(
    deepMerge(
      {
        baseURL: '/',
        timeout: device === 'service' ? 5000 : 6000,
        headers: { 'Content-Type': CONTENTTYPE.FORM_URLENCODE },
        // 默认拦截器
        transform,

        // 配置项，下面的选项都可以在独立的接口请求中覆盖
        requestOptions: {
          // 是否携带公共参数 Boolean｜Object
          publicParams: true,

          // 接口拼接地址
          urlPrefix: '',

          // 是否返回原生响应头 比如：需要获取响应头时使用该属性
          isReturnNativeResponse: false,

          // 消息提示类型 'none' 'toast' 'log'
          errorMessageMode: 'toast',

          // 忽略重复请求
          ignoreCancelToken: false,

          // 重试次数 Number｜Boolean｜Object {count: 3}
          retryRequest: 3,

          // 格式化请求响应数据
          transformData: null,
        },
        withCredentials: false,
      },
      opt || {},
    ),
  );

  return {
    request: requestInstance.request.bind(requestInstance),
    get: requestInstance.get.bind(requestInstance),
    post: requestInstance.post.bind(requestInstance),
    upload: requestInstance.upload.bind(requestInstance),
    put: requestInstance.put.bind(requestInstance),
    delete: requestInstance.delete.bind(requestInstance),
    setRequestHooks: requestInstance.setRequestHooks.bind(requestInstance),
  };
}

const request = createRequest();

export default request;

export { createRequest };
