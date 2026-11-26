export class AxiosRetry {
  maximum_backoff = 64 * 1000;
  retryTimes = 3;
  /**
   * 重试
   */
  retry(axiosInstance, error) {
    const config = error?.config;
    const option = config?.requestOptions?.retryRequest ?? 0;
    const count = typeof option === 'number'
      ? option
      : option === true ? this.retryTimes
      : option && typeof option === 'object' ? option.count ?? this.retryTimes : 0;
    if (!config || !Number.isSafeInteger(count) || count < 0) {
      return Promise.reject(error);
    }
    config.__retryCount = config.__retryCount || 0;
    if (config.__retryCount >= count) return Promise.reject(error);
    const waitTime = this.createTimeout(config.__retryCount);
    return this.delay(waitTime).then(() => {
      config.__retryCount += 1;
      return axiosInstance(config);
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
