<!-- Tab Indicator -->
<template>
  <div :class="['zp-tabs-indicator', `zp-tabs-indicator-${position}`]" :style="indicatorStyle"></div>
</template>

<script>
  import { domStyle } from '../../utils/dom'

  export default {
    name: 'zp-tab-indicator',
    props: {
      navs: Array,
      position: String
    },
    computed: {
      indicator () {
        return (['left', 'right'].indexOf(this.position) < 0 ? {
          size: 'width',
          axis: 'X',
          client: 'clientWidth'
        } : {
          size: 'height',
          axis: 'Y',
          client: 'clientHeight'
        })
      },
      indicatorStyle () {
        const style = {}
        let leeway = 0
        let size = 0
        let offset = 0
        let paddingLeft = 0
        let paddingRight = 0
        const len = this.navs.length
        for (let [index, nav] of this.navs.entries()) {
          const $nav = this.$parent.$refs.navs[index]
          if (!nav.active) {
            leeway += $nav[this.indicator.client]
          } else {
            size = $nav[this.indicator.client]
            if (this.$parent.horizontal && len > 1) {
              paddingLeft = parseInt(domStyle($nav, 'padding-left'), 10)
              paddingRight = parseInt(domStyle($nav, 'padding-right'), 10)
              offset = Math.max(paddingLeft, paddingRight)
              size -= (paddingLeft + paddingRight)
            }
            break
          }
        }
        if (this.$parent.horizontal && leeway !== 0) {
          leeway += offset
        }
        const translate = `translate${this.indicator.axis}(${Math.ceil(leeway)}px)`
        style[this.indicator.size] = `${size}px`
        style.msTransform = translate
        style.oTransform = translate
        style.webkitTransform = translate
        style.mozTransform = translate
        style.transform = translate
        return style
      }
    }
  }
</script>

<style>
  .zp-tabs-indicator {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    background: #4da1ff;
    -moz-transition: -moz-transform .3s cubic-bezier(.645, .045, .355, 1);
    -webkit-transition: -webkit-transform .3s cubic-bezier(.645, .045, .355, 1);
    -o-transition: -o-transform .3s cubic-bezier(.645, .045, .355, 1);
    transition: transform .3s cubic-bezier(.645, .045, .355, 1);
    z-index: 2;
  }
</style>