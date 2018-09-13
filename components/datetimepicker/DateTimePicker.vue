<!-- Date Time Picker -->
<template>
  <div :class="['zp-dtp', {'zp-picker-disabled': disabled}]" @mousewheel="expand = false" @click="toggleList" @blur="onBlur" @mouseleave="onBlur" ref="tpSelf">
    <input type="text" v-model="model" readonly :placeholder="placeholder" ref="dtpInput" />
    <i class="zp-icon-calendar"></i>
    <i v-if="clearable" :class="['zp-icon-clear', {'zp-hide': !value || disabled}]" @click.stop="clearDate"></i>
    <div :class="['zp-dtp-wrapper', `zp-dtp-${uid}`]" ref="tpWrap" :style="wrapStyle">
      <transition :name="`zp-${position}`">
        <div v-show="expand" class="zp-dtp-items" :style="pickerStyle" @mouseenter="dptVisible = true" @mouseleave="onBlur(false)">
          <zp-calendar
            v-model="curDate"
            @change="handleDateChange"
            type="calendar"
            :format="format"
            :disabledDate="disabledDate"
            ref="dateComp"
            class="zp-dtp-date"
          />
          <div class="zp-dtp-time">
            <zp-time
              v-model="curTime"
              @change="handleTimeChange"
              :format="format"
              type="nonsecond"
              :am-pm-mode="amPmMode"
              :disabledHours="disabledHours"
              :disabledMinutes="disabledMinutes"
              :disabledSeconds="disabledSeconds"
              ref="timeComp"
            />
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
  import ZpTime from '../timepicker/Time.vue'
  import ZpCalendar from '../datepicker/Calendar.vue'
  import MaxZIndex from '../../mixins/zIndex'
  import UID from '../../mixins/uid'
  import { formatDateTime } from '../datepicker/date'

  export default {
    name: 'zp-date-time-picker',
    mixins: [MaxZIndex, UID],
    props: {
      format: {
        default: 'yyyy-MM-dd HH:mm'
      },
      amPmMode: {
        type: String,
        default: '' // '': none; 'a': am/pm; 'A': AM/PM
      },
      width: {
        default: 400
      },
      value: Date,
      placeholder: String,
      clearable: {
        type: Boolean,
        default: true
      },
      disabled: {
        type: Boolean,
        default: false
      },
      disabledDate: {
        type: Function,
        default: () => {}
      },
      disabledHours: {
        type: Function,
        default: () => {
          return []
        }
      },
      disabledMinutes: {
        type: Function,
        default: () => {
          return []
        }
      },
      disabledSeconds: {
        type: Function,
        default: () => {
          return []
        }
      }
    },
    data () {
      return {
        expand: false,
        dptVisible: false,
        position: 'top',
        curDate: null,
        curTime: null,
        model: ''
      }
    },
    components: {
      ZpTime,
      ZpCalendar
    },
    computed: {
      wrapStyle () {
        const style = {}
        style.zIndex = this.zIndex
        return style
      },
      pickerStyle () {
        const style = {}
        const width = parseInt(this.width, 10)
        style.width = `${width}px`
        return style
      }
    },
    mounted () {
      this.init()
      const fragment = document.createDocumentFragment()
      fragment.appendChild(this.$refs.tpWrap)
      document.body.appendChild(fragment)
    },
    beforeDestroy () {
      const tp = document.querySelector(`.zp-dtp-${this.uid}`)
      tp && tp.parentNode.removeChild(tp)
    },
    methods: {
      init () {
        if (this.value) {
          this.curDate = this.curTime = this.value
          this.model = formatDateTime(this.value, this.format)
        }
      },
      handleChange () {
        const date = this.curDate
        if (date) {
          if (this.curTime) {
            date.setHours(this.curTime.getHours(), this.curTime.getMinutes(), this.curTime.getSeconds(), 0)
          } else {
            date.setHours(0, 0, 0, 0)
          }
          this.model = formatDateTime(date, this.format)
          this.$emit('input', date)
          this.$emit('chagne', date)
        }
      },
      handleDateChange (val, date) {
        this.curDate = date
        this.handleChange()
      },
      handleTimeChange (val, date) {
        this.curTime = date
        this.handleChange()
      },
      clearDate () {
        this.model = ''
        this.expand = false
        this.curDate = this.curTime = null
        this.$refs.timeComp.init()
        this.$emit('input', null)
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
          this.$refs.timeComp.init().updateScroller()
        }, 0)
      },
      toggleList () { // 切换当前项
        if (this.disabled) {
          return false
        }
        this.expand = !this.expand
        this.expand && this.$nextTick(() => {
          this.adjustPos(this.$refs.tpWrap)
        })
      },
      onBlur (status) { // 隐藏当前项
        status === false && (this.dptVisible = false)
        setTimeout(() => {
          if (!this.dptVisible) {
            this.expand = false
            this.$emit('dtpInput:blur')
          }
        }, 300)
      }
    }
  }
