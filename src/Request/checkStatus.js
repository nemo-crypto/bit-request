import message from '../components/message';
import intl from '../i18n';

export function checkStatus(status, msg, config, error) {
  const { errorMessageMode } = config?.requestOptions || {};

  let errorMessage = '';

  if (error?.message?.includes('timeout')) {
    errorMessage = 'Network timeout please refresh and try again!';
  } else {
    switch (status) {
      case 400:
        errorMessage = intl('err.400');
        break;
      case 401:
        errorMessage = intl('err.401');
        // 未登录 todo 跳登录
        break;
      case 403:
        errorMessage = intl('err.403');
        break;
      case 404:
        errorMessage = intl('err.404');
        break;
      case 500:
        errorMessage = intl('err.500');
        break;
      case 501:
        errorMessage = intl('err.501');
        break;
      case 503:
        errorMessage = intl('err.503');
        break;
    }
  }

  errorMessage = msg || errorMessage;

  if (errorMessage) {
    if (errorMessageMode === 'toast') {
      message(errorMessage);
    } else if (errorMessageMode === 'log') {
      // todo 上报
      console.log({
        status,
        msg: errorMessage,
      });
    }
  }
}
