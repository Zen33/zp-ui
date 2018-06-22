import Vue from 'vue'
import messageModel from './Message.vue'

const MessageConstructor = Vue.extend(messageModel)
const defaultOptions = {
  message: '',
  showClose: false
}
const instances = []
let seed = 1

const Message = (message = '', options = {}) => {
  return new Promise((resolve, reject) => {
    if (['info', 'success', 'warning', 'error'].indexOf(options.type) === -1) {
      options.type = 'info'
    }
    if (['top', 'middle', 'bottom'].indexOf(options.position) === -1) {
      options.position = 'middle'
    }
    options.handleClose = () => {
      Message.close(instance.id, resolve)
    }
    const instance = new MessageConstructor({
      el: document.createElement('div'),
      data: Object.assign({}, defaultOptions, options)
    })
    instance.id = `message__${seed++}`
    document.body.appendChild(instance.$el)
    instance.message = message
    instance.visible = true
    instances.push(instance)
  })
}

Message.close = (id, resolve) => {
  const len = instances.length
  for (let i = 0; i < len; i++) {
    if (id === instances[i].id) {
      instances.splice(i, 1)
      try {
        resolve(instances[i])
      } catch (e) {
        return false
      }
      break
    }
  }
}

Message.closeAll = () => {
  for (let i = instances.length - 1; i >= 0; i--) {
    instances[i].closed = true
  }
}

export default Message
