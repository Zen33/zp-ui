<!-- Loader -->
<template>
  <transition name="zp-loader">
    <div v-show="visible" :class="['zp-loader-mask', {'zp-loader-full': fullscreen}, {'zp-loader-service': mode !== 'directive'}]" :style="{'z-index': zIndex, 'background-color': background}">
      <div class="zp-loader-hint">
        <div class="zp-loader-spinner"></div>
        <div v-if="text" class="zp-loader-text">{{ text }}</div>
      </div>
    </div>
  </transition>
</template>

<script>
  import MaxZIndex from '../../mixins/zIndex'
  export default {
    mixins: [MaxZIndex],
    data() {
      return {
        visible: false,
        fullscreen: true,
        text: null,
        background: null,
        mode: 'directive'
      }
    },
    methods: {
      updateText (text) {
        this.text = text
      }
    }
  }
</script>

<style>
  .zp-loader-enter,
  .zp-loader-leave-active {
    opacity: 0
  }
  .zp-loader-mask {
    position: absolute;
    background-color: rgba(255, 255, 255, .9);
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    -moz-transition: all .3s;
    -webkit-transition: all .3s;
    -o-transition: all .3s;
    transition: all .3s;
  }
  .zp-loader-full {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
  .zp-loader-hint {
    position: relative;
    width: 100px;
    min-height: 31px;
    top: 50.1%;
    left: 50%;
    -moz-transform: translate3d(-50%, calc(-50% + 0.5px), 0);
    -webkit-transform: translate3d(-50%, calc(-50% + 0.5px), 0);
    -o-transform: translate3d(-50%, calc(-50% + 0.5px), 0);
    transform: translate3d(-50%, calc(-50% + 0.5px), 0);
  }
  .zp-loader-spinner {
    height: 30px;
    margin-left: 35px;
  }
  .zp-loader-spinner:before {
    content: '';
    box-sizing: border-box;
    position: absolute;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 2px solid #ccc;
    border-top-color: #54a5ff;
    animation: spin .6s linear infinite;
  }
  @-moz-keyframes spin {
    from {
      -moz-transform: rotate(0deg);
    }
    to { 
      -moz-transform: rotate(360deg);
    }
  }
  @-webkit-keyframes spin {
    from {
      -webkit-transform: rotate(0deg);
    }
    to {
      -webkit-transform: rotate(360deg);
    }
  }
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  .zp-loader-text {
    text-align: center;
    width: 100px;
    height: 25px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    font-size: 12px;
    line-height: 25px;
  }
</style>
