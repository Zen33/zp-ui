<!-- Pagination -->
<template>
  <div class="zp-pg-wrap">
    <template v-if="pageSizes.length">
      <zp-dropdownlist :ddl-option="ddlOption" class="zp-pg-ddl" />
    </template>
    <ul class="zp-pg" ref="pgSelf" @click="handleChange($event)">
      <li :class="['zp-pg-prev', {'zp-pg-disabled': curPage === 1}]" rel="0"></li><!--
      --><li :class="['zp-pg-num', {'zp-pg-selected': curPage === 1}]" v-if="pageCount > 0">1</li><!--
      --><li :class="['zp-pg-omit-prev', omitPrevClass]" v-if="showOmitPrev" @mouseenter="omitPrevClass = 'zp-pg-arrow-left'" @mouseleave="omitPrevClass = 'zp-pg-omit'"></li><!--
      --><li v-for="(page, i) in pages" :class="['zp-pg-num', {'zp-pg-selected': curPage === page}]" :key="i">{{ page }}</li><!--
      --><li :class="['zp-pg-omit-next', omitNextClass]" v-if="showOmitNext" @mouseenter="omitNextClass = 'zp-pg-arrow-right'" @mouseleave="omitNextClass = 'zp-pg-omit'"></li><!--
      --><li :class="['zp-pg-num', {'zp-pg-selected': curPage === pageCount}]" v-if="pageCount > 1">{{ pageCount}}</li><!--
      --><li :class="['zp-pg-next', {'zp-pg-disabled': curPage === pageCount}]" rel="1"></li>
    </ul>
    <div v-if="jumpTo" class="zp-pg-jump">
      <label>
        {{ jumpToContent }}<input type="number" min="1" :max="pageCount" v-model="model" @blur="setPage" ref="jumpInput"/>
      </label>
    </div>
  </div>
</template>

<script>
  import ZpDropdownlist from '../dropdownlist/'
  export default {
    name: 'zp-pagination',
    props: ['pageOption'],
    data() {
      return {
        curPage: this.getProp(this.pageOption, 'currentPage', 1),
        pageCount: this.getProp(this.pageOption, 'pageCount', 0),
        size: this.getProp(this.pageOption, 'size', 5),
        pageSizes: this.pageOption.pageSizes || [],
        showOmitPrev: false,
        showOmitNext: false,
        omitNextClass: 'zp-pg-omit',
        omitPrevClass: 'zp-pg-omit',
        jumpTo: this.pageOption.jumpTo || false,
        jumpToContent: this.pageOption.jumpToContent || '前往',
        ddlOption: {
          data: this.pageOption.pageSizes,
          width: 60,
          setDefault: this.pageOption.pageSize
        },
        model: this.curPage
      }
    },
    created () {
      this.model = this.curPage
    },
    methods: {
      getProp (data, key, val) { // 验证属性
        return data.hasOwnProperty(key) ? +data[key] : val
      },
      handleChange (evt) { // 页面切换
        const target = evt.target
        if (target.hasAttribute('rel')) {
          const dir = target.getAttribute('rel')
          !target.classList.contains('zp-pg-disabled') && (+dir ? this.curPage += 1 : this.curPage -= 1) && this.$emit('page-action', this.curPage)
        } else if (['li', 'i'].includes(target.tagName.toLowerCase())) {
          let curPage = +target.textContent
          if (target.classList.contains('zp-pg-omit-prev')) {
            curPage = this.curPage - 5
          } else if(target.classList.contains('zp-pg-omit-next')) {
            curPage = this.curPage + 5
          }
          curPage < 1 && (curPage = 1)
          curPage > this.pageCount && (curPage = this.pageCount)
          curPage !== this.curPage && this.$emit('page-action', curPage)
          this.curPage = curPage
        }
        this.model = this.curPage
      },
      setPage () { // 页面跳转
        if (`${this.curPage}` !== `${this.model}` && !isNaN(this.model) && +this.model <= this.pageCount) {
          this.curPage = +this.model
          this.$emit('page-action', this.curPage)
        } else {
          this.model = this.curPage
        }
      }
    },
    computed: {
      pages () {
        const defaultCount = this.size
        const pagesGroup = []
        let showOmitPrev = false
        let showOmitNext = false
        if (this.pageCount > defaultCount) {
          this.curPage > defaultCount - 3 && (showOmitPrev = true)
          this.curPage < this.pageCount - 3 && (showOmitNext = true)
        }
        if (showOmitPrev && !showOmitNext) {
          const startPage = this.pageCount - (defaultCount - 2)
          for (let i = startPage; i < this.pageCount; i++) {
            pagesGroup.push(i)
          }
        } else if (!showOmitPrev && showOmitNext) {
          for (let i = 2; i < defaultCount; i++) {
            pagesGroup.push(i)
          }
        } else if (showOmitPrev && showOmitNext) {
          const offset = Math.floor(defaultCount / 2) - 1
          const leeway = this.curPage + offset
          for (let i = this.curPage - offset; i <= leeway; i++) {
            pagesGroup.push(i)
          }
        } else {
          for (let i = 2; i < this.pageCount; i++) {
            pagesGroup.push(i)
          }
        }
        this.showOmitPrev = showOmitPrev
        this.showOmitNext = showOmitNext
        return pagesGroup
      }
    },
    watch: {
      'pageOption.pageCount': {
        handler (val) {
          val && (this.pageCount = val)
        }
      }
    },
    components: {
      ZpDropdownlist
    }
  }
