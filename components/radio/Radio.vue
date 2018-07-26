<!-- Radio -->
<template>
  <label :class="['zp-radio-wrapper', {'zp-radio-disabled': isDisabled}, {'zp-radio-checked': model === label}, {'zp-radio-focus': onFocus}]">
    <span class="zp-radio"></span>
    <input class="zp-radio-input" type="radio" :name="name" :disabled="isDisabled" :value="label" v-model="model" @focus="onFocus = true" @blur="onFocus = false"/>
    <slot>{{ label }}</slot>
  </label>
</template>
<script>
  export default {
    name: 'zp-radio',
    props: {
      disabled: Boolean,
      name: String,
      value: null,
      label: null
    },
    data () {
      return {
        onFocus: false
      }
    },
    computed: {
      model: {
        get () {
          return this.curVal
        },
        set (val) {
          this.inGroup ? this.dispatch('input', val) : this.$emit('input', val)
        }
      },
      inGroup () {
        return !!(this.$parent.$options.name === 'zp-radio-group')
      },
      isDisabled () {
        return this.inGroup ? this.$parent.disabled || this.disabled : this.disabled
      },
      curVal () {
        return this.inGroup ? this.$parent.value : this.value 
      }
    },
    methods: {
      dispatch (evtName, val) {
        const parent = this.$parent
        parent.$emit.call(parent, evtName, val)
      }
    }
  }
</script>

<style>
  .zp-radio-wrapper {
    cursor: pointer;
    display: inline-block;
    white-space: nowrap;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .zp-radio-input {
    opacity: 0;
    outline: none;
    position: absolute;
    margin: 0;
    width: 0;
    height: 0;
    left: -999px;
  }
  .zp-radio {
    display: inline-block;
    vertical-align: bottom;
    position: relative;
    width: 12px;
    height: 12px;
    border: 1px solid #bdbdbd;
    border-radius: 50%;
    -moz-transition: all .2s ease-in-out;
    -webkit-transition: all .2s ease-in-out;
    -o-transition: all .2s ease-in-out;
    transition: all .2s ease-in-out;
  }
  .zp-radio-checked .zp-radio {
    border-color: #4da1ff;
    background: #4da1ff;
  }
  .zp-radio-checked .zp-radio:before {
    content: '';
    display: table;
    width: 12px;
    height: 12px;
    position: absolute;
    border-top: 0;
    border-left: 0;
    border-radius: 6px;
    background-color: #fff;
  }
  .zp-radio-checked .zp-radio:after {
    content: '';
    display: table;
    width: 8px;
    height: 8px;
    position: absolute;
    top: 2px;
    left: 2px;
    border-top: 0;
    border-left: 0;
    border-radius: 6px;
    background-color: #4da1ff;
  }
  .zp-radio-focus .zp-radio {
    border-color: #4da1ff;
  }
  .zp-radio-disabled {
    cursor: not-allowed;
    color: #ccc;
  }
  .zp-radio-disabled .zp-radio {
    border-color: #ccc;
    background: #fafafa;
  }
  .zp-radio-disabled .zp-radio:after {
    border-color: #ccc;
    background: #ddd;
  }
</style>