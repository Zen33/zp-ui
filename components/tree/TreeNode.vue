<!-- Tree Node -->
<template>
  <div v-show="tree.visible" @click.stop="handleClick" :class="['zp-tree-node', {'zp-tree-node-expand': tree.expand, 'zp-tree-node-hide': !tree.visible, 'zp-tree-node-disabled': tree.disabled, 'zp-tree-node-checked': !tree.disabled && tree.checked}]">
    <div :class="{'zp-tree-expand-on-click-node': props.expandOnClickNode}" :style="{'padding-left': `${(level - 1) * props.indent}px`}">
      <i :class="['zp-tree-node-icon', {'zp-expand-icon': !tree.isLeaf, 'zp-expand-icon-expand': !tree.isLeaf && tree.expand}]" @click.stop="handleExpand"></i>
      <i :class="{'zp-tree-spinner': landing === 2}"></i>
      <zp-checkbox v-if="props.showCheckbox" v-model="tree.checked" :disabled="!!tree.disabled" @click.native.stop @change="handleCheckChange" />
      <span :class="['zp-tree-node-text', {'zp-tree-node-selected': tree[props.nodeKey] === defaultExpandKey}]">{{ tree.label }}</span>
    </div>
    <collapse-transition>
      <div class="zp-tree-node-children" v-show="tree.expand" v-if="tree[props.childKey]">
        <zp-tree-node v-for="datum in tree[props.childKey]" :data="datum" :props="props" :parent="tree" :root="root" :bus="bus" @node-expand="handleChildNodeExpand(datum)" :key="getKey(datum)" />
      </div>
    </collapse-transition>
  </div>
</template>

<script>
  import { Checkbox } from '../checkbox/'
  import CollapseTransition from '../common/collapseTransition'
  import ClosestElement from '../../mixins/closestElement'
  import GetKey from './getKey'

  export default {
    name: 'zp-tree-node',
    props: ['data', 'props', 'parent', 'root', 'bus'],
    mixins: [ClosestElement, GetKey],
    components: {
      Checkbox,
      CollapseTransition
    },
    data () {
      return {
        level: (this.parent && this.parent.level || 0) + 1,
        tree: this.data,
        lazy: typeof this.props.load === 'function',
        landing: 0, // 0: 未载入、1：载入成功、2：载入中
        defaultExpandKey: null
      }
    },
    created () {
      !this.lazy && (this.landing = 1)
      if (this.props.nodeKey && typeof this.props.defaultExpandKey !== 'undefined' && !this.lazy) {
        // 非异步支持默认展开
        this.defaultExpandKey = this.props.defaultExpandKey
      }
      for (let prop in this.props.dataProps) {
        !this.tree.hasOwnProperty(prop) && this.$set(this.tree, prop, this.props.dataProps[prop])
      }
      this.tree.isLeaf = !this.tree[this.props.childKey]
      this.tree.level = this.tree.level || this.level
      // this.tree.$$nodeKey = this.tree.$$nodeKey || this.tree[this.props.nodeKey]
      this.tree.parent = this.parent
    },
    mounted () {
      const nodeKey = this.props.nodeKey
      if (this.tree[nodeKey] === this.defaultExpandKey) {
        this.bus.$emit('selectedNode', this.tree, this.root)
        this.handleExpand(null, true)
        if (!this.tree.disabled) {
          this.tree.checked = true
          this.handleCheckChange()
        }
      }
    },
    methods: {
      handleSelected (evt) { // 选中事件
        const target = evt.target
        const wrapper = this.getClosest(target, '.zp-tree-wrap')
        const selectedNode = wrapper && wrapper.querySelector('.zp-tree-node-selected')
        selectedNode && selectedNode.classList.remove('zp-tree-node-selected')
        const curNode = target.classList.contains('zp-tree-node-text') ?  target : target.querySelector('.zp-tree-node-text')
        curNode && curNode.classList.add('zp-tree-node-selected')
      },
      handleClick (evt) { // 点击节点事件
        if (this.props.expandOnClickNode && !this.tree.isLeaf) {
          this.handleExpand()
        }
        this.handleSelected(evt)
        this.bus.$emit('selectedNode', this.tree, this.root)
        this.$emit('node-click', this.tree)
      },
      async handleExpand (evt, expandParent) {
        if ((evt && !this.tree.isLeaf) || !evt) {
          if (this.tree.expand) {
            this.$emit('node-collapse', this.tree)
            this.tree.expand = false
          } else {
            const expand = () => {
              if (expandParent) {
                let parent = this.tree.parent
                while (parent) {
                  parent.expand = true
                  parent = parent.parent
                }
              }
              this.$nextTick(() => {
                !this.tree.disabled && (this.tree.expand = true)
              })
              !this.tree.isLeaf && this.props.accordion && this.handleAccord()
            }
            if (this.lazy && !this.landing) {
              try {
                this.landing = 2
                const data = await this.props.load()
                this.landing = 1
                this.$set(this.tree, this.props.childKey, data)
                expand()
                if (this.tree.checked) {
                  this.$nextTick(this.setChildProp(this.tree, 'checked', true))
                }
              } catch (e) {
                setTimeout(() => {
                  this.landing = 0
                }, 600)
              }
            } else {
              expand()
            }
            this.$emit('node-expand', this.tree)
          }
        }
      },
      handleAccord () { // 折叠节点
        const childKey = this.props.childKey
        const parent = this.tree.parent || {
          [childKey]: this.root
        }
        if (parent) {
          for (let child of parent[childKey]) {
            if (child.$$nodeKey !== this.tree.$$nodeKey && child.expand === true) {
              child.expand = false
              this.setChildProp(child, 'expand', false)
            }
          }
        }
      },
      setChildProp (context, prop, val, deep = true) { // 设置子节点属性
        const childKey = this.props.childKey
        const walk = self => {
          const children = self[childKey] || []
          if (children.length) {
            for (let child of children) {
              if (!child.disabled) {
                // child[prop] = val
                this.$set(child, prop, val)
                deep && walk(child)
              }
            }
          }
        }
        walk(context)
      },
      handleParentCheckChange (context, val, deep = true) { // 设置父节点checkbox
        const childKey = this.props.childKey
        const walk = self => {
          if (self.parent) {
            if (self.parent[childKey].length === self.parent[childKey].filter(child => child.checked === val).length) {
              if (val) {
                self.parent.checked = true
              } else {
                self.parent.checked = false
              }
            } else {
              self.parent.checked = false
            }
            deep && walk(self.parent)
          }
        }
        walk(context)
      },
      handleCheckChange () { // 设置checkbox属性
        const status = this.tree.checked
        this.setChildProp(this.tree, 'checked', status)
        this.handleParentCheckChange(this, status)
        this.$emit('node-check', this.tree, status)
      },
      handleChildNodeExpand (data) { // 子节点展开事件
        this.$emit('node-expand', data.$$nodeData)
      }
    }
  }
