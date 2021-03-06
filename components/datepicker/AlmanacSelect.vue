<!-- Almanac Select -->
<template>
  <div :class="['zp-almanac-select', {'zp-picker-disabled': disabled}]" @mousewheel="expand = false" @click="toggleList" @blur="onBlur" @mouseleave="onBlur" ref="dpSelf">
    <input type="text" v-model="startDate" ref="dpStart" readonly :placeholder="startPlaceholder"/>
    <span class="zp-range-separator">{{ rangeSeparator }}</span>
    <input type="text" v-model="endDate" ref="dpEnd" readonly :placeholder="endPlaceholder"/>
    <i class="zp-icon-calendar"></i>
    <i v-if="clearable" :class="['zp-icon-clear', {'zp-hide': !startDate || !endDate || disabled}]" @click.stop="clearDate"></i>
    <div :class="['zp-date-wrapper', `zp-date-${uid}`]" ref="dpWrap" :style="wrapStyle" @mouseenter="dpVisible = true">
      <transition :name="`zp-${position}`">
        <div v-show="expand" ref="dpItems" class="zp-date-items" @mouseleave="onBlur(false)">
          <zp-almanac v-model="value" @change="handleDateChange" :format="format" :disabledDate="disabledDate" :selectedDate="selectedDate" :id="id" />
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
  import ZpAlmanac from './Almanac.vue'
  import MaxZIndex from '../../mixins/zIndex'
  import UID from '../../mixins/uid'
  import { formatDate } from './date'

  export default {
    name: 'zp-almanac-select',
    mixins: [MaxZIndex, UID],
    props: {
      format: {
        default: 'yyyy-MM-dd'
      },
      width: {
        default: 600
      },
      value: {
        type: Array,
        default: () => []
      },
      disabledDate: {
        type: Function,
        default: () => {}
      },
      selectedDate: {
        type: Object,
        default: () => ({})
      },
      startPlaceholder: String,
      endPlaceholder: String,
      rangeSeparator: {
        type: String,
        default: '-'
      },
      bus: Object,
      id: String,
      clearable: {
        type: Boolean,
        default: true
      },
      disabled: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        expand: false,
        dpVisible: false,
        position: 'top',
        startDate: '',
        endDate: ''
      }
    },
    components: {
      ZpAlmanac
    },
    computed: {
      wrapStyle () {
        const style = {}
        style.zIndex = this.zIndex
        style.width = `${parseInt(this.width, 10)}px`
        return style
      }
    },
    mounted () {
      if (this.value[0]) {
        this.startDate = formatDate(this.value[0], this.format)
      }
      if (this.value.length > 1 && this.value[1]) {
        this.endDate = formatDate(this.value[1], this.format)
      }
      const fragment = document.createDocumentFragment()
      fragment.appendChild(this.$refs.dpWrap)
      document.body.appendChild(fragment)
    },
    beforeDestroy () {
      this.removeAlmanac()
    },
    methods: {
      removeAlmanac (force = false) { // 移除组件
        const dp = document.querySelector(`.zp-date-${this.uid}`)
        dp && dp.parentNode.removeChild(dp)
        if (force) {
          const self = this.$el
          self && self.parentNode.removeChild(self)
        }
      },
      clearDate () { // 清除已选
        const blank = ['', '']
        this.handleDateChange(blank, blank)
      },
      handleDateChange (val, range) { // 选择日期变化
        this.startDate = val[0]
        this.endDate = val[1]
        this.expand = false
        this.$emit('change', range)
        if (this.bus) {
          this.bus.$emit('change', range, this)
        } else {
          this.$emit('input', range)
        }
      },
      adjustPos (item) { // 纠正位置
        const dpRect = this.$el.getBoundingClientRect()
        const itemRect = item.getBoundingClientRect()
        const itemMaxHeight = itemRect.height + dpRect.top + dpRect.height
        if (itemMaxHeight >= window.innerHeight) {
          item.style.top = `${window.scrollY + dpRect.top - itemRect.height}px`
          this.position = 'bottom'
        } else {
          item.style.top = `${dpRect.top + dpRect.height + window.scrollY}px`
          this.position = 'top'
        }
        item.style.left = `${dpRect.left + window.scrollX}px`
        this.expand = false
        setTimeout(() => {
          this.expand = true
        }, 0)
      },
      toggleList () { // 切换当前项
        if (this.disabled) {
          return false
        }
        this.expand = !this.expand
        this.expand && this.$nextTick(() => {
          this.adjustPos(this.$refs.dpWrap)
        })
      },
      onBlur (status) { // 隐藏当前项
        status === false && (this.dpVisible = false)
        setTimeout(() => {
          if (!this.dpVisible) {
            this.expand = false
            this.$emit('dpSelf:blur')
          }
        }, 300)
      }
    }
  }
