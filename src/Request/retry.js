import { isNumber } from 'lodash';

export class AxiosRetry {
  maximum_backoff = 64 * 1000;
  retryTimes = 3;
  /**
   * 重试
   */
  retry(axiosInstance, error) {
    const { config } = error;
    const retryRequest = config?.requestOptions?.retryRequest || 0;
    const count = isNumber(retryRequest)
      ? retryRequest
      : retryRequest?.count || this.retryTimes;
    config.__retryCount = config.__retryCount || 0;
    if (config.__retryCount >= count) {
      return;
    }
    //请求返回后config的header不正确造成重试请求失败,删除返回headers采用默认headers
    delete config.headers;
    const waitTime = this.createTimeout(config.__retryCount);
    return this.delay(waitTime).then(() => {
      config.__retryCount += 1;
      axiosInstance(config);
    });
  }

  createTimeout(times) {
    const random_number_milliseconds = Math.floor(Math.random() * 1000);
    return Math.min(
      Math.pow(2, times) * 1000 + random_number_milliseconds,
      this.maximum_backoff,
    );
  }

  /**
   * 延迟
   */
  delay(waitTime) {
    return new Promise((resolve) => setTimeout(resolve, waitTime));
  }
}
