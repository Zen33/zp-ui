<!-- Information -->
<template>
  <transition :name="`zp-info-${position}`">
    <div :class="['zp-info-wrapper', `zp-info-${position}`, `zp-info-${type}`]" :style="{top, 'z-index': zIndex}" v-show="visible" @mouseenter="clearTimer" @mouseleave="startTimer">
      <div class="zp-info-container">
        <div>{{ message }}</div>
        <span v-if="showClose" class="zp-info-close" @click="closed = true"></span>
      </div>
    </div>
  </transition>
</template>

<script>
import MaxZIndex from '../../mixins/zIndex'
import TransitionEnd from '../../mixins/transitionEnd'

export default {
  name: 'zp-information',
  mixins: [MaxZIndex, TransitionEnd],
  data() {
    return {
      visible: false,
      timer: 0,
      closed: false,
      duration: 3000,
      top: 'auto'
    }
  },
  watch: {
    closed (val) {
      if (val) {
        this.visible = false
        this.handleClose && this.handleClose(this)
        if (this.transitionend) {
          this.$el.addEventListener(this.transitionend, this.destroyInfo)
        } else {
          this.destroyInfo()
        }
      }
    }
  },
  methods: {
    destroyInfo () {
      this.transitionend && this.$el.removeEventListener(this.transitionend, this.destroyInfo)
      this.$destroy(true)
      this.$el.parentNode.removeChild(this.$el)
    },
    clearTimer () {
      clearTimeout(this.timer)
      this.timer = 0
    },
    startTimer () {
      if (this.duration) {
        this.timer = setTimeout(() => {
          !this.closed && (this.closed = true)
        }, this.duration)
      }
    }
  },
  mounted() {
    this.startTimer()
  }
}
</script>

<style>
.zp-info-wrapper {
  position: fixed;
  min-width: 200px;
  min-height: 60px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  -moz-transition: all .3s cubic-bezier(.55, 0, .1, 1);
  -webkit-transition: all .3s cubic-bezier(.55, 0, .1, 1);
  -o-transition: all .3s cubic-bezier(.55, 0, .1, 1);
  transition: all .3s cubic-bezier(.55, 0, .1, 1);
}
.zp-info-top-right,
.zp-info-bottom-right {
  right: 10px;
}
.zp-info-top-left,
.zp-info-bottom-left {
  left: 10px;
}
.zp-info-container {
  padding: 10px;
  font-size: 12px;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
.zp-info-info {
  border: 1px solid #54a5ff;
  color: #54a5ff;
}
.zp-info-info .zp-info-container {
  background-color: rgba(85, 165, 255, .13);
}
.zp-info-success {
  border: 1px solid #00c853;
  color: #00c853;
}
.zp-info-success .zp-info-container {
  background-color: rgba(152, 225, 101, .13);
}
.zp-info-warning {
  border: 1px solid #ffab00;
  color: #ffab00;
}
.zp-info-warning .zp-info-container {
  background-color: rgba(255, 171, 0, .13);
}
.zp-info-error {
  border: 1px solid #dd2c00;
  color: #dd2c00;
}
.zp-info-error .zp-info-container {
  background-color: rgba(221, 44, 0, .13);
}
.zp-info-top-right-enter,
.zp-info-bottom-right-enter,
.zp-info-top-right-leave-active,
.zp-info-bottom-right-leave-active {
  -moz-transform: translateX(100%);
  -webkit-transform: translateX(100%);
  -o-transform: translateX(100%);
	transform: translateX(100%);
  opacity: 0;
}
.zp-info-top-left-enter,
.zp-info-bottom-left-enter,
.zp-info-top-left-leave-active,
.zp-info-bottom-left-leave-active {
  -moz-transform: translateX(-100%);
  -webkit-transform: translateX(-100%);
  -o-transform: translateX(-100%);
	transform: translateX(-100%);
	opacity: 0;
}
.zp-info-close {
  cursor: pointer;
  display: inline-block;
  position: absolute;
  top: 1px;
  right: 1px;
  width: 16px;
  height: 16px;
  background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAUZJREFUOBGtks9Kw0AQxme3j+AzeDR5B++CeGwS6KngnxcoaK+CIEix51o2xWPfQxEkL+HFeih6k6zf1zplExMVdCE7uzvz/XZ2JiL/MbIs28PX+y0rTdN9xO8y3n6KtkTMBI6TnyBJkqTG2Ln3fpuxHU5FUTzGcfQMxyiKdl6wv+N5fXS7WWatuTFGTvM8v6J/BeAContAFm2QtVgmEJ85586p4dgAuGmDtImpMZzqAwU6hmsk4g/hW3ovDjcPw5tV0wigE5D+GiK2LP1gNnOXKgqtdiE80/USC/o7xvhXPazbSg3UyTcj5SlSH+AZc2QyjuN4wRppjNovgKBgwzx3FxA9UMznNLW4AgjElVaF3WGrw0w2gDaxpqoQZhJCVgCID6yVW/5hTa1qgFwD8sTnaRfeULCj78QKQcwYbe2XpXnXsz/ZD+EXpYv46zVSAAAAAElFTkSuQmCC') no-repeat;
}
</style>