export default function limit(fn, timespan) {
  let pending = false;
  return (...args) => {
    if (pending) return;
    pending = true;
    try {
      fn(...args);
    } finally {
      setTimeout(() => {
        pending = false;
      }, timespan);
    }
  };
}
