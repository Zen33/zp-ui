import Radio from './Radio.vue'
import RadioGroup from './RadioGroup.vue'

Radio.install = Vue => {
  Vue.component(Radio.name, Radio)
}
RadioGroup.install = Vue => {
  Vue.component(RadioGroup.name, RadioGroup)
}

export {
  Radio,
  RadioGroup
}
