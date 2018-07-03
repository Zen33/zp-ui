<!-- Cascader -->
<template>
  <div class="zp-cas" ref="casSelf" @mousewheel="expand = false">
    <input type="text" v-model="model" readonly :style="{width: `${casOption.width}px`}" @click="toggleList" @blur="onBlur" @mouseleave="onBlur" ref="casInput"/>
    <i class="zp-cas-arrow"></i>
    <div :class="['zp-cas-wrapper', `zp-cas-${uid}`, {'zp-cas-hide': !expand}]" ref="casWrap" :style="{'z-index': casOption.zIndex || zIndex}">
      <ul ref="casItems" data-level="0" class="zp-cas-items" :style="{'max-width': `${casOption.width}px`}" @mouseenter="casVisible = true;casSubVisible = true" @mouseleave="onBlur(false)">
        <li v-for="item in casOption.data" @click="setSelected($event, item)" @mouseenter="beforeCheckSub($event, item)" :class="[{'zp-cas-selected': `${item.value}` === `${oriValue[0]}`}, 'zp-cas-item']">
          <a :class="{'zp-cas-sub-arrow': item[subKey]}"><i v-if="item.itemClass" :class="item.itemClass"/>{{ item.label }}</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  import MaxZIndex from '../../mixins/zIndex'
  import ClosestElement from '../../mixins/closestElement'

  export default {
    name: 'zp-cascader',
    mixins: [MaxZIndex, ClosestElement],
    props: ['casOption'],
    data () {
      return {
        landing: false,
        expand: false,
        immediate: this.getProp(this.casOption, 'immediate', false), // 选择即改变
        allLevels: this.getProp(this.casOption, 'allLevels'), // 全路径
        oriData: [],
        casVisible: false,
        casSubVisible: true,
        subKey: this.casOption.hasChild || 'children',
        // model: this.casOption.value ? this.casOption.value.join('/') : '',
        model: '',
        oriValue: this.casOption.value || [],
        oriLabel: [],
        shadow: {
          value: [],
          label: []
        }
      }
    },
    created () {
      if (this.casOption.url) {
        this.casOption.data = []
        this.getAsyncData(this.casOption.url).then(data => {
          this.casOption.data = this.getChainVal(data, this.casOption.dotNotation || null)
          this.oriValue.length && this.dataMapping()
        }).catch(e => {
          this.casOption.onFail && this.casOption.onFail(e)
        })
      } else {
        this.oriValue.length && this.dataMapping()
      }
    },
    beforeUpdate () {
      if (!this.landing && this.casOption.data.length) {
        this.landing = true
        const fragment = document.createDocumentFragment()
        fragment.appendChild(this.$refs.casWrap)
        document.body.appendChild(fragment)
        this.oriData = this.cloneData(this.casOption.data)
      }
    },
    beforeDestroy () {
      const cas = document.querySelector(`.zp-cas-${this.uid}`)
      cas && cas.parentNode.removeChild(cas)
    },
    computed: {
      uid () {
        // return Math.round(Math.random() * (0x999999 - 0x100000) + 0x100000)
        return Math.random().toString(36).substr(2, 9)
      },
      seed () {
        return `zp-cas-sub-${this.uid}`
      }
    },
    methods: {
      getProp (data, prop, val = true) {
        return data.hasOwnProperty(prop) ? data[prop] : val
      },
      dataMapping (level = 0, data = this.casOption.data) {
        for (let [i, val] of data.entries()) {
          if (`${val.value}` === `${this.oriValue[level]}`) {
            this.oriLabel[level] = val.label
            const nextLevel = level + 1
            if (this.oriValue[nextLevel] !== undefined) {
              return this.dataMapping(nextLevel, val[this.subKey])
            } else {
              this.shadow.value = this.cloneData(this.oriValue)
              this.shadow.label = this.cloneData(this.oriLabel)
              return (this.model = this.oriLabel.join('/'))
            }
          }
        }
      },
      hidePrevSub (item) { // 隐藏之前显示子项
        const level = parseInt(item.getAttribute('data-level'), 10)
        const casSubItems = [...document.querySelectorAll(`.${this.seed}:not([style*="display:none"]):not([style*="display: none"]`)]
        for (let subItem of casSubItems) {
          const itemLevel = parseInt(subItem.getAttribute('data-level'), 10)
          if (itemLevel >= level && subItem !== item) {
            subItem.style.display = 'none'
          }
        }
      },
      beforeCheckSub (...args) { // 预处理第一级
        // this.immediate && this.setModel(args[0].currentTarget, args[1])
        const target = args[0].currentTarget
        this.hidePrevSub(this.$refs.casItems)
        let level = this.setModel(target, args[1])
        this.checkSub(...args, ++level, this.oriValue[level])
      },
      setModel (el, prop, update) { // 设置当前值
        const itsRoot = this.getClosest(el, 'ul')
        const level = itsRoot ? itsRoot.getAttribute('data-level') : null
        if (level !== null && prop) {
          const len = this.oriValue.length - 1
          if (this.immediate) {
            if (level < len) {
              this.oriValue.splice(level, len - level)
              this.oriLabel.splice(level, len - level)
            }
            this.oriValue[level] = prop.value
            this.oriLabel[level] = prop.label
            this.model = this.allLevels ? this.oriLabel.join('/') : this.oriLabel.slice(-1)
          } else if (update && !this.immediate) {
            this.oriValue = this.cloneData(this.shadow.value)
            this.oriLabel = this.cloneData(this.shadow.label)
            this.model = this.allLevels ? this.oriLabel.join('/') : this.oriLabel.slice(-1)
          } else {
            if (level < len) {
              this.shadow.value.splice(level, len - level)
              this.shadow.label.splice(level, len - level)
            }
            this.shadow.value[level] = prop.value
            this.shadow.label[level] = prop.label
          }
        }
        return level
      },
      expandSubItems (level = 0, data = this.casOption.data, leeway, el) { // 显示级联列表
        for (let [i, val] of data.entries()) {
          if (`${val.value}` === `${this.oriValue[level]}`) {
            // data-index i
            // data-level index
            const nextLevel = level + 1
            const item = level === 0 ? this.$refs.casItems.querySelectorAll('.zp-cas-item')[i] : el.querySelectorAll('.zp-cas-item')[i]
              const higherUp = this.checkSub(item, val, nextLevel, this.oriValue[nextLevel])
              return this.expandSubItems(nextLevel, val[this.subKey], i, higherUp)
          }
        }
      },
      getElementIndex (el) { // 获取当前索引值
        let index = 0
        while (el = el.previousElementSibling) {
          index += 1
        }
        return index
      },
      checkSub (evt, data, level = 1, selectedVal) { // 配置子级
        const self = evt.currentTarget || evt
        if (data && data[this.subKey] && data[this.subKey].length) {
          const childId = self.getAttribute('data-child')
          const selfPos = self.getBoundingClientRect()
          const casSelf = this.$refs.casSelf
          const zIndex = this.casOption.zIndex ? parseInt(this.casOption.zIndex, 10) + 1 : 1000
          const curIndex = this.getElementIndex(self) // 当前索引
          const casWrap = this.$refs.casWrap
          let casSub
          if (childId) {
            casSub = document.querySelector(`#${childId}`)
            ;[...casSub.querySelectorAll('.zp-cas-item')].forEach(item => {
              const value = item.getAttribute('data-value')
              if (`${value}` === `${selectedVal}`) {
                item.classList.add('zp-cas-selected')
              } else {
                item.classList.remove('zp-cas-selected')
              }
            })
            casSub.style.display = 'inline-block'
          } else {
            const id = `child-${new Date().getTime()}`
            let casString = `<ul id="${id}" data-index="${curIndex}" data-level="${level}" class="zp-cas-sub ${this.seed}" style="z-index: ${zIndex};">`
            for (let item of data[this.subKey]) {
              const hasSubClass = item[this.subKey] ? ' zp-cas-sub-arrow' : ''
              const hasSelectedClass = `${selectedVal}` === `${item.value}` ? ' zp-cas-selected' : ''
              casString += `<li class="zp-cas-item${hasSubClass}${hasSelectedClass}" data-value="${item.value}"><a>${item.label}</a></li>`
            }
            this.$refs.casWrap.insertAdjacentHTML('beforeend', casString)
            casSub = document.querySelector(`#${id}`)
            const items = [...document.querySelectorAll(`#${id} li`)]
            level += 1
            casSub.addEventListener('mouseenter', () => {
              this.casVisible = true
              this.casSubVisible = true
              this.hidePrevSub(casSub)
            })
            items.forEach((item, index) => {
              item.addEventListener('mouseenter', evt => {
                // this.immediate && this.setModel(evt.currentTarget, data[this.subKey][index])
                this.setModel(evt.currentTarget, data[this.subKey][index])
                this.hidePrevSub(casSub)
                this.checkSub(evt, data[this.subKey][index], level, this.oriValue[level])
              })
              item.addEventListener('click', evt => {
                this.setSelected(evt, data[this.subKey][index])
              })
            })
            casSub.addEventListener('mouseleave', evt => {
              this.onBlur(false)
              this.casSubVisible = false
              setTimeout(() => {
                this.hideSub()
              }, 300)
            })
            self.setAttribute('data-child', id)
          }
          return casSub
        }
        // arguments.length <= 3 && this.immediate && this.setModel(self, data)
        arguments.length <= 3 && this.setModel(self, data)
      },
      getChainVal (obj, prop, val) { // 获取诸如a.b.c对象
        if (!prop) {
          return obj
        }
        const props = prop.split('.')
        const final = props.pop()
        let key
        while ((key = props.shift())) {
          if (typeof obj[key] === 'undefined') {
            return undefined
          }
          obj = obj[key]
        }
        return val ? (obj[final] = val) : obj[final]
      },
      cloneData (data) { // 对象拷贝
        return Object.assign ? Object.assign([], data) : JSON.parse(JSON.stringify(data))
      },
      async getAsyncData (url) { // 获取异步数据
        const res = await fetch(url)
        const data = await res.json()
        return data
      },
      hideSub () { // 隐藏子项
        if (this.casSubVisible) {
          return false
        }
        const casSubItems = [...document.querySelectorAll(`.${this.seed}`)]
        for (let item of casSubItems) {
          item.style.display = 'none'
        }
      },
      setSelected (evt, data) { // 获取选中项
        if (data && data[this.subKey] && data[this.subKey].length || !data) {
          return false
        }
        // this.model = val
        this.setModel(evt.currentTarget, {
          label: data.label,
          value: data.value
        }, true)
        this.casSubVisible = false
        this.hideSub()
        this.toggleList()
        this.casOption.onSelect && this.casOption.onSelect.call(this, data.value)
        this.$emit('cas-action', data.value)
      },
      adjustPos (item) { // 纠正位置
        const modal = document.querySelector(this.casOption.modal)
        const casRect = this.$refs.casSelf.getBoundingClientRect()
        const itemRect = item.getBoundingClientRect()
        if (modal) {
          const rect = modal.getBoundingClientRect()
          const modalMaxHeight = rect.height + rect.top
          const itemMaxHeight = itemRect.height + casRect.top
          if (itemMaxHeight >= modalMaxHeight) {
            item.style.top = `-${itemRect.height}px`
          }
        } else {
          const itemMaxHeight = itemRect.height + casRect.top + casRect.height
          if (itemMaxHeight >= window.innerHeight) {
            item.style.top = `${window.scrollY + casRect.top - itemRect.height}px`
          } else {
            item.style.top = `${casRect.top + casRect.height + window.scrollY}px`
          }
          item.style.left = `${casRect.left + window.scrollX}px`
        }
      },
      toggleList () { // 切换当前项
        if (this.casOption.data.length) {
          this.expand = !this.expand
        }
        this.expand && this.$nextTick(() => {
          this.adjustPos(this.$refs.casWrap)
          this.oriValue.length && this.expandSubItems()
        })
      },
      onBlur (status) { // 隐藏当前项
        status === false && (this.casVisible = false)
        setTimeout(() => {
          if (!this.casVisible) {
            this.expand = false
            this.$emit('casInput:blur')
          }
        }, 300)
      }
    }
  }
