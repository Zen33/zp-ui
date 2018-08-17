<!-- Tag -->
<template>
  <transition name="zp-tag-fade">
    <span :class="['zp-tag', type ? `zp-tag-${type}` : '']">
      <slot></slot>
      <i class="zp-close-icon" v-if="closable" @click.stop="handleClose"></i>
    </span>
  </transition>
</template>
<script>
  export default {
    name: 'zp-tag',
    props: {
      text: String,
      closable: Boolean,
      type: String
    },
    methods: {
      handleClose (evt) {
        this.$emit('close', evt)
      }
    }
  }
</script>

<style>
  .zp-tag-fade-enter-active,
  .zp-tag-fade-leave-active {
    -moz-transition: all 0.2s ease-in;
    -webkit-transition: all 0.2s ease-in;
    -o-transition: all 0.2s ease-in;
    transition: all 0.2s ease-in;
  }
  .zp-tag-fade-enter,
  .zp-tag-fade-leave-active {
    opacity: 0;
  }
  .zp-tag .zp-close-icon {
    position: relative;
    display: inline-block;
    width: 10px;
    height: 16px;
    line-height: 16px;
    vertical-align: middle;
    right: -5px;
    top: -1px;
    cursor: pointer;
  }
  .zp-tag .zp-close-icon:before,
  .zp-tag .zp-close-icon:after {
    content: '';
    position: absolute;
    height: 1px;
    width: 10px;
    top: 50%;
    right: 0;
    margin-top: -1px;
    background: #4da1ff;
  }
  .zp-tag {
    position: relative;
    background: rgba(77, 161, 255, .1);
    display: inline-block;
    padding: 0 10px;
    height: 25px;
    line-height: 23px;
    font-size: 12px;
    color: #4da1ff;
    border-radius: 4px;
    box-sizing: border-box;
    border: 1px solid rgba(77, 161, 255, .2);
    white-space: nowrap;
  }
  .zp-tag-success {
    background: rgba(0, 200, 83, .1);
    border: 1px solid rgba(0, 200, 83, .2);
    color: #00c853;
  }
  .zp-tag-success .zp-close-icon:before,
  .zp-tag-success .zp-close-icon:after {
    background: #00c853;
  }
  .zp-tag-warning {
    background: rgba(255, 171, 0, .1);
    border: 1px solid rgba(255, 171, 0, .2);
    color: #ffab00;
  }
  .zp-tag-warning .zp-close-icon:before,
  .zp-tag-warning .zp-close-icon:after {
    background: #ffab00;
  }
  .zp-tag-error {
    background: rgba(221, 44, 0, .1);
    border: 1px solid rgba(221, 44, 0, .2);
    color: #dd2c00;
  }
  .zp-tag-error .zp-close-icon:before,
  .zp-tag-error .zp-close-icon:after {
    background: #dd2c00;
  }
  .zp-tag .zp-close-icon:before {
    -moz-transform: rotate(45deg);
    -webkit-transform: rotate(45deg);
    /* -ms-transform: rotate(45deg); */
    -o-transform: rotate(45deg);
    transform: rotate(45deg);
  }
  .zp-tag .zp-close-icon:after {
    -moz-transform: rotate(-45deg);
    -webkit-transform: rotate(-45deg);
    /* -ms-transform: rotate(-45deg); */
    -o-transform: rotate(-45deg);
    transform: rotate(-45deg);
  }
</style>