</script>

<style>
  .zp-almanac-select {
    border: 1px solid #ccc;
    border-radius: 4px;
    display: inline-block;
    position: relative;
    padding-left: 20px;
    padding-right: 20px;
    font-size: 12px;
  }
  .zp-almanac-select:hover .zp-icon-clear {
    display: inline-block;
  }
  .zp-hide {
    display: none!important;
  }
  .zp-almanac-select:after {
    content: '';
    width: 20px;
    height: 20px;
    position: absolute;
    top: 7px;
    left: 10px;
    background: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTBweCIgaGVpZ2h0PSIxMXB4IiB2aWV3Qm94PSIwIDAgMTAgMTEiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUwLjIgKDU1MDQ3KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT7mi5zorr/nrb7liLBpY29u6ZuGPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGRlZnM+PC9kZWZzPgogICAgPGcgaWQ9IlBhZ2UtMiIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IuaLnOiuv+etvuWIsGljb27pm4YiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0zMDIuMDAwMDAwLCAtMjY5LjAwMDAwMCkiIGZpbGw9IiM0REExRkYiIGZpbGwtcnVsZT0ibm9uemVybyI+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0zMTEuNzc0MDU5LDI3OS4wOTUzOTcgQzMxMS41ODY2MTEsMjc5LjI4Mjg0NSAzMTEuMjY1MjcyLDI3OS4zMzY0MDIgMzEwLjk5NzQ5LDI3OS4zMzY0MDIgTDMwMi45OTA3OTUsMjc5LjMzNjQwMiBDMzAyLjcyMzAxMywyNzkuMzM2NDAyIDMwMi4zNzQ4OTUsMjc5LjI4Mjg0NSAzMDIuMTg3NDQ4LDI3OS4wOTUzOTcgQzMwMiwyNzguOTA3OTUgMzAyLDI3OC42NDAxNjcgMzAyLDI3OC4zNzIzODUgTDMwMiwyNzAuODc0NDc3IEMzMDIsMjcwLjYwNjY5NSAzMDIuMDgwMzM1LDI3MC4yMzE3OTkgMzAyLjI2Nzc4MiwyNzAuMDQ0MzUyIEMzMDIuNDU1MjMsMjY5Ljg1NjkwNCAzMDIuNjk2MjM0LDI2OS42OTYyMzQgMzAzLjA3MTEzLDI2OS43MjMwMTMgTDMwNC44Mzg0OTQsMjY5LjcyMzAxMyBMMzA0LjgzODQ5NCwyNjkgTDMwNS41NjE1MDYsMjY5IEwzMDUuNTYxNTA2LDI2OS43MjMwMTMgTDMwOC40MjY3NzgsMjY5LjcyMzAxMyBMMzA4LjQyNjc3OCwyNjkgTDMwOS4xMjMwMTMsMjY5IEwzMDkuMTIzMDEzLDI2OS43MjMwMTMgTDMxMC45MTcxNTUsMjY5LjcyMzAxMyBDMzExLjE4NDkzNywyNjkuNzIzMDEzIDMxMS41NTk4MzMsMjY5Ljg4MzY4MiAzMTEuNzQ3MjgsMjcwLjA3MTEzIEMzMTEuOTM0NzI4LDI3MC4yNTg1NzcgMzExLjk4ODI4NSwyNzAuNjA2Njk1IDMxMS45ODgyODUsMjcwLjg3NDQ3NyBMMzExLjk4ODI4NSwyNzguMzcyMzg1IEMzMTEuOTYxNTA2LDI3OC42MTMzODkgMzExLjk2MTUwNiwyNzguOTA3OTUgMzExLjc3NDA1OSwyNzkuMDk1Mzk3IFogTTMxMS4yNjUyNzIsMjcwLjQxOTI0NyBDMzExLjI2NTI3MiwyNzAuNDE5MjQ3IDMxMC45NDM5MzMsMjcwLjQxOTI0NyAzMTAuNzAyOTI5LDI3MC40MTkyNDcgTDMwOS4xMjMwMTMsMjcwLjQxOTI0NyBMMzA5LjEyMzAxMywyNzEuODM4NDk0IEwzMDguNCwyNzEuODM4NDk0IEwzMDguNCwyNzAuNDE5MjQ3IEwzMDUuNTYxNTA2LDI3MC40MTkyNDcgTDMwNS41NjE1MDYsMjcxLjgzODQ5NCBMMzA0LjgzODQ5NCwyNzEuODM4NDk0IEwzMDQuODM4NDk0LDI3MC40MTkyNDcgTDMwMy4yNTg1NzcsMjcwLjQxOTI0NyBDMzAzLjAxNzU3MywyNzAuNDE5MjQ3IDMwMi42OTYyMzQsMjcwLjQxOTI0NyAzMDIuNjk2MjM0LDI3MC40MTkyNDcgQzMwMi42OTYyMzQsMjcwLjQxOTI0NyAzMDIuNjk2MjM0LDI3MC44MjA5MiAzMDIuNjk2MjM0LDI3MS4wNjE5MjUgTDMwMi42OTYyMzQsMjc4LjI2NTI3MiBDMzAyLjY5NjIzNCwyNzguNTA2Mjc2IDMwMi42OTYyMzQsMjc4LjYxMzM4OSAzMDIuNjk2MjM0LDI3OC42MTMzODkgQzMwMi42OTYyMzQsMjc4LjYxMzM4OSAzMDIuODAzMzQ3LDI3OC42MTMzODkgMzAzLjA0NDM1MiwyNzguNjEzMzg5IEwzMTAuMzgxNTksMjc4LjYxMzM4OSBDMzEwLjYyMjU5NCwyNzguNjEzMzg5IDMxMS4yMzg0OTQsMjc4LjYxMzM4OSAzMTEuMjM4NDk0LDI3OC42MTMzODkgQzMxMS4yMzg0OTQsMjc4LjYxMzM4OSAzMTEuMjM4NDk0LDI3Ny45OTc0OSAzMTEuMjM4NDk0LDI3Ny43ODMyNjQgTDMxMS4yMzg0OTQsMjcxLjA2MTkyNSBDMzExLjI2NTI3MiwyNzAuODIwOTIgMzExLjI2NTI3MiwyNzAuNDE5MjQ3IDMxMS4yNjUyNzIsMjcwLjQxOTI0NyBaIE0zMDMuNDE5MjQ3LDI3Mi45MDk2MjQgTDMxMC41NDIyNTksMjcyLjkwOTYyNCBMMzEwLjU0MjI1OSwyNzMuNjMyNjM2IEwzMDMuNDE5MjQ3LDI3My42MzI2MzYgTDMwMy40MTkyNDcsMjcyLjkwOTYyNCBaIE0zMDQuNjI0MjY4LDI3NC42MjM0MzEgQzMwNC45NDU2MDcsMjc0LjYyMzQzMSAzMDUuMjEzMzg5LDI3NC44OTEyMTMgMzA1LjIxMzM4OSwyNzUuMjEyNTUyIEMzMDUuMjEzMzg5LDI3NS41MzM4OTEgMzA0Ljk0NTYwNywyNzUuODAxNjc0IDMwNC42MjQyNjgsMjc1LjgwMTY3NCBDMzA0LjMwMjkyOSwyNzUuODAxNjc0IDMwNC4wMzUxNDYsMjc1LjUzMzg5MSAzMDQuMDM1MTQ2LDI3NS4yMTI1NTIgQzMwNC4wMzUxNDYsMjc0Ljg2NDQzNSAzMDQuMzAyOTI5LDI3NC42MjM0MzEgMzA0LjYyNDI2OCwyNzQuNjIzNDMxIFogTTMwNC42MjQyNjgsMjc2LjY4NTM1NiBDMzA0Ljk0NTYwNywyNzYuNjg1MzU2IDMwNS4yMTMzODksMjc2Ljk1MzEzOCAzMDUuMjEzMzg5LDI3Ny4yNzQ0NzcgQzMwNS4yMTMzODksMjc3LjU5NTgxNiAzMDQuOTQ1NjA3LDI3Ny44NjM1OTggMzA0LjYyNDI2OCwyNzcuODYzNTk4IEMzMDQuMzAyOTI5LDI3Ny44NjM1OTggMzA0LjAzNTE0NiwyNzcuNTk1ODE2IDMwNC4wMzUxNDYsMjc3LjI3NDQ3NyBDMzA0LjAzNTE0NiwyNzYuOTUzMTM4IDMwNC4zMDI5MjksMjc2LjY4NTM1NiAzMDQuNjI0MjY4LDI3Ni42ODUzNTYgWiBNMzA2Ljk4MDc1MywyNzQuNjIzNDMxIEMzMDcuMzAyMDkyLDI3NC42MjM0MzEgMzA3LjU2OTg3NSwyNzQuODkxMjEzIDMwNy41Njk4NzUsMjc1LjIxMjU1MiBDMzA3LjU2OTg3NSwyNzUuNTMzODkxIDMwNy4zMDIwOTIsMjc1LjgwMTY3NCAzMDYuOTgwNzUzLDI3NS44MDE2NzQgQzMwNi42NTk0MTQsMjc1LjgwMTY3NCAzMDYuMzkxNjMyLDI3NS41MzM4OTEgMzA2LjM5MTYzMiwyNzUuMjEyNTUyIEMzMDYuMzkxNjMyLDI3NC44NjQ0MzUgMzA2LjY1OTQxNCwyNzQuNjIzNDMxIDMwNi45ODA3NTMsMjc0LjYyMzQzMSBaIE0zMDYuOTgwNzUzLDI3Ni42ODUzNTYgQzMwNy4zMDIwOTIsMjc2LjY4NTM1NiAzMDcuNTY5ODc1LDI3Ni45NTMxMzggMzA3LjU2OTg3NSwyNzcuMjc0NDc3IEMzMDcuNTY5ODc1LDI3Ny41OTU4MTYgMzA3LjMwMjA5MiwyNzcuODYzNTk4IDMwNi45ODA3NTMsMjc3Ljg2MzU5OCBDMzA2LjY1OTQxNCwyNzcuODYzNTk4IDMwNi4zOTE2MzIsMjc3LjU5NTgxNiAzMDYuMzkxNjMyLDI3Ny4yNzQ0NzcgQzMwNi4zOTE2MzIsMjc2Ljk1MzEzOCAzMDYuNjU5NDE0LDI3Ni42ODUzNTYgMzA2Ljk4MDc1MywyNzYuNjg1MzU2IFogTTMwOS4zMzcyMzksMjc0LjYyMzQzMSBDMzA5LjY1ODU3NywyNzQuNjIzNDMxIDMwOS45MjYzNiwyNzQuODkxMjEzIDMwOS45MjYzNiwyNzUuMjEyNTUyIEMzMDkuOTI2MzYsMjc1LjUzMzg5MSAzMDkuNjU4NTc3LDI3NS44MDE2NzQgMzA5LjMzNzIzOSwyNzUuODAxNjc0IEMzMDkuMDE1OSwyNzUuODAxNjc0IDMwOC43NDgxMTcsMjc1LjUzMzg5MSAzMDguNzQ4MTE3LDI3NS4yMTI1NTIgQzMwOC43NDgxMTcsMjc0Ljg2NDQzNSAzMDkuMDE1OSwyNzQuNjIzNDMxIDMwOS4zMzcyMzksMjc0LjYyMzQzMSBaIE0zMDkuMzM3MjM5LDI3Ni42ODUzNTYgQzMwOS42NTg1NzcsMjc2LjY4NTM1NiAzMDkuOTI2MzYsMjc2Ljk1MzEzOCAzMDkuOTI2MzYsMjc3LjI3NDQ3NyBDMzA5LjkyNjM2LDI3Ny41OTU4MTYgMzA5LjY1ODU3NywyNzcuODYzNTk4IDMwOS4zMzcyMzksMjc3Ljg2MzU5OCBDMzA5LjAxNTksMjc3Ljg2MzU5OCAzMDguNzQ4MTE3LDI3Ny41OTU4MTYgMzA4Ljc0ODExNywyNzcuMjc0NDc3IEMzMDguNzQ4MTE3LDI3Ni45NTMxMzggMzA5LjAxNTksMjc2LjY4NTM1NiAzMDkuMzM3MjM5LDI3Ni42ODUzNTYgWiIgaWQ9IuaXpeWOhiI+PC9wYXRoPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+') no-repeat;
  }
  .zp-almanac-select input {
    display: inline-block;
    position: relative;
    width: 85px;
    height: 25px;
    /* text-indent: 10px; */
    box-sizing: border-box;
    /* cursor: pointer; */
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    text-align: center;
    border: none!important;
  }
  .zp-date-wrapper {
    position: absolute;
  }
  ::-ms-clear {
    display: none;
  }
  .zp-top-enter-active,
  .zp-top-leave-active {
    opacity: 1;
    -moz-transform: scaleY(1);
    -webkit-transform: scaleY(1);
    -o-transform: scaleY(1);
    transform: scaleY(1);
    -moz-transition: all .3s cubic-bezier(.23, 1, .32, 1);
    -webkit-transition: all .3s cubic-bezier(.23, 1, .32, 1);
    -o-transition: all .3s cubic-bezier(.23, 1, .32, 1);
    transition: all .3s cubic-bezier(.23, 1, .32, 1);
    -moz-transform-origin: center top;
    -o-transform-origin: center top;
    -webkit-transform-origin: center top;
    transform-origin: center top;
  }
  .zp-top-enter,
  .zp-top-leave-active {
    opacity: 0;
    -moz-transform: scaleY(0);
    -webkit-transform: scaleY(0);
    -o-transform: scaleY(0);
    transform: scaleY(0);
  }
  .zp-bottom-enter-active,
  .zp-bottom-leave-active {
    opacity: 1;
    -moz-transform: scaleY(1);
    -webkit-transform: scaleY(1);
    -o-transform: scaleY(1);
    transform: scaleY(1);
    -moz-transition: all .3s cubic-bezier(.23, 1, .32, 1);
    -webkit-transition: all .3s cubic-bezier(.23, 1, .32, 1);
    -o-transition: all .3s cubic-bezier(.23, 1, .32, 1);
    transition: all .3s cubic-bezier(.23, 1, .32, 1);
    -moz-transform-origin: center bottom;
    -o-transform-origin: center bottom;
    -webkit-transform-origin: center bottom;
    transform-origin: center bottom;
  }
  .zp-bottom-enter,
  .zp-bottom-leave-active {
    opacity: 0;
    -moz-transform: scaleY(0);
    -webkit-transform: scaleY(0);
    -o-transform: scaleY(0);
    transform: scaleY(0);
  }
  .zp-date-items {
    display: inline-block;
    vertical-align: top;
    min-height: 22px;
    background: #fff;
    overflow: auto;
    overflow-x: hidden;
    min-width: 158px;
    border: 1px solid #e6e8ea;
    border-top: none;
    box-shadow: 0 2px 6px #ccc;
    border-radius: 2px;
    border: 1px solid #d1dbe5;
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  .zp-icon-clear {
    cursor: pointer;
    display: none;
    position: absolute;
    top: 6px;
    right: 8px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #d2d2d2;
  }
  .zp-icon-clear:before,
  .zp-icon-clear:after {
    content: '';
    position: absolute;
    height: 1px;
    width: 8px;
    top: 50%;
    right: 2px;
    margin-top: -1px;
    background: #fff;
  }
  .zp-icon-clear:before {
    -moz-transform: rotate(45deg);
    -webkit-transform: rotate(45deg);
    /* -ms-transform: rotate(45deg); */
    -o-transform: rotate(45deg);
    transform: rotate(45deg);
  }
  .zp-icon-clear:after {
    -moz-transform: rotate(-45deg);
    -webkit-transform: rotate(-45deg);
    /* -ms-transform: rotate(-45deg); */
    -o-transform: rotate(-45deg);
    transform: rotate(-45deg);
  }
  .zp-picker-disabled > *,
  .zp-picker-disabled [type="text"] {
    cursor: not-allowed!important;
    color: #ccc!important;
  }
  .zp-picker-disabled:after {
    filter: gray;
    -webkit-filter: grayscale(1);
    -webkit-filter: grayscale(100%);
    filter: grayscale(100%);
  }
</style>