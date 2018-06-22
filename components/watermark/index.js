const WatermarkDirective = {
  inserted (el, binding, vnode) {
    const styles = window.getComputedStyle(el, null)
    const params = {
      width: parseInt(styles.getPropertyValue('width'), 10),
      height: parseInt(styles.getPropertyValue('height'), 10)
    }
    const times = 5
    const leeway = 150
    const unit = Math.ceil(params.width / times)
    let gap = []
    let wmContent = Array.isArray(binding.value) ? binding.value : binding.value !== undefined ? [binding.value] : ['zhaopin.com']
    for (let i = 0; i < times; i += 1) {
      gap[i] = unit * i
    }
    (gapLen => {
      const columns = Math.ceil(params.height / leeway)
      let htmlString = ''
      let flag = 0
      const cssText = `
      position: fixed;
      opacity: .25;
      font-size: 4em;
      -webkit-transform: rotate(-15deg);
      -moz-transform: rotate(-15deg);
      -ms-transform: rotate(-15deg);
      -o-transform: rotate(-15deg);
      transform: rotate(-15deg); 
      font-weight: bold;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      `
      for (let i = 0; i < columns; i += 1) {
        for (let wm of wmContent) {
          htmlString += `<div style="${cssText}left:${gap[flag]}px;top:${leeway * i}px;">${wm}</div>`
          flag = (flag >= gapLen - 1) ? 0 : flag + 1
        }
      }
      el.insertAdjacentHTML('beforeend', htmlString)
      // el.insertAdjacentHTML('beforebegin', htmlString)
    })(gap.length)
  }
}

const Watermark = {
  install (Vue) {
    Vue.directive('watermark', WatermarkDirective)
  },
  name: 'watermark'
}

export {
  Watermark,
  WatermarkDirective
}
