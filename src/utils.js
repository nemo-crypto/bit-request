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
  name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
  let regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
    results = regex.exec(url || window.location.search);
  return results === null
    ? ''
    : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
