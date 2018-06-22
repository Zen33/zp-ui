// Inspired by https://github.com/naugtur/xhr/blob/master/index.js
let aborted = false
let timer = null
const getXML = xhr => {
  // xhr.responseXML will throw Exception "InvalidStateError" or "DOMException"
  // See https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseXML.
  try {
    if (xhr.responseType === 'document') {
      return xhr.responseXML
    }
    const firefoxBugTakenEffect = xhr.responseXML && xhr.responseXML.documentElement.nodeName === 'parsererror'
    if (xhr.responseType === '' && !firefoxBugTakenEffect) {
      return xhr.responseXML
    }
  } catch (e) {}
  return null
}
const getBody = xhr => {
  // Chrome with requestType=blob throws errors arround when even testing access to responseText
  const body = xhr.response || xhr.responseText || getXML(xhr)
  try {
    return JSON.parse(body)
  } catch (e) {
    return body
  }
}
const getError = (evt, xhr) => {
  clearTimeout(timer)
  if (!(evt instanceof Error)) {
    const msg = xhr.response && xhr.response.error || xhr.response || xhr.responseText || xhr.status
    const err = new Error(msg)
    err.status = xhr.status
    err.method = 'post'
    return err
  } else {
    return evt
  }
}

export default opts => {
  const xhr = new window.XMLHttpRequest()
  const formData = new FormData()
  const sync = !!opts.sync
  const uri = xhr.url = opts.uri || opts.url
  const headers = xhr.headers = opts.headers || {}
  const file = opts.file
  xhr.upload && xhr.upload.addEventListener('progress', evt => {
    if (evt.lengthComputable) {
      const now = Date.now ? Date.now() : new Date().getTime()
      opts.progressInterval = opts.progressInterval
      if (opts.curTime && opts.progressInterval && (now - opts.curTime < opts.progressInterval) && evt.loaded !== evt.total) {
        return
      }
      opts.curTime = now
      evt.percentComplete = Math.floor(evt.loaded / evt.total * 100)
    }
    opts.progress && opts.progress(evt, file)
  })
  opts.data && Object.keys(opts.data).forEach(key => {
    formData.append(key, opts.data[key])
  })
  formData.append(opts.filename, file)
  xhr.onload = () => {
    if (aborted) {
      return
    }
    const status = (opts.useXDR && xhr.status === undefined ? 200 : (xhr.status === 1223 ? 204 : xhr.status)) || 0
    const response = getBody(xhr)
    if (status !== 0) {
      opts.success(response, file)
    } else {
      opts.error(response, file)
    }
  }
  xhr.onerror = err => {
    opts.error(err, file)
  }
  xhr.onabort = () => {
    aborted = true
    opts.abort(file)
  }
  xhr.ontimeout = xhr => {
    aborted = true
    xhr.abort('timeout')
    opts.error(getBody(xhr), file)
  }
  xhr.open('post', uri, !sync)
  // opts.withCredentials && (xhr.withCredentials = true)
  !sync && (xhr.withCredentials = !!opts.withCredentials)
  if (!sync && Number(opts.timeout) > 0 ) {
    timer = setTimeout(() => {
      if (!aborted) {
        aborted = true // IE9 may still call readystatechange
        xhr.abort('timeout')
        const err = new Error('XMLHttpRequest timeout')
        err.code = 'ETIMEDOUT'
        opts.error(err, file)
      }
    }, opts.timeout)
  }
  for (let key in headers) {
    if (headers.hasOwnProperty(key)) {
      xhr.setRequestHeader(key, headers[key])
    }
  }
  if ('responseType' in opts) {
    xhr.responseType = opts.responseType
  }
  // if ('beforeSend' in opts && typeof opts.beforeSend === 'function') {
  //   opts.beforeSend(xhr)
  // }
  xhr.send(formData)
  return xhr
}
