import Tabs from './Tabs.vue'
import TabPane from './TabPane.vue'

Tabs.install = Vue => {
  Vue.component(Tabs.name, Tabs)
}
TabPane.install = Vue => {
  Vue.component(TabPane.name, TabPane)
}

export {
  Tabs,
  TabPane
}
