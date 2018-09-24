import addKeyFrames from '../../utils/keyframes'
import { domStyle } from '../../utils/dom'
const styles = window.getComputedStyle(document.documentElement, '')
const pre = ([...styles].join('').match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o']))[1]
const mapping = {
  webkit: 'webkitAnimationStart',
  moz: 'animationstart',
  o: 'oanimationstart',
  ms: 'MSAnimationStart'
}
const animationStart = mapping[pre.toLocaleLowerCase()]
let eventFn
let unbindFn = true
const SensorDirective = {
  bind (el, binding, vnode) {
    addKeyFrames(
      'showTime',
      `from {
        clip: rect(1px, auto, auto, auto);
      }
      to {
        clip: rect(0px, auto, auto, auto);
      }`
    )
    const cssText = `
    -o-animation-duration: 0.001s;
    -ms-animation-duration: 0.001s;
    -moz-animation-duration: 0.001s;
    -webkit-animation-duration: 0.001s;
    animation-duration: 0.001s;
    -o-animation-name: showTime;
    -ms-animation-name: showTime;
    -moz-animation-name: showTime;
    -webkit-animation-name: showTime;
    animation-name: showTime;`
    el.style.cssText += cssText
    const sensorFn = binding.arg && vnode.context && vnode.context[binding.arg]
    if (sensorFn && typeof sensorFn === 'function') {
      eventFn = () => {
        sensorFn ()
        if (binding.modifiers.once) {
          el.removeEventListener(animationStart, eventFn) // TBD 会无效故样式清空
          domStyle(el, `-${pre}-animation-name`, '')
          domStyle(el, `-${pre}-animation-duration`, 0)
          unbindFn = false
        }
      }
      el.addEventListener(animationStart, eventFn)
    }
  },
  unbind (el) {
    unbindFn && el.removeEventListener(animationStart, eventFn)
  }
}

const Sensor = {
  install (Vue) {
    Vue.directive('sensor', SensorDirective)
  },
  name: 'sensor'
}

export {
  Sensor,
  SensorDirective
}
