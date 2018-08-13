<!-- Rate -->
<template>
  <div class="zp-rate-wrapper">
    <div class="zp-rate">
      <span v-for="(rate, index) in max" :key="index" :class="[{'zp-rate-hover': curIndex === index}, rateClass(rate, index)]" :style="rateStyle(rate, index)" @mousemove="setValue(rate, index, $event)" @mouseleave="resetValue" @click="setValue(rate)"></span>
      <span v-if="showText" class="zp-rate-text">{{ curText }}</span>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'zp-rate',
    props: {
      value: {
        type: Number,
        default: 0
      },
      max: {
        type: Number,
        default: 5
      },
      allowHalf: {
        type: Boolean,
        default: false
      },
      disabled: {
        type: Boolean,
        default: false
      },
      iconClasses: {
        type: Array,
        default () {
          return []
        }
      },
      colors: {
        type: Array,
        default () {
          return ['#ffab00']
        }
      },
      texts: {
        type: Array,
        default () {
          return ['Awful', 'Bad', 'Neutral', 'Good', 'Great']
        }
      },
      showText: {
        type: Boolean,
        default: false
      },
      emptyColor: {
        type: String,
        default: '#ccc'
      },
      emptyIconClass: String
    },
    data () {
      return {
        curVal: this.value,
        curIndex: -1,
        hasHalfVal: false
      }
    },
    computed: {
      curText () { // 当前评分文字描述
        return this.texts[Math.ceil(this.curVal) - 1]
      },
      curColor () { // 当前评分颜色
        return this.getCurState(this.colors)
      },
      curIcon () { // 当前评分样式
        return this.getCurState(this.iconClasses)
      }
    },
    methods: {
      getCurState (state) { // 根据阈值获取当前状态
        if (!state.length) {
          return null
        }
        let curState = []
        if (this.max.length <= state.length) {
          curState = state
        } else {
          const threshold = Math.round(this.max / state.length) // 阈值
          let step = 0
          Array.from(Array(this.max), (ignore, i) => { // 自增max为数组
            curState.push(state[step] || state[step - 1])
            ++i % threshold === 0 && step++
          })
        }
        return curState[Math.ceil(this.curVal) - 1]
      },
      rateStyle (val, index) { // 当前评分样式
        let color
        if (val > this.curVal) {
          if (this.allowHalf && val <= this.curVal + 0.5) {
            color = this.curColor
          } else {
            color = this.emptyColor
          }
        } else {
          color = this.curColor
        }
        return {
          color,
          cursor: this.disabled ? 'auto' : 'pointer'
        }
      },
      rateClass (val, index) { // 当前评分class：●◐○
        let klass
        if ((this.curIndex < 0 && (val === this.value + 0.5)) || (this.curIndex === index && this.hasHalfVal)) {
          klass = this.curIcon || 'half'
        } else if (val <= this.curVal) {
          klass = this.curIcon || 'full'
        } else {
          klass = this.emptyIconClass || 'empty'
        }
        return this.iconClasses.length ? klass : `zp-rate-${klass}`
      },
      setValue (val, index, evt) { // 选中、路过当前评分
        if (!this.disabled) {
          if (evt) {
            this.curIndex = index
            if (this.allowHalf) {
              const rect = evt.target.getBoundingClientRect()
              this.hasHalfVal = evt.offsetX <= rect.width / 2
              this.curVal = this.hasHalfVal ? val - 0.5 : val
            } else {
              this.curVal = val
            }
          } else {
            const selVal = this.allowHalf && this.hasHalfVal ? this.curVal : val
            this.$emit('change', selVal)
            this.$emit('input', selVal)
          }
        }
      },
      resetValue () { // 重置评分状态
        if (!this.disabled) {
          this.allowHalf && (this.hasHalfVal = this.value !== Math.floor(this.value))
          this.curVal = this.value
          this.curIndex = -1
        }
      }
    }
  }
</script>

