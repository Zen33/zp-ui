<!-- Tooltip -->
<template>
  <div class="zp-tt-wrap" @mouseenter="showTip" @mouseleave="hideTip" @mousewheel="visible = false">
    <div class="zp-tt-ref">
      <slot></slot>
    </div>
    <div :class="['zp-tt', `zp-tt-${placement}`]" ref="ttSelf">
      <transition name="zp-tt-fade">
        <div class="zp-tt-content" v-show="!disabled && visible">
          <div class="zp-tt-arrow"></div>
          <div class="zp-tt-inner">{{ content }}</div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
  import MaxZIndex from '../../mixins/zIndex'

  export default {
    name: 'zp-tooltip',
    mixins: [MaxZIndex],
    props: {
      content: {
        type: [Number, String],
        default: ''
      },
      placement: {
        type: [String],
        default: 'top'
      },
      disabled: {
        type: Boolean,
        default: false
      },
      delay: {
        type: Number,
        default: 200
      },
      keep: {
        type: Boolean,
        default: false
      },
      follow: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        visible: false,
        el: null
      }
    },
    methods: {
      setTipPos () { // 设置 Tip
        const ttSelf = this.$refs.ttSelf
        const elRect = this.el.getBoundingClientRect()
        const elRectTop = this.follow ? this.el.offsetTop : (elRect.top + window.scrollY)
        const elRectLeft = this.follow ? this.el.offsetLeft : (elRect.left + window.scrollX)
        let styles
        const adjustPosition = (attr, suffix) => {
          if (['top', 'bottom'].includes(attr)) {
            if (suffix === 'start') {
              return `left:${elRectLeft}px;`
            } else {
              return `left:${elRectLeft - (ttSelf.offsetWidth - elRect.width)}px;`
            }
          } else {
            if (suffix === 'start') {
              return `top:${elRectTop}px;`
            } else {
              return `top:${elRectTop + elRect.height - ttSelf.offsetHeight}px;`
            }
          }
        }
        if (this.el) {
          const cases = {
            top (suffix) {
              const top = `top:${elRectTop - ttSelf.offsetHeight}px;`
              let left = `left:${elRectLeft - (ttSelf.offsetWidth - elRect.width) / 2}px;`
              const origin = `transform-origin:center bottom 0px;`
              suffix && (left = adjustPosition('top', suffix))
              return [left, top, origin]
            },
            right (suffix) {
              let top = `top:${elRectTop + (elRect.height - ttSelf.offsetHeight) / 2}px;`
              const left = `left:${elRectLeft + elRect.width}px;`
              const origin = `transform-origin:left center 0px;`
              suffix && (top = adjustPosition('right', suffix))
              return [left, top, origin]
            },
            bottom (suffix) {
              const top = `top:${elRectTop + elRect.height}px;`
              let left = `left:${elRectLeft - (ttSelf.offsetWidth - elRect.width) / 2}px;`
              const origin = `transform-origin:center top 0px;`
              suffix && (left = adjustPosition('bottom', suffix))
              return [left, top, origin]
            },
            left (suffix) {
              let top = `top:${elRectTop + (elRect.height - ttSelf.offsetHeight) / 2}px;`
              const left = `left:${elRectLeft - ttSelf.offsetWidth}px;`
              const origin = `transform-origin:right center 0px;`
              suffix && (top = adjustPosition('left', suffix))
              return [left, top, origin]
            }
          }
          const orientation = this.placement.split('-')
          cases[orientation[0]] && (styles = cases[orientation[0]].call(this, orientation[1]))
        }
        if (Array.isArray(styles)) {
          this.$refs.ttSelf.style.cssText = `${styles.join('')}z-index:${this.zIndex}`
        }
      },
      showTip () { // 显示 Tip
        this.timeout && clearTimeout(this.timeout)
        this.timeout = setTimeout(() => {
          this.visible = true
          this.$nextTick(this.setTipPos)
        }, this.delay)
      },
      hideTip () { // 隐藏 Tip
        if (this.timeout) {
          clearTimeout(this.timeout)
          if (!this.keep) {
            this.visible = false
          }
        }
      }
    },
    mounted () {
      if (!this.follow) {
        const fragment = document.createDocumentFragment()
        fragment.appendChild(this.$refs.ttSelf)
        document.body.appendChild(fragment)
      }
      this.el = this.$slots.default && this.$slots.default[0].elm
    },
    beforeDestroy () {
      const tip = this.$refs.ttSelf
      !this.follow && tip.parentNode.removeChild(tip)
    }
  }
