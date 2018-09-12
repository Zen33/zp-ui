<!-- Time -->
<template>
  <div class="zp-time" ref="picker">
    <zp-scroller noresize @mouseenter.native="selectRange('hour')" @mousemove.native="adjustItem('hour')" @on-scroll="handleScroll('hour')" :class="['zp-time-container', {'zp-time-nonsec': type !== 'time'}]" ref="hour">
      <ul class="zp-time-list">
        <li v-for="hour in hourRanges" :key="hour" :class="['zp-time-item', {'zp-time-selected': curTimeProps.hour === hour}]" @click="handleClick('hour', hour)">
          {{ (`0${amPmMode ? (hour % 12 || 12) : hour}`).slice(-2)}}{{ amPm(hour) }}
        </li>
      </ul>
    </zp-scroller>
    <zp-scroller noresize @mouseenter.native="selectRange('minute')" @mousemove.native="adjustItem('minute')" @on-scroll="handleScroll('minute')" :class="['zp-time-container', {'zp-time-nonsec': type !== 'time'}]" ref="minute">
      <ul class="zp-time-list">
        <li v-for="min in minuteRanges" :key="min" :class="['zp-time-item', {'zp-time-selected': curTimeProps.minute === min}]" @click="handleClick('minute', min)">
          {{ `0${min}`.slice(-2) }}
        </li>
      </ul>
    </zp-scroller>
    <zp-scroller v-show="type === 'time'" noresize @mouseenter.native="selectRange('second')" @mousemove.native="adjustItem('second')" @on-scroll="handleScroll('second')" class="zp-time-container" ref="second">
      <ul class="zp-time-list">
        <li v-for="sec in secondRanges" :key="sec" :class="['zp-time-item', {'zp-time-selected': curTimeProps.second === sec}]" @click="handleClick('second', sec)">
          {{ `0${sec}`.slice(-2) }}
        </li>
      </ul>
    </zp-scroller>
  </div>
</template>

