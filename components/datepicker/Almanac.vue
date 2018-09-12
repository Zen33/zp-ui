<!-- Almanac -->
<template>
  <div class="zp-almanac" @mouseleave="isSelecting = false">
    <div class="zp-almanac-wrapper">
      <div class="zp-almanac-container" v-show="isPicker" ref="picker">
        <div class="zp-almanac-header zp-bottom-line">
          <span class="zp-almanac-prev-year zp-float-left" @click="handleYearChange()"></span>
          <span class="zp-almanac-title-year" @click="handleViewChange('isDecade')">{{ `${curDate.getFullYear()} ${t('date.year')}`}}</span>
          <span class="zp-almanac-next-year zp-float-right" @click="handleYearChange(true)"></span>
        </div>
        <div class="zp-almanac-body">
          <div class="zp-almanac-days" ref="days">
            <div v-for="(month, mIndex) in monthShort" :key="mIndex" style="white-space: nowrap;">
              <div class="zp-almanac-title-month">{{ t(`date.months.${month}`)}}</div>
              <div v-for="(day, dIndex) in getDaysByMonth(mIndex)" :key="dIndex" :class="['zp-almanac-day', day.className]" @click.stop="handleDaySelect(day.date, mIndex * 31 + dIndex, $event)" @mouseenter="handleRangeStart(day.date, mIndex * 31 + dIndex, $event)">
                <span v-html="day.text"></span>
              </div>
            </div>
          </div>
        </div>
        <div class="zp-almanac-footer">
          <button class="prime" @click="handleConfirm">{{ t('date.confirm')}}</button>
          <button @click="init">{{ t('date.cancel') }}</button>
        </div>
      </div>
      <div class="zp-almanac-container" v-show="isDecade" :style="{width: `${wrapWidth}px`}">
        <div class="zp-almanac-header zp-bottom-line">
          <span class="zp-almanac-prev-decade zp-float-left" @click="handleDecadeChange()"></span>
          <span class="zp-almanac-title-decade">{{ curDecade }}</span>
          <span class="zp-almanac-next-decade zp-float-right" @click="handleDecadeChange(true)"></span>
        </div>
        <div class="zp-almanac-body">
          <span v-for="(year, index) in decade" :key="index" class="zp-almanac-year" @click="handleYearSelect(year.text)">{{ year.text }}</span>
        </div>
      </div>
      <div class="zp-almanac-container" v-show="isMonths" :style="{width: `${wrapWidth}px`}"></div>
    </div>
  </div>
</template>

