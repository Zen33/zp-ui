<!-- Picker Item -->
<template>
  <div v-sensor:init.once class="zp-picker-item">
    <div v-if="mask" class="zp-picker-item-mask"></div>
    <div :class="['zp-picker-item-outer', {'zp-picker-item-picking': isPicking}]" :style="outerStyle" ref="pickerOuter">
      <div v-for="(data, index) in curVals" :key="index" :index="index" :class="['zp-picker-item-inner', data.className, {'zp-picker-item-selected': data === curVal}, {'zp-picker-item-disabled': data.disabled}]" :style="innerStyle">
        {{ valueKey ? data[valueKey] : data }}
      </div>
    </div>
    <div v-if="separator" class="zp-picker-item-separator-outer">
      <div class="zp-picker-item-separator-inner" :style="separatorStyle" ref="pickerSeparator">
        {{ separator }}
      </div>
    </div>
  </div>
</template>

<script>
  import { domStyle } from '../../utils/dom'
  import Prefix from '../../mixins/prefix'
  import pick from './pick'

  export default {
    name: 'zp-picker-item',
    mixins: [Prefix],
    props: ['value', 'values', 'itemIndex', 'rowNumber', 'height', 'align', 'mask', 'valueKey', 'separator'],
    data () {
      return {
        curVal: this.valueKey ? (this.value || this.values[0][this.valueKey]) : (this.value || this.values[0]),
        curVals: this.values,
        rowHeight: 0,
        isPicking: false,
        separatorWidth: 0
      }
    },
    computed: {
      outerStyle () {
        const width = this.separatorWidth ? `calc(100% - ${this.separatorWidth}px)` : null
        return {
          width,
          height: `${this.rowHeight * this.rowNumber}px`
        }
      },
      innerStyle () {
        const height = `${this.rowHeight}px`
        return {
          height,
          lineHeight: height,
          textAlign: this.align
        }
      },
      separatorStyle () {
        const height = `${this.rowHeight}px`
         return {
          height,
          lineHeight: height
        }
      },
      max () {
        return this.rowHeight * Math.floor(this.rowNumber / 2)
      },
      // min () {
      //   return this.rowHeight * (Math.ceil(this.rowNumber / 2) - this.curVals.length)
      // },
      has3d () {
        return !!('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix())
      },
      leeway () {
        return [
          -this.rowHeight * (this.curVals.length - Math.ceil(this.rowNumber / 2)),
          this.rowHeight * Math.floor(this.rowNumber / 2)
        ]
      }
    },
    methods: {
      getValueByTranslate (translate) {
        translate = Math.round(translate / this.rowHeight) * this.rowHeight
        const index = -(translate - Math.floor(this.rowNumber / 2) * this.rowHeight) / this.rowHeight
        if (index > -1) {
          return this.curVals[index]
        }
      },
      getTranslateByValue (value, index) {
        if (!value) {
          return false
        }
        if (typeof index === 'undefined') {
          index = this.valueKey ? this.curVals.findIndex(val => val[this.valueKey] === value[this.valueKey]) : this.curVals.indexOf(value)
        }
        if (index > -1) {
          return (index - Math.floor(this.rowNumber / 2)) * -this.rowHeight
        }
      },
      getTranslate (el) {
        const translate = {}
        const transform = domStyle(el, `${this.prefix.css}transform`)
        // const transform = el.style[`${this.prefix.css}transform`]
        if (this.has3d) {
          const matrix = new WebKitCSSMatrix(transform)
          translate.x = matrix.m41
          translate.y = matrix.m42
        } else {
          const coord = /translate\(\s*(-?\d+(\.?\d+?)?)px,\s*(-?\d+(\.\d+)?)px\)\s*/ig.exec(transform)
          translate.x = Number(coord[1])
          translate.y = Number(coord[3])
        }
        return translate
      },
      setTranslate (el, x = 0, y = 0) {
        let transform = ` translate(${x ? `${x}px` : `0px`}, ${y ? `${y}px` : `0px`})`
        this.has3d && (transform += ' translateZ(0px)')
        domStyle(el, `${this.prefix.css}transform`, transform)
        // el.style[`${this.prefix.css}transform`] = transform
      },
      adjustItem (picker, diff, index, oy) {
        const len = this.curVals.length
        let items
        let translateY
        if (diff < 0) { // Down
          if (index === 0) {
            items = this.curVals
          } else {
            items = Object.assign([], this.curVals.slice(0, index)).reverse() // TBD
            // items = []
          }
        } else if (diff > 0) { // Up
          if (index === len - 1) {
            items = Object.assign([], this.curVals).reverse()
          } else {
            items = this.curVals.slice(index + 1)
          }
        } else {
          items = this.curVals
        }
        if (items.length) {
          const curItem = items.find(item => !item.disabled)
          if (typeof curItem !== 'undefined') {
            const offsetY = translateY = this.getTranslateByValue(curItem)
            this.setTranslate(picker, 0, offsetY)
          }
        } else {
          translateY = oy
          this.setTranslate(picker, 0, oy)
        }
        this.curVal = this.getValueByTranslate(translateY)
      },
      updateValue (picker, val, force) {
        if (this.valueKey) {
          if (force && !force.disabled) {
            this.setTranslate(picker, 0, val)
          } else {
            this.adjustItem(picker, 0)
          }
        } else {
          this.setTranslate(picker, 0, val)
        }
      },
      init () {
        const separator = this.$refs.pickerSeparator
        this.separatorWidth = parseInt(domStyle(separator, 'width'), 10) + 2 * parseInt(domStyle(separator, 'padding-right'), 10)
      }
    },
    mounted () {
      const picker = this.$refs.pickerOuter
      let items
      let props = {}
      let velocityLeeway
      let prevLeeway
      this.rowHeight = this.height || parseInt(domStyle(this.$el, 'height'), 10)
      pick(picker, {
        pickStart: evt => {
          props = {
            leeway: this.leeway,
            date: new Date(),
            oy: evt.pageY,
            translate: this.getTranslate(picker)
          }
          items = picker.querySelectorAll('.zp-picker-item-inner')
          document.body.classList.add('zp-pick-on')
        },
        pick: evt => {
          this.isPicking = true
          const leeway = evt.pageY - props.oy
          const translate = [props.translate.x, props.translate.y + leeway]
          velocityLeeway = leeway - prevLeeway || leeway
          prevLeeway = leeway
          this.setTranslate(picker, ...translate)
        },
        pickEnd: evt => {
          this.isPicking = false
          let rect
          let offset
          const MOMENTUM_RATIO = 7
          let translateY = this.getTranslate(picker).y
          const duration = new Date() - props.date
          let momentumTranslateY
          const diff = props.translate.y - translateY
          let distance = Math.abs(diff)
          if (distance < 6) {
            rect = this.$el.getBoundingClientRect()
            offset = Math.floor((evt.clientY - (rect.top + (this.rowNumber - 1) * this.rowHeight / 2)) / this.rowHeight) * this.rowHeight
            offset > this.max && (offset = this.max)
            velocityLeeway = 0
            translateY -= offset
          }
          duration < 300 && (momentumTranslateY = translateY + velocityLeeway * MOMENTUM_RATIO)
          this.$nextTick(() => {
            translateY = momentumTranslateY || translateY
            let translateLeeway = Math.round(translateY / this.rowHeight) * this.rowHeight
            translateLeeway = Math.max(Math.min(translateLeeway, props.leeway[1]), props.leeway[0])
            this.setTranslate(picker, props.translate.x, translateLeeway)
            this.curVal = this.getValueByTranslate(translateLeeway)
            if (this.valueKey) {
              const index = this.curVals.findIndex(val => val[this.valueKey] === this.curVal[this.valueKey])
              if (this.curVals[index].disabled) {
                this.adjustItem(picker, diff, index, props.translate.y)
              }
            }
          })
          document.body.classList.remove('zp-pick-on')
        }
      })
      this.updateValue(picker, this.getTranslateByValue(this.curVal), this.value)
    },
    watch: {
      curVal (val) {
        this.$emit('change', val, this.itemIndex)
      },
      curVals (vals) {
        const picker = this.$refs.pickerOuter
        ;[...picker.querySelectorAll('.zp-picker-item-inner')].forEach((ignore, index) => this.updateValue(picker, this.rowHeight * index))
      }
    }
  }
</script>

<style>
  .zp-picker-item {
    overflow: hidden;
    position: relative;
    max-height: 100%;
    -webkit-box-flex: 1;
    -webkit-flex: 1;
    -ms-flex: 1;
    flex: 1;
    -o-animation-duration: 0.001s;
    -ms-animation-duration: 0.001s;
    -moz-animation-duration: 0.001s;
    -webkit-animation-duration: 0.001s;
    animation-duration: 0.001s;
    -o-animation-name: showTime;
    -ms-animation-name: showTime;
    -moz-animation-name: showTime;
    -webkit-animation-name: showTime;
    animation-name: showTime;
  }
  .zp-picker-item .zp-picker-item-mask {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    background: -webkit-linear-gradient(to bottom, #fff, rgba(255, 255, 255, 0), #fff);
    background: -moz-linear-gradient(to bottom, #fff, rgba(255, 255, 255, 0), #fff);
    background: -o-linear-gradient(to bottom, #fff, rgba(255, 255, 255, 0), #fff);
    background: -ms-linear-gradient(to bottom, #fff, rgba(255, 255, 255, 0), #fff);
    background: linear-gradient(to bottom, #fff, rgba(255, 255, 255, 0), #fff);
    opacity: .9;
    pointer-events: none;
    z-index: 2;
  }
  .zp-picker-item .zp-picker-item-separator-outer {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
  }
  .zp-picker-item .zp-picker-item-separator-inner {
    position: relative;
    top: 50%;
    left: 50%;
    padding: 0 10px;
    -webkit-transform: translate(-50%, -50%);
    -moz-transform: translate(-50%, -50%);
    -ms-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
  }
  .zp-picker-item .zp-picker-item-left {
    text-align: left;
  }
  .zp-picker-item .zp-picker-item-center {
    text-align: center;
  }
  .zp-picker-item .zp-picker-item-right {
    text-align: right;
  }
  .zp-picker-item .zp-picker-item-outer {
    -moz-transition-duration: .3s;
    -webkit-transition-duration: .3s;
    -o-transition-duration: .3s;
    transition-duration: .3s;
    transition-timing-function: ease-out;
    -webkit-backface-visibility: hidden;
    -moz-backface-visibility: hidden;
    -ms-backface-visibility: hidden;
    backface-visibility: hidden;
  }
  .zp-picker-item .zp-picker-item-outer.zp-picker-item-picking,
  .zp-picker-item .zp-picker-item-outer.zp-picker-item-picking .zp-picker-item-inner {
    -moz-transition-duration: 0s;
    -webkit-transition-duration: 0s;
    -o-transition-duration: 0s;
    transition-duration: 0s;
  }
  .zp-picker-item .zp-picker-item-inner {
    position: relative;
    padding: 0 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #999;
    width: 100%;
    box-sizing: border-box;
    -moz-transition-duration: .3s;
    -webkit-transition-duration: .3s;
    -o-transition-duration: .3s;
    transition-duration: .3s;
    -webkit-backface-visibility: hidden;
    -moz-backface-visibility: hidden;
    -ms-backface-visibility: hidden;
    backface-visibility: hidden;  
  }
  .zp-picker-item .zp-picker-item-selected {
    color: #323c47;
    -moz-transform: translate3d(0, 0, 0);
    -webkit-transform: translate3d(0, 0, 0);
    /* -ms-transform: translate3d(0, 0, 0); */
    -o-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }
  .zp-picker-item .zp-picker-item-disabled {
    color: #ccc;
  }
  .zp-picker-item,
  .zp-picker-on {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  @-moz-keyframes showTime {
    from {
      clip: rect(1px, auto, auto, auto);
    }
    to {
      clip: rect(0px, auto, auto, auto);
    }
  }
  @-webkit-keyframes showTime {
    from {
      clip: rect(1px, auto, auto, auto);
    }
    to {
      clip: rect(0px, auto, auto, auto);
    }
  }
  @-ms-keyframes showTime {
    from {
      clip: rect(1px, auto, auto, auto);
    }
    to {
      clip: rect(0px, auto, auto, auto);
    }
  }
  @-o-keyframes showTime {
    from {
      clip: rect(1px, auto, auto, auto);
    }
    to {
      clip: rect(0px, auto, auto, auto);
    }
  }
  @keyframes showTime {
    from {
      clip: rect(1px, auto, auto, auto);
    }
    to {
      clip: rect(0px, auto, auto, auto);
    }
  }
</style>