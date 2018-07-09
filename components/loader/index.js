import Vue from 'vue'
import loaderModel from './Loader.vue'
import { domStyle } from '../../utils/dom'

const defaultOptions = {
  fullscreen: true,
  text: null,
  mode: 'service', 
  target: document.body
}
const LoaderConstructor = Vue.extend(loaderModel)
const getAttr = function (attr, vm) {
  return vm && vm[attr] || this.getAttribute(attr)
}
let fullInstance
const setDom = (parent, el) => {
  const self = el.instance.$el
  parent.appendChild(self)
  el.instance.visible = true
  el.landing = true
}
const toggleLoader = (el, binding) => {
  const { value, modifiers } = binding
  if (value) {
    Vue.nextTick(() => {
      const self = el.instance.$el
      if (modifiers.fullscreen) {
        self.classList.add('zp-loader-full')
        setDom(document.body, el)
      } else {
        self.classList.remove('zp-loader-full')
        const oriPos = domStyle(el, 'position')
        if (['initial', 'inherit', 'unset', 'static', 'revert'].indexOf(oriPos) > -1) {
          el.oriPos = oriPos
          domStyle(el, 'position', 'relative')
        }
        setDom(el, el)
      }
    })
  } else { 
    el.instance.visible = false
    setTimeout(() => {
      el.oriPos && domStyle(el, 'position', el.oriPos)
    }, 600)
  }
}
const LoaderDirective = {
  bind (el, binding, vnode) {
    const vm = vnode.context
    const text = getAttr.call(el, 'loader-text', vm)
    const background = getAttr.call(el, 'loader-background', vm)
    el.instance = new LoaderConstructor({
      el: document.createElement('div'),
      data: {
        text,
        fullscreen: !!binding.modifiers.fullscreen,
        background
      }
    })
    binding.value && toggleLoader(el, binding)
  },
  update (el, binding) {
    const text = getAttr.call(el, 'loader-text')
    el.instance.updateText(text)
    ;(binding.oldValue !== binding.value) && toggleLoader(el, binding)
  },
  unbind (el, binding) {
    if (el.landing) {
      const self = el.instance.$el
      self && self.parentNode && self.parentNode.removeChild(self)
      binding.value = false
      toggleLoader(el, binding)
    }
  }
}
const LoaderService = (options = {}) => {
  options = Object.assign({}, defaultOptions, options)
  try {
    options.target = document.querySelector(options.target)
  } catch (e) {
    options.target = document.body
  }
  options.target !== document.body && (options.fullscreen = false)
  const instance = new LoaderConstructor({
    el: document.createElement('div'),
    data: options
  })
  if (!options.fullscreen) {
    const pos = domStyle(options.target, 'position')
    if (['initial', 'inherit', 'unset', 'static', 'revert'].indexOf(pos) > -1) {
      options.target.oriPos = pos
      domStyle(options.target, 'position', 'relative')
    }
  } else if (fullInstance) {
    return fullInstance
  }
  options.target.appendChild(instance.$el)
  instance.visible = instance.landing = true
  options.fullscreen && (fullInstance = instance)
  return instance
}
LoaderConstructor.prototype.close = function () {
  this.fullscreen && (fullInstance = null)
  this.visible = false
  setTimeout(() => {
    if (this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el)
    }
    this.$destroy()
  }, 600)
}
const Loader = {
  install (Vue) {
    Vue.directive('loader', LoaderDirective)
  },
  name: 'loader'
}

export {
  LoaderService,
  Loader,
  LoaderDirective
}
