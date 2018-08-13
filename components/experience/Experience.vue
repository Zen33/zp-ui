<!-- Experience -->
<template>  
  <div class="zp-exp">
    <div class="zp-exp-wrap">
      <div class="zp-exp-bar">
        <div class="zp-exp-bg" :style="{background: bgColor, width: `${100 / expLen}%`}" v-for="(stage, index) in expLen" :key="index">
          <span class="zp-exp-per" :style="{background: ftColor, width: percent[index]}"></span>
        </div>
      </div>
      <div class="zp-exp-stage" :style="{left: getLeft(index)}" v-for="(stage, index) in expOption.data" :key="index">
        <span class="zp-exp-point" :style="{left: getLeft(index), background: point[index]}"></span>
        <span class="zp-exp-val" :style="{left: ready && getLeft(index, 'zp-exp-val')}">{{ stage.value }}</span>
        <span class="zp-exp-key" :style="{left: ready && getLeft(index, 'zp-exp-key')}">{{ stage.name }}</span>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'zp-experience',
    props: ['expOption'],
    data () {
      const TEMP_LEN = this.expOption.data.length || 0
      const TEMP_FT_COLOR = this.expOption.ftColor || '#4da1ff'
      const TEMP_BG_COLOR = this.expOption.bgColor || '#ebebeb'
      return {
        ready: false,
        ftColor: TEMP_FT_COLOR,
        bgColor: TEMP_BG_COLOR,
        expLen: TEMP_LEN - 1, // 层级段数量
        curStage: 0, // 当前层级
        score: parseInt(this.expOption.score, 10) || 0, // 积分
        point: ((i, len) => {
          const pt = []
          for (; i < len; i++) {
            pt.push(TEMP_BG_COLOR)
          }
          return pt
        })(0, TEMP_LEN),
        percent: ((i, len) => {
          const per = []
          for (; i < len; i++) {
            per.push(0)
          }
          return per
        })(0, TEMP_LEN - 1)
      }
    },
    created () {
      this.score> 0 && this.updateScore(this.score)
    },
    mounted () {
      this.ready = true
    },
    methods: {
      getLeft (index, klass) { // 获取位置
        if (klass && this.$el) {
          const exp = [...this.$el.querySelectorAll(`.${klass}`)]
          const item = exp[index].getBoundingClientRect()
          exp[index].textContent.length > 1 && (exp[index].style.marginLeft = `-${item.width / 2}px`)
        }
        return `${index * 100 / this.expLen}%`
      },
      updateScore (val) { // 更新分数
        this.score = val
        this.setStage()
        for (let [perIndex] of this.percent.entries()) {
          this.getPer(perIndex)
        }
        for (let [ptIndex] of this.point.entries()) {
          this.getBgColor(ptIndex)
        }
        this.$emit('exp-action', this.score)
      },
      setStage () { // 设置当前的层级段
        for (let [index, stage] of this.expOption.data.entries()) {
          if (this.score <= stage.value) {
            this.curStage = index - 1
            return false
          }
        }
      },
      getPer (index) { // 获取占比
        const stage = this.expOption.data
        const val = stage[index + 1].value
        let percent
        if (index < this.curStage) {
          percent = '100%'
        } else if (index === this.curStage) {
          const prevStageVal = this.expOption.data[index].value
          percent = `${(this.score - prevStageVal) / (val - prevStageVal) * 100}%`
        } else {
          percent = '0'
        }
        this.$set(this.percent, index, percent)
      },
      getBgColor (index) { // 获取背景色
        if (index <= this.curStage) {
          this.point[index] = this.ftColor
        } else {
          this.point[index] = this.bgColor
        }
      }
    },
    watch: {
      'expOption.score': {
        handler (val) {
          this.updateScore(val)
        }
      }
    }
  }
</script>

<style>
  .zp-exp {
    position: relative;
    width: 200px;
  }
  .zp-exp .zp-exp-bar {
    position: absolute;
    width: 100%;
    display: flex;
  }
  .zp-exp .zp-exp-bg {
    height: 3px;
    overflow: hidden;
    border-radius: 3px;
    display: flex;
  }
  .zp-exp .zp-exp-per {
    height: 3px;
    overflow: hidden;
    border-radius: 5px;
    transition: all .5s ease;
    -webkit-transition: all .5s ease;
    -ms-transition: all .5s ease;
    -o-transition: all .5s ease;
    -moz-transition: all .5s ease;
  }
  .zp-exp .zp-exp-wrap {
    width: 180px;
    height: 3px;
    position: relative;
    margin: auto;
  }
  .zp-exp .zp-exp-stage {
    position: absolute;
  }
  .zp-exp .zp-exp-point {
    position: absolute;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    margin-top: -3px;
  }
  .zp-exp .zp-exp-val {
    position: absolute;
    margin-top: -25px;
    white-space: nowrap;
    font-size: 12px;
    transform: scale(0.833);
    -webkit-transform: scale(0.833);
    -moz-transform: scale(0.833);
    -ms-transform: scale(0.833);
    -o-transform: scale(0.833);
  }
  .zp-exp .zp-exp-key {
    position: absolute;
    margin-top: 10px;
    white-space: nowrap;
    font-size: 12px;
    transform: scale(0.833);
    -webkit-transform: scale(0.833);
    -moz-transform: scale(0.833);
    -ms-transform: scale(0.833);
    -o-transform: scale(0.833);
  }
</style>