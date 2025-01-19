import axios from 'axios';
import Cookies from 'js-cookie';
import { isBoolean, isNumber, isObject } from 'lodash';
import queryString from 'query-string';
import { isFunction } from '../utils';
import { checkStatus } from './checkStatus';
import { CONTENTTYPE, token as token_url } from './constant';
import { device } from './env';
import { AxiosRetry } from './retry';

/**
 * @description: 数据处理，方便区分多种处理方式
 */
export const transform = {
  /**
   * @description: 处理请求数据。直接返回
   */
  afterRequestHook: (res, options) => {
    const { isReturnNativeResponse } = options;

    // 是否返回原生响应头 比如：需要获取响应头时使用该属性
    if (isReturnNativeResponse) {
      return res;
    }

    let { data, config } = res || {};

    if (!data) {
      throw new Error('request error!');
    }

    const { transformData } = options;

    if (transformData && isFunction(transformData)) {
      try {
        data = transformData(data);
      } catch (err) {
        throw new Error(err || new Error('request error!'));
      }
    }
    // 除json等文件请求以外的响应数据如果没有code，提示响应数据格式不符合标准
    if (!('code' in data) && !/^[\s\S]*\.[\s\S]*$/.test(config.url)) {
      console.warn(
        '请求返回的数据格式不符合标准，请添加transformData修改或让服务端调整响应数据格式。否则下次升级版本将直接报错',
      );
    }

    return data || null;
  },

  /**
   * @description: 请求之前处理config
   */
  beforeRequestHook: (config, options) => {
    const { data, method, headers = {} } = config || {};
    const { urlPrefix } = options;

    const contentType = headers['Content-Type'] || headers['content-type'];

    if (
      method?.toUpperCase() !== 'GET' &&
      contentType === CONTENTTYPE.FORM_URLENCODE &&
      data
    ) {
      config.data = queryString.stringify(data);
    }

    if (urlPrefix) {
      config.url = `${urlPrefix}${config.url}`;
    }

    return config;
  },

  /**
   * @description: 请求拦截器处理
   */
  requestInterceptors: (config, options) => {
    /**
     * 添加公共参数 publicParams Boolean | Object
     **/
    const withPublicParams =
      config.requestOptions?.publicParams !== 'undefined'
        ? config.requestOptions?.publicParams
        : options.requestOptions?.publicParams;

    let publicParams = {};

    if (isObject(withPublicParams)) {
      publicParams = withPublicParams;
    } else if (typeof withPublicParams === 'boolean' && withPublicParams) {
      let token = '';
      if (device !== 'service') {
        // 非app用户登录校验
        if (device !== 'app') {
          token = Cookies.get(token_url) || '';
        }

        if (token) {
          publicParams = {
            token, // 用户token
            appName: navigator.appName, // 浏览器名称
            appCodeName: navigator.appCodeName, // 浏览器代码名称
            appVersion: navigator.appVersion, // 浏览器版本号
            userAgent: navigator.userAgent, // 浏览器版本信息
            cookieEnabled: navigator.cookieEnabled, // 浏览器是否启用cookie
            platform: navigator.platform, // 客户端操作系统
            userLanguage: navigator.language, // 浏览器语言
            vendor: navigator.vendor, // 浏览器厂商
            onLine: navigator.onLine, // 浏览器是否需要连接网络
            product: navigator.product, // 浏览器产品名称
            productSub: navigator.productSub, // 浏览器产品其他信息
            mimeTypesLen: navigator.mimeTypes?.length, // 浏览器的MIME类型数量
            pluginsLen: navigator.plugins?.length, // 浏览器的插件数量
            javaEnbled: navigator.javaEnabled(), // 浏览器是否启用JAVA
            windowScreenWidth: window.screen.width, // 屏幕分辨率 - 宽
            windowScreenHeight: window.screen.height, // 屏幕分辨率 - 高
            windowColorDepth: window.screen.colorDepth, // 屏幕色彩位数
          };
        }
      }
    }

    // 发送公共参数
    config.params = config.params
      ? Object.assign({}, publicParams, config.params)
      : publicParams;

    return config;
  },

  /**
   * @description: 请求错误拦截器处理
   */

  requestInterceptorsCatch: (error) => {
    return Promise.reject(error);
  },

  /**
   * @description: 响应拦截器处理
   */
  responseInterceptors: (res) => {
    // 请求失败 2xx
    if (res.status !== 200) {
      return Promise.reject(res);
    }
    return res;
  },

  /**
   * @description: 响应错误处理
   */
  responseInterceptorsCatch: (axiosInstance, error) => {
    const { response, config = {} } = error || {};

    // 请求是被取消的
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (device !== 'service') {
      // 统一状态码处理
      if (!config?.__retryCount) {
        checkStatus(
          response?.status,
          response?.data?.message || '',
          config || {},
          error,
        );
      }

      // 自动重试机制 只针对client端的GET请求
      const retryRequest = new AxiosRetry();
      const retryRequestTimes = config?.requestOptions?.retryRequest; // Number || Boolean || Object
      const needRetry = isBoolean(retryRequestTimes)
        ? retryRequestTimes
        : isNumber(retryRequestTimes)
        ? retryRequestTimes > 0
        : true;
      config?.method?.toUpperCase() === 'GET' &&
        needRetry &&
        retryRequest.retry(axiosInstance, error);
    }

    // 忽略重试error
    if (config?.__retryCount) {
      return;
    }
    return Promise.reject(error);
  },
};
