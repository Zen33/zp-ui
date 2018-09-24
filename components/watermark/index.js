import { domStyle } from '../../utils/dom'

const WatermarkDirective = {
  inserted (el, binding) {
    // const styles = window.getComputedStyle(el, null)
    // const params = {
    //   width: parseInt(styles.getPropertyValue('width'), 10),
    //   height: parseInt(styles.getPropertyValue('height'), 10)
    // }
    const params = {
      width: parseInt(domStyle(el, 'width'), 10),
      height: parseInt(domStyle(el, 'height'), 10)
    }
    const TIMES = 5
    const LEEWAY = 150
    const unit = Math.ceil(params.width / TIMES)
    let gap = []
    let wmContent = Array.isArray(binding.value) ? binding.value : binding.value !== undefined ? [binding.value] : ['zhaopin.com']
    for (let i = 0; i < TIMES; i += 1) {
      gap[i] = unit * i
    }
    (gapLen => {
      const columns = Math.ceil(params.height / LEEWAY)
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
          htmlString += `<div style="${cssText}left:${gap[flag]}px;top:${LEEWAY * i}px;">${wm}</div>`
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
