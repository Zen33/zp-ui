<!-- Progress -->
<template>
  <div class="zp-pro-wrapper">
    <div class="zp-pro-circle-outer" :style="outerStyle" v-if="type === 'circle'">
      <div class="zp-pro-circle-inner">
        <slot></slot>
      </div>
      <svg class="zp-pro-circle" :style="outerStyle" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient :id="`radial-gradient-${uid}`" :fx="gradient.fx" :fy="gradient.fy" :cx="gradient.cx" :cy="gradient.cy" :r="gradient.r">
            <stop offset="30%" :stop-color="startColor"/>
            <stop offset="100%" :stop-color="endColor"/>
          </radialGradient>
        </defs>
        <circle :r="innerRadius" :cx="radius" :cy="radius" fill="transparent" :stroke="strokeColor" :stroke-dasharray="circumference" stroke-dashoffset="0" stroke-linecap="round" :style="strokeStyle"></circle>
        <circle :transform="'rotate(270, ' + radius + ',' + radius + ')'" :r="innerRadius" :cx="radius" :cy="radius" fill="transparent" :stroke="'url(#radial-gradient-' + uid + ')'" :stroke-dasharray="circumference" :stroke-dashoffset="circumference" stroke-linecap="round" :style="progressStyle"></circle>
      </svg>
    </div>
    <div class="zp-pro-line" v-else>
      <div class="zp-pro-line-outer" :style="outerStyle">
        <div class="zp-pro-line-inner" :style="innerStyle">
          <slot></slot>
        </div>
      </div>
    </div>
    <div class="zp-pro-line-status" v-show="type !== 'circle' && !this.$slots.default">
      {{ `${percentage}%` }}
    </div>
  </div>
</template>

