<!-- Picker -->
<template>
  <div class="zp-picker">
    <slot></slot>
    <div class="zp-picker-items">
      <zp-picker-items
        v-for="(item, index) in items"
        v-model="values[index]"
        :key="index"
        :values="item.values"
        :row-number="rowNumber"
        :height="rowHeight"
        :item-index="index"
        :mask="mask"
        :value-key="valueKey"
        :align="item.align"
        :separator="item.separator"
        @change="handleChange"
      />
    </div>
  </div>
</template>

<script>
  import ZpPickerItems from './PickerItem.vue'

  export default {
    name: 'zp-picker',
    props: {
      value: Array,
      items: {
        type: Array,
        default: () => []
      },
      rowNumber: {
        type: Number,
        default: 5
      },
      rowHeight: {
        type: Number,
        default: 40
      },
      mask: {
        type: Boolean,
        default: true
      },
      separator: String,
      valueKey: String
    },
    components: {
      ZpPickerItems
    },
    computed: {
      values () {
        let values = []
        if (typeof this.value !== 'undefined') {
          if (Array.isArray(this.value)) {
            values = this.value
          } else {
            return [this.value]
          }
        }
        const len = this.items.length - values.length
        for (let i = values.length; i < len; i++) {
          values.push(this.items[i][0])
        }
        return values
      }
    },
    methods: {
      handleChange (val, index) {
        this.$emit('input', this.getValues())
        this.$emit('change', val, index)
      },
      getItem (index = 0) {
        const children = this.$children.filter(child => child.$options.name === 'zp-picker-item')
        for (let [i, child] of children.entries()) {
          if (i === index) {
            return child
          }
        }
        return null
      },
      getItemValue (index = 0) {
        const item = this.getItem(index)
        return item ? item.curVal : null
      },
      getItemValues (index = 0) {
        const item = this.getItem(index)
        return item ? item.curVals : []
      },
      getValues () {
        return this.items.map((item, i) => this.getItemValue(i))
      },
      setItemValue (index = 0, val) {
        const item = this.getItem(index)
        item && (item.curVal = val)
      },
      setItemValues (index, vals) {
        const item = this.getItem(index)
        item && (item.curVals = vals)
      }
    }
  }
</script>

<style>
  .zp-picker {
    overflow: hidden;
  }
  .zp-picker .zp-picker-items {
    position: relative;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    justify-content: center;
    font-size: 24px;
  }
  .zp-picker .zp-picker-items:before {
    content: '';
    position: absolute;
    top: 50%;
    margin-top: -20px;
    height: 40px;
    z-index: 0;
    left: 0;
    right: 0;
    box-sizing: border-box;
    text-align: left;
    border-top: 1px solid #dedede;
    border-bottom: 1px solid #dedede;
    pointer-events: none;
  }
</style>