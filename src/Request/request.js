import axios from 'axios';
import { cloneDeep } from 'lodash';
import { isFunction } from '../utils';
import { AxiosCanceler } from './canceler';
import { CONTENTTYPE } from './constant';
import { device } from './env';

/**
 * @description:  axios模块
 */
export class Request {
  constructor(options) {
    this.options = options;
    this.axiosInstance = axios.create(options);
    this.setupInterceptors();
  }

  getAxios() {
    return this.axiosInstance;
  }

  /**
   * @description: 重新配置axios
   */
  configAxios(config) {
    if (!this.axiosInstance) {
      return;
    }
    this.createAxios(config);
  }

  /**
   * @description: 添加自定义拦截器
   */

  setRequestHooks({ beforeRequestHook, afterRequestHook }) {
    if (this.axiosInstance) {
      this.axiosInstance.interceptors.request.use(
        (config) => {
          if (beforeRequestHook && isFunction(beforeRequestHook)) {
            config = beforeRequestHook(config, this.options);
          }

          return config;
        },
        (error) => {
          return Promise.reject(error);
        },
      );
      this.axiosInstance.interceptors.response.use(
        (res) => {
          if (afterRequestHook && isFunction(afterRequestHook)) {
            res = afterRequestHook(res);
          }

          return res;
        },
        (error) => {
          return Promise.reject(error);
        },
      );
    }
  }

  /**
   * @description: 设置通用header
   */
  setHeader(headers) {
    if (!this.axiosInstance) {
      return;
    }
    Object.assign(this.axiosInstance.defaults.headers, headers);
  }

  /**
   * @description:  创建axios实例
   */
  createAxios(config) {
    this.axiosInstance = axios.create(config);
  }

  /**
   * @description: 拦截器配置
   */
  setupInterceptors() {
    const { transform } = this.options;
    if (!transform) {
      return;
    }
    const {
      requestInterceptors,
      requestInterceptorsCatch,
      responseInterceptors,
      responseInterceptorsCatch,
    } = transform;

    const axiosCanceler = new AxiosCanceler();

    // 请求拦截器配置处理
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // 是否忽略重复请求 优先取单个请求里的配置
        const ignoreCancel =
          config.requestOptions?.ignoreCancelToken !== 'undefined'
            ? config.requestOptions?.ignoreCancelToken
            : this.options.requestOptions?.ignoreCancelToken;
        !ignoreCancel && axiosCanceler.addPending(config);

        if (requestInterceptors && isFunction(requestInterceptors)) {
          config = requestInterceptors(config, this.options);
        }

        return config;
      },
      (error) => {
        if (requestInterceptorsCatch && isFunction(requestInterceptorsCatch)) {
          return requestInterceptorsCatch(error);
        }
      },
    );

    // 响应结果拦截器处理
    this.axiosInstance.interceptors.response.use(
      (res) => {
        res && axiosCanceler.removePending(res.config);

        if (responseInterceptors && isFunction(responseInterceptors)) {
          res = responseInterceptors(res);
        }

        return res;
      },
      (error) => {
        if (
          responseInterceptorsCatch &&
          isFunction(responseInterceptorsCatch)
        ) {
          return responseInterceptorsCatch(this.axiosInstance, error);
        }
      },
    );
  }

  /**
   * @description:   请求方法
   * options: requestOptions
   */
  request(config, options) {
    let conf = cloneDeep(config);

    const { requestOptions, transform } = this.options;

    // 单个请求和初始化requestOptions合并
    const mergedOpt = Object.assign({}, requestOptions, options);
    const { beforeRequestHook, afterRequestHook } = transform || {};
    if (beforeRequestHook && isFunction(beforeRequestHook)) {
      conf = beforeRequestHook(conf, mergedOpt);
    }

    //这里重新 赋值成最新的配置
    conf.requestOptions = mergedOpt;

    return new Promise((resolve, reject) => {
      this.axiosInstance
        .request(conf)
        .then((res) => {
          let ret = res;
          if (afterRequestHook && isFunction(afterRequestHook)) {
            try {
              ret = afterRequestHook(res, mergedOpt);
            } catch (err) {
              return reject(err || new Error('request error!'));
            }
          }

          resolve(ret);
        })
        .catch((e) => {
          // 取消请求
          if (axios.isCancel(e)) {
            return console.warn(e);
          }
          reject(e);
        });
    });
  }

  get(url, params, config, options) {
    return this.request({ url, params, ...config, method: 'GET' }, options);
  }

  post(url, data, config, options) {
    return this.request(
      {
        url,
        data,
        ...config,
        headers: {
          ...{ 'Content-Type': CONTENTTYPE.JSON },
          ...(config?.headers || {}),
        },
        method: 'POST',
      },
      options,
    );
  }

  put(url, config, options) {
    return this.request({ url, ...config, method: 'PUT' }, options);
  }

  delete(url, config, options) {
    return this.request({ url, ...config, method: 'DELETE' }, options);
  }

  upload(url, params, config) {
    if (device === 'service' || !FormData) {
      return Promise.reject('仅支持客户端上传');
    }

    const formData = new FormData();
    const fileName = params.name || 'file';
    if (params.fileName) {
      formData.append(fileName, params.file, params.fileName);
    } else {
      formData.append(fileName, params.file);
    }

    if (params.data) {
      Object.keys(params.data).forEach((key) => {
        const value = params.data[key];
        if (Array.isArray(value)) {
          value.forEach((item) => {
            formData.append(`${key}[]`, item);
          });
          return;
        }

        formData.append(key, params.data[key]);
      });
    }

    return this.request(
      {
        url,
        ...config,
        method: 'POST',
        data: formData,
        headers: {
          'Content-type': CONTENTTYPE.FORM_DATA,
        },
      },
      {
        ignoreCancelToken: true,
      },
    );
  }
}
