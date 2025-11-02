import Cookies from 'js-cookie';
import { get, memoize, template } from 'lodash';
import { getParameterByName } from './utils';

// const locales = {
//     'en_US': './locales/en_US.json', // 英文
//     'tw_TW': './locales/tw_TW.json', // 中文 - 繁体
//     'es_ES': './locales/es_ES.json', // 西班牙
//     'id_ID': './locales/id_ID.json', // 印尼
//     'ar_AR': './locales/ar_AR.json', // 阿拉伯语
//     'pl_PL': './locales/pl_PL.json', // 波兰语
//     'tr_TR': './locales/tr_TR.json', // 土耳其语
//     'fr_FR': './locales/fr_FR.json', // 法语
//     'de_DE': './locales/de_DE.json', // 德语
//     'th_TH': './locales/th_TH.json', // 泰语
//     'nl_NL': './locales/nl_NL.json', // 荷兰语
//     'pt_PT': './locales/pt_PT.json', // 葡萄牙语
//     'ru_RU': './locales/ru_RU.json', // 俄语
//     'vi_VN': './locales/vi_VN.json', // 越南语
//     'sv_SE': './locales/sv_SE.json', // 瑞典语
//     'ko_KR': './locales/ko_KR.json', // 韩语
// };

const currentLang = 
  (typeof window !== 'undefined' &&
    getParameterByName('hl', window?.location?.search || '')) ||
  Cookies.get('clientCommonlanguage') ||
  'en_US';
const currentTemp = require(`./locales/${currentLang}.json`);

function intl(key, values) {
  const compiled = template(get(currentTemp, key), {
    interpolate: /{([\s\S]+?)}/g, // {myVar}
  });

  return compiled(values);
}

export default memoize(intl);
