<!-- Dropdownlist -->
<template>
  <div class="zp-ddl" ref="ddlSelf" @mousewheel="expand = false">
    <slot>
      <input type="text" v-model="model" :readonly="!ddlOption.editable" :style="{width: `${ddlOption.width}px`}" @click="toggleList" @blur="onBlur" @mouseleave="onBlur" @keyup="getRes" ref="ddlInput"/>
      <i class="zp-ddl-arrow"></i>
    </slot>
    <div :class="['zp-ddl-wrapper', `zp-ddl-${uid}`, {'zp-ddl-hide': !expand}]" ref="ddlWrap" :style="{'z-index': ddlOption.zIndex || zIndex}">
      <ul ref="ddlItems" data-level="0" :class="['zp-ddl-items', {'zp-ddl-ref': slot}, {'zp-ddl-non-ref': !slot}]" :style="{width: `${ddlOption.width}px`}" @mouseenter="ddlVisible = true;ddlSubVisible = true" @mouseleave="onBlur(false)">
        <li v-for="item in ddlOption.data" @click="setSelected(item)" @mouseenter="beforeCheckSub($event, item)" :class="[{'zp-ddl-selected': getItem(item) === model && !slot}, 'zp-ddl-item']">
          <a :class="{'zp-ddl-sub-arrow': item[subKey]}"><i v-if="item.itemClass" :class="item.itemClass"/>{{ getItem(item) }}</a>
        </li>
    </ul>
    </div>
  </div>
</template>

