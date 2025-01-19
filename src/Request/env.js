export const device =
  typeof window === 'undefined'
    ? 'service'
    : window.currencyexchange || window.currency_exchange
    ? 'app'
    : 'browser';