<script>
  import ZpScroller from '../scroller'
  import { domStyle } from '../../utils/dom'
  import { getRangeHours, formatDate } from './time'

  export default {
    name: 'zp-time',
    props: {
      value: Date,
      amPmMode: {
        type: String,
        default: '' // '': none; 'a': am/pm; 'A': AM/PM
      },
      format: {
        default: 'HH:mm:ss'
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
      },
      type: String
    },
    data () {
      return {
        curTime: null,
        offset: 0,
        lineHeight: 0
      }
    },
    components: {
      ZpScroller
    },
    computed: {
      maxHour () {
        return this.hourRanges.length - 1
      },
      maxMinute () {
        return this.minuteRanges.length - 1
      },
      maxSecond () {
        return this.secondRanges.length - 1
      },
      hourRanges () {
        return this.getRangeList(24, this.disabledHours())
      },
      minuteRanges () {
        return this.getRangeList(60, this.disabledMinutes())
      },
      secondRanges () {
        return this.getRangeList(60, this.disabledSeconds())
      },
      curTimeProps () {
        return {
          hour: this.curTime.getHours(),
          minute: this.curTime.getMinutes(),
          second: this.curTime.getSeconds()
        }
      }
    },
    methods: {
      getRangeList (length, disabled = []) {
        return Array.from({length}, (ignore, item) => item).filter(item => disabled.indexOf(item) < 0)
      },
      handleClick (type, val) {
        this.handleChange(type, val)
        this.adjustItem(type)
      },
      getLeeway (type) {
        const timeList = this.$refs[type].$el.querySelector('.zp-time-list')
        const item = [...timeList.querySelectorAll('.zp-time-item')][0]
        this.offset = parseInt(domStyle(timeList, 'height', undefined, ':after'), 10)
        this.lineHeight = parseInt(domStyle(item, 'height'), 10)
      },
      handleChange (type, value) {
        const { hour, minute, second } = this.curTimeProps
        const cases = {
          hour () {
            this.updateTime(value, minute, second)
          },
          minute () {
            this.updateTime(hour, value, second)
          },
          second () {
            this.updateTime(hour, minute, value)
          }
        }
        cases[type] && cases[type].call(this)
      },
      updateTime (h, m, s) {
        this.curTime = new Date(this.curTime.getFullYear(), this.curTime.getMonth(), this.curTime.getDate(), h, m, s, this.curTime.getMilliseconds())
        this.$emit('change', formatDate(this.curTime, this.format), this.curTime)
      },
      selectRange (type) {
        let param
        if (type === 'hour') {
          param = [0, 2]
        } else if (type === 'minute') {
          param = [3, 5]
        } else if (type === 'second') {
          param = [6, 8]
        }
        this.$emit('select-range', ...param)
      },
      upperFirstLetter (str) {
        return `${str.charAt(0).toUpperCase()}${str.slice(1)}`
      },
      handleScroll (type) {
        !this.offset && this.getLeeway(type)
        const scroller = this.$refs[type].$refs.scrollerWrap
        const upperType = this.upperFirstLetter(type)
        const maxType = this[`max${upperType}`]
        const index = Math.min(Math.floor((scroller.scrollTop - this.offset) / this.lineHeight + 3), maxType)
        const val = this[`${type}Ranges`][index]
        this.handleChange(type, val)
      },
      adjustItems () {
        Object.keys(this.curTimeProps).forEach(type => this.adjustItem(type))
      },
      adjustItem (type) {
        const val = this.curTimeProps[type]
        const scroller = this.$refs[type].$refs.scrollerWrap
        if (scroller) {
          !this.offset && this.getLeeway(type)
          const index = this[`${type}Ranges`].indexOf(val)
          scroller.scrollTop = Math.max(0, (index - 2.5) * this.lineHeight + this.offset)
        }
      },
      amPm (hour) {
        if (this.amPmMode) {
          const mode = {
            a (hour) {
              return hour < 12 ? ' am' : ' pm'
            },
            A (hour) {
              return hour < 12 ? ' AM' : ' PM'
            }
          }
          return mode[this.amPmMode] && mode[this.amPmMode](hour) || ''
        }
      },
      updateScroller (force = true) {
        Object.keys(this.curTimeProps).forEach(type => {
          this.$refs[type].updateScrollbar()
          force && this.adjustItem(type)
        })
      },
      init () {
        this.curTime = this.value || new Date()
        this.curTime.setHours(0, 0, 0, 0)
        return this
      }
    },
    created () {
      this.init()
    }
  }
</script>

<style>
  .zp-time {
    width: 100%;
    white-space: nowrap;
  }
  .zp-time:before {
    content: '';
    position: absolute;
    top: 50%;
    margin-top: -15px;
    height: 30px;
    z-index: 0;
    left: 10px;
    right: 10px;
    box-sizing: border-box;
    text-align: left;
    border-top: 1px solid #dedede;
    border-bottom: 1px solid #dedede;
  }
  .zp-time-container {
    display: inline-block;
    width: 32%;
    width: -webkit-calc((100% - 8px) / 3);
    width: -moz-calc((100% - 8px) / 3);
    width: calc((100% - 8px) / 3);
    height: 180px;
    overflow: hidden;
    position: relative;
    vertical-align: top;
  }
  .zp-time-nonsec {
    display: inline-block;
    width: 49%;
    width: -webkit-calc((100% - 2px) / 2);
    width: -moz-calc((100% - 2px) / 2);
    width: calc((100% - 2px) / 2);
    height: 180px;
    overflow: hidden;
    position: relative;
    vertical-align: top;
  }
  .zp-time-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .zp-time-list:before,
  .zp-time-list:after {
    content: '';
    display: block;
    width: 100%;
    height: 90px;
  }
  .zp-time-item {
    height: 30px;
    line-height: 30px;
    font-size: 12px;
    text-align: center;
    color: #999;
  }
  .zp-time-item:hover:not(.zp-time-disabled) {
    cursor: pointer;
    background: rgba(77, 161, 255, .1);
  }
  .zp-time-item.zp-time-selected:not(.zp-time-disabled) {
    color: #54a5ff;
    font-weight: bold;
  }
  .zp-time-disabled {
    cursor: not-allowed;
    color: #ccc;
  }
  .zp-time .zp-scrollbar {
    background: rgba(204, 204, 204, .2);
  }
</style>