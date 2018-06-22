<!-- Popover -->
<template>
  <div>
    <div :class="['zp-pop', `zp-pop-${placement}`]" ref="popSelf" :style="{width: `${width}px`}">
      <transition name="zp-pop-fade">
        <div class="zp-pop-content" v-show="!disabled && visible">
          <div class="zp-pop-arrow"></div>
          <div class="zp-pop-inner">
            <slot>{{ content }}</slot>
          </div>
        </div>
      </transition>
      <slot name="popRef"></slot>
    </div>
  </div>
</template>

<script>
  import MaxZIndex from '../../mixins/zIndex'

  export default {
    name: 'zp-popover',
    mixins: [MaxZIndex],
    props: {
      width: {
        type: [Number, String],
        default: 200
      },
      trigger: {
        type: String,
        default: 'click',
        validator: value => ['click', 'hover'].indexOf(value) > -1
      },
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
      setPopPos () { // 设置 Pop
        const popSelf = this.$refs.popSelf
        if (!popSelf) {
          return false
        }
        const elRect = this.el.getBoundingClientRect()
        const elRectTop = this.follow ? this.el.offsetTop : (elRect.top + window.scrollY)
        const elRectLeft = this.follow ? this.el.offsetLeft : (elRect.left + window.scrollX)
        let styles
        const adjustPosition = (attr, suffix) => {
          if (['top', 'bottom'].includes(attr)) {
            if (suffix === 'start') {
              return `left:${elRectLeft}px;`
            } else {
              return `left:${elRectLeft - (popSelf.offsetWidth - elRect.width)}px;`
            }
          } else {
            if (suffix === 'start') {
              return `top:${elRectTop}px;`
            } else {
              return `top:${elRectTop + elRect.height - popSelf.offsetHeight}px;`
            }
          }
        }
        if (this.el) {
          const cases = {
            top (suffix) {
              const top = `top:${elRectTop - popSelf.offsetHeight}px;`
              let left = `left:${elRectLeft - (popSelf.offsetWidth - elRect.width) / 2}px;`
              const origin = `transform-origin:center bottom 0px;`
              suffix && (left = adjustPosition('top', suffix))
              return [left, top, origin]
            },
            right (suffix) {
              let top = `top:${elRectTop + (elRect.height - popSelf.offsetHeight) / 2}px;`
              const left = `left:${elRectLeft + elRect.width}px;`
              const origin = `transform-origin:left center 0px;`
              suffix && (top = adjustPosition('right', suffix))
              return [left, top, origin]
            },
            bottom (suffix) {
              const top = `top:${elRectTop + elRect.height}px;`
              let left = `left:${elRectLeft - (popSelf.offsetWidth - elRect.width) / 2}px;`
              const origin = `transform-origin:center top 0px;`
              suffix && (left = adjustPosition('bottom', suffix))
              return [left, top, origin]
            },
            left (suffix) {
              let top = `top:${elRectTop + (elRect.height - popSelf.offsetHeight) / 2}px;`
              const left = `left:${elRectLeft - popSelf.offsetWidth}px;`
              const origin = `transform-origin:right center 0px;`
              suffix && (top = adjustPosition('left', suffix))
              return [left, top, origin]
            }
          }
          const orientation = this.placement.split('-')
          cases[orientation[0]] && (styles = cases[orientation[0]].call(this, orientation[1]))
        }
        if (Array.isArray(styles)) {
          this.$refs.popSelf.style.cssText = `width:${this.width}px;${styles.join('')}z-index:${this.zIndex}`
        }
      },
      showPop (evt) { // 显示 Pop
        this.timeout && clearTimeout(this.timeout)
        this.timeout = setTimeout(() => {
          if (evt.target === this.el) {
            this.visible = !this.visible
          } else {
            this.hidePop()
          }
          this.$nextTick(this.setPopPos)
        }, this.delay)
      },
      hidePop () { // 隐藏 Pop
        if (this.timeout) {
          clearTimeout(this.timeout)
          if (!this.keep) {
            this.visible = false
          }
        }
      }
    },
    mounted () {
      this.el = this.$refs.popRef
      if (this.trigger === 'click') {
        document.addEventListener('click', this.showPop)
      } else {
        this.el.addEventListener('mouseenter', this.showPop)
        this.el.addEventListener('mouseleave', this.hidePop)
      }
      if (!this.follow) {
        const fragment = document.createDocumentFragment()
        fragment.appendChild(this.$refs.popSelf)
        document.body.appendChild(fragment)
      }
    },
    beforeDestroy () {
      document.removeEventListener('click', this.showPop)
      this.el.removeEventListener('mouseenter', this.showPop)
      this.el.removeEventListener('mouseleave', this.hidePop)
      const tip = this.$refs.popSelf
      !this.follow && tip.parentNode.removeChild(tip)
    }
  }
