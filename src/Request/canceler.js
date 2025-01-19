import axios from 'axios';
import qs from 'qs';
import { isFunction } from '../utils';

// 声明一个 Map 用于存储每个请求的标识 和 取消函数
let pendingMap = new Map();

const isAbortControllerSupport = () => {
  let abortControllerSupported = false;

  try {
    new AbortController();
    abortControllerSupported = true;
  } catch (e) {}

  return abortControllerSupported;
};

export const getPendingUrl = (config) =>
  [
    config.method,
    config.url,
    qs.stringify(config.data),
    qs.stringify(config.params),
  ].join('&');

export class AxiosCanceler {
  /**
   * 添加请求
   * @param {Object} config
   */
  addPending(config) {
    this.removePending(config);
    const url = getPendingUrl(config);
    if (isAbortControllerSupport()) {
      const contraller = new AbortController();
      config.signal = config.signal || contraller.signal;
      if (!pendingMap.has(url)) {
        pendingMap.set(url, contraller);
      }
    } else {
      config.cancelToken =
        config.cancelToken ||
        new axios.CancelToken((cancel) => {
          if (!pendingMap.has(url)) {
            pendingMap.set(url, cancel);
          }
        });
    }
  }

  /**
   * @description: 清空所有pending
   */
  removeAllPending() {
    pendingMap.forEach((cancel) => {
      if (cancel) {
        isFunction(cancel?.abort) ? cancel.abort() : cancel();
      }
    });
    pendingMap.clear();
  }

  /**
   * 移除请求
   * @param {Object} config
   */
  removePending(config) {
    const url = getPendingUrl(config);

    if (pendingMap.has(url)) {
      // 如果在 pending 中存在当前请求标识，需要取消当前请求，并且移除
      const cancel = pendingMap.get(url);
      if (cancel) {
        isFunction(cancel?.abort) ? cancel.abort(url) : cancel(url);
      }
      pendingMap.delete(url);
    }
  }

  /**
   * @description: 重置
   */
  reset() {
    pendingMap = new Map();
  }
}
