<!-- Carousel  -->
<template>  
  <div class="zp-cal-wrapper" @mouseenter.stop="pause" @mouseleave.stop="resume">
    <div class="zp-cal" :style="{height}">
      <slot></slot>
      <transition name="zp-cal-left">
        <span v-if="hasArrow && visible" class="zp-cal-arrow zp-cal-arrow-left" @click.stop="handleArrowClick(curIndex - 1)"></span>
      </transition>
      <transition name="zp-cal-right">
        <span v-if="hasArrow && visible" class="zp-cal-arrow zp-cal-arrow-right" @click.stop="handleArrowClick(curIndex + 1)"></span>
      </transition>
      <ul v-if="items.length" class="zp-cal-indicators">
        <li v-for="(item, index) in items" @mouseenter="hancleIndicatorHover(index)" :class="['zp-cal-indicator', {'zp-cal-indicator-label': item.label}, {'zp-cal-indicator-active': index === curIndex}]" :key="index">
          {{ item.label }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  const resizeEvent = require('../../utils/resize')
  const throttleEvent = require('../../utils/throttle')

  export default {
    name: 'zp-carousel',
    props: {
      index: {
        type: Number,
        default: 0
      },
      hasArrow: {
        type: Boolean,
        default: true
      },
      interval: {
        type: [Number, String],
        default: 3000
      },
      autoplay: {
        type: Boolean,
        default: true
      },
      height: {
        type: String,
        default: '200px'
      }
    },
    data () {
      return {
        items: [],
        curIndex: -1,
        timer: 0,
        visible: false
      }
    },
    methods: {
      setItem (index) {
        const len = this.items.length
        if (typeof index === 'undefined') {
          this.curIndex = this.curIndex < len - 1 ? this.curIndex + 1 : 0
        } else {
          index = Number(index)
          const oriIndex = this.curIndex
          if (isNaN(index) || index !== parseInt(index, 10)) {
            return false
          } else if (index < 0) {
            this.curIndex = len - 1
          } else if (index >= len) {
            this.curIndex = 0
          } else {
            this.curIndex = index
          }
          if (oriIndex === this.curIndex) {
            this.updateItems(oriIndex)
          }
        }
      },
      pause () {
        this.visible = true
        clearInterval(this.timer)
        this.timer = 0
      },
      resume () {
        this.visible = false
        this.showTime()
      },
      next () {
        this.setItem(this.curIndex + 1)
      },
      prev () {
        this.setItem(this.curIndex - 1)
      },
      updateItems (index) {
        this.items.forEach((item, i) => {
          item.translateItem(i, this.curIndex, index)
        })
      },
      showTime () {
        if (isNaN(Number(this.interval)) || !this.autoplay) {
          return false
        }
        this.timer && this.pause()
        this.timer = setInterval(this.setItem, this.interval)
      }
    },
    created () {
      this.handleArrowClick = throttleEvent(index => {
        this.setItem(index)
      }, 300)
      this.hancleIndicatorHover = throttleEvent(index => {
        this.setItem(index)
      }, 300)
    },
    mounted () {
      this.items = this.$children.filter(item => item.$options.name === 'zp-carousel-item')
      if (this.index < this.items.length && this.index >= 0) {
        this.curIndex = this.index
      }
      resizeEvent.addResizeListener(this.$el, this.updateItems)
      this.showTime()
    },
    beforeDestroy () {
      resizeEvent.removeResizeListener(this.$el, this.updateItems)
    },
    watch: {
      curIndex (val, prev) {
        this.items.length && this.updateItems(prev)
        this.$emit('cal-action', val, prev)
      }
    }
  }
</script>
<style>
.zp-cal-wrapper {
  position: relative;
  overflow: hidden;
}
.zp-cal .zp-cal-arrow {
  display: inline-block;
  position: absolute;
  top: 50%;
  cursor: pointer;
  width: 23px;
  height: 23px;
  margin-top: -12px;
  /* border: 1px solid #dedede; */
  border-radius: 50%;
  background: rgba(81, 165, 255, .8);
  -moz-transition: all .3s;
  -webkit-transition: all .3s;
  -o-transition: all .3s;
  transition: all .3s;
  z-index: 3;
}
.zp-cal .zp-cal-arrow-left {
  left: 2%;
}
.zp-cal .zp-cal-arrow-right  {
  right: 2%;
}
.zp-cal-right-enter,
.zp-cal-right-leave-active {
  opacity: 0;
  -moz-transform: translateX(-10px);
  -webkit-transform: translateX(-10px);
  -o-transform: translateX(-10px);
  transform: translateX(-10px);
}
.zp-cal-left-enter,
.zp-cal-left-leave-active {
  opacity: 0;
  -moz-transform: translateX(10px);
  -webkit-transform: translateX(10px);
  -o-transform: translateX(10px);
  transform: translateX(10px);
}
.zp-cal .zp-cal-arrow-right:after {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  top: 8px;
  left: 6px;
  border-right: 1px solid #fff;
  border-top: 1px solid #fff;
  -moz-transform: rotate(45deg);
  -webkit-transform: rotate(45deg);
  -o-transform: rotate(45deg);
  transform: rotate(45deg);
}
.zp-cal .zp-cal-arrow-left:after {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  top: 8px;
  left: 10px;
  border-right: 1px solid #fff;
  border-top: 1px solid #fff;
  -moz-transform: rotate(225deg);
  -webkit-transform: rotate(225deg);
  -o-transform: rotate(225deg);
  transform: rotate(225deg);
}
.zp-cal-indicators {
  position: absolute;
  list-style: none;
  bottom: 5px;
  left: 50%;
  margin: 0;
  padding: 0;
  -moz-transform: translateX(-50%);
  -webkit-transform: translateX(-50%);
  -o-transform: translateX(-50%);
  transform: translateX(-50%);
  z-index: 3;
}
.zp-cal-indicator {
  position: relative;
  display: inline-block;
  background: #54a5ff;
  cursor: pointer;
  margin-left: 5px;
  margin-right: 5px;
  min-width: 10px;
  min-height: 10px;
  border-radius: 5px;
  opacity: .3;
}
.zp-cal-indicator-label {
  font-size: 12px;
  padding: 3px;
  text-align: center;
  color: #fff;
}
.zp-cal-indicator-active {
  opacity: .8;
}
</style>