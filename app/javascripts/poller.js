export default {
  _options: {
    delay: 1500
  },
  intervals: {},
  _queue: {},

  init (options = {}) {
    Object.assign(this._options, options)
    this._interval = setInterval(
      () => Object.keys(this._queue)
        .map(key => this._queue[key])
        .forEach(task => requestAnimationFrame(task)),
      this._options.delay
    )
    return this
  },
  destroy () {
    clearInterval(this._interval)
    this._queue = []
  },
  queue (name, fn) {
    requestAnimationFrame(() =>fn());
    this._queue[name] = fn;
  },
  remove (name) {
    delete this._queue[name]
  }
}