</script>

<style>
.zp-cas {
  display: inline-block;
  position: relative;
}
.zp-cas input {
  display: block;
  position: relative;
  border: 1px solid #e6e8ea;
  border-radius: 3px;
  width: 160px;
  height: 25px;
  text-indent: 5px;
  padding: 0 10px 0 1px;
  box-sizing: border-box;
  cursor: pointer;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.zp-cas-sub-arrow:after {
  content: '';
  width: 0;
  position: absolute;
  right: 5px;
  height: 0;
  margin-top: 6px;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 6px solid #54a5ff;
}
.zp-cas-selected {
  background: #54a5ff!important;
}
.zp-cas-selected:after {
  border-left-color: #fff;
}
.zp-cas-selected a {
  color: #fff!important;
}
.zp-cas .zp-cas-arrow {
  background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAOCAYAAAASVl2WAAAAAXNSR0IArs4c6QAAAK1JREFUGBljYCAFGNl4poEwsh5GGMfM3sPyz1+GAyA+CzODw6mDO46D2GAFxrbukkDm2f///wNpIIuR8TkDw3/js4d3PmcMDQ1lu/vi8wGG//8tQZJwwMh4XFmC14GZQ0huGlB1AFwCwZB9/+WXOIJLMxajkY3HTKAbUPyOsI1xFpOyJG8u0F9gPyMkgCyQL4ByBMOBCaQLFCDMTAzBQG2/QBjEBomhmAjiYIsLACjQPAdNibz2AAAAAElFTkSuQmCC') no-repeat;
  position: absolute;
  pointer-events: none;
  width: 16px;
  height: 16px;
  right: 0;
  top: 5px;
}
.zp-cas-items,
.zp-cas-sub {
  /* position: absolute; */
  display: inline-block;
  vertical-align: top;
  min-height: 200px;
  background: #fff;
  overflow: auto;
  overflow-x: hidden;
  width: 158px;
  border: 1px solid #e6e8ea;
  border-top: none;
  box-shadow: 0 2px 6px #ccc;
  border-radius: 2px;
  border: 1px solid #d1dbe5;
  list-style-type: none;
  padding: 0;
  margin: 0;
  margin-left: -1px;
}
.zp-cas-items:first-child,
.zp-cas-sub:first-child {
  margin-left: 0;
}
/* .zp-cas-sub {
  overflow: hidden!important;
  max-height: 208px;
  margin-top: -1px;
  margin-left: -5px;
} */
.zp-cas-items li,
.zp-cas-sub li {
  line-height: 25px;
  height: 25px;
  text-indent: 5px;
  position: relative;
}
.zp-cas-items li:hover,
.zp-cas-sub li:hover {
  cursor: pointer;
  background: #e6e8ea;
}
.zp-cas-items li:hover a,
.zp-cas-sub li:hover a {
  color: #323c47;
}
.zp-cas-items li,
.zp-cas-sub li {
  border-bottom: 1px solid #eceef3;
}
.zp-cas-items li:last-child,
.zp-cas-sub li:last-child {
  border-bottom: none;
}
.zp-cas-sub a,
.zp-cas a,
.zp-cas-item a {
  color: #323c47;
  font-size: 14px;
}
.zp-cas-hide {
  display: none;
}
/* .zp-cas:after {
  position: absolute;
  content: '';
  width: 0;
  height: 0;
  right: 16px;
  top: 35px;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 10px solid #fff;
} */
.zp-cas-wrapper {
  position: absolute;
}
::-ms-clear {
  display: none;
}
</style>