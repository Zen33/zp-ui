<!-- Almanac Picker -->
<template>
  <div>
    <div class="zp-almanac-picker" ref="picker">
      <zp-almanac-select v-model="value" :id="curId" ref="pickerItem"
        :format="format"
        :width="width"
        :disabledDate="disabledDate"
        :selectedDate="ranges"
        :startPlaceholder="startPlaceholder"
        :endPlaceholder="endPlaceholder"
        :rangeSeparator="rangeSeparator"
        :bus="bus"
        :disabled="disabled"
        :clearable="clearable"
      />
    </div>
    <button class="prime" @click="addSelect">{{ addSelectText }}</button>
  </div>
</template>

<script>
  import Vue from 'vue'
  import ZpAlmanacSelect from './AlmanacSelect.vue'

  export default {
    name: 'zp-almanac-picker',
    props: {
      format: {
        default: 'yyyy-MM-dd'
      },
      width: {
        default: 600
      },
      value: {
        type: Array,
        default: () => []
      },
      disabledDate: {
        type: Function,
        default: () => {}
      },
      startPlaceholder: String,
      endPlaceholder: String,
      rangeSeparator: {
        type: String,
        default: '-'
      },
      addSelectText: {
        type: String,
        default: '+'
      },
      clearable: {
        type: Boolean,
        default: true
      },
      disabled: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        ranges: {},
        items: []
      }
    },
    created () {
      this.ranges[this.curId] = this.value
      this.bus.$on('change', (range, vm) => {
        if (vm.id) {
          this.ranges[vm.id] = range
          this.$emit('input', this.getRange())
        }
      })
    },
    mounted () {
      this.items.push(this.$refs.pickerItem)
    },
    beforeDestroy () {
      for (let item of this.items) {
        item.removeAlmanac()
      }
    },
    components: {
      ZpAlmanacSelect
    },
    computed: {
      bus () {
        return new Vue()
      },
      curId () {
        return this.getUid()
      }
    },
    methods: {
      getUid () { // 获取uid
        return Math.random().toString(36).substr(2, 9)
      },
      getRange () { // 获取当前时间集合
        const ranges = []
        Object.keys(this.ranges).forEach(range => {
          ranges.push(this.ranges[range])
        })
        return ranges
      },
      addSelect () { // 创建picker
        const props = Object.assign({}, this._props)
        const id = this.getUid()
        const picker = this.$refs.picker
        const tmpId = 'tmpPlaceholder'
        props.value = []
        props.bus = this.bus
        props.selectedDate = this.ranges
        const tmpPlaceholder = document.createElement('div')
        tmpPlaceholder.setAttribute('id', tmpId)
        picker.appendChild(tmpPlaceholder)
        const item = new Vue({
          el: `#${tmpId}`,
          components: {
            ZpAlmanacSelect
          },
          render: h => {
            return h('zp-almanac-select', {
              props,
              attrs: {
                id
              }
            })
          }
        })
        this.items.push(item.$children[0])
      }
    }
  }
</script>

<style>
  .zp-almanac-picker,
  #tmpPlaceholder {
    position: relative;
    display: inline-block;
  }
  .zp-almanac-picker {
    width: 240px;
  }
  .zp-almanac-select {
    margin-bottom: 10px;
  }
  .zp-almanac-picker button {
    float: right;
    padding: 7px 9px;
    font-size: 12px;
    border-radius: 4px;
    color: #323c47;
    background: #ddd;
    border: none;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    text-align: center;
    box-sizing: border-box;
    outline: none;
    font-weight: normal;
    margin-left: 10px;
  }
  .zp-almanac-picker button.prime {
    background: #54a5ff;
    color: #fff;
  }
</style>