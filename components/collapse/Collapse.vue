<!-- Collapse -->
<template>
  <div :class="['zp-col', {'zp-col-glow': expand}]" ref="colSelf">
    <div class="zp-col-title" @click="handleSwitch">
      <div class="zp-col-left">
        {{ colOption.title}}
        <slot name="colLeeway"></slot>
      </div>
      <div class="zp-col-right">
        <slot name="colSelf">
          <div :class="['zp-col-switch', {'zp-col-collapse': !expand}, {'zp-col-expand': expand}]">
            {{ expand ? expandTxt : collapseTxt }}
            <i class="zp-col-arrow"></i>
          </div>
        </slot>
      </div>
    </div>
    <div class="zp-col-item">
      <slot name="colAlways"><!-- 一直显示区域 --></slot>
      <collapse-transition>
        <div v-show="expand">
          <slot name="colSwitch"><!-- 折叠区域 --></slot>
        </div>
      </collapse-transition>
    </div>
  </div>
</template>

<script>
  import CollapseTransition from '../common/collapseTransition'

  export default {
    name: 'zp-collapse',
    props: ['colOption'],
    components: {
      CollapseTransition
    },
    data () {
      return {
        expand: this.colOption.expand || false,
        expandTxt: this.colOption.expandTxt || '收起',
        collapseTxt: this.colOption.collapseTxt || '展开'
      }
    },
    methods: {
      handleSwitch () { // 折叠切换
        this.expand = !this.expand
        this.colOption.callback && this.colOption.callback.apply(this)
        this.$emit('col-action', this)
      }
    }
  }
</script>

<style>
  .zp-col {
    width: 100%;
    border-radius: 6px;
    background: #fff;
    box-shadow: 0 0 4px 0 #4da1ff;
  }
  .zp-col.zp-col-glow {
    box-shadow: 0 0 4px 0 #4da1ff;
  }
  .zp-col .zp-col-title {
    height: 30px;
    font-size: 18px;
    font-weight: 600;
    color: #323c47;
    display: flex;
    cursor: pointer;
    border-bottom: 1px solid #ebebeb;
    padding: 10px 16px 16px 16px;
  }
  .zp-col .zp-col-left {
    flex: .9;
  }
  .zp-col .zp-col-right {
    flex: .1;
    text-align: right;
    font-size: 12px;
    font-weight: normal;
  }
  .zp-col .zp-col-item {
    padding: 10px 16px 16px 16px;
  }
  .zp-col .zp-col-collapse {
    color: #4da1ff;
  }
  .zp-col .zp-col-switch {
    margin-top: 5px;
  }
  .zp-col .zp-col-arrow {
    display: inline-block;
    width: 14px;
    height: 8px;
    margin-left: 10px;
    background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAICAYAAADJEc7MAAAAAXNSR0IArs4c6QAAAKBJREFUGBmFkFEOwiAQRIFLNB4HDuRP/VD/tdhUbTwQcBtvAc40bGI1DSSbZXbetICOMfZKqZ219oDeXOAnQG9TSulQfUrp3kqRIcvMwoYQRlRBPbbC9Cozrhh87UYDR3muDAjO6JH59RYNwNfwLABmc515mbHrb8E9wAF3OBpjXtQ5573W2uPxTtSy/oI08IcrmoCDc+4sgWbHfS6sLfADvGRlngSVsjQAAAAASUVORK5CYII=') no-repeat;
    -moz-transition: -moz-transform .3s;
    -webkit-transition: -webkit-transform .3s;
    -o-transition: -o-transform .3s;
    transition: transform .3s;
  }
  .zp-col .zp-col-expand .zp-col-arrow {
    -moz-transform: rotate(-180deg);
    -webkit-transform: rotate(-180deg);
    -o-transform: rotate(-180deg);
    transform: rotate(-180deg);
  }
  /* .zp-col .zp-col-fade-enter-active,
  .zp-col .zp-col-fade-leave-active {
    -moz-transition: all 0.2s ease-in;
    -webkit-transition: all 0.2s ease-in;
    -o-transition: all 0.2s ease-in;
    transition: all 0.2s ease-in;
  }
  .zp-col .zp-col-fade-enter,
  .zp-col .zp-col-fade-leave-active {
    opacity: 0;
  } */
</style>