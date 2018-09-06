<!-- Tabs -->
<template>
  <div :class="['zp-tabs', `zp-tabs-${position}`]">
    <div :class="['zp-tabs-nav-container', {'zp-tabs-nav-scrollable': navScrollable}]">
      <i v-if="navScrollable" class="zp-tabs-nav-prev" @click="scrollPrev"></i>
      <i v-if="navScrollable" class="zp-tabs-nav-next" @click="scrollNext"></i>
      <div class="zp-tabs-nav-wrapper" ref="navWrap">
        <div :class="['zp-tabs-nav', `zp-tabs-nav-${position}`]" :style="navStyle" ref="nav">
          <zp-tab-indicator :navs="navs" :position="position" />
          <div :class="['zp-tabs-nav-item', {'zp-tabs-active': nav.active}]" v-for="(nav, i) in navs" :key="i" @click="handleTabClick($event, nav)" ref="navs">
            {{ nav.label }}
          </div>
        </div>
      </div>
    </div>
    <div class="zp-tabs-pane-wrapper">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  import ZpTabIndicator from './TabIndicator.vue'
  import resizeEvent from '../../utils/resize'

  export default {
    name: 'zp-tabs',
    value: {},
    props: {
      activeName: String,
      position: {
        type: String,
        default: 'top'
      }
    },
    components: {
      ZpTabIndicator
    },
    data () {
      return {
        tabName: this.activeName,
        navs: [],
        navOffset: 0,
        navScrollable: false
      }
    },
    computed: {
      horizontal () {
        return ['left', 'right'].indexOf(this.position) < 0
      },
      navStyle () {
        const style = {}
        const axis = this.horizontal ? 'X' : 'Y'
        const translate = `translate${axis}(-${this.navOffset}px)`
        style.msTransform = translate
        style.oTransform = translate
        style.webkitTransform = translate
        style.mozTransform = translate
        style.transform = translate
        return style
      },
      offsetSize () {
        return this.horizontal ? 'offsetWidth' : 'offsetHeight'
      },
      panes () {
        return this.$children.filter(pane => pane.$options.name === 'zp-tab-pane')
      }
    },
    methods: {
      handleTabClick (evt, tab) {
        this.setTabName(tab)
        this.$emit('change', evt, tab)
      },
      scrollPrev () {
        const wrapSize = this.$refs.navWrap[this.offsetSize]
        if (this.navOffset) {
          const offset = this.navOffset > wrapSize ? this.navOffset - wrapSize : 0
          this.navOffset = offset
        }
      },
      scrollNext () {
        const navSize = this.$refs.nav[this.offsetSize]
        const wrapSize = this.$refs.navWrap[this.offsetSize]
        if (navSize - this.navOffset > wrapSize) {
          const offset = navSize - this.navOffset > this.navOffset * 2 ? this.navOffset + wrapSize : (navSize - wrapSize)
          this.navOffset = offset
        }
      },
      scrollToActiveTab () {
        const getRefsRect = refs => {
          const rect = {}
          Object.keys(refs).forEach(ref => {
            rect[`${ref}Rect`] = refs[ref].getBoundingClientRect()
          })
          return rect
        }
        if (this.navScrollable) {
          const refs = {}
          refs.nav = this.$refs.nav
          refs.activeNav = refs.nav.querySelector('.zp-tabs-active')
          if (refs.activeNav) {
            refs.navWrap = this.$refs.navWrap
            const { navRect, activeNavRect, navWrapRect } = getRefsRect(refs)
            let leeway = this.navOffset
            if (this.horizontal) {
              if (activeNavRect.left < navWrapRect.left) {
                leeway = this.navOffset - (navWrapRect.left - activeNavRect.left)
              }
              if (activeNavRect.right > navWrapRect.right) {
                leeway = this.navOffset + activeNavRect.right - navWrapRect.right
              }
              if (navRect.right < navWrapRect.right) {
                leeway = refs.nav.offsetWidth - navWrapRect.width
              }
            } else {
              if (activeNavRect.top < navWrapRect.top) {
                leeway = this.navOffset - (navWrapRect.left - activeNavRect.left)
              }
              if (activeNavRect.bottom > navWrapRect.bottom) {
                leeway = this.navOffset + activeNavRect.bottom - navWrapRect.bottom
              }
              if (navRect.bottom < navWrapRect.bottom) {
                leeway = refs.nav.offsetHeight - navWrapRect.height
              }
            }
            this.navOffset = Math.max(leeway, 0)
          }
        }
      },
      setTabName (tab) {
        this.tabName = tab.hasOwnProperty('name') ? tab.name : tab
        this.updateNavs(true)
      },
      updateNavs (force = false) {
        this.navs = []
        for (let [index, pane] of this.panes.entries()) {
          if (!pane.hasOwnProperty('name')) {
            pane.index = index
          }
          if (!index && typeof this.tabName === 'undefined') {
            this.tabName = pane.paneName
          }
          this.navs.push({
            label: pane.label,
            name: pane.paneName,
            active: pane.active
          })
        }
        force && setTimeout(this.scrollToActiveTab, 0)
      },
      updateNavScroll (force = true) {
        const navSize = this.$refs.nav[this.offsetSize]
        const wrapSize = this.$refs.navWrap[this.offsetSize]
        if (wrapSize < navSize) {
          this.navScrollable = true
          if (navSize - this.navOffset < wrapSize) {
            this.navOffset = navSize - wrapSize
          }
        } else {
          this.navScrollable = false
          this.navOffset > 0 && (this.navOffset = 0)
        }
        force && setTimeout(this.scrollToActiveTab, 0)
      }
    },
    updated () {
      this.updateNavScroll(false)
    },
    mounted () {
      this.updateNavs()
      resizeEvent.addResizeListener(this.$el, this.updateNavScroll)
    },
    beforeDestroy () {
      resizeEvent.removeResizeListener(this.$el, this.updateNavScroll)
    },
    watch: {
      activeName (val) {
        this.setTabName(val)
      },
      value (val) {
        this.setTabName(val)
      }
    }
  }
