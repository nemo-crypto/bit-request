import axios from 'axios';
import qs from 'qs';

export const getPendingUrl = (config) =>
  [config.method, config.url, qs.stringify(config.data), qs.stringify(config.params)].join('&');

export class AxiosCanceler {
  pending = new Map();
  requests = new WeakMap();

  addPending(config) {
    this.removePending(config);
    const key = getPendingUrl(config);
    let cancel;
    let dispose = () => {};
    if (typeof AbortController !== 'undefined') {
      const controller = new AbortController();
      const originalSignal = config.signal;
      if (originalSignal) {
        const forwardAbort = () => controller.abort(originalSignal.reason);
        if (originalSignal.aborted) forwardAbort();
        else originalSignal.addEventListener('abort', forwardAbort, { once: true });
        dispose = () => originalSignal.removeEventListener('abort', forwardAbort);
      }
      config.signal = controller.signal;
      cancel = () => controller.abort();
    } else {
      const originalToken = config.cancelToken;
      const source = axios.CancelToken.source();
      if (originalToken) {
        originalToken.subscribe(source.cancel);
        dispose = () => originalToken.unsubscribe(source.cancel);
      }
      config.cancelToken = source.token;
      cancel = source.cancel;
    }
    const entry = {key, cancel, dispose};
    this.pending.set(key, entry);
    this.requests.set(config, entry);
  }

  // 响应只能清理自己持有的记录，不能取消同 URL 的后续请求。
  completePending(config) {
    if (!config) return;
    const entry = this.requests.get(config);
    if (!entry) return;
    if (this.pending.get(entry.key) === entry) this.pending.delete(entry.key);
    entry.dispose();
    this.requests.delete(config);
  }

  removePending(config) {
    const key = getPendingUrl(config);
    const entry = this.pending.get(key);
    if (!entry) return;
    this.pending.delete(key);
    entry.cancel();
    entry.dispose();
  }

  removeAllPending() {
    const entries = [...this.pending.values()];
    this.pending.clear();
    entries.forEach(entry => { entry.cancel(); entry.dispose(); });
  }

  reset() {
    this.removeAllPending();
    this.requests = new WeakMap();
  }
}
