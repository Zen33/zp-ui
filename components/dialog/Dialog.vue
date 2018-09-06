<!-- Dialog -->
<template>
  <transition name="zp-dg">
    <div :class="['zp-dg-mask', {'zp-dg-mask-non-bg': maskStatus}]" v-show="visible" :style="{'z-index': zIndex}" @click="checkClose($event)">
      <div class="zp-dg-wrapper">
        <div class="zp-dg-container" :style="{width: `${dgOption.width || 300}px`, height: `${dgOption.height}px`}" ref="dgSelf">
          <div class="zp-dg-header">
            <slot name="header">{{ dgOption.title }}</slot>
            <a class="zp-dg-close" @click="closeDialog"></a>
          </div>
          <div class="zp-dg-body">
            <slot name="body">{{ dgOption.message }}</slot>
          </div>
          <div class="zp-dg-footer">
            <slot name="footer">
              <div class="zp-dg-message" v-if="dgType !== 'modal'">
                <button v-show="dgType === 'confirm'" class="zp-dg-btn zp-dg-btn-confirm" @click="handleAction('confirm')">{{ dgOption.confirmText }}</button>
                <button class="zp-dg-btn zp-dg-btn-canel" @click="handleAction('cancel')">{{ dgType === 'confirm' ? dgOption.cancelText : dgOption.confirmText }}</button>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import MaxZIndex from '../../mixins/zIndex'
import TransitionEnd from '../../mixins/transitionEnd'

export default {
  name: 'zp-dialog',
  mixins: [MaxZIndex, TransitionEnd],
  props: {
    dgOption: {
      type: Object,
      default () {
        return {
          visible: false,
          type: 'modal'
        }
      }
    }
  },
  data () {
    return {
      dgType: 'modal',
      visible: false,
      selType: null
    }
  },
  computed: {
    maskStatus () {
      const visibleMask = document.querySelector('.zp-dg-mask:not([style*="display:none"]):not([style*="display: none"])')
      return !!(visibleMask && this.visible)
    }
  },
  methods: {
    closeDialog () {
      this.visible = this.dgOption.visible = false
      if (this.dgType !== 'modal') {
        if (this.transitionend) {
          this.$el.addEventListener(this.transitionend, this.destroyDialog)
        } else {
          this.destroyDialog()
        }
      }
    },
    destroyDialog () {
      this.transitionend && this.$el.removeEventListener(this.transitionend, this.destroyDialog)
      this.$destroy(true)
      this.$el.parentNode.removeChild(this.$el)
      if (this.selType) {
        this.$nextTick(() => {
          this.dgOption.callback && this.dgOption.callback(this.selType)
          this.selType = null
        })
      }
    },
    checkClose (evt) {
      if (evt.target.classList.contains('zp-dg-wrapper')) {
        this.dgOption.modalClick && this.closeDialog()
      }
    },
    handleAction (type) {
      this.selType = type
      this.closeDialog()
    }
  },
  watch: {
    'dgOption.type': {
      handler (val) {
        val && (this.dgType = val)
      }
    },
    'dgOption.visible': {
      handler (val) {
        val && (this.visible = val)
      }
    }
  }
}
</script>

<style>
.zp-dg-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  display: table;
}
.zp-dg-mask,
.zp-dg-container {
  -moz-transition: all .3s ease;
  -webkit-transition: all .3s ease;
  -o-transition: all .3s ease;
  transition: all .3s ease;
}
.zp-dg-mask-non-bg {
  background: transparent!important;
}
.zp-dg-wrapper {
  display: table-cell;
  vertical-align: middle;
}
.zp-dg-container {
  margin: 0px auto;
  padding: 10px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
}
.zp-dg-header {
  position: relative;
  font-size: 14px;
  font-weight: bold;
}
.zp-dg-close {
  cursor: pointer;
  display: inline-block;
  position: absolute;
  top: 0;
  right: 0;
  width: 16px;
  height: 16px;
  /* background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAUZJREFUOBGtks9Kw0AQxme3j+AzeDR5B++CeGwS6KngnxcoaK+CIEix51o2xWPfQxEkL+HFeih6k6zf1zplExMVdCE7uzvz/XZ2JiL/MbIs28PX+y0rTdN9xO8y3n6KtkTMBI6TnyBJkqTG2Ln3fpuxHU5FUTzGcfQMxyiKdl6wv+N5fXS7WWatuTFGTvM8v6J/BeAContAFm2QtVgmEJ85586p4dgAuGmDtImpMZzqAwU6hmsk4g/hW3ovDjcPw5tV0wigE5D+GiK2LP1gNnOXKgqtdiE80/USC/o7xvhXPazbSg3UyTcj5SlSH+AZc2QyjuN4wRppjNovgKBgwzx3FxA9UMznNLW4AgjElVaF3WGrw0w2gDaxpqoQZhJCVgCID6yVW/5hTa1qgFwD8sTnaRfeULCj78QKQcwYbe2XpXnXsz/ZD+EXpYv46zVSAAAAAElFTkSuQmCC') no-repeat; */
}
.zp-dg-close:before,
.zp-dg-close:after {
  content: '';
  position: absolute;
  height: 1px;
  width: 15px;
  top: 50%;
  right: 0;
  margin-top: -1px;
  background: #323c47;
}
.zp-dg-close:before {
  -moz-transform: rotate(45deg);
  -webkit-transform: rotate(45deg);
  /* -ms-transform: rotate(45deg); */
  -o-transform: rotate(45deg);
  transform: rotate(45deg);
}
.zp-dg-close:after {
  -moz-transform: rotate(-45deg);
  -webkit-transform: rotate(-45deg);
  /* -ms-transform: rotate(-45deg); */
  -o-transform: rotate(-45deg);
  transform: rotate(-45deg);
}
.zp-dg-body {
  padding: 10px 0;
  overflow-y: auto;
  height: -webkit-calc(100% - 65px);
  height: -moz-calc(100% - 65px);
  height: calc(100% - 65px);
}
.zp-dg-footer {
  text-align: right;
}
.zp-dg-enter .zp-dg-container,
.zp-dg-leave-active .zp-dg-container {
  opacity: 0;
  -moz-transform: scale(1.1);
  -webkit-transform: scale(1.1);
  -o-transform: scale(1.1);
  transform: scale(1.1);
}
.zp-dg-btn {
  min-width: 40px;
  height: 25px;
  padding: 7px 9px;
  font-size: 12px;
  border-radius: 4px;
  color: #fff;
  background-color: #54a5ff;
  border: none;
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  -webkit-appearance: none;
  text-align: center;
  box-sizing: border-box;
  outline: none;
  font-weight: normal;
}
</style>