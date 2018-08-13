<!-- Breadcrumb -->
<template>
  <div class="zp-crumb-wrapper">
    <div v-for="(item, index) in crumbOption.data" class="zp-crumb-item" :key="index">
      <span :class="['zp-crumb-item-title', {'zp-crumb-item-clickable': !item.nonclickable}, item.customClass]" @click="handleAction(item, index)">{{ item.value || item }}</span>
      <span v-if="index !== crumbOption.data.length - 1" :class="['zp-crumb-item-separator', {'zp-crumb-item-arrow': !item.separator}]" v-html="item.separator"></span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'zp-breadcrumb',
  props: {
    crumbOption: {
      type: Object,
      default () {
        return {
          data: [],
          callback: null
        }
      }
    }
  },
  methods: {
    handleAction (...args) {
      this.crumbOption.callback && this.crumbOption.callback.call(this, ...args)
    }
  }
}
</script>

<style>
  .zp-crumb-wrapper {
    position: relative;
    font-size: 14px;
    font-weight: bold;
    height: 20px;
    line-height: 20px;
  }
  .zp-crumb-item,
  .zp-crumb-item-separator {
    position: relative;
    display: inline-block;
    vertical-align: top;
  }
  .zp-crumb-item-clickable:hover {
    color: #54a5ff;
    cursor: pointer;
  }
  .zp-crumb-item-separator,
  .zp-crumb-item-arrow {
    width: 16px;
    height: 20px;
  }
  .zp-crumb-item-separator {
    color: #ccc;
    text-align: center;
  }
  .zp-crumb-item-arrow:after {
    content: '';
    position: absolute;
    width: 6px;
    height: 6px;
    top: 6px;
    margin-left: -6px;
    border-right: 2px solid #ccc;
    border-top: 2px solid #ccc;
    -moz-transform: rotate(45deg);
    -webkit-transform: rotate(45deg);
    -o-transform: rotate(45deg);
    transform: rotate(45deg);
  }
</style>