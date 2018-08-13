import Tree from './Tree.vue'

Tree.install = Vue => {
  Vue.component(Tree.name, Tree)
}

export default Tree