</script>

<style>
  .zp-dtp {
    display: inline-block;
    position: relative;
  }
  .zp-dtp:after {
    content: '';
    width: 20px;
    height: 20px;
    position: absolute;
    top: 7px;
    left: 10px;
    background: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTBweCIgaGVpZ2h0PSIxMXB4IiB2aWV3Qm94PSIwIDAgMTAgMTEiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUwLjIgKDU1MDQ3KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT7mi5zorr/nrb7liLBpY29u6ZuGPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGRlZnM+PC9kZWZzPgogICAgPGcgaWQ9IlBhZ2UtMiIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IuaLnOiuv+etvuWIsGljb27pm4YiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0zMDIuMDAwMDAwLCAtMjY5LjAwMDAwMCkiIGZpbGw9IiM0REExRkYiIGZpbGwtcnVsZT0ibm9uemVybyI+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0zMTEuNzc0MDU5LDI3OS4wOTUzOTcgQzMxMS41ODY2MTEsMjc5LjI4Mjg0NSAzMTEuMjY1MjcyLDI3OS4zMzY0MDIgMzEwLjk5NzQ5LDI3OS4zMzY0MDIgTDMwMi45OTA3OTUsMjc5LjMzNjQwMiBDMzAyLjcyMzAxMywyNzkuMzM2NDAyIDMwMi4zNzQ4OTUsMjc5LjI4Mjg0NSAzMDIuMTg3NDQ4LDI3OS4wOTUzOTcgQzMwMiwyNzguOTA3OTUgMzAyLDI3OC42NDAxNjcgMzAyLDI3OC4zNzIzODUgTDMwMiwyNzAuODc0NDc3IEMzMDIsMjcwLjYwNjY5NSAzMDIuMDgwMzM1LDI3MC4yMzE3OTkgMzAyLjI2Nzc4MiwyNzAuMDQ0MzUyIEMzMDIuNDU1MjMsMjY5Ljg1NjkwNCAzMDIuNjk2MjM0LDI2OS42OTYyMzQgMzAzLjA3MTEzLDI2OS43MjMwMTMgTDMwNC44Mzg0OTQsMjY5LjcyMzAxMyBMMzA0LjgzODQ5NCwyNjkgTDMwNS41NjE1MDYsMjY5IEwzMDUuNTYxNTA2LDI2OS43MjMwMTMgTDMwOC40MjY3NzgsMjY5LjcyMzAxMyBMMzA4LjQyNjc3OCwyNjkgTDMwOS4xMjMwMTMsMjY5IEwzMDkuMTIzMDEzLDI2OS43MjMwMTMgTDMxMC45MTcxNTUsMjY5LjcyMzAxMyBDMzExLjE4NDkzNywyNjkuNzIzMDEzIDMxMS41NTk4MzMsMjY5Ljg4MzY4MiAzMTEuNzQ3MjgsMjcwLjA3MTEzIEMzMTEuOTM0NzI4LDI3MC4yNTg1NzcgMzExLjk4ODI4NSwyNzAuNjA2Njk1IDMxMS45ODgyODUsMjcwLjg3NDQ3NyBMMzExLjk4ODI4NSwyNzguMzcyMzg1IEMzMTEuOTYxNTA2LDI3OC42MTMzODkgMzExLjk2MTUwNiwyNzguOTA3OTUgMzExLjc3NDA1OSwyNzkuMDk1Mzk3IFogTTMxMS4yNjUyNzIsMjcwLjQxOTI0NyBDMzExLjI2NTI3MiwyNzAuNDE5MjQ3IDMxMC45NDM5MzMsMjcwLjQxOTI0NyAzMTAuNzAyOTI5LDI3MC40MTkyNDcgTDMwOS4xMjMwMTMsMjcwLjQxOTI0NyBMMzA5LjEyMzAxMywyNzEuODM4NDk0IEwzMDguNCwyNzEuODM4NDk0IEwzMDguNCwyNzAuNDE5MjQ3IEwzMDUuNTYxNTA2LDI3MC40MTkyNDcgTDMwNS41NjE1MDYsMjcxLjgzODQ5NCBMMzA0LjgzODQ5NCwyNzEuODM4NDk0IEwzMDQuODM4NDk0LDI3MC40MTkyNDcgTDMwMy4yNTg1NzcsMjcwLjQxOTI0NyBDMzAzLjAxNzU3MywyNzAuNDE5MjQ3IDMwMi42OTYyMzQsMjcwLjQxOTI0NyAzMDIuNjk2MjM0LDI3MC40MTkyNDcgQzMwMi42OTYyMzQsMjcwLjQxOTI0NyAzMDIuNjk2MjM0LDI3MC44MjA5MiAzMDIuNjk2MjM0LDI3MS4wNjE5MjUgTDMwMi42OTYyMzQsMjc4LjI2NTI3MiBDMzAyLjY5NjIzNCwyNzguNTA2Mjc2IDMwMi42OTYyMzQsMjc4LjYxMzM4OSAzMDIuNjk2MjM0LDI3OC42MTMzODkgQzMwMi42OTYyMzQsMjc4LjYxMzM4OSAzMDIuODAzMzQ3LDI3OC42MTMzODkgMzAzLjA0NDM1MiwyNzguNjEzMzg5IEwzMTAuMzgxNTksMjc4LjYxMzM4OSBDMzEwLjYyMjU5NCwyNzguNjEzMzg5IDMxMS4yMzg0OTQsMjc4LjYxMzM4OSAzMTEuMjM4NDk0LDI3OC42MTMzODkgQzMxMS4yMzg0OTQsMjc4LjYxMzM4OSAzMTEuMjM4NDk0LDI3Ny45OTc0OSAzMTEuMjM4NDk0LDI3Ny43ODMyNjQgTDMxMS4yMzg0OTQsMjcxLjA2MTkyNSBDMzExLjI2NTI3MiwyNzAuODIwOTIgMzExLjI2NTI3MiwyNzAuNDE5MjQ3IDMxMS4yNjUyNzIsMjcwLjQxOTI0NyBaIE0zMDMuNDE5MjQ3LDI3Mi45MDk2MjQgTDMxMC41NDIyNTksMjcyLjkwOTYyNCBMMzEwLjU0MjI1OSwyNzMuNjMyNjM2IEwzMDMuNDE5MjQ3LDI3My42MzI2MzYgTDMwMy40MTkyNDcsMjcyLjkwOTYyNCBaIE0zMDQuNjI0MjY4LDI3NC42MjM0MzEgQzMwNC45NDU2MDcsMjc0LjYyMzQzMSAzMDUuMjEzMzg5LDI3NC44OTEyMTMgMzA1LjIxMzM4OSwyNzUuMjEyNTUyIEMzMDUuMjEzMzg5LDI3NS41MzM4OTEgMzA0Ljk0NTYwNywyNzUuODAxNjc0IDMwNC42MjQyNjgsMjc1LjgwMTY3NCBDMzA0LjMwMjkyOSwyNzUuODAxNjc0IDMwNC4wMzUxNDYsMjc1LjUzMzg5MSAzMDQuMDM1MTQ2LDI3NS4yMTI1NTIgQzMwNC4wMzUxNDYsMjc0Ljg2NDQzNSAzMDQuMzAyOTI5LDI3NC42MjM0MzEgMzA0LjYyNDI2OCwyNzQuNjIzNDMxIFogTTMwNC42MjQyNjgsMjc2LjY4NTM1NiBDMzA0Ljk0NTYwNywyNzYuNjg1MzU2IDMwNS4yMTMzODksMjc2Ljk1MzEzOCAzMDUuMjEzMzg5LDI3Ny4yNzQ0NzcgQzMwNS4yMTMzODksMjc3LjU5NTgxNiAzMDQuOTQ1NjA3LDI3Ny44NjM1OTggMzA0LjYyNDI2OCwyNzcuODYzNTk4IEMzMDQuMzAyOTI5LDI3Ny44NjM1OTggMzA0LjAzNTE0NiwyNzcuNTk1ODE2IDMwNC4wMzUxNDYsMjc3LjI3NDQ3NyBDMzA0LjAzNTE0NiwyNzYuOTUzMTM4IDMwNC4zMDI5MjksMjc2LjY4NTM1NiAzMDQuNjI0MjY4LDI3Ni42ODUzNTYgWiBNMzA2Ljk4MDc1MywyNzQuNjIzNDMxIEMzMDcuMzAyMDkyLDI3NC42MjM0MzEgMzA3LjU2OTg3NSwyNzQuODkxMjEzIDMwNy41Njk4NzUsMjc1LjIxMjU1MiBDMzA3LjU2OTg3NSwyNzUuNTMzODkxIDMwNy4zMDIwOTIsMjc1LjgwMTY3NCAzMDYuOTgwNzUzLDI3NS44MDE2NzQgQzMwNi42NTk0MTQsMjc1LjgwMTY3NCAzMDYuMzkxNjMyLDI3NS41MzM4OTEgMzA2LjM5MTYzMiwyNzUuMjEyNTUyIEMzMDYuMzkxNjMyLDI3NC44NjQ0MzUgMzA2LjY1OTQxNCwyNzQuNjIzNDMxIDMwNi45ODA3NTMsMjc0LjYyMzQzMSBaIE0zMDYuOTgwNzUzLDI3Ni42ODUzNTYgQzMwNy4zMDIwOTIsMjc2LjY4NTM1NiAzMDcuNTY5ODc1LDI3Ni45NTMxMzggMzA3LjU2OTg3NSwyNzcuMjc0NDc3IEMzMDcuNTY5ODc1LDI3Ny41OTU4MTYgMzA3LjMwMjA5MiwyNzcuODYzNTk4IDMwNi45ODA3NTMsMjc3Ljg2MzU5OCBDMzA2LjY1OTQxNCwyNzcuODYzNTk4IDMwNi4zOTE2MzIsMjc3LjU5NTgxNiAzMDYuMzkxNjMyLDI3Ny4yNzQ0NzcgQzMwNi4zOTE2MzIsMjc2Ljk1MzEzOCAzMDYuNjU5NDE0LDI3Ni42ODUzNTYgMzA2Ljk4MDc1MywyNzYuNjg1MzU2IFogTTMwOS4zMzcyMzksMjc0LjYyMzQzMSBDMzA5LjY1ODU3NywyNzQuNjIzNDMxIDMwOS45MjYzNiwyNzQuODkxMjEzIDMwOS45MjYzNiwyNzUuMjEyNTUyIEMzMDkuOTI2MzYsMjc1LjUzMzg5MSAzMDkuNjU4NTc3LDI3NS44MDE2NzQgMzA5LjMzNzIzOSwyNzUuODAxNjc0IEMzMDkuMDE1OSwyNzUuODAxNjc0IDMwOC43NDgxMTcsMjc1LjUzMzg5MSAzMDguNzQ4MTE3LDI3NS4yMTI1NTIgQzMwOC43NDgxMTcsMjc0Ljg2NDQzNSAzMDkuMDE1OSwyNzQuNjIzNDMxIDMwOS4zMzcyMzksMjc0LjYyMzQzMSBaIE0zMDkuMzM3MjM5LDI3Ni42ODUzNTYgQzMwOS42NTg1NzcsMjc2LjY4NTM1NiAzMDkuOTI2MzYsMjc2Ljk1MzEzOCAzMDkuOTI2MzYsMjc3LjI3NDQ3NyBDMzA5LjkyNjM2LDI3Ny41OTU4MTYgMzA5LjY1ODU3NywyNzcuODYzNTk4IDMwOS4zMzcyMzksMjc3Ljg2MzU5OCBDMzA5LjAxNTksMjc3Ljg2MzU5OCAzMDguNzQ4MTE3LDI3Ny41OTU4MTYgMzA4Ljc0ODExNywyNzcuMjc0NDc3IEMzMDguNzQ4MTE3LDI3Ni45NTMxMzggMzA5LjAxNTksMjc2LjY4NTM1NiAzMDkuMzM3MjM5LDI3Ni42ODUzNTYgWiIgaWQ9IuaXpeWOhiI+PC9wYXRoPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+') no-repeat;
  }
  .zp-dtp:hover .zp-icon-clear {
    display: inline-block;
  }
  .zp-dtp input {
    display: block;
    position: relative;
    border: 1px solid #ccc;
    border-radius: 3px;
    width: 180px;
    height: 25px;
    text-align: center;
    box-sizing: border-box;
    cursor: pointer;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  .zp-dtp .zp-dtp-range {
    border: 1px solid #ccc;
    border-radius: 4px;
    display: inline-block;
    position: relative;
    padding-left: 20px;
    padding-right: 20px;
    font-size: 12px;
    height: 23px;
  }
  .zp-dtp .zp-dtp-range input {
    display: inline-block;
    position: relative;
    width: 85px;
    height: 23px;
    box-sizing: border-box;
    /* cursor: pointer; */
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    border: none!important;
  }
  .zp-dtp-wrapper {
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
  .zp-dtp-items {
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
  .zp-hide {
    display: none;
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
  .zp-dtp-date,
  .zp-dtp-time {
    display: inline-block;
    width: 79%;
    vertical-align: top;
  }
  .zp-dtp-time {
    position: absolute;
    top: 50%;
    -moz-transform: translateY(-50%);
    -webkit-transform: translateY(-50%);
    -o-transform: translateY(-50%);
    transform: translateY(-50%);
    width: 20%;
  }
  .zp-dtp-time .zp-time-nonsec {
    height: 230px;
  }
  .zp-dtp-time .zp-time-list:before,
  .zp-dtp-time .zp-time-list:after {
    content: '';
    display: block;
    width: 100%;
    height: 120px;
  }
  .zp-dtp-items {
    background: rgba(243, 243, 243, .9);
  }
  .zp-dtp-date {
    background: #fff;
  }
  .zp-dtp-time .zp-time-item {
    height: 40px;
    line-height: 40px;
  }
  .zp-dtp-time .zp-time:before {
    content: '';
    height: 40px;
  }
</style>