</script>
<style>
.zp-tt-wrap {
  /* position: absolute; */
  position: relative;
  display: inline-block;
}
.zp-tt-ref {
  position: relative;
  display: inline-block;
}
.zp-tt-ref > * {
  cursor: pointer;
}
.zp-tt {
  position: absolute;
  display: block;
  font-size: 12px;
  visibility: visible;
}
.zp-tt-top,
.zp-tt-top-start,
.zp-tt-top-end {
  padding: 5px 0 8px;
}
.zp-tt-right,
.zp-tt-right-start,
.zp-tt-right-end {
  padding: 0 5px 0 8px;
}
.zp-tt-bottom,
.zp-tt-bottom-start,
.zp-tt-bottom-end {
  padding: 8px 0 5px;
}
.zp-tt-left,
.zp-tt-left-start,
.zp-tt-left-end {
  padding: 0 8px 0 5px;
}
.zp-tt-top .zp-tt-arrow,
.zp-tt-top-start .zp-tt-arrow,
.zp-tt-top-end .zp-tt-arrow {
  bottom: 3px;
  border-width: 5px 5px 0;
  border-top-color: rgba(50, 60, 71, .9);
}
.zp-tt-right-end .zp-tt-arrow,
.zp-tt-left-end .zp-tt-arrow {
  bottom: 8px;
}
.zp-tt-top .zp-tt-arrow {
  left: 50%;
  margin-left: -5px;
}
.zp-tt-top-start .zp-tt-arrow {
  left: 16px;
}
.zp-tt-top-end .zp-tt-arrow {
  right: 16px;
}
.zp-tt-right .zp-tt-arrow,
.zp-tt-right-start .zp-tt-arrow,
.zp-tt-right-end .zp-tt-arrow {
  left: 3px;
  border-width: 5px 5px 5px 0;
  border-right-color: rgba(50, 60, 71, .9);
}
.zp-tt-right .zp-tt-arrow {
  top: 50%;
  margin-top: -5px;
}
.zp-tt-right-start .zp-tt-arrow {
  top: 8px;
}
.zp-tt-left .zp-tt-arrow,
.zp-tt-left-start .zp-tt-arrow,
.zp-tt-left-end .zp-tt-arrow {
  right: 3px;
  border-width: 5px 0 5px 5px;
  border-left-color: rgba(50, 60, 71, .9);
}
.zp-tt-left .zp-tt-arrow {
  top: 50%;
  margin-top: -5px;
}
.zp-tt-left-start .zp-tt-arrow {
  top: 8px;
}
.zp-tt-bottom .zp-tt-arrow,
.zp-tt-bottom-start .zp-tt-arrow,
.zp-tt-bottom-end .zp-tt-arrow {
  top: 3px;
  border-width: 0 5px 5px;
  border-bottom-color: rgba(50, 60, 71, .9);
}
.zp-tt-bottom .zp-tt-arrow {
  left: 50%;
  margin-left: -5px;
}
.zp-tt-bottom-start .zp-tt-arrow {
  left: 16px;
}
.zp-tt-bottom-end .zp-tt-arrow {
  right: 16px;
}
.zp-tt-content {
  box-sizing: border-box;
}
.zp-tt-inner {
  max-width: 300px;
  min-height: 20px;
  padding: 8px 12px;
  line-height: 20px;
  color: #fff;
  text-align: left;
  background-color: rgba(50, 60, 71, .9);
  white-space: nowrap;
  border-radius: 4px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, .2);
}
.zp-tt-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-color: transparent;
  border-style: solid;
}
.zp-tt-fade-enter-active,
.zp-tt-fade-leave-active {
  -ms-transition: opacity .2s ease;
  -o-transition: opacity .2s ease;
  -webkit-transition: opacity .2s ease;
  transition: opacity .2s ease;
}
.zp-tt-fade-enter,
/* .zp-tt-fade-leave, */
.zp-tt-fade-leave-active {
  opacity: 0;
}
</style>