<script>
  import Prefix from '../../mixins/prefix'

  export default {
    name: 'zp-progress',
    mixins: [Prefix],
    props: ['proOption'],
    data () {
      return {
        type: this.proOption.type || 'line',
        diameter: this.proOption.diameter || 120,
        totalSteps: 100,
        percentage: this.getPercent(this.proOption.percentage),
        startColor: this.proOption.startColor || '#bbff42',
        endColor: this.proOption.endColor || '#429321',
        strokeWidth: this.proOption.strokeWidth || 6,
        animateSpeed: 1000,
        strokeColor: this.proOption.strokeColor || '#ebebeb',
        animateTiming: this.proOption.timing || 'linear',
        frame: 60,
        gradient: {
          fx: 0.99,
          fy: 0.5,
          cx: 0.5,
          cy: 0.5,
          r: 0.65
          // fx: 0.5,
          // fy: 0.5,
          // cx: 0,
          // cy: 0.5,
          // r: 1
        },
        animateProcess: null,
        currentAngle: 0,
        strokeDashoffset: 0
      }
    },
    computed: {
      uid () {
        return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1)
      },
      radius () {
        return this.diameter / 2
      },
      circumference () {
        return Math.PI * this.innerDiameter
      },
      circleSlice () {
        return 2 * Math.PI / this.totalSteps
      },
      animateSlice () {
        return this.circleSlice / this.totalPoints
      },
      innerDiameter () {
        return this.diameter - (this.strokeWidth * 2)
      },
      innerRadius () {
        return this.innerDiameter / 2
      },
      totalPoints () {
        return this.animateSpeed / this.timer
      },
      timer () {
        return 1000 / this.frame
      },
      outerStyle () {
        if (this.type === 'circle') {
          return {
            height: `${this.diameter}px`,
            width: `${this.diameter}px`
          }
        } else {
          return {
            width: '100%',
            height: `${this.strokeWidth}px`,
            background: this.strokeColor
          }
        }
      },
      progressStyle () {
        return {
          height: `${this.diameter}px`,
          width: `${this.diameter}px`,
          strokeWidth: `${this.strokeWidth}px`,
          strokeDashoffset: this.strokeDashoffset,
          transition: `stroke-dashoffset ${this.animateSpeed}ms ${this.animateTiming}`,
          opacity: this.percentage > 0 ? 1 : 0
        }
      },
      strokeStyle () {
        return {
          height: `${this.diameter}px`,
          width: `${this.diameter}px`,
          strokeWidth: `${this.strokeWidth}px`
        }
      },
      innerStyle () {
        // return {
        //   width: `${this.innerDiameter}px`
        // }
        return {
          width: `${this.percentage > 100 ? 100 : this.percentage}%`,
          height: `${this.strokeWidth}px`,
          background: `${this.prefix.css}linear-gradient(right, ${this.startColor}, ${this.endColor})`
        }
      }
    },
    methods: {
      getPercent (per) {
        let percent = parseInt(per, 10)
        if (isNaN(percent) || percent < 0) {
          percent = 0
        } else if (percent > 100) {
          percent = 100
        }
        return percent
      },
      getStopPointsOfCircle (steps) {
        const points = []
        for (let i = 0; i < steps; i++) {
          const angle = this.circleSlice * i
          points.push(this.getPointOfCircle(angle))
        }
        return points
      },
      getPointOfCircle (angle) {
        const radius = 0.5
        const x = radius + (radius * Math.cos(angle))
        const y = radius + (radius * Math.sin(angle))
        return {
          x,
          y
        }
      },
      gotoPoint () {
        const point = this.getPointOfCircle(this.currentAngle)
        this.gradient.fx = point.x
        this.gradient.fy = point.y
      },
      changeProgress (isAnimate = true) {
        this.strokeDashoffset = ((100 - this.percentage) / 100) * this.circumference
        if (this.animateProcess) {
          clearInterval(this.animateProcess)
        }
        if (!isAnimate) {
          return this.gotoNextFrame()
        }
        const angleOffset = (this.percentage - 1) * this.circleSlice
        let i = (this.currentAngle - angleOffset) / this.animateSlice
        const incrementer = Math.abs(i - this.totalPoints) / this.totalPoints
        const isMoveForward = i < this.totalPoints
        this.animateProcess = setInterval(() => {
          if ((isMoveForward && i >= this.totalPoints) || (!isMoveForward && i < this.totalPoints)) {
            clearInterval(this.animateProcess)
            return this.$emit('pro-action', this)
          }
          this.currentAngle = angleOffset + (this.animateSlice * i)
          this.gotoPoint()
          i += isMoveForward ? incrementer : -incrementer
        }, this.timer)
      },
      gotoNextFrame () {
        this.currentAngle = this.percentage * this.circleSlice
        this.gotoPoint()
      }
    },
    watch: {
      'proOption.percentage': {
        handler (val) {
          this.percentage = this.getPercent(val)
          this.changeProgress()
        }
      },
      'proOption.startColor': {
        handler (val) {
          this.startColor = val
        }
      },
      'proOption.endColor': {
        handler (val) {
          this.endColor = val
        }
      }
    },
    created () {
      this.changeProgress(false)
    }
  }
</script>

<style>
.zp-pro-circle-outer {
  position: relative;
}
.zp-pro-circle {
  will-change: transform;
}
.zp-pro-circle-inner {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  text-align: center;
  margin: 0;
  -moz-transform: translateY(-50%);
  -webkit-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  -o-transform: translateY(-50%);
  transform: translateY(-50%);
}
.zp-pro-line-outer,
.zp-pro-line-inner {
  border-radius: 100px;
}
.zp-pro-line {
  padding-right: 50px;
  margin-right: -50px;
  display: inline-block;
  width: 100%;
  box-sizing: border-box;
  vertical-align: middle;
}
.zp-pro-line-outer {
  position: relative;
  overflow: hidden;
  vertical-align: middle;
  display: inline-block;
}
.zp-pro-line-inner {
  position: absolute;
  top: 0;
  left: 0;
  -webkit-transition: all .3s ease;
  -ms-transition: all .3s ease;
  -o-transition: all .3s ease;
  -moz-transition: all .3s ease;
  transition: all .3s ease;
  text-align: right;
}
.zp-pro-line-status {
  display: inline-block;
  vertical-align: middle;
  margin-left: 3px;
  line-height: 1;
  letter-spacing: .5px;
  font-size: 12px;
}
</style>
