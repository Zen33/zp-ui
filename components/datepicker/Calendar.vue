<!-- Calendar -->
<template>
  <div class="zp-calendar">
    <div class="zp-calendar-wrapper">
      <div class="zp-calendar-container" v-show="isCalendar" ref="picker">
        <div class="zp-calendar-header">
          <span :class="['zp-calendar-prev-year', 'zp-float-left', {'zp-calendar-hidden': isMinYear}]" @click="handleYearChange()"></span>
          <span :class="['zp-calendar-prev-month', 'zp-float-left', {'zp-calendar-hidden': isMinMonth}]" @click="handleMonthChange()"></span>
          <span :class="['zp-calendar-title-year', {'zp-calendar-normal': isRange}]" @click="handleViewChange('isDecade')">{{ `${curDate.getFullYear()} ${t('date.year')}`}}</span>
          <span :class="['zp-calendar-title-month', {'zp-calendar-normal': isRange}]" @click="handleViewChange('isMonths')">{{ t(`date.month${curDate.getMonth() + 1}`)}}</span>
          <span :class="['zp-calendar-next-year', 'zp-float-right', {'zp-calendar-hidden': isMaxYear}]" @click="handleYearChange(true)"></span>
          <span :class="['zp-calendar-next-month', 'zp-float-right', {'zp-calendar-hidden': isMaxMonth}]" @click="handleMonthChange(true)"></span>
        </div>
        <div class="zp-calendar-body">
          <div class="zp-calendar-weeks zp-bottom-line">
            <span v-for="(day, index) in weeks" :key="index" class="zp-calendar-week">{{ day }}</span>
          </div>
          <div :class="['zp-calendar-days', type]">
            <div v-for="(day, index) in days" :key="index" :rel="formatDate(day.date, format)" :data-index="offsetIndex + index" :class="['zp-calendar-day', day.className]" @click.stop="handleDaySelect(day.date, offsetIndex + index, $event)" @mouseenter="handleRangeStart(day.date, offsetIndex + index, $event)">
              <span>{{ day.text }}</span>
            </div>
          </div>
        </div>
        <div v-if="withToday" class="zp-calendar-footer">
          <button @click="handleDaySelect(new Date(), null, $event)">{{ t('date.today') }}</button>
        </div>
      </div>
      <div class="zp-calendar-container" v-show="isDecade" :style="wrapStyle">
        <div class="zp-calendar-header zp-bottom-line">
          <span class="zp-calendar-prev-decade zp-float-left" @click="handleDecadeChange()"></span>
          <span class="zp-calendar-title-decade">{{ curDecade }}</span>
          <span class="zp-calendar-next-decade zp-float-right" @click="handleDecadeChange(true)"></span>
        </div>
        <div class="zp-calendar-body">
          <span v-for="(year, index) in decade" :key="index" :class="['zp-calendar-year', {'zp-calendar-year-current': value === year.text}]" @click="handleYearSelect(year.text)">{{ year.text }}</span>
        </div>
      </div>
      <div class="zp-calendar-container" v-show="isMonths" :style="wrapStyle">
        <div class="zp-calendar-header zp-bottom-line">
          <span class="zp-calendar-prev-year zp-float-left" @click="handleYearChange()"></span>
          <span class="zp-calendar-title-year zp-calendar-normal">{{ `${curDate.getFullYear()} ${t('date.year')}`}}</span>
          <span class="zp-calendar-next-year zp-float-right" @click="handleYearChange(true)"></span>
        </div>
        <div class="zp-calendar-body">
          <span v-for="(month, index) in months" :key="index" :class="['zp-calendar-month', {'zp-calendar-month-current': matchMonth(index)}]" @click="handleMonthSelect(index)">{{ month.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import i18n from '../../mixins/i18n'
  import { parseDate, formatDate, weeks, monthShort, getDayCountOfMonth, getPrevMonthDate, getNextMonthDate, getPrevYearDate, getNextYearDate } from './date'
  const CLS_TODAY = 'zp-calendar-today'
  const CLS_CURRENT = 'zp-calendar-current'
  const CLS_LEEWAY = 'zp-calendar-leeway'
  const CLS_LEEWAY_BEFORE = 'zp-calendar-leeway-before'
  const CLS_LEEWAY_AFTER = 'zp-calendar-leeway-after'
  const CLS_DISABLED = 'zp-calendar-disabled'
  const CLS_WEEKEND = 'zp-calendar-weekend'
  const TOTAL_DAYS = 42

  export default {
    name: 'zp-calendar',
    mixins: [i18n],
    props: {
      value: [Date, Number, String],
      format: {
        default: 'yyyy-MM-dd' // YYYY: week-based calendar year; yyyy: ordinary calendar year
      },
      disabledDate: {
        type: Function,
        default: () => {}
      },
      type: {
        type: String,
        default: 'calendar'
      },
      max: Date,
      min: Date,
      startNode: {
        type: Object,
        default: () => ({})
      },
      endNode: {
        type: Object,
        default: () => ({})
      },
      view: String,
      isSelecting: Boolean,
      withToday: Boolean
    },
    data () {
      return {
        offsetIndex: this.type === 'range-right' ? TOTAL_DAYS : 0,
        curDate: this.value || new Date(),
        decade: [],
        isCalendar: true,
        isDecade: false,
        isMonths: false,
        ranger: null,
        isHolding: undefined,
        wrapWidth: 0
      }
    },
    computed: {
      isMaxYear () {
        if (!this.max) {
          return false
        } else {
          if (this.max.getTime() > getNextYearDate(this.curDate).getTime()) {
            return false
          } else {
            return true
          }
        }
      },
      isMaxMonth () {
        if (!this.max) {
          return false
        } else {
          if (this.max.getTime() > getNextMonthDate(this.curDate).getTime()) {
            return false
          } else {
            return true
          }
        }
      },
      isMinYear () {
        if (!this.min) {
          return false
        } else {
          if (this.min.getTime() < getPrevYearDate(this.curDate).getTime()) {
            return false
          } else {
            return true
          }
        }
      },
      isMinMonth () {
        if (!this.min) {
          return false
        } else {
          if (this.min.getTime() < getPrevMonthDate(this.curDate).getTime()) {
            return false
          } else {
            return true
          }
        }
      },
      isRange () {
        return this.type.indexOf('range') > -1
      },
      curDecade () {
        let curDecade = ''
        if (this.decade.length > 1) {
          const decade = Object.assign([], this.decade)
          const unit = this.t('date.year')
          curDecade = `${decade[0].text} ${unit} - ${decade.pop().text} ${unit}`
        }
        return curDecade
      },
      visible () {
        if (this.$parent.$options.name === 'zp-date-picker') {
          return this.$parent.expand
        } else if (this.$parent.$options.name === 'zp-date-range') {
          return this.$parent.$parent.expand
        }
        return null
      },
      weeks () {
        return weeks
      },
      months () {
        return monthShort.map((month, index) => {
          return {
            text: this.t(`date.months.${month}`),
            index
          }
        })
      },
      wrapStyle () {
        if (this.wrapWidth === 0) {
          return null
        } else {
          return {
            width: `${this.wrapWidth}px`
          }
        }
      },
      days () {
        const today = new Date()
        const curDate = {
          year: this.curDate.getFullYear(),
          month: this.curDate.getMonth(),
          day: this.curDate.getDate()
        }
        const curDays = []
        const decade = (`${curDate.year}`.substring(0, `${curDate.year}`.length - 1) + 0) - 1
        this.decade = []
        for (let i = 0; i < 10; i++) {
          this.decade.push({
            text: decade + i
          })
        }
        if (this.isHolding) {
          return []
        }
        let firstDayWeek = new Date(curDate.year, curDate.month, 1).getDay() + 1
        firstDayWeek === 0 && (firstDayWeek = 7)
        const days = getDayCountOfMonth(curDate.year, curDate.month)
        const [max, min] = [Math.max(this.startNode.timestamp, this.endNode.timestamp), Math.min(this.startNode.timestamp, this.endNode.timestamp)]
        if (firstDayWeek > 1) {
          const prevMonth = this.getFringeDate(curDate.year, curDate.month - 1)
          const prevMonthDays = getDayCountOfMonth(prevMonth.year, prevMonth.month)
          for (let i = 1; i < firstDayWeek; i++) {
            const text = prevMonthDays - firstDayWeek + i + 1
            const date = new Date(prevMonth.year, prevMonth.month, text)
            const className = this.disabledDate(date) ? CLS_DISABLED : `${CLS_LEEWAY} ${CLS_LEEWAY_BEFORE}`
            curDays.push({
              text,
              date,
              className
            })
          }
        }
        for (let i = 1; i <= days; i++) {
          const [date, time] = [new Date(curDate.year, curDate.month, i), new Date(curDate.year, curDate.month, i, 23, 59, 59)] // TBD
          const timestamp = date.getTime()
          const theDay = date.getDay()
          let className = ''
          if (i === today.getDate() && today.getFullYear() === curDate.year && today.getMonth() === curDate.month) {
            className = CLS_TODAY
          }
          if (i === curDate.day) {
            if (this.value && !this.isRange) {
              const model = this.value
              if (model.getFullYear() === curDate.year && model.getMonth() === curDate.month) {
                className = CLS_CURRENT
              }
            }
          }
          if (!(theDay % 6)) {
            className += ` ${CLS_WEEKEND}`
          }
          if (this.disabledDate(time)) {
            className = CLS_DISABLED
          } else {
            if (timestamp === min || timestamp === max) {
              className += ` zp-date-range ${CLS_CURRENT}`
            } else if (timestamp > min && timestamp < max) {
              className += ' zp-date-range'
            }
          }
          curDays.push({
            text: i,
            date,
            className
          })
        }
        if (curDays.length < TOTAL_DAYS) {
          const leeway = TOTAL_DAYS - curDays.length
          const nextMonth = this.getFringeDate(curDate.year, curDate.month + 1)
          for (let i = 1; i <= leeway; i++) {
            const date = new Date(nextMonth.year, nextMonth.month, i)
            const className= this.disabledDate(date) ? CLS_DISABLED : `${CLS_LEEWAY} ${CLS_LEEWAY_AFTER}`
            curDays.push({
              text: i,
              date,
              className
            })
          }
        }
        return curDays
      },
      curDateProps () {
        return {
          year: this.curDate.getFullYear(),
          month: this.curDate.getMonth(),
          date: this.curDate.getDate()
        }
      }
    },
    methods: {
      matchMonth (index) {
        try {
          const date = parseDate(this.value, this.format)
          return (date.getFullYear() === this.curDateProps.year && date.getMonth() === index)
        } catch (e) {
          return false
        }
      },
      handleViewChange (view = 'isCalendar') {
        if (this.isRange && view !== 'isCalendar') {
          return false
        }
        ['isCalendar', 'isDecade', 'isMonths'].forEach(item => {
          this[item] = !!(item === view)
        })
      },
      handleMonthChange (dir = false) {
        if ((!dir && this.isMinMonth) || (dir && this.isMaxMonth)) {
          return false
        }
        const { year, month, date } = this.curDateProps
        const leeway = dir ? month + 1 : month - 1
        const curDate = this.getFringeDate(year, leeway)
        this.curDate = new Date(curDate.year, curDate.month, date)
        this.$emit('range-action', this.curDate)
      },
      handleYearChange (dir = false) {
        if ((!dir && this.isMinYear) || (dir && this.isMaxYear)) {
          return false
        }
        const { year, month, date } = this.curDateProps
        const leeway = dir ? year + 1 : year - 1
        this.curDate = new Date(leeway, month, date)
        this.$emit('range-action', this.curDate)
      },
      handleDecadeChange (dir = false) {
        const { year, month, date } = this.curDateProps
        const leeway = dir ? year + 10 : year - 10
        this.curDate = new Date(leeway, month, date)
      },
      handleMonthSelect (month) {
        const { year, date } = this.curDateProps
        this.curDate = new Date(year, month, date)
        if (this.isHolding === 'isMonths') {
          const curMonth = formatDate(this.curDate, this.format)
          this.$emit('change', curMonth, curMonth)
          this.$emit('input', curMonth)
        } else {
          this.handleViewChange()
        }
      },
      handleYearSelect (year) {
        const { month, date } = this.curDateProps
        this.curDate = new Date(year, month, date)
        if (this.isHolding === 'isDecade') {
          // const curYear = this.curDate.getFullYear()
          const curYear = formatDate(this.curDate, this.format)
          this.$emit('change', curYear, curYear)
          this.$emit('input', curYear)
        } else {
          this.handleViewChange('isMonths')
        }
      },
      handleDaySelect (date, index, evt) {
        let target = evt.currentTarget
        let startNode
        let endNode
        let isSelecting
        if (!date || target.classList.contains(CLS_DISABLED)) {
          return false
        }
        if (this.isRange) {
          if (this.isSelecting) {
            isSelecting = false
          } else {
            if (target.classList.contains(CLS_LEEWAY)) {
              if ((this.type === 'range-left' && target.classList.contains(CLS_LEEWAY_BEFORE)) || (this.type === 'range-right' && target.classList.contains(CLS_LEEWAY_AFTER))) {
                return false
              }
              const section = this.type === 'range-left' ? '.range-right' : '.range-left'
              const day = this.formatDate(date, this.format)
              target = this.ranger.querySelector(`${section} [rel="${day}"]`)
              index = Number(target.getAttribute('data-index'))
            }
            this.resetDayClasses()
            // target.classList.add('zp-date-range')
            this.addClasses(target, 'zp-date-range', CLS_CURRENT)
            isSelecting = true
            startNode = {
              index,
              target,
              date,
              timestamp: date.getTime()
            }
          }
          endNode = {
            index,
            target,
            date,
            timestamp: date.getTime()
          }
          this.$emit('range-change', startNode, endNode)
          this.$emit('range-select', isSelecting)
        } else {
          this.curDate = date
          if (index !== null) {
            this.$emit('change', formatDate(this.curDate), this.curDate)
            this.$emit('input', this.curDate)
          }
        }
      },
      handleRangeStart (date, index, evt) {
        const target = evt.currentTarget
        if (this.isSelecting && !target.classList.contains(CLS_DISABLED) && !target.classList.contains(CLS_LEEWAY)) {
          if (this.startNode.target === target) {
            this.resetDayClasses()
            // target.classList.add('zp-date-range')
            this.addClasses(target, 'zp-date-range', CLS_CURRENT)
          } else {
            const [max, min] = [Math.max(index, this.startNode.index), Math.min(index, this.startNode.index)]
            const days = [...this.ranger.querySelectorAll('.zp-calendar-day')]
            for (let [i, day] of days.entries()) {
              if (i === max || i === min) {
                !day.classList.contains(CLS_LEEWAY) && this.addClasses(day, 'zp-date-range', CLS_CURRENT)
              } else if (i > min && i < max) {
                day.classList.remove(CLS_CURRENT)
                !day.classList.contains(CLS_LEEWAY) && day.classList.add('zp-date-range')
              } else {
                // day.classList.remove('zp-date-range')
                this.removeClasses(day, 'zp-date-range', CLS_CURRENT)
              }
            }
          }
          this.$emit('range-chagne', this.startNode, {
            index,
            target,
            date,
            timestamp: date.getTime()
          })
        }
      },
      resetDayClasses () { // 清除临时日期选项
        this.ranger && [...this.ranger.querySelectorAll('.zp-date-range')].map(day => this.removeClasses(day, 'zp-date-range', CLS_CURRENT))
        return this
      },
      addClasses (target, ...args) { // 批量增class
        args.map(cls => target.classList.add(cls))
      },
      removeClasses (target, ...args) { // 批量删class
        args.map(cls => target.classList.contains(cls) && target.classList.remove(cls))
      },
      getFringeDate (year, month) {
        if (month > 11) {
          year++
          month = 0
        } else if (month < 0) {
          year--
          month = 11
        }
        return {
          year,
          month
        }
      },
      formatDate (...args) {
        return formatDate (...args)
      },
      setWrapWidth () { // 设置隐藏域宽度
        this.wrapWidth = this.$refs.picker.getBoundingClientRect()['width']
        return this
      }
    },
    mounted () {
      if (this.view === 'year') {
        this.isHolding = 'isDecade'
      } else if (this.view === 'month') {
        this.isHolding = 'isMonths'
      }
      this.handleViewChange(this.isHolding)
      this.ranger = this.$parent.$refs.zpRange
      this.setWrapWidth()
    },
    watch: {
      visible (val) {
        if (!val) {
          // this.$emit('range-select', false, false)
          setTimeout(() => {
            this.handleViewChange(this.isHolding)
          }, 300)
        }
      }
    }
  }
</script>

<style>
  .zp-calendar {
    padding: 5px 5px 3px 5px;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    display: inline-block;
    box-sizing: border-box;
  }
  .zp-calendar .zp-calendar-weeks {
    white-space: nowrap;
  }
  .zp-calendar .zp-calendar-header {
    text-align: center;
  }
  .zp-calendar .zp-calendar-header span {
    position: relative;
    vertical-align: middle;
    cursor: pointer;
    min-width: 20px;
    height: 20px;
    line-height: 20px;
    text-align: center;
    border-radius: 3px;
    font-size: 16px;
    color: #323c47;
    white-space: nowrap;
    margin: 10px;
    display: inline-block;
  }
  .zp-float-left {
    float: left;
  }
  .zp-float-right {
    float: right;
  }
  .zp-bottom-line {
    border-bottom: 1px solid #dedede;
  }
  .zp-calendar .zp-calendar-day span:hover,
  .zp-calendar .zp-calendar-month:hover,
  .zp-calendar .zp-calendar-year:hover,
  .zp-calendar .zp-calendar-title-year:hover,
  .zp-calendar .zp-calendar-title-month:hover {
    color: #4da1ff;
  }
  .zp-calendar .zp-calendar-prev-month:after {
    content: '';
    position: absolute;
    width: 6px;
    height: 6px;
    top: 6px;
    left: 8px;
    border-right: 1px solid #323c47;
    border-top: 1px solid #323c47;
    -moz-transform: rotate(225deg);
    -webkit-transform: rotate(225deg);
    -o-transform: rotate(225deg);
    transform: rotate(225deg);
  }
  .zp-calendar .zp-calendar-prev-decade:before,
  .zp-calendar .zp-calendar-prev-decade:after,
  .zp-calendar .zp-calendar-prev-year:before,
  .zp-calendar .zp-calendar-prev-year:after {
    content: '';
    position: absolute;
    top: 6px;
    left: 6px;
    width: 6px;
    height: 6px;
    font-size: 20px;
    border-right: 1px solid #323c47;
    border-top: 1px solid #323c47;
    -moz-transform: rotate(225deg);
    -webkit-transform: rotate(225deg);
    -o-transform: rotate(225deg);
    transform: rotate(225deg);
  }
  .zp-calendar .zp-calendar-prev-decade:after,
  .zp-calendar .zp-calendar-prev-year:after {
    left: 11px;
  }
  .zp-calendar .zp-calendar-next-month:after {
    content: '';
    position: absolute;
    width: 6px;
    height: 6px;
    top: 6px;
    left: 10px;
    border-right: 1px solid #323c47;
    border-top: 1px solid #323c47;
    -moz-transform: rotate(45deg);
    -webkit-transform: rotate(45deg);
    -o-transform: rotate(45deg);
    transform: rotate(45deg);
    margin-left: -6px;
  }
  .zp-calendar .zp-calendar-next-decade:before,
  .zp-calendar .zp-calendar-next-decade:after,
  .zp-calendar .zp-calendar-next-year:before,
  .zp-calendar .zp-calendar-next-year:after {
    content: '';
    position: absolute;
    top: 6px;
    left: 2px;
    width: 6px;
    height: 6px;
    font-size: 20px;
    border-right: 1px solid #323c47;
    border-top: 1px solid #323c47;
    -moz-transform: rotate(45deg);
    -webkit-transform: rotate(45deg);
    -o-transform: rotate(45deg);
    transform: rotate(45deg);
  }
  .zp-calendar .zp-calendar-next-decade:after,
  .zp-calendar .zp-calendar-next-year:after {
    left: 7px;
  }
  .zp-calendar .zp-calendar-week,
  .zp-calendar .zp-calendar-day,
  .zp-calendar .zp-calendar-year,
  .zp-calendar .zp-calendar-month {
    position: relative;
    display: inline-block;
    text-align: center;
    padding: 5px;
    font-size: 12px;
    line-height: 30px;
    box-sizing: border-box;
    cursor: pointer;
  }
  .zp-calendar .zp-calendar-week,
  .zp-calendar .zp-calendar-day {
    width: -webkit-calc(100% / 7);
    width: -moz-calc(100% / 7);
    width: calc(100% / 7);
    min-width: 32px;
  }
  .zp-calendar .zp-calendar-day {
    margin-bottom: 2px;
  }
  .zp-calendar .zp-calendar-year,
  .zp-calendar .zp-calendar-month {
    width: -webkit-calc(100% / 4);
    width: -moz-calc(100% / 4);
    width: calc(100% / 4);
    padding-top: 20px;
    padding-bottom: 20px;
    font-size: 14px;
  }
  .zp-calendar .zp-calendar-day span {
    display: block;
    width: 30px;
    height: 30px;
    margin: auto;
  }
  .zp-calendar .zp-calendar-week,
  .zp-calendar .zp-calendar-title-decade,
  .zp-calendar-normal {
    cursor: default!important;
  }
  .zp-calendar-normal:hover {
    color: #323c47!important;
  }
  .zp-calendar-leeway {
    color: #ccc;
  }
  .zp-calendar-today,
  .zp-calendar-year-current,
  .zp-calendar-month-current {
    color: #4da1ff;
    font-weight: bold;
  }
  .zp-calendar-current span {
    color: #fff;
    background: #4da1ff;
    border-radius: 50%;
  }
  .zp-calendar-current span:hover {
    color: #fff!important;
  }
  .zp-calendar-disabled {
    cursor: not-allowed!important;
  }
  .zp-calendar-disabled:after,
  .zp-calendar-leeway:after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(255, 255, 255, .1)!important;
  }
  .zp-calendar-disabled:after {
    background: rgba(255, 255, 255, .8)!important;
  }
  .zp-date-range {
    background: rgba(77, 161, 255, .1);
  }
  .zp-calendar-hidden {
    visibility: hidden;
  }
  .zp-calendar-weekend {
    color: #dd2c00;
  }
  .zp-calendar button {
    float: right;
    padding: 7px 9px;
    font-size: 12px;
    border-radius: 4px;
    color: #323c47;
    background: #ddd;
    border: none;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    text-align: center;
    box-sizing: border-box;
    outline: none;
    font-weight: normal;
    margin-left: 10px;
    min-width: 60px;
  }
</style>