<!-- Carousel Item  -->
<template>  
  <div v-show="landing" :class="['zp-cal-item', {'zp-cal-item-active': active}]" :style="itemStyle">
    <slot></slot>
  </div>
</template>

<script>
  export default {
    name: 'zp-carousel-item',
    props: {
      label: {
        type: [String, Number],
        default: ''
      }
    },
    data () {
      return {
        landing: false,
        translate: 0,
        active: false,
        highlight: false
      }
    },
    computed: {
      itemStyle () {
        const style = {}
        const translate = `translateX(${this.translate}px)`
        style.msTransform = translate
        style.oTransform = translate
        style.webkitTransform = translate
        style.mozTransform = translate
        style.transform = translate
        style.zIndex = this.highlight ? 1 : 0
        return style
      }
    },
    methods: {
      setIndex (index, curIndex, len) {
        if (!curIndex && index === len - 1) {
          return -1
        } else if (!index && curIndex === len - 1) {
          return len
        } else if (index < curIndex - 1 && curIndex - index >= len / 2) {
          return len + 1
        } else if (index > curIndex + 1 && index - curIndex >= len / 2) {
          return -2
        }
        return index
      },
      translateItem (index, curIndex, oriIndex) {
        const parentWidth = this.$parent.$el.offsetWidth
        const len = this.$parent.items.length
        typeof oriIndex !== 'undefined' && (this.active = index === curIndex || index === oriIndex)
        index !== curIndex && len > 2 && (index = this.setIndex(index, curIndex, len))
        this.highlight = index === curIndex
        this.translate = parentWidth * (index - curIndex)
        this.landing = true
      }
    }
  }
</script>
<style>
.zp-cal-item {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  overflow: hidden;
  z-index: 0;
}
.zp-cal-item-active {
  -moz-transition: all .3s ease-in-out;
  -webkit-transition: all .3s ease-in-out;
  -o-transition: all .3s ease-in-out;
  transition: all .3s ease-in-out;
}
</style>