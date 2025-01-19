class Fetch {
  plugins = [];
  count = 0;
  state = {
    loading: false,
    params: undefined,
    data: undefined,
    error: undefined,
  };

  constructor(serviceRef, options, update, initState) {
    this.state = {
      ...this.state,
      loading: !options.manual,
      ...initState,
    };
    this.serviceRef = serviceRef;
    this.update = update;
  }

  setState(state) {
    this.state = {
      ...this.state,
      ...state,
    };
    this.update();
  }

  runPluginHandler(event, ...rest) {
    const res = this.plugins.map((p) => p[event]?.(...rest)).filter(Boolean);
    return Object.assign({}, ...res);
  }

  async runAsync(...params) {
    this.count += 1;
    const currentCount = this.count;

    const {
      stopNow = false,
      returnNow = false,
      ...state
    } = this.runPluginHandler('onBefore', params);

    // stop request
    if (stopNow) {
      return new Promise(() => {});
    }

    this.setState({
      loading: true,
      params,
      ...state,
    });

    // return now
    if (returnNow) {
      return Promise.resolve(state.data);
    }

    this.options.onBefore?.(params);

    try {
      // replace service
      let { servicePromise } = this.runPluginHandler(
        'onRequest',
        this.serviceRef.current,
        params,
      );

      if (!servicePromise) {
        servicePromise = this.serviceRef.current(...params);
      }

      const res = await servicePromise;

      if (currentCount !== this.count) {
        // prevent run.then when request is canceled
        return new Promise(() => {});
      }

      // const formattedResult = this.options.formatResultRef.current ? this.options.formatResultRef.current(res) : res;

      this.setState({
        data: res,
        error: undefined,
        loading: false,
      });

      this.options.onSuccess?.(res, params);
      this.runPluginHandler('onSuccess', res, params);

      this.options.onFinally?.(params, res, undefined);

      if (currentCount === this.count) {
        this.runPluginHandler('onFinally', params, res, undefined);
      }

      return res;
    } catch (error) {
      if (currentCount !== this.count) {
        // prevent run.then when request is canceled
        return new Promise(() => {});
      }

      this.setState({
        error,
        loading: false,
      });

      this.options.onError?.(error, params);
      this.runPluginHandler('onError', error, params);

      this.options.onFinally?.(params, undefined, error);

      if (currentCount === this.count) {
        this.runPluginHandler('onFinally', params, undefined, error);
      }

      throw error;
    }
  }

  run(...params) {
    this.runAsync(...params).catch((error) => {
      if (!this.options?.onError) {
        console.error(error);
      }
    });
  }

  cancel() {
    this.count += 1;
    this.setState({
      loading: false,
    });

    this.runPluginHandler('onCancel');
  }

  refresh() {
    this.run(...(this.state.params || []));
  }

  refreshAsync() {
    return this.runAsync(...(this.state.params || []));
  }

  mutate(data) {
    const targetData = isFunction(data) ? data(this.state.data) : data;
    this.runPluginHandler('onMutate', targetData);
    this.setState({
      data: targetData,
    });
  }
}

export default Fetch;
