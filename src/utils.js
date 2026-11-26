import { isPlainObject } from 'lodash';

export const isFunction = (fn) => {
  return Object.prototype.toString.call(fn) === '[object Function]';
};

export const deepMerge = (...configs) => {
  const newConfig = {};

  configs.forEach((config) => {
    Object.keys(config).forEach((key) => {
      if (isPlainObject(config[key])) {
        if (newConfig[key]) {
          newConfig[key] = deepMerge(newConfig[key], config[key]);
        } else {
          newConfig[key] = deepMerge(config[key]);
        }
      } else {
        newConfig[key] = config[key];
      }
    });
  });

  return newConfig;
};

/**
 * 获取URL中指定参数的值
 * @param {String} name 名称
 * @param {String} url 地址
 * @return {String} 值
 */
export const getParameterByName = (name, url) => {
  const source = url ?? (typeof window !== 'undefined' ? window.location.search : '');
  const withoutFragment = source.split('#', 1)[0];
  const queryIndex = withoutFragment.indexOf('?');
  if (queryIndex < 0) return '';
  return new URLSearchParams(withoutFragment.slice(queryIndex + 1)).get(name) ?? '';
};
