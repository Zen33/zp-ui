<!-- Dynamic numbers -->
<template>
  <span class="zp-dn" v-text="num" :style="anStyle" />
</template>

<script>
  const shifty = require('../../utils/shifty')

  export default {
    name: 'zp-dynamic-numbers',
    props: ['dnOption'],
    data () {
      return {
        num: 0,
        state: 0,
        options: {},
        anStyle: {},
        from: this.dnOption.from || 0,
        to: this.dnOption.to || 0,
        startColor: this.dnOption.startColor,
        endColor: this.dnOption.endColor,
        formatter: this.dnOption.formatter || (num => num.toFixed(0)),
        duration: this.dnOption.duration || 1000,
        easing: this.dnOption.easing || 'easeOutQuad',
        callback: this.dnOption.callback
      }
    },
    mounted () {
      this.setAnimateProps()
      if (this.dnOption.mode && this.dnOption.mode === 'auto') {
        this.start()
      } else {
        this.num = this.formatter ? this.formatter(parseFloat(this.from)) : this.from
        if (this.startColor && this.endColor) {
          let {
            r,
            g,
            b
          } = this.hexToRGB(this.startColor)
          this.anStyle = {
            color: `rgb(${parseInt(r, 10)}, ${parseInt(g, 10)}, ${parseInt(b, 10)})`
          }
        }
      }
    },
    methods: {
      hexToRGB (hex) { // 色号转换
        hex = hex.replace('#', '')
        if (hex.length === 3) {
          hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`
        }
        return {
          r: parseInt(hex.substr(0, 2), 16),
          g: parseInt(hex.substr(2, 2), 16),
          b: parseInt(hex.substr(4, 2), 16)
        }
      },
      updateNumber (state) { // 更新数字
        this.num = this.formatter ? this.formatter(state.num) : state.num
        this.anStyle = {
          color: `rgb(${parseInt(state.r, 10)}, ${parseInt(state.g, 10)}, ${parseInt(state.b, 10)})`
        }
      },
      setAnimateProps () { // 设置过场
        const from = {
          num: parseFloat(this.from)
        }
        const to = {
          num: parseFloat(this.to)
        }
        if (this.startColor && this.endColor) {
          Object.assign(from, this.hexToRGB(this.startColor))
          Object.assign(to, this.hexToRGB(this.endColor))
        }
        this.options = {
          from,
          to,
          duration: this.duration,
          easing: this.easing,
          step: this.updateNumber
        }
      },
      start (options) { // 开始动画
        if (this.state !== 0) {
          return
        }
        this.state = 1
        if (options) {
          Object.assign(this.options, options)
        }
        !this.options.duration && (this.options.duration = 1)
        shifty.tween(this.options).then(this.updateNumber).then(() => {
          this.state = 0
          this.callback && this.callback(parseFloat(this.num))
          this.$emit('dn-action', this)
        })
      },
      reset ({from, to, startColor, endColor}) { // 重设动画
        this.options.from = {
          num: parseFloat(from)
        }
        this.options.to = {
          num: parseFloat(to)
        }
        if (startColor && endColor) {
          Object.assign(this.options.from, this.hexToRGB(startColor))
          Object.assign(this.options.to, this.hexToRGB(endColor))
        }
        return this
      }
    }
  }
</script>

<style>
  .zp-dn {
    font-size: 20px;
    font-weight: 600;
    min-width: 20px;
    display: inline-block;
  }
</style>