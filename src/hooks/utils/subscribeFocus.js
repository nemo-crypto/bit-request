const listeners = new Set();

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
  if (isBrowser && typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
    return navigator.onLine;
  }
  return true;
};

function subscribe(listener) {
  const entry = () => listener();
  listeners.add(entry);
  return () => listeners.delete(entry);
}

if (isBrowser) {
  const revalidate = () => {
    if (!isDocumentVisible() || !isOnline()) return;
    // 当前轮次使用快照，回调内的订阅变更从下一轮生效。
    [...listeners].forEach(listener => listener());
  };
  window.addEventListener('visibilitychange', revalidate, false);
  window.addEventListener('focus', revalidate, false);
}

export default subscribe;
