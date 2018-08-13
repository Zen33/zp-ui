<template>
  <div>
    <ul class="zp-card" :style="wrapStyle" ref="zpCard">
      <li :class="['zp-card-item', {'zp-card-active': i === curIndex}, {'zp-card-leeway': curIndex + 1 > items.length - 1 ? i === 0 : i === curIndex + 1}]" :style="getItemStyle(i)" v-for="(item, i) in items" @click="handleClick($event, i)" :key="i">
        <div class="zp-card-container">{{ renderContent(i) }}</div>
      </li>
    </ul>
  </div>
</template>

<script>
  import Vue from 'vue'

  export default {
    name: 'zp-card',
    props: {
      items: {
        type: Array
      },
      width: {
        type: [String, Number],
        default: 200
      },
      height: {
        type: [String, Number],
        default: 100
      },
      ftColor: {
        type: String,
        default: '#4da1ff'
      },
      bgColor: {
        type: String,
        default: '#ccc'
      },
      index: {
        type: Number,
        default: 0
      }
    },
    data () {
      return {
        curIndex: this.index
      }
    },
    computed: {
      wrapStyle () {
        const { width, height } = this
        return {
          width: `${parseInt(width, 10)}px`,
          height: `${parseInt(height, 10)}px`
        }
      }
    },
    methods: {
      handleClick (evt, index) {
        const target = evt.target
        const items = [...this.$el.querySelectorAll('.zp-card-item')]
        const next = target.nextElementSibling || items[0]
        target.classList.remove('zp-card-leeway')
        next && next.classList.add('zp-card-leeway')
        this.$el.querySelector('.zp-card-active').classList.remove('zp-card-active')
        target.classList.add('zp-card-active')
        this.setItem(index)
      },
      getItemStyle (index) {
        let backgroundColor = this.bgColor
        this.curIndex === index && (backgroundColor = this.ftColor)
        return {
          backgroundColor
        }
      },
      setItem (index) {
        const len = this.items.length
        if (typeof index === 'undefined') {
          this.curIndex = this.curIndex < len - 1 ? this.curIndex + 1 : 0
        } else {
          index = Number(index)
          const oriIndex = this.curIndex
          if (isNaN(index) || index !== parseInt(index, 10)) {
            return false
          } else if (index < 0) {
            this.curIndex = len - 1
          } else if (index >= len) {
            this.curIndex = 0
          } else {
            this.curIndex = index
          }
        }
      },
      next () {
        this.setItem(this.curIndex + 1)
      },
      prev () {
        this.setItem(this.curIndex - 1)
      },
      renderContent (i) {
        const item = this.items[i]
        if (item.hasOwnProperty('text')) {
          return item.text
        } else if (item.hasOwnProperty('render') && typeof item.render === 'function') {
          try {
            /* eslint-disable no-new */
            const tmpComp = new Vue({
              render (h) {
                return item.render.call(this, h)
              }
            })
            this.$nextTick(() => {
              const container = [...this.$el.querySelectorAll('.zp-card-container')][i]
              // container.insertAdjacentHTML('beforeend', '<div class="tmp"/>')
              container.innerHTML = '<div class="tmp"/>'
              const tmp = container.querySelector('.tmp')
              tmpComp.$mount(tmp)
            })
          } catch (e) {
            return false
          }
        }
      }
    },
    created () {
      this.setItem(this.curIndex)
    }
  }
</script>

<style>
  .zp-card {
    position: relative;
    display: block;
    margin: 0 0 20px;
    padding: 0;
  }
  .zp-card .zp-card-item {
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    left: 20px;
    opacity: 0.3;
    z-index: 1;
    color: #fff;
    cursor: pointer;
    -webkit-transition: all .2s ease-in-out;
    -ms-transition: all .2s ease-in-out;
    -o-transition: all .2s ease-in-out;
    -moz-transition: all .2s ease-in-out;
    transition: all .2s ease-in-out;
    border-radius: 5px;
    padding: 5px;
  }
  .zp-card li.zp-card-leeway {
    z-index: 2;
  }
  .zp-card li.zp-card-active {
    left: 0;
    opacity: 1;
    z-index: 3;
    cursor: default;
  }
</style>