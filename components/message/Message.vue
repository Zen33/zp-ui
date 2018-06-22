<!-- Message -->
<template>
  <transition :name="`zp-msg-${position}`">
    <div :class="['zp-msg-wrapper', `zp-msg-${position}`, `zp-msg-${type}`]" :style="{'z-index': zIndex}" v-show="visible" @mouseenter="clearTimer" @mouseleave="startTimer">
      <div class="zp-msg-container">
        <div>{{ message }}</div>
        <span v-if="showClose" class="zp-msg-close" @click="closed = true"></span>
      </div>
    </div>
  </transition>
</template>

<script>
import MaxZIndex from '../../mixins/zIndex'
import TransitionEnd from '../../mixins/transitionEnd'

export default {
  name: 'zp-message',
  mixins: [MaxZIndex, TransitionEnd],
  data() {
    return {
      visible: false,
      timer: 0,
      closed: false,
      duration: 3000
    }
  },
  watch: {
    closed (val) {
      if (val) {
        this.visible = false
        this.handleClose && this.handleClose(this)
        if (this.transitionend) {
          this.$el.addEventListener(this.transitionend, this.destroyMsg)
        } else {
          this.destroyMsg()
        }
      }
    }
  },
  methods: {
    destroyMsg () {
      this.transitionend && this.$el.removeEventListener(this.transitionend, this.destroyMsg)
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
.zp-msg-wrapper {
  position: fixed;
  left: 50%;
  /* top: 51%; */
  -moz-transform: translate(-50%, -51%);
  -webkit-transform: translate(-50%, -51%);
  -o-transform: translate(-50%, -51%);
  transform: translate(-50%, -51%);
  min-width: 200px;
  margin: 0px auto;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  -moz-transition: all .3s cubic-bezier(.55, 0, .1, 1);
  -webkit-transition: all .3s cubic-bezier(.55, 0, .1, 1);
  -o-transition: all .3s cubic-bezier(.55, 0, .1, 1);
  transition: all .3s cubic-bezier(.55, 0, .1, 1);
}
.zp-msg-top {
  top: 20px;
  -moz-transform: translateX(-50%);
  -webkit-transform: translateX(-50%);
  -o-transform: translateX(-50%);
  transform: translateX(-50%);
}
.zp-msg-middle {
  top: 51%;
  -moz-transform: translate(-50%, -51%);
  -webkit-transform: translate(-50%, -51%);
  -o-transform: translate(-50%, -51%);
  transform: translate(-50%, -51%);
}
.zp-msg-bottom {
  bottom: 20px;
  -moz-transform: translateX(-50%);
  -webkit-transform: translateX(-50%);
  -o-transform: translateX(-50%);
  transform: translateX(-50%);
}
.zp-msg-container {
  padding: 10px;
}
.zp-msg-info {
  border: 1px solid #54a5ff;
  color: #54a5ff;
}
.zp-msg-info .zp-msg-container {
  background-color: rgba(85, 165, 255, .13);
}
.zp-msg-success {
  border: 1px solid #00c853;
  color: #00c853;
}
.zp-msg-success .zp-msg-container {
  background-color: rgba(152, 225, 101, .13);
}
.zp-msg-warning {
  border: 1px solid #ffab00;
  color: #ffab00;
}
.zp-msg-warning .zp-msg-container {
  background-color: rgba(255, 171, 0, .13);
}
.zp-msg-error {
  border: 1px solid #dd2c00;
  color: #dd2c00;
}
.zp-msg-error .zp-msg-container {
  background-color: rgba(221, 44, 0, .13);
}
.zp-msg-top-enter,
.zp-msg-top-leave-active,
.zp-msg-middle-enter,
.zp-msg-middle-leave-active {
  opacity: 0;
  -moz-transform: translate(-50%, -100%);
  -webkit-transform: translate(-50%, -100%);
  -o-transform: translate(-50%, -100%);
  transform: translate(-50%, -100%);
}
.zp-msg-bottom-enter,
.zp-msg-bottom-leave-active {
  opacity: 0;
  -moz-transform: translate(-50%, 100%);
  -webkit-transform: translate(-50%, 100%);
  -o-transform: translate(-50%, 100%);
  transform: translate(-50%, 100%);
}
.zp-msg-close {
  cursor: pointer;
  display: inline-block;
  position: absolute;
  top: 51%;
  -moz-transform: translateY(-51%);
  -webkit-transform: translateY(-51%);
  -o-transform: translateY(-51%);
  transform: translateY(-51%);
  right: 10px;
  width: 16px;
  height: 16px;
  background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAUZJREFUOBGtks9Kw0AQxme3j+AzeDR5B++CeGwS6KngnxcoaK+CIEix51o2xWPfQxEkL+HFeih6k6zf1zplExMVdCE7uzvz/XZ2JiL/MbIs28PX+y0rTdN9xO8y3n6KtkTMBI6TnyBJkqTG2Ln3fpuxHU5FUTzGcfQMxyiKdl6wv+N5fXS7WWatuTFGTvM8v6J/BeAContAFm2QtVgmEJ85586p4dgAuGmDtImpMZzqAwU6hmsk4g/hW3ovDjcPw5tV0wigE5D+GiK2LP1gNnOXKgqtdiE80/USC/o7xvhXPazbSg3UyTcj5SlSH+AZc2QyjuN4wRppjNovgKBgwzx3FxA9UMznNLW4AgjElVaF3WGrw0w2gDaxpqoQZhJCVgCID6yVW/5hTa1qgFwD8sTnaRfeULCj78QKQcwYbe2XpXnXsz/ZD+EXpYv46zVSAAAAAElFTkSuQmCC') no-repeat;
}
</style>