<script>
  import i18n from '../../mixins/i18n'
  import { formatDate, monthShort, getDayCountOfMonth, parseDate, getArrayBtwTwoDates } from './date'
  const CLS_TODAY = 'zp-almanac-today'
  const CLS_DISABLED = 'zp-almanac-disabled'
  const CLS_WEEKEND = 'zp-almanac-weekend'
  const CLS_PLACEHOLDER = 'zp-almanac-placeholder'
  const CLS_SELECTED = 'zp-almanac-selected'

  export default {
    name: 'zp-almanac',
    mixins: [i18n],
    props: {
      value: {
        type: Array,
        default: () => []
      },
      format: {
        default: 'yyyy-MM-dd' // YYYY: week-based calendar year; yyyy: ordinary calendar year
      },
      disabledDate: {
        type: Function,
        default: () => {}
      },
      selectedDate: {
        type: Object,
        default: () => ({})
      },
      id: String
    },
    data () {
      return {
        curDate: new Date(),
        startNode: {},
        endNode: {},
        isPicker: true,
        isDecade: false,
        isMonths: false,
        isSelecting: false,
        wrapWidth: 0,
        selectedDays: []
      }
    },
    computed: {
      decade () {
        const { year } = this.curDateProps
        const curDecade = (`${year}`.substring(0, `${year}`.length - 1) + 0) - 1
        const decade = []
        for (let i = 0; i < 10; i++) {
          decade.push({
            text: curDecade + i
          })
        }
        return decade
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
        if (this.$parent.$options.name === 'zp-almanac-select') {
          return this.$parent.expand
        }
        return null
      },
      monthShort () {
        return monthShort
      },
      months () {
        return monthShort.map((month, index) => {
          return {
            text: this.t(`date.months.${month}`),
            index
          }
        })
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
      handleViewChange (view = 'isPicker') { // 切换场景
        ['isPicker', 'isDecade', 'isMonths'].forEach(item => {
          this[item] = !!(item === view)
        })
        return this
      },
      handleYearChange (dir = false) { // 改变年
        const { year, month, date } = this.curDateProps
        const leeway = dir ? year + 1 : year - 1
        this.resetDayClasses()
        this.curDate = new Date(leeway, month, date)
      },
      handleDecadeChange (dir = false) { // 改变旬
        const { year, month, date } = this.curDateProps
        const leeway = dir ? year + 10 : year - 10
        this.curDate = new Date(leeway, month, date)
      },
      handleMonthSelect (month) { // 选择月
        const { year, date } = this.curDateProps
        this.handleViewChange().resetDayClasses()
        this.curDate = new Date(year, month, date)
      },
      handleYearSelect (year) { // 选择年
        const { month, date } = this.curDateProps
        // this.handleViewChange('isMonths')
        this.handleViewChange().resetDayClasses()
        this.curDate = new Date(year, 0, date)
      },
      handleDaySelect (date, index, evt) { // 选择日
        const target = evt.currentTarget
        if (!date || target.classList.contains(CLS_DISABLED) || target.classList.contains(CLS_PLACEHOLDER) || target.classList.contains(CLS_SELECTED)) {
          return false
        }
        if (this.isSelecting) {
          this.isSelecting = false
        } else {
          this.resetDayClasses()
          target.classList.add('zp-date-range')
          this.isSelecting = true
          this.startNode = {
            index,
            target,
            date,
            timestamp: date.getTime()
          }
        }
        this.endNode = {
          index,
          target,
          date,
          timestamp: date.getTime()
        }
      },
      handleRangeStart (date, index, evt) { // 日期选择
        const target = evt.currentTarget
        if (this.isSelecting && !target.classList.contains(CLS_DISABLED) && !target.classList.contains(CLS_PLACEHOLDER) && !target.classList.contains(CLS_SELECTED)) {
          if (this.startNode.target === target) {
            this.resetDayClasses()
            target.classList.add('zp-date-range')
          } else {
            const [max, min] = [Math.max(index, this.startNode.index), Math.min(index, this.startNode.index)]
            const days = [...this.$refs.days.querySelectorAll('.zp-almanac-day')]
            for (let [i, day] of days.entries()) {
              if (i >= min && i <= max) {
                day.classList.add('zp-date-range')
              } else {
                day.classList.remove('zp-date-range')
              }
            }
          }
          this.endNode = {
            index,
            target,
            date,
            timestamp: date.getTime()
          }
        }
      },
      handleConfirm () { // 选择确认
        const curRange = [formatDate(this.startNode.timestamp, this.format), formatDate(this.endNode.timestamp, this.format)]
        this.$emit('change', curRange, [this.startNode.date, this.endNode.date])
      },
      resetDayClasses () { // 清除临时日期选项
        [...this.$refs.days.querySelectorAll('.zp-date-range')].map(day => day.classList.remove('zp-date-range'))
        return this
      },
      getDaysByMonth (month) { // 获取当月日信息
        const today = new Date()
        const totalDays = 31
        const curDate = {
          year: this.curDate.getFullYear(),
          month: this.curDate.getMonth(),
          day: this.curDate.getDate()
        }
        const curDays = []
        const days = getDayCountOfMonth(curDate.year, month)
        const yearMonth = `${curDate.year}-${month + 1}`
        const [max, min] = [Math.max(this.startNode.timestamp, this.endNode.timestamp), Math.min(this.startNode.timestamp, this.endNode.timestamp)]
        for (let i = 1; i <= days; i++) {
          // 时间置于当日的最后一秒
          const date = new Date(curDate.year, month, i, 23, 59, 59)
          const timestamp = date.getTime()
          const formatedDay = formatDate(date)
          let className = ''
          const theDate = new Date(parseDate(`${yearMonth}-${i}`))
          const theDay = theDate.getDay()
          if (!(theDay % 6)) {
            className = CLS_WEEKEND
          }
          if (i === today.getDate() && today.getFullYear() === curDate.year && today.getMonth() === month) {
            className = CLS_TODAY
          }
          if (this.disabledDate(date)) { // 禁用日期
            className += ` ${CLS_DISABLED}`
          } else {
            if (timestamp >= min && timestamp <= max) {
              className += ' zp-date-range'
            }
          }
          if (this.selectedDays.indexOf(formatedDay) > -1) { // 邻选日期
            className = CLS_SELECTED
          }
          curDays.push({
            text: i,
            date,
            className
          })
        }
        if (curDays.length < totalDays) {
          const leeway = totalDays - curDays.length
          for (let i = 1; i <= leeway; i++) {
            curDays.push({
              text: '&nbsp;&nbsp;',
              date: null,
              className: CLS_PLACEHOLDER
            })
          }
        }
        return curDays
      },
      addClasses (target, ...args) { // 批量增class
        args.map(cls => target.classList.add(cls))
      },
      removeClasses (target, ...args) { // 批量删class
        args.map(cls => target.classList.contains(cls) && target.classList.remove(cls))
      },
      init () { // 日期重置
        const range = this.selectedDate[this.id] || this.value
        if (range[0]) {
          const start = range[0]
          this.curDate = start
          start.setHours(23, 59, 59, 0)
          this.startNode.timestamp = start.getTime()
        } else {
          this.curDate = new Date()
          this.startNode = {}
        }
        if (range.length > 1 && range[1]) {
          const end = range[1]
          end.setHours(23, 59, 59, 0)
          this.endNode.timestamp = end.getTime()
        } else {
          this.endNode = {}
        }
      },
      setWrapWidth () { // 设置隐藏域宽度
        this.wrapWidth = this.$refs.picker.getBoundingClientRect()['width']
        return this
      },
      updateSelectedDate () { // 更新邻选集合
        this.selectedDays = []
        Object.keys(this.selectedDate).forEach(day => {
          if (day !== this.id) {
            try {
            const curDates = getArrayBtwTwoDates(this.selectedDate[day][0], this.selectedDate[day].slice(-1)[0])
            this.selectedDays = this.selectedDays.concat(curDates)
            } catch (e) {}
          }
        })
      }
    },
    created () {
      this.init()
    },
    mounted () {
      this.setWrapWidth()
    },
    watch: {
      visible (val) {
        if (!val) {
          this.init()
          setTimeout(() => {
            this.handleViewChange()
          }, 300)
        } else {
          this.setWrapWidth().updateSelectedDate()
        }
      }
    }
  }
</script>

<style>
  .zp-almanac {
    padding: 5px;
    margin: 0 5px 5px 5px;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    display: inline-block;
  }
  .zp-almanac .zp-almanac-title-month {
    display: inline-block;
    font-size: 14px;
    /* font-weight: bold; */
    width: 40px;
  }
  .zp-almanac .zp-almanac-header {
    text-align: center;
    padding-bottom: 5px;
  }
  .zp-almanac .zp-almanac-header span {
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
    margin: 5px;
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
  /* .zp-almanac .zp-almanac-title-year,
  .zp-almanac .zp-almanac-title-decade {
    font-weight: bold;
  } */
  .zp-almanac .zp-almanac-day span:hover,
  .zp-almanac .zp-almanac-month:hover,
  .zp-almanac .zp-almanac-year:hover,
  .zp-almanac .zp-almanac-title-year:hover {
    color: #4da1ff;
  }
  .zp-almanac .zp-almanac-prev-decade:before,
  .zp-almanac .zp-almanac-prev-decade:after,
  .zp-almanac .zp-almanac-prev-year:before,
  .zp-almanac .zp-almanac-prev-year:after {
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
  .zp-almanac .zp-almanac-prev-decade:after,
  .zp-almanac .zp-almanac-prev-year:after {
    left: 11px;
  }
  .zp-almanac .zp-almanac-next-month:after {
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
  .zp-almanac .zp-almanac-next-decade:before,
  .zp-almanac .zp-almanac-next-decade:after,
  .zp-almanac .zp-almanac-next-year:before,
  .zp-almanac .zp-almanac-next-year:after {
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
  .zp-almanac .zp-almanac-next-decade:after,
  .zp-almanac .zp-almanac-next-year:after {
    left: 7px;
  }
  .zp-almanac .zp-almanac-week,
  .zp-almanac .zp-almanac-day,
  .zp-almanac .zp-almanac-year,
  .zp-almanac .zp-almanac-month {
    position: relative;
    display: inline-block;
    text-align: center;
    padding: 5px;
    font-size: 12px;
    line-height: 20px;
    box-sizing: border-box;
    cursor: pointer;
  }
  .zp-almanac .zp-almanac-year {
    font-size: 14px;
  }
  .zp-almanac .zp-almanac-day {
    width: -webkit-calc((100% - 40px) / 31);
    width: -moz-calc((100% - 40px) / 31);
    width: calc((100% - 40px) / 31);
    min-width: 32px;
    margin-top: 1px;
    margin-bottom: 1px;
    /* border: 1px solid transparent; */
  }
  .zp-almanac .zp-almanac-year,
  .zp-almanac .zp-almanac-month {
    width: 25%;
  }
  .zp-almanac .zp-almanac-day span {
    display: block;
    width: 20px;
    height: 20px;
    margin: auto;
  }
  .zp-almanac .zp-almanac-week,
  .zp-almanac .zp-almanac-title-decade,
  .zp-almanac-placeholder,
  .zp-almanac-normal {
    cursor: default!important;
    background: transparent!important;
  }
  .zp-almanac-placeholder:hover,
  .zp-almanac-normal:hover {
    color: #323c47!important;
  }
  .zp-almanac-today {
    color: #4da1ff;
    font-weight: bold;
  }
  .zp-almanac-disabled {
    cursor: not-allowed!important;
  }
  .zp-almanac-weekend {
    color: #dd2c00;
  }
  .zp-date-range {
    background: rgba(77, 161, 255, .1);
  }
  .zp-almanac-disabled:after,
  .zp-almanac-selected:after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(255, 255, 255, .1)!important;
  }
  .zp-almanac-disabled:after {
    background: rgba(255, 255, 255, .8)!important;
  }
  .zp-almanac button {
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
  .zp-almanac button.prime {
    background: #54a5ff;
    color: #fff;
  }
  .zp-almanac-selected {
    background: rgba(221, 44, 0, .1);
    cursor: not-allowed!important;
  }
</style>
