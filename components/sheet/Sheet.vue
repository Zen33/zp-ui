<!-- Sheet -->
<template>
  <transition name="zp-sheet">
    <div class="zp-sheet-mask" v-show="visible" :style="{'z-index': zIndex}" @click="checkClose($event)">
      <div :class="['zp-sheet-wrapper', `zp-sheet-${placement}`]">
        <slot></slot>
      </div>
    </div>
  </transition>
</template>

<script>
import MaxZIndex from '../../mixins/zIndex'
import ClosestElement from '../../mixins/closestElement'

export default {
  name: 'zp-sheet',
  mixins: [MaxZIndex, ClosestElement],
  props: {
    visible: Boolean,
    placement: {
      type: String,
      default: 'bottom'
    }
  },
  methods: {
    closeSheet () {
      this.$emit('update:visible', false)
    },
    checkClose (evt) {
      !this.getClosest(evt.target, '.zp-sheet-wrapper') && this.closeSheet()
    }
  }
}
</script>

<style>
.zp-sheet-mask {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, .5);
}
.zp-sheet-wrapper {
  position: fixed;
  background-color: rgba(255, 255, 255, .9);
  -moz-backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  -o-backface-visibility: hidden;
  backface-visibility: hidden;
}
.zp-sheet-top {
  width: 100%;
  top: 0;
  left: 0;
}
.zp-sheet-right {
  height: 100%;
  top: 0;
  right: 0;
}
.zp-sheet-bottom {
  width: 100%;
  left: 0;
  bottom: 0;
}
.zp-sheet-left {
  height: 100%;
  top: 0;
  left: 0;
}
.zp-sheet-wrapper,
.zp-sheet-enter-active,
.zp-sheet-leave-active {
  -moz-transition: all .3s ease;
  -webkit-transition: all .3s ease;
  -o-transition: all .3s ease;
  transition: all .3s ease;
}
.zp-sheet-enter .zp-sheet-top,
.zp-sheet-leave-to .zp-sheet-top {
  -moz-transform: translate3d(0, -100%, 0);
  -webkit-transform: translate3d(0, -100%, 0);
  -o-transform: translate3d(0, -100%, 0);
  transform: translate3d(0, -100%, 0);
}
.zp-sheet-enter .zp-sheet-right,
.zp-sheet-leave-to .zp-sheet-right {
  -moz-transform: translate3d(100%, 0, 0);
  -webkit-transform: translate3d(100%, 0, 0);
  -o-transform: translate3d(100%, 0, 0);
  transform: translate3d(100%, 0, 0);
}
.zp-sheet-enter .zp-sheet-bottom,
.zp-sheet-leave-to .zp-sheet-bottom {
  -moz-transform: translate3d(0, 100%, 0);
  -webkit-transform: translate3d(0, 100%, 0);
  -o-transform: translate3d(0, 100%, 0);
  transform: translate3d(0, 100%, 0);
}
.zp-sheet-enter .zp-sheet-left,
.zp-sheet-leave-to .zp-sheet-left {
  -moz-transform: translate3d(-100%, 0, 0);
  -webkit-transform: translate3d(-100%, 0, 0);
  -o-transform: translate3d(-100%, 0, 0);
  transform: translate3d(-100%, 0, 0);
}
</style>