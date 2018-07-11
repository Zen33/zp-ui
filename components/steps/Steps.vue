<!-- Steps -->
<template>  
  <div :class="['zp-steps', {'zp-steps-vertical': isVertical, 'zp-steps-place-right': position === 'right'}]">
    <div class="zp-steps-wrap">
      <div class="zp-steps-bar">
        <div class="zp-steps-bg" :style="getStepStyle(step, index)" v-for="(step, index) in steps - 1"></div>
      </div>
      <div class="zp-steps-step" :style="{top: isVertical && getTop(index), left: !isVertical && getLeft(index)}" v-for="(step, index) in stepsOption.data">
        <span :class="['zp-steps-point', {'zp-steps-check': index < curStep}]" :style="{backgroundColor: index < curStep ? ftColor : null, top: isVertical && getTop(index), left: !isVertical && getLeft(index), color: point[index], borderColor: point[index]}">{{ index < curStep ? '' : index + 1 }}</span>
        <span :class="`zp-steps-${position}`" :style="{top: isVertical && getTop(index), left: ready && !isVertical && getLeft(index, `zp-steps-${position}`), color: point[index]}">{{ step }}</span>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'zp-steps',
    props: ['stepsOption'],
    data () {
      const TEMP_LEN = this.stepsOption.data.length || 0
      const TEMP_FT_COLOR = this.stepsOption.ftColor || '#4da1ff'
      const TEMP_BG_COLOR = this.stepsOption.bgColor || '#dbdbdb'
      const TEMP_IS_VERTICAL = this.stepsOption.isVertical
      return {
        ready: false,
        ftColor: TEMP_FT_COLOR,
        bgColor: TEMP_BG_COLOR,
        steps: TEMP_LEN,
        curStep: this.stepsOption.step || 0, // 当前步骤
        point: (i => {
          const pt = []
          for (; i < TEMP_LEN; i++) {
            pt.push(i ? TEMP_BG_COLOR : TEMP_FT_COLOR)
          }
          return pt
        })(0),
        isVertical: TEMP_IS_VERTICAL,
        position: TEMP_IS_VERTICAL ? 'right' : (this.stepsOption.position === 'right' ? 'right' : 'bottom')
      }
    },
    created () {
      this.curStep && this.updateStep(this.curStep)
    },
    mounted () {
      this.ready = true
    },
    methods: {
      getTop (index) { // 获取当前 Top
        return `${index * 100 / (this.steps - 1)}%`
      },
      getLeft (index, klass) { // 获取当前 Left
        if (klass && this.$el && this.position === 'bottom') {
          const steps = [...this.$el.querySelectorAll(`.${klass}`)]
          const item = steps[index].getBoundingClientRect()
          steps[index].textContent.length > 1 && (steps[index].style.marginLeft = `-${item.width / 2}px`)
        }
        return `${index * 100 / (this.steps - 1)}%`
      },
      updateStep (val) { // 更新步骤
        this.curStep = val
        for (let [ptIndex] of this.point.entries()) {
          this.getStepColor(ptIndex)
        }
        this.$emit('steps-action', this.curStep)
      },
      getStepStyle (step, index) { // 获取当前步骤样式
        const style = {}
        const leeway = this.steps - 1
        return {
          background: step > this.curStep ? this.bgColor: this.ftColor,
          width: this.isVertical ? null : `${100 / leeway}%`,
          height: this.isVertical ? `${100 / leeway}%` : null,
          top: this.isVertical ? this.getTop(index) : null,
          left: this.isVertical ? null : this.getLeft(index)
        }
      },
      getStepColor (index) { // 获取当前步骤颜色
        if (index <= this.curStep) {
          this.point[index] = this.ftColor
        } else {
          this.point[index] = this.bgColor
        }
      }
    },
    watch: {
      'stepsOption.step': {
        handler (val) {
          this.updateStep(val)
        }
      }
    }
  }
</script>

<style>
  .zp-steps {
    position: relative;
    width: 500px;
    height: 40px;
  }
  .zp-steps-vertical {
    height: 300px;
  }
  .zp-steps .zp-steps-bar {
    position: absolute;
    width: 100%;
    height: 100%;
  }
  .zp-steps .zp-steps-bg {
    position: absolute;
    height: 2px;
    overflow: hidden;
    border-radius: 2px;
    -webkit-transition: all .2s ease-in-out;
    -ms-transition: all .2s ease-in-out;
    -o-transition: all .2s ease-in-out;
    -moz-transition: all .2s ease-in-out;
    transition: all .2s ease-in-out;
  }
  .zp-steps-vertical .zp-steps-bg {
    width: 2px;
    height: auto;
    margin-left: 1px;
  }
  .zp-steps .zp-steps-wrap {
    width: 480px;
    position: relative;
    margin: auto;
  }
  .zp-steps-vertical .zp-steps-wrap {
    height: 280px;
  }
  .zp-steps .zp-steps-step {
    position: absolute;
  }
  .zp-steps .zp-steps-point {
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    margin-top: -10px;
    margin-left: -10px;
    text-align: center;
    line-height: 20px;
    font-size: 14px;
    font-weight: bold;
    background: #fff;
    border-width: 2px;
    border-style: solid;
    -moz-transition: all .3s ease-in-out;
    -webkit-transition: all .3s ease-in-out;
    -o-transition: all .3s ease-in-out;
    transition: all .3s ease-in-out;
  }
  .zp-steps-place-right .zp-steps-point:before {
    content: '';
    position: absolute;
    left: 22px;
    background: #fff;
    width: 10px;
    height: 20px;
  }
  .zp-steps .zp-steps-right {
    position: absolute;
    display: block;
    white-space: nowrap;
    font-size: 14px;
    background: #fff;
    padding-right: 10px;
    -moz-transform: translate3d(20px, calc(-50% + 0.5px), 0);
    -webkit-transform: translate3d(20px, calc(-50% + 0.5px), 0);
    -o-transform: translate3d(20px, calc(-50% + 0.5px), 0);
    transform: translate3d(20px, calc(-50% + 0.5px), 0);
    top: 50%;
  }
  .zp-steps .zp-steps-bottom {
    position: absolute;
    margin-top: 20px;
    white-space: nowrap;
    font-size: 14px;
  }
  .zp-steps.zp-steps-place-right .zp-steps-bg {
    -moz-transform: translate3d(20px, 0, 0);
    -webkit-transform: translate3d(20px, 0, 0);
    -o-transform: translate3d(20px, 0, 0);
    transform: translate3d(20px, 0, 0);
  }
  .zp-steps-vertical.zp-steps-place-right .zp-steps-bg {
    -moz-transform: translate3d(0, 0, 0);
    -webkit-transform: translate3d(0, 0, 0);
    -o-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }
  .zp-steps .zp-steps-check:after {
    content: '';
    display: table;
    width: 5px;
    height: 8px;
    position: absolute;
    top: 3px;
    left: 6px;
    border: 2px solid #fff;
    border-top: 0;
    border-left: 0;
    -moz-transform: rotate(45deg) scale(1);
    -webkit-transform: rotate(45deg) scale(1);
    -o-transform: rotate(45deg) scale(1);
    transform: rotate(45deg) scale(1);
  }
</style>