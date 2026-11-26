import Cookies from 'js-cookie';
import { get, memoize, template } from 'lodash';
import { getParameterByName } from './utils';

// 仅允许已打包的语言，避免不支持的 URL 或 Cookie 值导致模块加载失败。
const locales = {
  ar_AR: require('./locales/ar_AR.json'),
  de_DE: require('./locales/de_DE.json'),
  en_US: require('./locales/en_US.json'),
  es_ES: require('./locales/es_ES.json'),
  fr_FR: require('./locales/fr_FR.json'),
  id_ID: require('./locales/id_ID.json'),
  ko_KR: require('./locales/ko_KR.json'),
  nl_NL: require('./locales/nl_NL.json'),
  pl_PL: require('./locales/pl_PL.json'),
  pt_PT: require('./locales/pt_PT.json'),
  ru_RU: require('./locales/ru_RU.json'),
  sv_SE: require('./locales/sv_SE.json'),
  th_TH: require('./locales/th_TH.json'),
  tr_TR: require('./locales/tr_TR.json'),
  tw_TW: require('./locales/tw_TW.json'),
  vi_VN: require('./locales/vi_VN.json'),
  zh_CN: require('./locales/zh_CN.json'),
};

const currentLang = 
  (typeof window !== 'undefined' &&
    getParameterByName('hl', window?.location?.search || '')) ||
  Cookies.get('clientCommonlanguage') ||
  'en_US';
const currentTemp = Object.prototype.hasOwnProperty.call(locales, currentLang)
  ? locales[currentLang]
  : locales.en_US;

function intl(key, values) {
  const compiled = template(get(currentTemp, key), {
    interpolate: /{([\s\S]+?)}/g, // {myVar}
  });

  return compiled(values);
}

export default memoize(intl);