<style>
@font-face {
  font-family: star-rate;
  src: url(data:application/x-font-ttf;base64,AAEAAAALAIAAAwAwT1MvMigiLIYAAAC8AAAAYGNtYXAmCyZNAAABHAAAAFRnYXNwAAAAEAAAAXAAAAAIZ2x5ZlNxiKoAAAF4AAABFGhlYWQBHDApAAACjAAAADZoaGVhA+IB6AAAAsQAAAAkaG10eAcAAAAAAALoAAAAHGxvY2EAjADoAAADBAAAABBtYXhwAAoAGAAAAxQAAAAgbmFtZYWP6p0AAAM0AAABaXBvc3QAAwAAAAAEoAAAACAAAwIAAZAABQAAAUwBZgAAAEcBTAFmAAAA9QAZAIQAAAAAAAAAAAAAAAAAAAABAAAgAAAAAAAAAAAAAAAAAABAAAAl0AHg/+D/4AHgACAAAAABAAAAAAAAAAAAAAAgAAAAAAACAAAAAwAAABQAAwABAAAAFAAEAEAAAAAMAAgAAgAEAAEAICXLJdD//f//AAAAAAAgJcslz//9//8AAf/j2jnaNgADAAEAAAAAAAAAAAAAAAAAAQAB//8ADwABAAAAAAAAAAAAAgAANzkBAAAAAAEAAAAAAAAAAAACAAA3OQEAAAAAAQAAAAAAAAAAAAIAADc5AQAAAAACAAD/7QIAAdMACgAVAAABLwEPARcHNxcnNwUHNyc/AR8BBxcnAgCxT0+xgB6enh6A/wBwFlt9ODh9WxZwARkaoKAafLBTU7B8sjp8WBJxcRJYfDoAAAAAAQAA/+0CAAHTAAoAAAEvAQ8BFwc3Fyc3AgCxT0+xgB6enh6AARkaoKAafLBTU7B8AAAAAAIAAP/tAgAB0wAKABIAAAEvAQ8BFwc3Fyc3BTERHwEHFycCALFPT7GAHp6eHoD/ADh9WxZwARkaoKAafLBTU7B8sgEdcRJYfDoAAAABAAAAAQAA1qooUl8PPPUACwIAAAAAAM/+d7YAAAAAz/53tgAA/+0CAAHTAAAACAACAAAAAAAAAAEAAAHg/+AAAAIAAAAAAAIAAAEAAAAAAAAAAAAAAAAAAAAHAAAAAAAAAAAAAAAAAQAAAAIAAAACAAAAAgAAAAAAAAAACgAUAB4ASgBkAIoAAQAAAAcAFgACAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAA4ArgABAAAAAAABABYAAAABAAAAAAACAA4AYwABAAAAAAADABYALAABAAAAAAAEABYAcQABAAAAAAAFABYAFgABAAAAAAAGAAsAQgABAAAAAAAKADQAhwADAAEECQABABYAAAADAAEECQACAA4AYwADAAEECQADABYALAADAAEECQAEABYAcQADAAEECQAFABYAFgADAAEECQAGABYATQADAAEECQAKADQAhwBzAHQAYQByAC0AcgBhAHQAaQBuAGcAVgBlAHIAcwBpAG8AbgAgADEALgAwAHMAdABhAHIALQByAGEAdABpAG4AZ3N0YXItcmF0aW5nAHMAdABhAHIALQByAGEAdABpAG4AZwBSAGUAZwB1AGwAYQByAHMAdABhAHIALQByAGEAdABpAG4AZwBGAG8AbgB0ACAAZwBlAG4AZQByAGEAdABlAGQAIABiAHkAIABJAGMAbwBNAG8AbwBuAC4AAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==) format('truetype'),url(data:application/font-woff;base64,d09GRk9UVE8AAAUgAAoAAAAABNgAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABDRkYgAAAA9AAAAWMAAAFjbsVsoU9TLzIAAAJYAAAAYAAAAGAoIiyGY21hcAAAArgAAABUAAAAVCYLJk1nYXNwAAADDAAAAAgAAAAIAAAAEGhlYWQAAAMUAAAANgAAADYBHDApaGhlYQAAA0wAAAAkAAAAJAPiAehobXR4AAADcAAAABwAAAAcBwAAAG1heHAAAAOMAAAABgAAAAYAB1AAbmFtZQAAA5QAAAFpAAABaYWP6p1wb3N0AAAFAAAAACAAAAAgAAMAAAEABAQAAQEBDHN0YXItcmF0aW5nAAECAAEAOvgcAvgbA/gYBB4KABlT/4uLHgoAGVP/i4sMB4tr+JT4dAUdAAAAjg8dAAAAkxEdAAAACR0AAAFaEgAIAQEMFxkbHiMoLXN0YXItcmF0aW5nc3Rhci1yYXRpbmd1MHUxdTIwdTI1Q0J1MjVDRnUyNUQwAAACAYkABQAHAQEEBwoNVn29/JQO/JQO/JQO+5QO+JT3rRX7RaU89zQ8+zT7RXH3FPsQbftE9zLe9zI4bfdE9xT3EAX7lPtGFfsEUaH3EDDj9xGdw/cFw/sF9xF5MDOh+xD7BMUFDviU960V+0WlPPc0PPs0+0Vx9xT7EG37RPcy3vcyOG33RPcU9xAFDviU960V+0WlPPc0PPs0+0Vx9xT7EG37RPcy3vcyOG33RPcU9xAF+5T7RhWLi4v3scP7BfcReTAzofsQ+wTFBQ74lBT4lBWLDAoAAAMCAAGQAAUAAAFMAWYAAABHAUwBZgAAAPUAGQCEAAAAAAAAAAAAAAAAAAAAAQAAIAAAAAAAAAAAAAAAAAAAQAAAJdAB4P/g/+AB4AAgAAAAAQAAAAAAAAAAAAAAIAAAAAAAAgAAAAMAAAAUAAMAAQAAABQABABAAAAADAAIAAIABAABACAlyyXQ//3//wAAAAAAICXLJc///f//AAH/49o52jYAAwABAAAAAAAAAAAAAAAAAAEAAf//AA8AAQAAAAEAAOJjA1tfDzz1AAsCAAAAAADP/ne2AAAAAM/+d7YAAP/tAgAB0wAAAAgAAgAAAAAAAAABAAAB4P/gAAACAAAAAAACAAABAAAAAAAAAAAAAAAAAAAABwAAAAAAAAAAAAAAAAEAAAACAAAAAgAAAAIAAAAAAFAAAAcAAAAAAA4ArgABAAAAAAABABYAAAABAAAAAAACAA4AYwABAAAAAAADABYALAABAAAAAAAEABYAcQABAAAAAAAFABYAFgABAAAAAAAGAAsAQgABAAAAAAAKADQAhwADAAEECQABABYAAAADAAEECQACAA4AYwADAAEECQADABYALAADAAEECQAEABYAcQADAAEECQAFABYAFgADAAEECQAGABYATQADAAEECQAKADQAhwBzAHQAYQByAC0AcgBhAHQAaQBuAGcAVgBlAHIAcwBpAG8AbgAgADEALgAwAHMAdABhAHIALQByAGEAdABpAG4AZ3N0YXItcmF0aW5nAHMAdABhAHIALQByAGEAdABpAG4AZwBSAGUAZwB1AGwAYQByAHMAdABhAHIALQByAGEAdABpAG4AZwBGAG8AbgB0ACAAZwBlAG4AZQByAGEAdABlAGQAIABiAHkAIABJAGMAbwBNAG8AbwBuAC4AAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==) format('woff');
  font-weight: normal;
  font-style: normal;
}
.zp-rate-wrapper {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.zp-rate {
  font-family: star-rate;
  font-size: 20px;
}
.zp-rate span {
  -ms-transition: .3s;
  -o-transition: .3s;
  -webkit-transition: .3s;
  transition: .3s;
  width: 26px;
  display: inline-block;
}
.zp-rate-hover {
  -ms-transform: scale(1.1);
  -o-transform: scale(1.1);
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
.zp-rate-half:before {
  content: '\25d0';
}
.zp-rate-empty:before {
  content: '\25cb';
}
.zp-rate-full:before {
  content: '\25cf';
}
.zp-rate-text {
  font-size: 14px;
  color: #323c47;
}
</style>