<!-- Slider -->
<template>
  <div :class="['zp-slider-wrap', {'zp-slider-vertical': isVertical, 'zp-slider-disabled': disabled}]" ref="sliderSelf">
    <div class="zp-slider-stop" :style="stopStyle(stop)" v-if="showStops" v-for="stop in stops"></div>
    <div class="zp-slider" :style="sliderStyle" ref="zpSlider" @mouseenter="handleTooltip" @mouseleave="handleTooltip(false)" @mousedown="handleSliderStart" @touchstart="handleSliderStart"></div>
    <div class="zp-slider-handler" :style="minStyle" @mousedown="handleSliderStart($event, 'min')" @touchstart="handleSliderStart($event, 'min')" ref="minHandler">
      <zp-tooltip :content="getModel('min')" :disabled="tipDisabled" :keep="curType === 'min'" ref="minTip">
        <div :class="['zp-slider-core', {'zp-slider-moving': curType === 'min'}]"></div>
      </zp-tooltip>
    </div>
    <div class="zp-slider-handler" v-if="range" :style="maxStyle" @mousedown="handleSliderStart($event, 'max')" @touchstart="handleSliderStart($event, 'max')" ref="maxHandler">
      <zp-tooltip :content="getModel('max')" :disabled="tipDisabled" :keep="curType === 'max'" ref="maxTip">
        <div :class="['zp-slider-core', {'zp-slider-moving': curType === 'max'}]"></div>
      </zp-tooltip>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import Tooltip from '../tooltip/'

  Vue.use(Tooltip)

  export default {
    name: 'zp-slider',
    props:{
      sliderOption: Object,
      disabled: Boolean
    },
    data() {
      return {
        isDragging: false,
        min: this.getProp(this.sliderOption, 'min'),
        max: this.getProp(this.sliderOption, 'max', 100),
        step: this.getProp(this.sliderOption, 'step', 1),
        value: this.getProp(this.sliderOption, 'value'),
        showStops: this.getProp(this.sliderOption, 'showStops', false),
        isVertical: this.getProp(this.sliderOption, 'isVertical', false),
        showTooltip: this.getProp(this.sliderOption, 'showTooltip', true),
        curPos: 0,
        lastPos: 0,
        model:  [this.range ? this.value : [this.value]],
        curType: null,
        curStep: {
          min: 0,
          max: 0,
          fixed: null
        },
        curVal: null,
        fixed: this.getProp(this.sliderOption, 'fixed', false),
        leeway: 0,
        offset: 0,
        threshold: -1
      }
    },
    methods: {
      getProp (data, prop, val = 0) {
        return data.hasOwnProperty(prop) ? data[prop] : val
      },
      getMouseX (evt) { // 获取当前X坐标
        if (evt.type.indexOf('touch') > -1) {
          evt.clientX = evt.touches[0].clientX
          evt.clientY = evt.touches[0].clientY
        }
        return evt.clientX + this.offset
      },
      getMouseY (evt) { // 获取当前Y坐标
        if (evt.type.indexOf('touch') > -1) {
          evt.clientX = evt.touches[0].clientX
          evt.clientY = evt.touches[0].clientY
        }
        return evt.clientY + this.offset
      },
      getCurPos (evt) { // 获取当前位置
        const rect = this.$refs.sliderSelf.getBoundingClientRect()
        return this.isVertical ? Math.round((this.getMouseY(evt) - rect.top) / rect.height * 100) : Math.round((this.getMouseX(evt) - rect.left) / rect.width * 100)
        // return this.isVertical ? Math.floor((this.getMouseY(evt) - rect.top) / rect.height * 100) : Math.floor((this.getMouseX(evt) - rect.left) / rect.width * 100)
      },
      setHandler (evt) { // Slider 事件处理
        this.threshold++
        let leeway = this.getCurPos(evt)
        let curStart
        if (this.step > 1) { // 离散
          if (this.isVertical && !this.fixed) {
            leeway > this.max && (leeway = this.max)
            leeway < this.min && (leeway = this.min)
            leeway = this.max - leeway
          }
          if (leeway === this.curPos) {
            return false
          }
          if (this.curStep[this.curType] === null) {
            const avg = (this.model[1] + this.model[0]) / 2
            let index
            for (let [i, gap] of this.gaps.entries()) {
              if (avg < gap) {
                index = i - 1
                break
              }
            }
            if (this.isVertical) {
              this.curStep[this.curType] = this.gaps.length - index
            } else {
              this.curStep[this.curType] = index
            }
          }
          if (leeway > this.curPos) {
            this.curPos = this.gaps[this.curStep[this.curType] + 1] || this.max
            if (leeway < this.curPos) {
              return false
            }
            this.curStep[this.curType]++
          } else {
            this.curPos = this.gaps[this.curStep[this.curType] - 1] || this.min
            if (leeway > this.curPos) {
              return false
            }
            this.curStep[this.curType]--
          }
        } else {
          if (leeway < this.min || leeway > this.max) {
            return false
          }
          this.curPos = this.isVertical ? this.max - leeway : leeway
        }
        if (this.fixed) {
          let ext
          if (this.step > 1) {
            if (this.curPos === this.max || this.curPos === this.min) {
              return false
            }
            ext = leeway > this.lastPos ? this.step : -this.step
            this.isVertical && (ext = -ext)
          } else {
            ext = this.isVertical ? this.lastPos - leeway : leeway - this.lastPos
          }
          let min = this.model[0] + ext
          let max = this.model[1] + ext
          if (min < this.min) {
            min = this.min
            max = this.min + this.leeway
          }
          if (max > this.max) {
            max = this.max
            min = this.max - this.leeway
          }
          curStart = [min, max]
          this.lastPos = leeway
        } else {
          curStart = this.curType === 'min' ? [this.curPos, this.model[1]] : [this.model[0], this.curPos]
        }
        document.body.style.cursor = 'pointer'
        this.updateSlider(curStart)
        this.$nextTick(() => {
          if (!this.tipDisabled) {
            if (this.fixed) {
              this.$refs[`minTip`].setTipPos()
              this.$refs[`maxTip`].setTipPos()
            } else {
              this.$refs[`${this.curType}Tip`].setTipPos()
            }
          }
          this.$emit('slider-change', this.curVal)
        })
      },
      handleTooltip (status = true) { // 更新 Tooltip 状态
        if (!this.tipDisabled) {
          if (this.fixed) {
            this.$refs[`minTip`].visible = status
            this.$refs[`maxTip`].visible = status
            status && this.$nextTick(() => {
              this.$refs[`minTip`].setTipPos()
              this.$refs[`maxTip`].setTipPos()
            })
          } else {
            this.curType && (this.$refs[`${this.curType}Tip`].visible = status)
          }
        }
      },
      handleSliderStart (evt, type) { // Slider 开始事件
        if (!type && !this.fixed || this.disabled) {
          return false
        }
        evt.preventDefault()
        this.isDragging = true
        this.threshold = 0
        if (this.fixed) {
          const sliderRect = this.$refs.zpSlider.getBoundingClientRect()
          if (evt.type === 'touchstart') {
            evt.clientX = evt.touches[0].clientX
            evt.clientY = evt.touches[0].clientY
          }
          // this.offset = Math.floor(this.isVertical ? sliderRect.top + sliderRect.height / 2 - evt.clientY : sliderRect.left + sliderRect.width / 2 - evt.clientX)
          this.offset = Math.round(this.isVertical ? sliderRect.top + sliderRect.height / 2 - evt.clientY : sliderRect.left + sliderRect.width / 2 - evt.clientX)
          this.lastPos = this.getCurPos(evt)
          this.curType = 'fixed'
        } else {
          this.curType = type
          this.$refs[`${this.curType}Handler`].style.zIndex++
        }
        this.curPos = this.getCurPos(evt)
        document.body.classList.add('zp-drag-on')
        // this.lastPos = (this[`${type}Pos`] * this.valueRange / 100) + this.min
        // this.setHandler(evt)
        document.addEventListener('mousemove', this.handleSliderMove)
        document.addEventListener('touchmove', this.handleSliderMove)
        document.addEventListener('mouseup', this.handleSliderEnd)
        document.addEventListener('touchend', this.handleSliderEnd)
        document.addEventListener('contextmenu', this.handleSliderEnd)
      },
      handleSliderMove (evt) { // Slider 滑动中事件
        this.handleTooltip()
        this.isDragging && this.setHandler(evt)
      },
      handleSliderEnd () { // Slider 结束事件
        this.isDragging = false
        this.threshold = 0
        document.body.classList.remove('zp-drag-on')
        document.body.style.cursor = ''
        if (this.fixed) {
            this.handleTooltip(false)
            this.curStep[this.curType] = null
        } else {
          this.$refs[`${this.curType}Handler`].style.zIndex--
          !this.tipDisabled && (this.$refs[`${this.curType}Tip`].visible = false)
        }
        this.curType = null
        this.$emit('slider-action', this.curVal)
        document.removeEventListener('mousemove', this.handleSliderMove)
        document.removeEventListener('touchmove', this.handleSliderMove)
        document.removeEventListener('mouseup', this.handleSliderEnd)
        document.removeEventListener('touchend', this.handleSliderEnd)
        document.removeEventListener('contextmenu', this.handleSliderEnd)
      },
      adjustValue (val) { // 数据纠正
        if (this.range) {
          this.model = [Math.max(this.min, val[0]), Math.min(this.max, val[1])]
          this.curVal = this.model[0] > this.model[1] ? [this.model[1], this.model[0]] : Object.assign([], this.model)
        } else {
          !Array.isArray(val) && (val = [val])
          val[0] < this.min && (val[0] = this.min)
          val[0] > this.max && (val[0] = this.max)
          this.model = val
          this.curVal = val[0]
        }
      },
      updateSlider (val) { // Slider 更新
        if (this.threshold > 1 || this.threshold < 0) { // 区分当前点击/拖拽
          this.adjustValue(val)
          if (this.step > 1) {
            this.curStep.min = this.gaps.indexOf(this.model[0])
            this.curStep.max = this.gaps.indexOf(this.model[1])
          }
        }
      },
      stopStyle (stop) {
        const style = {}
        if (this.isVertical) {
          style.top = `${stop}%`
        } else {
          style.left = `${stop}%`
        }
        return style
      },
      getModel (type) {
        if (type === 'max') {
          return this.model[1]
        } else if (this.range) {
          return this.model[0]
        }
        return this.curVal
      }
    },
    computed: {
      minPos () {
        return (this.model[0] - this.min) / this.valueRange * 100
      },
      maxPos () {
        return (this.model[1] - this.min) / this.valueRange * 100
      },
      valueRange () {
        return this.max - this.min
      },
      range () {
        return !!(Array.isArray(this.value))
      },
      stops () {
        const len = this.valueRange / this.step
        const stops = []
        this.gaps = []
        const leeway = Math.floor(this.step * 100 / this.valueRange)
        const offset = (this.value[1] - this.value[0]) / 2
        for (let i = 0; i <= len; i++) {
          // this.step > 1 && this.gaps.push(i * leeway)
          if (this.step > 1) {
            if (this.fixed) {
              this.gaps.push(i * leeway + offset)
            } else {
              this.gaps.push(i * leeway)
            }
          }
          i && stops.push(i * leeway)
        }
        // this.isVertical && this.gaps.reverse()
        stops.pop()
        return stops
      },
      sliderStyle () {
        const style = {}
        if (this.range) {
          this.adjustValue(this.model)
          const leeway = this.model[0] > this.model[1] ? this.model[1] : this.model[0]
          const size = `${Math.abs(this.model[1] - this.model[0]) / this.valueRange * 100}%`
          const position = `${(leeway - this.min) / this.valueRange * 100}%`
          if (this.isVertical) {
            style.height = size
            style.bottom = position
          } else {
            style.width = size
            style.left = position
          }
          this.fixed && (style.cursor = 'pointer')
        } else {
          const size = `${(this.model[0] - this.min) / this.valueRange * 100}%`
          this.isVertical ? (style.height = size) : (style.width = size)
        }
        return style
      },
      minStyle () {
        const style = {}
        if (this.isVertical) {
          style.bottom = `${this.minPos}%`
        } else {
          style.left = `${this.minPos}%`
        }
        return style
      },
      maxStyle () {
        const style = {}
        if (this.isVertical) {
          style.bottom = `${this.maxPos}%`
        } else {
          style.left = `${this.maxPos}%`
        }
        return style
      },
      tipDisabled () {
        return !this.showTooltip
      }
    },
    mounted () {
      if (this.value) {
        this.curVal = this.range ? Object.assign([], this.value) : this.value
        this.fixed && (this.leeway = this.range ? this.value[1] - this.value[0] : 0)
        this.updateSlider(this.value)
      }
    }
  }