</script>
<style>
.zp-pg-wrap {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.zp-pg {
  list-style-type: none;
  margin: 0;
  padding: 0;
  /* -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none; */
  display: inline-block;
  vertical-align: top;
  white-space: nowrap;
  margin-right: 18px;
}
.zp-pg li {
  display: inline-table;
  position: relative;
  vertical-align: middle;
  cursor: pointer;
  width: 23px;
  height: 23px;
  line-height: 23px;
  text-align: center;
  border: 1px solid #dedede;
  border-radius: 3px;
  margin-left: 5px;
  font-size: 14px;
  background: #dee3e6;
  font-weight: bold;
  color: #323c47;
}
.zp-pg li:first-child {
  margin-left: 0;
}
.zp-pg .zp-pg-prev:after {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  top: 8px;
  left: 10px;
  border-right: 1px solid #323c47;
  border-top: 1px solid #323c47;
  -moz-transform: rotate(225deg);
  -webkit-transform: rotate(225deg);
  -o-transform: rotate(225deg);
  transform: rotate(225deg);
}
.zp-pg .zp-pg-next:after {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  top: 8px;
  left: 12px;
  border-right: 1px solid #323c47;
  border-top: 1px solid #323c47;
  -moz-transform: rotate(45deg);
  -webkit-transform: rotate(45deg);
  -o-transform: rotate(45deg);
  transform: rotate(45deg);
  margin-left: -6px;
}
.zp-pg .zp-pg-disabled {
  cursor: not-allowed;
}
.zp-pg .zp-pg-disabled.zp-pg-prev:after,
.zp-pg .zp-pg-disabled.zp-pg-next:after {
  border-right: 1px solid #ccc;
  border-top: 1px solid #ccc;
}
.zp-pg .zp-pg-omit:after {
  content: '...';
  position: absolute;
  top: -5px;
  left: -4px;
  width: 30px;
  height: 30px;
  font-size: 20px;
}
.zp-pg .zp-pg-arrow-right:before,
.zp-pg .zp-pg-arrow-right:after {
  content: '';
  position: absolute;
  top: 8px;
  left: 5px;
  width: 6px;
  height: 6px;
  font-size: 20px;
  border-right: 1px solid #323c47;
  border-top: 1px solid #323c47;
  -moz-transform: rotate(45deg);
  -webkit-transform: rotate(45deg);
  -o-transform: rotate(45deg);
  transform: rotate(45deg);
}
.zp-pg .zp-pg-arrow-right:after {
  left: 10px;
}
.zp-pg .zp-pg-arrow-left:before,
.zp-pg .zp-pg-arrow-left:after {
  content: '';
  position: absolute;
  top: 8px;
  left: 7px;
  width: 6px;
  height: 6px;
  font-size: 20px;
  border-right: 1px solid #323c47;
  border-top: 1px solid #323c47;
  -moz-transform: rotate(225deg);
  -webkit-transform: rotate(225deg);
  -o-transform: rotate(225deg);
  transform: rotate(225deg);
}
.zp-pg .zp-pg-arrow-left:after {
  left: 12px;
}
.zp-pg .zp-pg-selected {
  background: #acb3ba;
  color: #fff!important;
  border-color: #acb3ba;
}
.zp-pg-ddl,
.zp-pg-jump {
  display: inline-block;
  margin-right: 2px;
}
.zp-pg-ddl input {
  height: 25px;
}
.zp-pg-jump input {
  display: inline-block;
  position: relative;
  border: 1px solid #e6e8ea;
  border-radius: 3px;
  width: 23px;
  height: 22px;
  text-align: center;
  cursor: pointer;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  margin: auto 5px;
}
input[type=number]::-webkit-outer-spin-button,
input[type=number]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
}
</style>