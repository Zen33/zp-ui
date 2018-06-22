import Vue from 'vue'
import informationModel from './Information.vue'

const InformationConstructor = Vue.extend(informationModel)
const defaultOptions = {
  message: '',
  showClose: true
}
let instances = []
let seed = 1
const leeway = 10

const Information = (message = '', options = {}) => {
  return new Promise((resolve, reject) => {
    if (['info', 'success', 'warning', 'error'].indexOf(options.type) === -1) {
      options.type = 'info'
    }
    if (['top-right', 'top-left', 'bottom-right', 'bottom-left'].indexOf(options.position) === -1) {
      options.position = 'top-right'
    }
    options.handleClose = () => {
      Information.close(instance.id, resolve)
    }
    const instance = new InformationConstructor({
      el: document.createElement('div'),
      data: Object.assign({}, defaultOptions, options)
    })
    instance.fromTop = !!(options.position.indexOf('top') > -1)
    document.body.appendChild(instance.$el)
    instance.visible = true
    Vue.nextTick(() => {
      const windowHeight = 'innerHeight' in window ? window.innerHeight : document.documentElement.offsetHeight
      const infoHeight = instance.$el.offsetHeight
      let offset = instance.fromTop ? 0 : windowHeight - infoHeight
      let len = instances.length
      for (let i = 0; i < len; i++) {
        if (instances[i].fromTop) {
          offset += infoHeight + leeway
        } else {
          offset -= infoHeight + leeway
        }
      }
      instance.id = `info__${seed++}`
      instance.top = `${instance.fromTop ? (offset + leeway) : (offset - leeway)}px`
      instances.push(instance)
      instance.message = message
      })
  })
}

Information.close = (id, resolve) => {
  const len = instances.length
  let index
  let prevHeight
  for (let i = 0; i < len; i++) {
    if (id === instances[i].id) {
      index = i
      prevHeight = instances[i].$el.offsetHeight + leeway
      instances.splice(i, 1)
      try {
        resolve(instances[i])
      } catch (e) {
        return false
      }
      break
    }
  }
  if (len > 1) {
    for (let i = index; i < len - 1; i++) {
      instances[i].$el.style.top = `${parseInt(instances[i].$el.style.top, 10) + (instances[i].fromTop ? -prevHeight : prevHeight)}px`
    }
  }
}

Information.closeAll = () => {
  for (let i = instances.length - 1; i >= 0; i--) {
    instances[i].closed = true
  }
}

export default Information