</script>
<style>
  .zp-slider-wrap {
    width: 100%;
    height: 5px;
    margin: 10px 0;
    background: #ccc;
    border-radius: 3px;
    position: relative;
  }
  .zp-slider {
    position: absolute;
    height: 5px;
    background: #2d8cf0;
    /* border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
    cursor: pointer; */
    border-radius: 3px;
  }
  .zp-slider-handler {
    position: absolute;
    width: 24px;
    height: 24px;
    top: -10px;
    box-sizing: border-box;
    -ms-transform: translateX(-50%);
    -o-transform: translateX(-50%);
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);
    background: transparent;
    text-align: center;
  }
  .zp-slider-handler:after {
    content: '';
    display: inline-block;
    vertical-align: middle;
    height: 100%;
  }
  .zp-slider-core {
    display: inline-block;
    vertical-align: middle;
    width: 10px;
    height: 10px;
    border: 2px solid #2d8cf0;
    background: #fff;
    cursor: pointer;
    border-radius: 50%;
    -ms-transition: .2s;
    -o-transition: .2s;
    -webkit-transition: .2s;
    transition: .2s;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .zp-slider-core:hover,
  .zp-slider-moving {
    -ms-transform: scale(1.5);
    -o-transform: scale(1.5);
    -webkit-transform: scale(1.5);
    transform: scale(1.5);
  }
  .zp-slider-stop {
    position: absolute;
    height: 5px;
    width: 5px;
    border-radius: 100%;
    background: #fff;
    -ms-transform: translateX(-50%);
    -o-transform: translateX(-50%);
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);
  }
  .zp-slider-vertical {
    position: relative;
    width: 5px!important;
    height: 200px;
  }
  .zp-slider-vertical .zp-slider-handler {
    -ms-transform: translateY(50%);
    -o-transform: translateY(50%);
    -webkit-transform: translateY(50%);
    transform: translateY(50%);
    top: auto;
    left: -10px;
  }
  .zp-slider-vertical .zp-slider {
    width: 5px!important;
    bottom: 0%;
  }
  .zp-slider-vertical .zp-slider-stop {
    -ms-transform: translateX(0%);
    -o-transform: translateX(0%);
    -webkit-transform: translateX(0%);
    transform: translateX(0%);
  }
  .zp-drag-on {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .zp-slider-disabled .zp-slider-core {
    border-color: #ccc;
    background: #fafafa;
  }
  .zp-slider-disabled .zp-slider {
    background: #ccc;
  }
  .zp-slider-disabled  .zp-slider-core:hover,
  .zp-slider-disabled .zp-slider-moving {
    -ms-transform: scale(1);
    -o-transform: scale(1);
    -webkit-transform: scale(1);
    transform: scale(1);
  }
</style>