import DynamicNumbers from './DynamicNumbers.vue'

DynamicNumbers.install = Vue => {
  Vue.component(DynamicNumbers.name, DynamicNumbers)
}

export default DynamicNumbers
