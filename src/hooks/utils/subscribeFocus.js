const listeners = [];

const isBrowser = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

const isDocumentVisible = () => {
  if (isBrowser) {
    return document.visibilityState !== 'hidden';
  }
  return true;
};

const isOnline = () => {
  if (isBrowser && typeof navigator.onLine !== undefined) {
    return navigator.onLine;
  }
  return true;
};

function subscribe(listener) {
  listeners.push(listener);
  return function unsubscribe() {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

if (isBrowser) {
  const revalidate = () => {
    if (!isDocumentVisible() || !isOnline()) return;
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }
  };
  window.addEventListener('visibilitychange', revalidate, false);
  window.addEventListener('focus', revalidate, false);
}

export default subscribe;