</script>
<style>
.zp-pop {
  position: absolute;
  display: block;
  font-size: 12px;
  visibility: visible;
}
.zp-pop-top,
.zp-pop-top-start,
.zp-pop-top-end {
  padding: 5px 0 8px;
}
.zp-pop-right,
.zp-pop-right-start,
.zp-pop-right-end {
  padding: 0 5px 0 8px;
}
.zp-pop-bottom,
.zp-pop-bottom-start,
.zp-pop-bottom-end {
  padding: 8px 0 5px;
}
.zp-pop-left,
.zp-pop-left-start,
.zp-pop-left-end {
  padding: 0 8px 0 5px;
}
.zp-pop-top .zp-pop-arrow,
.zp-pop-top-start .zp-pop-arrow,
.zp-pop-top-end .zp-pop-arrow {
  bottom: 3px;
  border-width: 6px 6px 0;
  border-top-color: #fff;
}
.zp-pop-right-end .zp-pop-arrow,
.zp-pop-left-end .zp-pop-arrow {
  bottom: 8px;
}
.zp-pop-top .zp-pop-arrow {
  left: 50%;
  margin-left: -5px;
}
.zp-pop-top-start .zp-pop-arrow {
  left: 16px;
}
.zp-pop-top-end .zp-pop-arrow {
  right: 16px;
}
.zp-pop-right .zp-pop-arrow,
.zp-pop-right-start .zp-pop-arrow,
.zp-pop-right-end .zp-pop-arrow {
  left: 3px;
  border-width: 6px 6px 6px 0;
  border-right-color: #fff;
}
.zp-pop-right .zp-pop-arrow {
  top: 50%;
  margin-top: -5px;
}
.zp-pop-right-start .zp-pop-arrow {
  top: 8px;
}
.zp-pop-left .zp-pop-arrow,
.zp-pop-left-start .zp-pop-arrow,
.zp-pop-left-end .zp-pop-arrow {
  right: 3px;
  border-width: 6px 0 6px 6px;
  border-left-color: #fff;
}
.zp-pop-left .zp-pop-arrow {
  top: 50%;
  margin-top: -5px;
}
.zp-pop-left-start .zp-pop-arrow {
  top: 8px;
}
.zp-pop-bottom .zp-pop-arrow,
.zp-pop-bottom-start .zp-pop-arrow,
.zp-pop-bottom-end .zp-pop-arrow {
  top: 3px;
  border-width: 0 6px 6px;
  border-bottom-color: #fff;
}
.zp-pop-bottom .zp-pop-arrow {
  left: 50%;
  margin-left: -5px;
}
.zp-pop-bottom-start .zp-pop-arrow {
  left: 16px;
}
.zp-pop-bottom-end .zp-pop-arrow {
  right: 16px;
}
.zp-pop-content {
  box-sizing: border-box;
}
.zp-pop-inner {
  min-height: 20px;
  padding: 8px 12px;
  line-height: 20px;
  text-align: justify;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
}
.zp-pop-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-color: transparent;
  border-style: solid;
}
.zp-pop-fade-enter-active,
.zp-pop-fade-leave-active {
  -ms-transition: opacity .2s ease;
  -o-transition: opacity .2s ease;
  -webkit-transition: opacity .2s ease;
  transition: opacity .2s ease;
}
.zp-pop-fade-enter,
/* .zp-pop-fade-leave, */
.zp-pop-fade-leave-active {
  opacity: 0;
}
</style>