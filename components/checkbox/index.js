import Checkbox from './Checkbox.vue'
import CheckboxGroup from './CheckboxGroup.vue'

Checkbox.install = Vue => {
  Vue.component(Checkbox.name, Checkbox)
}
CheckboxGroup.install = Vue => {
  Vue.component(CheckboxGroup.name, CheckboxGroup)
}

export {
  Checkbox,
  CheckboxGroup
}
