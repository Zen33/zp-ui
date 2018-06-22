import Vue from 'vue'
import dialogModel from './Dialog.vue'

const DialogConstructor = Vue.extend(dialogModel)
const defaultOptions = {
  title: '',
  message: '',
  type: '',
  confirmText: '确定',
  cancelText: '取消'
}
const Dialog = options => {
  // const { title, message, type } = options
  return new Promise((resolve, reject) => {
    const instance = new DialogConstructor({
      el: document.createElement('div')
    })
    document.body.appendChild(instance.$el)
    // Vue.nextTick(() => {
      instance.dgOption = Object.assign({}, defaultOptions, options)
      options.type === 'confirm' && (instance.dgOption.callback = type => {
        type === 'confirm' ? resolve() : reject()
      })
      instance.visible = true
    // })
  })
}

Dialog.alert = (message, title = '', options = {}) => {
  return Dialog(Object.assign(options, {
    type: 'alert',
    message,
    title
  }))
}

Dialog.confirm = (message, title, options = {}) => {
  if (typeof title === 'object') {
    options = title
    title = ''
  }
  return Dialog(Object.assign(options, {
    type: 'confirm',
    message,
    title
  }))
}

export default Dialog
export { Dialog }
