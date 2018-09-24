export default {
  fetch (opts) {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest()
      xhr.open(opts.method || 'GET', opts.url)
      xhr.onload = () => {
        if (this.status >= 200 && this.status < 300) {
          resolve(xhr.response)
        } else {
          /* eslint-disable */
          reject({
            status: this.status,
            statusText: xhr.statusText
          })
          /* eslint-enable */
        }
      }
      xhr.onerror = () => {
        /* eslint-disable */
        reject({
          status: this.status,
          statusText: xhr.statusText
        })
        /* eslint-enable */
      }
      if (opts.headers) {
        Object.keys(opts.headers).forEach(function (key) {
          xhr.setRequestHeader(key, opts.headers[key])
        })
      }
      let params = opts.params
      // We'll need to stringify if we've been given an object
      // If we have a string, this is skipped.
      if (params && typeof params === 'object') {
        params = Object.keys(params).map(function (key) {
          return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
        }).join('&')
      }
      xhr.send(params)
    })
  }
}