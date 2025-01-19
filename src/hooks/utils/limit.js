export default function limit(fn, timespan) {
  let pending = false;
  return (...args) => {
    if (pending) return;
    pending = true;
    fn(...args);
    setTimeout(() => {
      pending = false;
    }, timespan);
  };
}
