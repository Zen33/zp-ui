<!-- Scrollbar -->
<template>
  <div :class="['zp-scrollbar', `zp-scrollbar-${orientation}`]" @mousedown="clickScrollbar">
    <div class="zp-scrollbar-indicator" @mousedown="clickIndicator" :style="indicatorStyle" ref="indicator">
    </div>
  </div>
</template>

<script>
  export default {
    name: 'zp-scrollbar',
    props: {
      orientation: {
        type: String,
        default: 'v' // v: vertical, h: horizontal
      },
      leeway: {
        type: [String, Number]
      },
      size: [String, Number]
    },
    data () {
      return {
        isScrolling: false
      }
    },
    computed: {
      scrollbar () {
        return (this.orientation === 'v' ? {
          offset: 'offsetHeight',
          scroll: 'scrollTop',
          scrollSize: 'scrollHeight',
          size: 'height',
          axis: 'Y',
          client: 'clientY',
          direction: 'top'
        } : {
          offset: 'offsetWidth',
          scroll: 'scrollLeft',
          scrollSize: 'scrollWidth',
          size: 'width',
          axis: 'X',
          client: 'clientX',
          direction: 'left'
        })
      },
      indicatorStyle () {
        const style = {}
        const translate = `translate${this.scrollbar.axis}(${Math.ceil(this.leeway)}%)`
        style[this.scrollbar.size] = this.size
        style.msTransform = translate
        style.oTransform = translate
        style.webkitTransform = translate
        style.mozTransform = translate
        style.transform = translate
        return style
      }
    },
    methods: {
      clickScrollbar (evt) {
        const scroller = this.$parent.$refs.scrollerWrap
        const offset = Math.abs(evt.target.getBoundingClientRect()[this.scrollbar.direction] - evt[this.scrollbar.client])
        const indicatorPosPer = (offset - this.$refs.indicator[this.scrollbar.offset] / 2) / this.$el[this.scrollbar.offset]
        scroller[this.scrollbar.scroll] = indicatorPosPer * scroller[this.scrollbar.scrollSize]
      },
      clickIndicator (evt) {
        this.isScrolling = true
        this[this.scrollbar.axis] = (evt.currentTarget[this.scrollbar.offset] - (evt[this.scrollbar.client] - evt.currentTarget.getBoundingClientRect()[this.scrollbar.direction]))
        document.body.classList.add('zp-scroll-on')
        document.addEventListener('mousemove', this.handleIndicatorMove)
        document.addEventListener('mouseup', this.handleIndicatorEnd)
      },
      setIndicator (evt) {
        const scroller = this.$parent.$refs.scrollerWrap
        const lastPos = this[this.scrollbar.axis]
        if (lastPos) {
          const offset = evt[this.scrollbar.client] - this.$el.getBoundingClientRect()[this.scrollbar.direction]
          const indicatorPosPer = (offset - (this.$refs.indicator[this.scrollbar.offset] - lastPos)) / this.$el[this.scrollbar.offset]
          scroller[this.scrollbar.scroll] = indicatorPosPer * scroller[this.scrollbar.scrollSize]
        }
      },
      handleIndicatorMove (evt) {
        this.isScrolling && this.setIndicator(evt)
      },
      handleIndicatorEnd (evt) {
        this.isScrolling = false
        this[this.scrollbar.axis] = 0
        document.body.classList.remove('zp-scroll-on')
        document.body.style.cursor = ''
        document.removeEventListener('mousemove', this.handleIndicatorMove)
        document.removeEventListener('mouseup', this.handleIndicatorEnd)
      }
    }
  }
</script>

<style>
.zp-scrollbar-indicator {
  position: relative;
  display: block;
  width: 0;
  height: 0;
  cursor: pointer;
  border-radius: inherit;
  background: rgba(0, 0, 0, .3);
  /* border: 1px solid rgba(255, 255, 255, .9); */
}
.zp-scrollbar-indicator:hover {
  background: rgba(0, 0, 0, .5);
}
.zp-scrollbar {
  position: absolute;
  right: 2px;
  bottom: 2px;
  z-index: 1;
  border-radius: 4px;
  opacity: 0;
  -ms-transition: opacity .15s ease-out;
  -o-transition: opacity .15s ease-out;
  -webkit-transition: opacity .15s ease-out;
  transition: opacity .15s ease-out;
  background: rgba(0, 0, 0, .1);
}
.zp-scrollbar.zp-scrollbar-h {
  height: 6px;
  left: 2px;
}
.zp-scrollbar.zp-scrollbar-h>div {
  height: 100%;
}
.zp-scrollbar.zp-scrollbar-v {
  width: 6px;
  top: 2px;
}
.zp-scrollbar.zp-scrollbar-v>div {
  width: 100%;
}
.zp-scroll-on {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>