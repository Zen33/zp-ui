<!-- Switch -->
<template>
  <label :class="['zp-switch-wrapper', {'zp-switch-disabled': disabled}]" :style="{width: `${width}px`, height: `${height}px`, background: model ? onColor : offColor, 'border-color': model ? onColor : offColor, 'border-radius': `${height}px`}">
    <span ref="switchSelf" class="zp-switch" :style="switchStyle"></span>
    <input class="zp-switch-input" type="checkbox" :disabled="disabled" v-model="model"/>
    <span v-if="model" class="zp-switch-text" :style="textAlign">{{ onText }}</span>
    <span v-else class="zp-switch-text zp-switch-text-off" :style="textAlign">{{ offText }}</span>
  </label>
</template>
<script>
  export default {
    name: 'zp-switch',
    props: {
      disabled: Boolean,
      value: null,
      width: {
        type: [Number, String],
        default: 40
      },
      height: {
        type: [Number, String],
        default: 16
      },
      onText: {
        type: String,
        default: ''
      },
      offText: {
        type: String,
        default: ''
      },
      onColor: {
        type: String,
        default: '#4da1ff'
      },
      offColor: {
        type: String,
        default: '#ccc'
      }
    },
    computed: {
      model: {
        get () {
          return this.value || false
        },
        set (val) {
          this.$emit('input', val)
        }
      },
      switchStyle () {
        return `left: ${this.switchLeft};width: ${this.height - 2}px;height: ${this.height - 2}px;border-radius: ${this.height}px`
      },
      textAlign () {
        return this.model ? `left: 3px;line-height: ${this.height}px` : `right: 3px;line-height: ${this.height}px`
      },
      switchLeft () {
        return this.model ? `${this.width - this.height + 1}px` : '1px'
      }
    }
  }
</script>

<style>
  .zp-switch-wrapper {
    position: relative;
    cursor: pointer;
    display: inline-block;
    white-space: nowrap;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    border: 1px solid #ccc;
    vertical-align: middle;
  }
  .zp-switch-input {
    display: none;
  }
  .zp-switch {
    position: absolute;
    display: inline-block;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #fff;
    top: 1px;
    cursor: pointer;
    -moz-transition: left .1s ease-in-out, background-color ease-in-out;
    -webkit-transition: left .1s ease-in-out, background-color ease-in-out;
    -o-transition: left .1s ease-in-out, background-color ease-in-out;
    transition: left .1s ease-in-out, background-color ease-in-out;
  }
  .zp-switch-disabled {
    cursor: not-allowed;
    background: #ccc!important;
    border-color: #ccc!important;
    color: #ccc;
  }
  .zp-switch-disabled .zp-switch {
    cursor: not-allowed;
    background: #fff;
  }
  .zp-switch-text {
    position: absolute;
    color: #fff;
    width: 30px;
    text-overflow: ellipsis;
    text-transform: uppercase;
    font-size: 12px;
    overflow: hidden;
    white-space: nowrap;
  }
  .zp-switch-disabled .zp-switch-text-on,
  .zp-switch-disabled .zp-switch-text-off {
    color: #fff;
  }
</style>