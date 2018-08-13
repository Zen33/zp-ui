<!-- Tree -->
<template>
  <div class="zp-tree-wrap">
    <zp-tree-node v-for="datum in rawData" :data="datum" :props="_props" :parent="null" :root="rawData" :bus="bus" :key="getKey(datum)" />
  </div>
</template>

<script>
  import Vue from 'vue'
  import Utils from '../../utils/common'
  import ZpTreeNode from './TreeNode.vue'
  import GetKey from './getKey'

  export default {
    name: 'zp-tree',
    props: {
      data: {
        type: Array,
        default: () => ([])
      },
      expandAll: {
        type: Boolean,
        default: false
      },
      showCheckbox: {
        type: Boolean,
        default: false
      },
      nodeKey: {
        type: String
      },
      expandOnClickNode: {
        type: Boolean,
        default: true
      },
      indent: {
        type: Number,
        default: 18
      },
      childKey: {
        type: String,
        default: 'children'
      },
      accordion: {
        type: Boolean,
        default: false
      },
      defaultExpandKey: [Number, String],
      load: Function,
      dataProps: {
        default: () => ({
          expand: false,
          checked: false,
          disabled: false,
          visible: true,
          landing: false,
          level: 0,
          isLeaf: false
        })
      }
    },
    mixins: [GetKey],
    data () {
      return {
        treeModel: null,
        treeData: null,
        rawData: this.data
      }
    },
    components: {
      ZpTreeNode
    },
    computed: {
      bus () {
        return new Vue()
      }
    },
    created () {
      this.bus.$on('selectedNode', (model, data) => {
        this.treeModel = model
        this.treeData = data
      })
    },
    methods: {
      checkData () { // 数据校验
        return this.treeModel && !this.treeModel.disabled
      },
      reExpand (node) { // 重新展开节点
        node.expand = false
        this.$nextTick(() => {
          node.expand = true
        })
      },
      getNodeData () { // 获取当前匹配节点数据
        const children = this.treeModel.parent ? this.treeModel.parent[this.childKey] : this.treeData
        for (let [index, child] of children.entries()) {
          if (child.$$nodeKey === this.treeModel.$$nodeKey) {
            return {
              parent: child.parent,
              children,
              index
            }
          }
        }
      },
      append (data) { // 新增节点
        if (this.checkData()) {
          this.treeModel[this.childKey] = this.treeModel[this.childKey] || []
          Utils.isObject(data) && (data = [data])
          for (let datum of data) {
            this.treeModel[this.childKey].push(datum)
          }
          this.treeModel.isLeaf = false
          this.treeModel.parent && this.reExpand(this.treeModel)
        }
      },
      remove () { // 删除节点
        if (this.checkData()) {
          try {
            const { parent, children, index } = this.getNodeData()
            if (Utils.isNumber(index)) {
              children.splice(index, 1)
              if (parent) {
                const children = parent[this.childKey]
                if (!children || (children && !children.length)) {
                  parent.isLeaf = true
                }
                this.reExpand(parent)
              }
            }
          } catch (e) {
            return false
          }
        }
      },
      update (data) { // 更新节点
        if (this.checkData() && Utils.isObject(data)) {
          for (let prop in data) {
            this.treeModel[prop] = data[prop]
          }
        }
      },
      insertBefore (data) { // 节点前插入
        const insert = (arr, index, ...items) => [
          ...arr.slice(0, index),
          ...items,
          ...arr.slice(index)
        ]
        if (this.checkData()) {
          try {
            const { parent, children, index } = this.getNodeData()
            Utils.isObject(data) && (data = [data])
            const newData = insert(children, index, ...data)
            if (parent) {
              parent[this.childKey] = newData
              this.reExpand(parent)
            } else {
              this.rawData = []
              this.$nextTick(() => {
                this.rawData = newData
              })
            }
          } catch (e) {
            return false
          }
        }
      },
      insertAfter (data) { // 节点后插入
        if (this.checkData()) {
          try {
            const { parent, children, index } = this.getNodeData()
            Utils.isObject(data) && (data = [data])
            const newData = [...children, ...data]
            if (parent) {
              parent[this.childKey] = newData
              this.reExpand(parent)
            } else {
              this.rawData = []
              this.$nextTick(() => {
                this.rawData = newData
              })
            }
          } catch (e) {
            return false
          }
        }
      }
    }
  }
</script>
