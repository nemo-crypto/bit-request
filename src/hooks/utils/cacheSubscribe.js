const listeners = new Map();

const trigger = (key, data) => {
  // 固定本轮订阅快照，回调内清理订阅不会跳过其他消费者。
  const subscriptions = listeners.get(key);
  if (subscriptions) {
    [...subscriptions].forEach(({ listener }) => listener(data));
  }
};

const subscribe = (key, listener) => {
  let subscriptions = listeners.get(key);
  if (!subscriptions) {
    subscriptions = new Set();
    listeners.set(key, subscriptions);
  }
  const subscription = { listener };
  subscriptions.add(subscription);

  return function unsubscribe() {
    subscriptions.delete(subscription);
    if (!subscriptions.size && listeners.get(key) === subscriptions) {
      listeners.delete(key);
    }
  };
};

export { subscribe, trigger };
