<!-- Timeline -->
<template>
  <div ref="tlSelf" class="zp-tl-wrapper">
    <ul class="zp-tl">
      <li v-for="item in tlOption.data" class="zp-tl-item">
        <div class="zp-tl-line" :style="{'border-left': `2px ${item.lineType} ${item.lineColor}`}"></div>
        <div class="zp-tl-dot" :style="{'border-color': item.dotBorderColor, 'background-color': item.dotBgColor, 'border-radius': (item.dotShape === 'square' ? '0' : '50%')}">
          <i class="zp-tl-dot-core" :style="{'border-radius': (item.dotShape === 'square' ? '0' : '50%'), 'background-color': item.dotColor}"></i>
        </div>
        <div class="zp-tl-main">
          <span class="zp-tl-title">{{ item.title }}</span>
          <p class="zp-tl-content" v-html="item.content"></p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    name: 'zp-timeline',
    props: ['tlOption']
  }
</script>

<style>
  .zp-tl-wrapper {
    position: relative;
  }
  .zp-tl {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .zp-tl-item {
    position: relative;
    margin: 0;
    /* padding: 0 0 12px; */
    list-style: none;
  }
  .zp-tl-item:last-child .zp-tl-line {
    display: none;
  }
  .zp-tl-line {
    position: absolute;
    height: -webkit-calc(100% - 18px);
    height: -moz-calc(100% - 18px);
    height: calc(100% - 18px);
    border-left: 2px solid #dbdbdb;
    /* top: 0;
    left: 5px; */
    top: 18px;
    left: 8px;
  }
  .zp-tl-dot {
    /* position: absolute;
    width: 9px;
    height: 9px;
    background: #fff;
    border-radius: 50%;
    border: 1px solid transparent;
    border-color: #607d8b;
    color: #607d8b; */
    width: 18px;
    height: 18px;
    border: 2px solid rgba(56, 173, 255, .4);
    background-color: #fff;
    box-sizing: border-box;
    /* border-radius: 50%; */
    background: #dbdbdb;
  }
  .zp-tl-wrapper *,
  .zp-tl-wrapper :before,
  .zp-tl-wrapper :after {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }
  .zp-tl-dot-core {
    display: block;
    background-color: #38adff;
    width: 14px;
    height: 14px;
    border: 2px solid #fff;
    border-radius: 50%;
  }
  .zp-tl-main {
    position: relative;
    /* top: -5px; */
    top: -20px;
    padding: 1px 1px 10px 40px;
  }
  .zp-tl-title {
    font-size: 14px;
    font-weight: 600;
  }
  .zp-tl-content {
    margin: 5px;
    font-size: 14px;
  }
</style>