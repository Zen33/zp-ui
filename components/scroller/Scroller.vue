<!-- Scroller -->
<template>
  <div class="zp-scroller">
    <slot v-if="nativeBar">
    </slot>
    <div v-else :class="['zp-scroller-wrap', {'zp-scroller-hidden-default': prefix.lowercase === 'webkit' }]" :style="wrapStyle" @scroll="handleScrollbar" ref="scrollerWrap">
      <div class="zp-scroller-content" ref="scrollContent">
        <slot></slot>
      </div>
    </div>
    <scrollbar v-show="scrollX" :size="width" :leeway="offsetX" orientation="h"></scrollbar>
    <scrollbar v-show="scrollY" :size="height" :leeway="offsetY"></scrollbar>
  </div>
</template>

<script>
  import Scrollbar from './Scrollbar.vue'
  import ScrollbarWidth from '../../mixins/scrollbarWidth'
  import Prefix from '../../mixins/prefix'
  const resizeEvent = require('../../utils/resize')

  export default {
    name: 'zp-scroller',
    mixins: [ScrollbarWidth, Prefix],
    props: {
      oriHeight: {
        type: [Number, String],
        default: null
      },
      nativeBar: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        width: 0,
        height: 0,
        offsetX: 0,
        offsetY: 0,
        scrollX: false,
        scrollY: false,
        observer: null,
        curHeight: this.oriHeight
      }
    },
    components: {
      Scrollbar
    },
    computed: {
      wrapStyle () {
        const style = {}
        if (this.scrollbarWidth) {
          this.prefix.lowercase !== 'webkit' && (style.marginRight = style.marginBottom = `-${this.scrollbarWidth}px`)
          style.height = this.curHeight && `${this.curHeight}px`
        }
        return style
      }
    },
    methods: {
      handleScrollbar (evt) {
        const ref = this.$refs.scrollerWrap
        this.offsetX = ref.scrollLeft * 100 / ref.clientWidth
        this.offsetY = ref.scrollTop * 100 / ref.clientHeight
        this.$emit('on-scroll', evt)
      },
      updateScrollbar () {
        const ref = this.$refs.scrollerWrap
        if (ref) {
          this.scrollX = ref.scrollWidth > ref.offsetWidth
          this.scrollY = ref.scrollHeight > ref.offsetHeight
          this.width = `${ref.clientWidth * 100 / ref.scrollWidth}%`
          this.height = `${ref.clientHeight * 100 / ref.scrollHeight}%`
        }
      }
    },
    mounted () {
      this.$refs.scrollContent && resizeEvent.addResizeListener(this.$refs.scrollContent, this.updateScrollbar)
    },
    beforeDestroy () {
      this.$refs.scrollContent && resizeEvent.removeResizeListener(this.$refs.scrollContent, this.updateScrollbar)
    }
  }
</script>
<style>
.zp-scroller {
  overflow: hidden;
  position: relative;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-transform: translateZ(0);
  -moz-transform: translateZ(0);
  -ms-transform: translateZ(0);
  -o-transform: translateZ(0);
  transform: translateZ(0);
}
.zp-scroller:active .zp-scrollbar,
.zp-scroller:focus .zp-scrollbar,
.zp-scroller:hover .zp-scrollbar {
  opacity: 1;
  -ms-transition: opacity .3s ease-out;
  -o-transition: opacity .3s ease-out;
  -webkit-transition: opacity .3s ease-out;
  transition: opacity .3 ease-out;
}
.zp-scroller-wrap {
  height: 100%;
  overflow: scroll;
}
.zp-scroller-hidden-default::-webkit-scrollbar {
  width: 0;
  height: 0;
}
</style>