</script>

<style>
  .zp-tree-node {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    white-space: nowrap;
    outline: none;
    line-height: 26px;
    font-size: 14px;
    margin-left: 4px;
  }
  .zp-tree-node .zp-checkbox {
    vertical-align: middle;
  }
  .zp-tree-node .zp-tree-expand-on-click-node {
    cursor: pointer;
    border-radius: 5px;
  }
  .zp-tree-node .zp-tree-expand-on-click-node:hover {
    background: rgba(222, 227, 230, .3);
  }
  .zp-tree-node .zp-tree-node-text {
    display: inline-block;
    padding: 0 5px;
    -webkit-touch-callout: text;
    -webkit-user-select: text;
    -khtml-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
    user-select: text;
  }
  .zp-tree-node .zp-tree-node-selected {
    background: rgba(84, 165, 255, .3);
    border-radius: 3px;
  }
  .zp-tree-node .zp-expand-icon-expand {
    -moz-transform: rotate(0deg)!important;
    -webkit-transform: rotate(0deg)!important;
    -o-transform: rotate(0deg)!important;
    transform: rotate(0deg)!important;
  }
  .zp-tree-node .zp-tree-node-icon {
    display: inline-block;
    width: 14px;
    height: 8px;
    margin: 0;
  }
  .zp-tree-node .zp-expand-icon {
    background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAICAYAAADJEc7MAAAAAXNSR0IArs4c6QAAAKBJREFUGBmFkFEOwiAQRIFLNB4HDuRP/VD/tdhUbTwQcBtvAc40bGI1DSSbZXbetICOMfZKqZ219oDeXOAnQG9TSulQfUrp3kqRIcvMwoYQRlRBPbbC9Cozrhh87UYDR3muDAjO6JH59RYNwNfwLABmc515mbHrb8E9wAF3OBpjXtQ5573W2uPxTtSy/oI08IcrmoCDc+4sgWbHfS6sLfADvGRlngSVsjQAAAAASUVORK5CYII=') no-repeat;
    -moz-transition: -moz-transform .3s;
    -webkit-transition: -webkit-transform .3s;
    -o-transition: -o-transform .3s;
    transition: transform .3s;
    cursor: pointer;
    -moz-transform: rotate(-90deg);
    -webkit-transform: rotate(-90deg);
    -o-transform: rotate(-90deg);
    transform: rotate(-90deg);
  }
  .zp-tree-node .zp-expand-icon-hide {
    visibility: hidden;
  }
  @-moz-keyframes spin {
    from {
      -moz-transform: rotate(0deg);
    }
    to { 
      -moz-transform: rotate(360deg);
    }
  }
  @-webkit-keyframes spin {
    from {
      -webkit-transform: rotate(0deg);
    }
    to {
      -webkit-transform: rotate(360deg);
    }
  }
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  .zp-tree-node .zp-tree-spinner {
    box-sizing: border-box;
    margin-top: 6px;
    margin-left: -18px;
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid #ccc;
    border-top-color: #54a5ff;
    -moz-animation: spin .6s linear infinite;
    -webkit-animation: spin .6s linear infinite;
    -o-animation: spin .6s linear infinite;
    animation: spin .6s linear infinite;
    background: #fff;
    cursor: default;
  }
</style>