<script>
  import MaxZIndex from '../../mixins/zIndex'

  export default {
    name: 'zp-dropdownlist',
    mixins: [MaxZIndex],
    props: ['ddlOption'],
    data () {
      return {
        landing: false,
        expand: false,
        oriData: [],
        slot: (() => {
          return this.$slots.default ? 1 : 0
        })(),
        getItem (item) {
          return item.label || item
        },
        ddlVisible: false,
        ddlSubVisible: true,
        subKey: this.ddlOption.hasChild || 'children',
        model: ''
      }
    },
    created () {
      if (this.ddlOption.url) {
        this.ddlOption.data = []
        this.getAsyncData(this.ddlOption.url).then(data => {
          this.ddlOption.data = this.getChainVal(data, this.ddlOption.dotNotation || null)
        }).catch(e => {
          this.ddlOption.onFail && this.ddlOption.onFail(e)
        })
      }
    },
    mounted () {
      this.setDefault()
      if (this.slot) {
        this.$slots.default[0].elm.addEventListener('click', this.toggleList)
        this.$refs.ddlSelf.addEventListener('mouseleave', () => {
          this.ddlSubVisible = false
          this.onBlur()
          setTimeout(() => {
            this.hideSub()
          }, 300)
        })
      }
    },
    beforeUpdate () {
      if (!this.landing && this.ddlOption.data.length) {
        this.landing = true
        const fragment = document.createDocumentFragment()
        fragment.appendChild(this.$refs.ddlWrap)
        document.body.appendChild(fragment)
        this.oriData = this.cloneData(this.ddlOption.data)
        this.setDefault()
      }
    },
    beforeDestroy () {
      const ddl = document.querySelector(`.zp-ddl-${this.uid}`)
      ddl && ddl.parentNode.removeChild(ddl)
    },
    computed: {
      uid () {
        // return Math.round(Math.random() * (0x999999 - 0x100000) + 0x100000)
        return Math.random().toString(36).substr(2, 9)
      },
      seed () {
        return `zp-ddl-sub-${this.uid}`
      }
    },
    methods: {
      hidePrevSub (item) { // 隐藏之前显示子项
        const level = parseInt(item.getAttribute('data-level'), 10)
        const ddlSubItems = [...document.querySelectorAll(`.${this.seed}:not([style*="display:none"]):not([style*="display: none"]`)]
        for (let subItem of ddlSubItems) {
          const itemLevel = parseInt(subItem.getAttribute('data-level'), 10)
          if (itemLevel >= level && subItem !== item) {
            subItem.style.display = 'none'
          }
        }
      },
      beforeCheckSub (...args) { // 预处理第一级
        this.hidePrevSub(this.$refs.ddlItems)
        this.checkSub(...args)
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
        // if (this.slot && data && data[this.subKey] && data[this.subKey].length) {
        if (data && data[this.subKey] && data[this.subKey].length) {
          const childId = self.getAttribute('data-child')
          const selfPos = self.getBoundingClientRect()
          const ddlSelf = this.$refs.ddlSelf
          const zIndex = this.ddlOption.zIndex ? parseInt(this.ddlOption.zIndex, 10) + 1 : 1000
          const curIndex = this.getElementIndex(self) // 当前索引
          const ddlWrap = this.$refs.ddlWrap
          let ddlSub
          if (childId) {
            ddlSub = document.querySelector(`#${childId}`)
            ;[...ddlSub.querySelectorAll('.zp-ddl-item')].forEach(item => {
              const value = item.getAttribute('data-value')
              if (`${value}` === `${selectedVal}`) {
                item.classList.add('zp-ddl-selected')
              } else {
                item.classList.remove('zp-ddl-selected')
              }
            })
            ddlSub.style.display = 'inline-block'
          } else {
            const id = `child-${new Date().getTime()}`
            let ddlString = `<ul id="${id}" data-level="${level}" class="zp-ddl-sub ${this.seed}" style="top: ${selfPos.top + window.scrollY}px;left: ${selfPos.left + selfPos.width + window.scrollX}px;z-index: ${zIndex};">`
            for (let item of data[this.subKey]) {
              const hasSubClass = item[this.subKey] ? ' zp-ddl-sub-arrow' : ''
              const hasSelectedClass = `${selectedVal}` === `${item.value}` ? ' zp-ddl-selected' : ''
              ddlString += `<li class="zp-ddl-item${hasSubClass}${hasSelectedClass}" data-value="${item.value}"><a>${item.label}</a></li>`
            }
            this.$refs.ddlWrap.insertAdjacentHTML('beforeend', ddlString)
            const ddlSub = document.querySelector(`#${id}`)
            const items = [...document.querySelectorAll(`#${id} li`)]
            level += 1
            ddlSub.addEventListener('mouseenter', () => {
              this.ddlVisible = true
              this.ddlSubVisible = true
              this.hidePrevSub(ddlSub)
            })
            items.forEach((item, index) => {
              item.addEventListener('mouseenter', evt => {
                this.hidePrevSub(ddlSub)
                this.checkSub(evt, data[this.subKey][index], level)
              })
              item.addEventListener('click', evt => {
                this.setSelected(data[this.subKey][index])
              })
            })
            ddlSub.addEventListener('mouseleave', evt => {
              this.onBlur(false)
              this.ddlSubVisible = false
              setTimeout(() => {
                this.hideSub()
              }, 300)
            })
            self.setAttribute('data-child', id)
          }
        }
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
      getProp (data, key) { // 验证属性
        return data.hasOwnProperty(key) ? data[key] : data
      },
      async getAsyncData (url) { // 获取异步数据
        const res = await fetch(url)
        const data = await res.json()
        return data
      },
      setDefault () { // 设置初始项（不支持无限子菜单）
        if (this.ddlOption.hasOwnProperty('setDefault') && this.ddlOption.data.length) {
          for (let item of this.ddlOption.data) {
            if (item.hasOwnProperty('value') && item.value === this.ddlOption.setDefault) {
              return this.model = item.label
            } else if (item === this.ddlOption.setDefault) {
              return this.model = item
            }
          }
        }
      },
      hideSub () { // 隐藏子项
        if (this.ddlSubVisible) {
          return false
        }
        const ddlSubItems = [...document.querySelectorAll(`.${this.seed}`)]
        for (let item of ddlSubItems) {
          item.style.display = 'none'
        }
      },
      setSelected (data) { // 获取选中项
        if (this.slot && data && data[this.subKey] && data[this.subKey].length) {
          return false
        }
        const curVal = this.getProp(data, 'value')
        this.model = this.getProp(data, 'label')
        this.ddlSubVisible = false
        this.hideSub()
        this.toggleList()
        this.ddlOption.onSelect && this.ddlOption.onSelect.call(this, curVal)
        this.$emit('ddl-action', curVal)
      },
      adjustPos (item) { // 纠正位置
        const modal = document.querySelector(this.ddlOption.modal)
        const ddlRect = this.$refs.ddlSelf.getBoundingClientRect()
        const itemRect = item.getBoundingClientRect()
        if (modal) {
          const rect = modal.getBoundingClientRect()
          const modalMaxHeight = rect.height + rect.top
          const itemMaxHeight = itemRect.height + ddlRect.top
          if (itemMaxHeight >= modalMaxHeight) {
            item.style.top = `-${itemRect.height}px`
          }
        } else {
          const itemMaxHeight = itemRect.height + ddlRect.top + ddlRect.height
          if (itemMaxHeight >= window.innerHeight) {
            item.style.top = `${window.scrollY + ddlRect.top - itemRect.height}px`
          } else {
            item.style.top = `${ddlRect.top + ddlRect.height + window.scrollY}px`
          }
          item.style.left = `${ddlRect.left + window.scrollX}px`
        }
      },
      toggleList () { // 切换当前项
        if (this.ddlOption.data.length) {
          this.expand = !this.expand
        }
        this.expand && this.$nextTick(() => {
          this.adjustPos(this.$refs.ddlWrap)
        })
      },
      onBlur (status) { // 隐藏当前项
        status === false && (this.ddlVisible = false)
        setTimeout(() => {
          if (!this.ddlVisible) {
            this.expand = false
            this.$emit('ddlInput:blur')
          }
        }, 300)
      },
      getRes () { // 得到查询项
        let tmpData = {}
        if (!this.ddlOption.editable) {
          return
        }
        this.ddlOption.data = this.cloneData(this.oriData)
        if (this.model.length && this.ddlOption.data.length) {
          tmpData = this.ddlOption.data.filter((val) => {
            return this.getProp(val, 'label').includes(this.model)
          })
          this.ddlOption.data = tmpData
          if (tmpData.length) {
            this.setSelected(tmpData[0])
          }
        }
      }
    }
  }
</script>

<style>
.zp-ddl {
  display: inline-block;
  position: relative;
}
.zp-ddl input {
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
/* .zp-ddl input:focus {
  outline: 0;
  border-color: #20a0ff;
}
.zp-ddl input:hover {
  border-color: #8391a5;
} */
.zp-ddl-sub-arrow:after {
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
.zp-ddl-selected {
  background: #54a5ff!important;
}
.zp-ddl-selected:after {
  border-left-color: #fff;
}
.zp-ddl-selected a {
  color: #fff!important;
}
.zp-ddl .zp-ddl-arrow {
  background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAOCAYAAAASVl2WAAAAAXNSR0IArs4c6QAAAK1JREFUGBljYCAFGNl4poEwsh5GGMfM3sPyz1+GAyA+CzODw6mDO46D2GAFxrbukkDm2f///wNpIIuR8TkDw3/js4d3PmcMDQ1lu/vi8wGG//8tQZJwwMh4XFmC14GZQ0huGlB1AFwCwZB9/+WXOIJLMxajkY3HTKAbUPyOsI1xFpOyJG8u0F9gPyMkgCyQL4ByBMOBCaQLFCDMTAzBQG2/QBjEBomhmAjiYIsLACjQPAdNibz2AAAAAElFTkSuQmCC') no-repeat;
  position: absolute;
  pointer-events: none;
  width: 16px;
  height: 16px;
  right: 0;
  top: 5px;
}
.zp-ddl-items,
.zp-ddl-sub {
  display: inline-block;
  vertical-align: top;
  min-height: 22px;
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
.zp-ddl-items:first-child,
.zp-ddl-sub:first-child {
  margin-left: 0;
}
.zp-ddl-ref,
.zp-ddl-sub {
  overflow: hidden!important;
}
.zp-ddl-non-ref {
  max-height: 208px;
}
.zp-ddl-items li,
.zp-ddl-sub li {
  line-height: 25px;
  height: 25px;
  text-indent: 5px;
  position: relative;
}
.zp-ddl-items li:hover,
.zp-ddl-sub li:hover {
  cursor: pointer;
  background: #e6e8ea;
}
.zp-ddl-items li:hover a,
.zp-ddl-sub li:hover a {
  color: #323c47;
}
.zp-ddl-items li,
.zp-ddl-sub li {
  border-bottom: 1px solid #eceef3;
}
.zp-ddl-items li:last-child,
.zp-ddl-sub li:last-child {
  border-bottom: none;
}
.zp-ddl-sub a,
.zp-ddl a,
.zp-ddl-item a {
  color: #323c47;
  font-size: 14px;
}
.zp-ddl-hide {
  display: none;
}
/* .zp-ddl:after {
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
.zp-ddl-wrapper {
  position: absolute;
}
::-ms-clear {
  display: none;
}
</style>