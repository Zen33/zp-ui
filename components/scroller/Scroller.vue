<!-- Scroller -->
<template>
  <div class="zp-scroller">
    <slot v-if="nativeBar">
    </slot>
    <div v-else class="zp-scroller-wrap zp-scroller-hidden-default" :style="wrapStyle" @scroll="handleScrollbar" ref="scrollerWrap">
      <div class="zp-scroller-content" ref="scrollContent">
        <slot></slot>
      </div>
    </div>
    <scrollbar v-show="overflowX" :size="width" :offset="offsetX" orientation="h"></scrollbar>
    <scrollbar v-show="overflowY" :size="height" :offset="offsetY"></scrollbar>
  </div>
</template>

<script>
  import Scrollbar from './Scrollbar.vue'
  import ScrollbarWidth from '../../mixins/scrollbarWidth'
  import resizeEvent from '../../utils/resize'

  export default {
    name: 'zp-scroller',
    mixins: [ScrollbarWidth],
    props: {
      oriHeight: {
        type: [Number, String],
        default: null
      },
      nativeBar: {
        type: Boolean,
        default: false
      },
      noresize: {
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
        overflowX: false,
        overflowY: false
      }
    },
    components: {
      Scrollbar
    },
    computed: {
      wrapStyle () {
        const style = {}
        const scrollBarWidth = this.getScrollbarWidth('zp-scroller-hidden-default')
        style.height = this.oriHeight && `${this.oriHeight}px`
        if (scrollBarWidth) {
          style.marginRight = style.marginBottom = `-${scrollBarWidth}px`
          style.height = `calc(100% + ${scrollBarWidth}px)`
        }
        !style.height && (style.height = '100%')
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
          this.overflowX = ref.scrollWidth > ref.offsetWidth
          this.overflowY = ref.scrollHeight > ref.offsetHeight
          this.width = `${ref.clientWidth * 100 / ref.scrollWidth}%`
          this.height = `${ref.clientHeight * 100 / ref.scrollHeight}%`
        }
      }
    },
    mounted () {
      !this.noresize && this.$refs.scrollContent && resizeEvent.addResizeListener(this.$refs.scrollContent, this.updateScrollbar)
    },
    beforeDestroy () {
      !this.noresize && this.$refs.scrollContent && resizeEvent.removeResizeListener(this.$refs.scrollContent, this.updateScrollbar)
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