<!-- Checkbox -->
<template>
  <label :class="['zp-checkbox-wrapper', {'zp-checkbox-disabled': disabled}, {'zp-checkbox-checked': isChecked}, {'zp-checkbox-focus': onFocus}]">
    <span class="zp-checkbox"></span>
    <input class="zp-checkbox-input" type="checkbox" :name="name" :disabled="disabled" :value="label" v-model="model" @change="action" @focus="onFocus = true" @blur="onFocus = false"/>
    <slot>{{ label }}</slot>
  </label>
</template>
<script>
  export default {
    name: 'zp-checkbox',
    props: {
      disabled: Boolean,
      checked: Boolean,
      name: String,
      value: null,
      label: null
    },
    data() {
      return {
        onFocus: false
      }
    },
    created () {
      this.checked && this.decorate()
    },
    computed: {
      model: {
        get () {
          return this.curVal || false
        },
        set (val) {
          this.inGroup ? this.dispatch('input', val) : this.$emit('input', val)
        }
      },
      inGroup () {
        return !!(this.$parent.$options.name === 'zp-checkbox-group')
      },
      isChecked () {
        if (typeof this.model === typeof true) {
          return this.model
        } else if (Array.isArray(this.model)) {
          return this.model.includes(this.label)
        }
      },
      curVal () {
        return this.inGroup ? this.$parent.value : this.value 
      }
    },
    methods: {
      decorate () {
        if (Array.isArray(this.model) && !this.model.includes(this.label)) {
          this.model.push(this.label)
        } else {
          this.model = true
        }
      },
      dispatch (evtName, val) {
        const parent = this.$parent
        parent.$emit.call(parent, evtName, val)
      },
      action (evt) {
        this.$emit('change', evt)
        this.inGroup && this.$nextTick(() => {
          this.dispatch('change', this.curVal)
        })
      }
    }
  }
</script>

<style>
  .zp-checkbox-wrapper {
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
  .zp-checkbox-input {
    opacity: 0;
    outline: none;
    position: absolute;
    margin: 0;
    width: 0;
    height: 0;
    left: -999px;
  }
  .zp-checkbox {
    display: inline-block;
    vertical-align: bottom;
    position: relative;
    width: 12px;
    height: 12px;
    border: 1px solid #bdbdbd;
    border-radius: 3px;
    -moz-transition: border-color .2s ease-in-out, background-color .2s ease-in-out, box-shadow .2s ease-in-out;
    -webkit-transition: border-color .2s ease-in-out, background-color .2s ease-in-out, box-shadow .2s ease-in-out;
    -o-transition: border-color .2s ease-in-out, background-color .2s ease-in-out, box-shadow .2s ease-in-out;
    transition: border-color .2s ease-in-out, background-color .2s ease-in-out, box-shadow .2s ease-in-out;
  }
  .zp-checkbox-checked .zp-checkbox {
    border-color: #4da1ff;
    background: #4da1ff;
  }
  .zp-checkbox-checked .zp-checkbox:after {
    content: '';
    display: table;
    width: 4px;
    height: 6px;
    position: absolute;
    top: 1px;
    left: 3px;
    border: 2px solid #fff;
    border-top: 0;
    border-left: 0;
    -moz-transform: rotate(45deg) scale(1);
    -webkit-transform: rotate(45deg) scale(1);
    -o-transform: rotate(45deg) scale(1);
    transform: rotate(45deg) scale(1);
    -moz-transition: all .2s ease-in-out;
    -webkit-transition: all .2s ease-in-out;
    -o-transition: all .2s ease-in-out;
    transition: all .2s ease-in-out;
  }
  .zp-checkbox-focus .zp-checkbox {
    border-color: #4da1ff;
  }
  .zp-checkbox-disabled {
    cursor: not-allowed;
    color: #ccc;
  }
  .zp-checkbox-disabled .zp-checkbox {
    border-color: #ccc;
    background: #fafafa;
  }
  .zp-checkbox-disabled .zp-checkbox:after {
    border-color: #ccc;
  }
</style>