<!-- Range -->
<template>
  <div class="zp-range" ref="zpRange">
    <zp-calendar
      v-model="firstDate"
      :max="max"
      type="range-left"
      :format="format"
      :startNode="startNode"
      :endNode="endNode"
      :isSelecting="isSelecting"
      :disabledDate="disabledDate"
      @range-action="handleRangeLeft"
      @range-change="changeRange"
      @range-select="changeStatus"
    />
    <zp-calendar
      v-model="lastDate"
      :min="min"
      type="range-right"
      :format="format"
      :startNode="startNode"
      :endNode="endNode"
      :isSelecting="isSelecting"
      :disabledDate="disabledDate"
      @range-action="handleRangeRight"
      @range-change="changeRange"
      @range-select="changeStatus"
    />
  </div>
</template>

<script>
  import { formatDate, getNextMonthDate, getFirstDateOfMonth } from './date'

  export default {
    name: 'zp-date-range',
    props: {
      format: {
        default: 'yyyy-MM-dd'
      },
      disabledDate: {
        type: Function,
        default: () => {}
      },
      value: Array
    },
    data () {
      return {
        firstDate: null,
        lastDate: null,
        max: null,
        min: null,
        startNode: {},
        endNode: {},
        isSelecting: false
      }
    },
    created () {
      this.init()
    },
    methods: {
      init () {
        this.startNode = {}
        this.endNode = {}
        this.firstDate = Array.isArray(this.value) && this.value[0]
        if (this.firstDate) {
          this.firstDate.setHours(0, 0, 0, 0)
          this.startNode.timestamp = this.firstDate.getTime()
          this.min = getFirstDateOfMonth(new Date(this.firstDate.getTime()))
        } else {
          this.firstDate = this.min = getFirstDateOfMonth(new Date())
        }
        this.lastDate = Array.isArray(this.value) && this.value.length > 1 && this.value[1]
        if (this.lastDate) {
          this.lastDate.setHours(0, 0, 0, 0)
          const lastYearMonth = this.lastDate.getFullYear() + this.lastDate.getMonth()
          const firstYearMonth = this.firstDate.getFullYear() + this.firstDate.getMonth()
          this.endNode.timestamp = this.lastDate.getTime()
          if (firstYearMonth ===  lastYearMonth) {
            this.lastDate = this.max = getNextMonthDate(this.firstDate) // TBD
          } else {
            this.max = getFirstDateOfMonth(this.lastDate)
          }
        } else {
          this.lastDate = this.max = getNextMonthDate(this.firstDate)
        }
      },
      resetDayClasses () {
        ;[...this.$refs.zpRange.querySelectorAll('.zp-date-range')].map(day => {
          day.classList.remove('zp-calendar-current')
          day.classList.remove('zp-date-range')
        })
        return this
      },
      handleRangeLeft (val, evt) {
        this.min = this.firstDate = val
      },
      handleRangeRight (val, evt) {
        this.max = this.lastDate = val
      },
      changeRange (start, end) {
        start && (this.startNode = start)
        end && (this.endNode = end)
      },
      changeStatus (status, force = true) {
        this.isSelecting = status
        if (!status && force && this.startNode.date && this.endNode.date) {
          const [max, min] = [Math.max(this.startNode.timestamp, this.endNode.timestamp), Math.min(this.startNode.timestamp, this.endNode.timestamp)]
          const [startDate, endDate] = [new Date(min), new Date(max)]
          this.$emit('change', [formatDate(startDate), formatDate(endDate)], [startDate, endDate])
          this.$emit('input', [startDate, endDate])
        }
      },
      formatDate (...args) {
        return formatDate (...args)
      }
    }
  }
</script>

<style>
  .zp-range .zp-calendar {
    width: 50%;
    float: left;
  }
  .zp-range .zp-calendar:first-child {
    border-right: 1px solid #dedede;
  }
</style>