</script>

<style>
  .zp-tabs-bottom {
    display: -webkit-box;
    display: -moz-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: vertical;
    -moz-box-orient: vertical;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
    /* optional */
    /* -webkit-box-align: start;
    -moz-box-align: start;
    -ms-flex-align: start;
    -webkit-align-items: flex-start;
    align-items: flex-start; */
  }
  .zp-tabs-bottom .zp-tabs-nav-container {
    -webkit-box-ordinal-group: 2;
    -moz-box-ordinal-group: 2;
    -ms-flex-order: 2;
    -webkit-order: 2;
    order: 2;
    width: -webkit-calc(100% - 40px);
    width: -moz-calc(100% - 40px);
    width: calc(100% - 40px);
  }
  .zp-tabs-bottom .zp-tabs-pane-wrapper {
    -webkit-box-ordinal-group: 1;
    -moz-box-ordinal-group: 1;
    -ms-flex-order: 1;
    -webkit-order: 1;
    order: 1;
  }
  .zp-tabs .zp-tabs-nav-container,
  .zp-tabs .zp-tabs-pane-wrapper,
  .zp-tabs .zp-tabs-nav-wrapper {
    position: relative;
    overflow: hidden;
  }
  .zp-tabs .zp-tabs-active {
    color: #4da1ff;
  }
  .zp-tabs-top .zp-tabs-pane-wrapper,
  .zp-tabs-bottom .zp-tabs-pane-wrapper {
    min-height: 154px;
  }
  .zp-tabs .zp-tabs-nav-scrollable {
    padding: 0 20px;
  }
  .zp-tabs .zp-tabs-nav-container {
    margin-bottom: 10px;
  }
  .zp-tabs .zp-tabs-nav-container:before {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 2px;
    background: #ededed;
    z-index: 0;
  }
  .zp-tabs .zp-tabs-nav {
    white-space: nowrap;
    position: relative;
    -moz-transition: -moz-transform .3s;
    -webkit-transition: -webkit-transform .3s;
    -o-transition: -o-transform .3s;
    transition: transform .3s;
    float: left;
    cursor: pointer;
  }
  .zp-tabs .zp-tabs-nav-item {
    position: relative;
    padding: 0 20px;
    height: 36px;
    box-sizing: border-box;
    line-height: 36px;
    display: inline-block;
    font-size: 12px;
  }
  .zp-tabs-top .zp-tabs-nav :nth-child(2),
  .zp-tabs-bottom .zp-tabs-nav :nth-child(2) {
    padding-left: 0;
  }
  .zp-tabs-top .zp-tabs-nav-item:last-child,
  .zp-tabs-bottom .zp-tabs-nav-item:last-child {
    padding-right: 0;
  }
  .zp-tabs .zp-tabs-nav-prev,
  .zp-tabs .zp-tabs-nav-next {
    position: absolute;
    cursor: pointer;
    z-index: 3;
    width: 6px;
    height: 36px;
  }
  .zp-tabs .zp-tabs-nav-prev {
    left: 0;
  }
  .zp-tabs .zp-tabs-nav-next {
    right: 0;
  }
  .zp-tabs .zp-tabs-nav-prev:after {
    content: '';
    position: absolute;
    top: 14px;
    left: 2px;
    width: 6px;
    height: 6px;
    font-size: 20px;
    border-right: 1px solid #ccc;
    border-top: 1px solid #ccc;
    -moz-transform: rotate(225deg);
    -webkit-transform: rotate(225deg);
    -o-transform: rotate(225deg);
    transform: rotate(225deg);
  }
  .zp-tabs .zp-tabs-nav-next:after {
    content: '';
    position: absolute;
    top: 14px;
    left: -2px;
    width: 6px;
    height: 6px;
    font-size: 20px;
    border-right: 1px solid #ccc;
    border-top: 1px solid #ccc;
    -moz-transform: rotate(45deg);
    -webkit-transform: rotate(45deg);
    -o-transform: rotate(45deg);
    transform: rotate(45deg);
  }
  .zp-tabs-left,
  .zp-tabs-right {
    overflow: hidden;
    height: 200px;
  }
  .zp-tabs-left .zp-tabs-nav-item {
    text-align: right;
  }
  .zp-tabs-left .zp-tabs-nav-container {
    float: left;
    margin-bottom: 0;
    margin-right: 10px;
    height: 180px;
  }
  .zp-tabs-right .zp-tabs-nav-container {
    float: right;
    margin-bottom: 0;
    margin-left: 10px;
    height: 180px;
  }
  .zp-tabs-bottom .zp-tabs-nav-container {
    margin-bottom: 0;
    margin-top: 10px;
  }
  .zp-tabs-left .zp-tabs-nav-left {
    margin-right: -1px;
    margin-bottom: 0;
  }
  .zp-tabs-right .zp-tabs-nav-right {
    margin-left: -1px;
    margin-bottom: 0;
  }
  .zp-tabs-left .zp-tabs-indicator-left,
  .zp-tabs-right .zp-tabs-indicator-right {
    float: none;
  }
  .zp-tabs-left .zp-tabs-nav-item,
  .zp-tabs-right .zp-tabs-nav-item {
    display: block;
  }
  .zp-tabs-left .zp-tabs-nav-container:before {
    height: 100%;
    width: 2px;
    bottom: auto;
    top: 0;
    left: auto;
    right: 0;
  }
  .zp-tabs-right .zp-tabs-nav-container:before {
    height: 100%;
    width: 2px;
    bottom: auto;
    top: 0;
    left: 0;
    right: auto;
  }
  .zp-tabs-left .zp-tabs-indicator-left,
  .zp-tabs-right .zp-tabs-indicator-right {
    top: 0;
    bottom: auto;
    width: 3px;
  }
  .zp-tabs-left .zp-tabs-indicator-left {
    left: auto;
    right: 0;
  }
  .zp-tabs-left .zp-tabs-nav-wrapper,
  .zp-tabs-right .zp-tabs-nav-wrapper {
    height: 100%;
  }
  .zp-tabs-left .zp-tabs-nav-scrollable,
  .zp-tabs-right .zp-tabs-nav-scrollable {
    padding: 10px 0;
  }
  .zp-tabs-left .zp-tabs-nav-prev,
  .zp-tabs-left .zp-tabs-nav-next,
  .zp-tabs-right .zp-tabs-nav-prev,
  .zp-tabs-right .zp-tabs-nav-next {
    left: 50%;
    margin-left: -3px;
    width: 6px;
    height: 6px;
  }
  .zp-tabs-left .zp-tabs-nav-prev,
  .zp-tabs-right .zp-tabs-nav-prev {
    top: 0;
  }
  .zp-tabs-left .zp-tabs-nav-next,
  .zp-tabs-right .zp-tabs-nav-next {
    bottom: 20px;
  }
  .zp-tabs-left .zp-tabs-nav-prev:after,
  .zp-tabs-right .zp-tabs-nav-prev:after {
    -moz-transform: rotate(-45deg);
    -webkit-transform: rotate(-45deg);
    -o-transform: rotate(-45deg);
    transform: rotate(-45deg);
    left: 0;
    top: 2px;
  }
  .zp-tabs-left .zp-tabs-nav-next:after,
  .zp-tabs-right .zp-tabs-nav-next:after {
    -moz-transform: rotate(135deg);
    -webkit-transform: rotate(135deg);
    -o-transform: rotate(135deg);
    transform: rotate(135deg);
    left: 0;
  }
</style>