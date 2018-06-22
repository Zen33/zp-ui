import Vue from 'vue'
import Popover from './Popover.vue'
import directive from './directive'

Vue.directive('popover', directive)

Popover.install = Vue => {
  Vue.directive('popover', directive)
  Vue.component(Popover.name, Popover)
}

Popover.directive = directive

export default Popover
