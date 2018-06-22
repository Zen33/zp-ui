<!-- Table -->
<template>
  <div class="zp-table" ref="tableSelf">
    <div class="zp-table-head-wrapper" ref="tableHeadWrapper">
      <table cellspacing="0" cellpadding="0" border="0" ref="tableHead">
        <colgroup ref="tableHeadColgroup"></colgroup>
        <thead ref="tableThead"></thead>
      </table>
    </div>
    <zp-scroller :nativeBar="!scrollbar" class="zp-table-body-wrapper" :ori-height="curHeight" ref="tableBodyWrapper">
      <table cellspacing="0" cellpadding="0" border="0" ref="tableBody">
        <colgroup ref="tableBodyColgroup"></colgroup>
        <tbody ref="tableTbody"></tbody>
      </table>
      <div class="zp-table-empty" v-show="!tableOption.data.length"><label>{{ tableOption.emptyText || '暂无数据'}}</label></div>
    </zp-scroller>
    <div v-if="tableOption.fixed" class="zp-table-fixed" ref="fixedTableSelf">
      <div class="zp-table-fixed-head-wrapper" ref="fixedTableHeadWrapper">
        <table cellspacing="0" cellpadding="0" border="0" ref="fixedTableHead">
          <colgroup ref="fixedTableHeadColgroup"></colgroup>
          <thead ref="fixedTableThead"></thead>
        </table>
      </div>
      <div class="zp-table-fixed-body-wrapper" ref="fixedTableBodyWrapper">
        <table cellspacing="0" cellpadding="0" border="0" ref="fixedTableBody">
          <colgroup ref="fixedTableBodyColgroup"></colgroup>
          <tbody ref="fixedTableTbody"></tbody>
        </table>
      </div>
    </div>
    <div v-show="isDragging" ref="dragLine" class="zp-drag-line"></div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import ZpCheckbox from '../checkbox/'
  import Cookie from '../../mixins/cookie'
  import ScrollbarWidth from '../../mixins/scrollbarWidth'
  const resizeEvent = require('../../utils/resize')

  export default {
    name: 'zp-table',
    props: ['tableOption'],
    mixins: [Cookie, ScrollbarWidth],
    data () {
      return {
        autosize: this.tableOption.autosize || true,
        renderFn: [],
        expandRenderFn: [],
        checkable: null,
        checkAll: false,
        allCks: [],
        fixed: false,
        expand: false,
        textIndent: this.getProp(this.tableOption, 'textIndent', 5),
        id: this.getProp(this.tableOption, 'id', 'id'),
        isLeaf: this.getProp(this.tableOption, 'isLeaf', 'isLeaf'),
        parentId: this.getProp(this.tableOption, 'parentId', 'parentId'),
        dragable: this.getProp(this.tableOption, 'dragable', false),
        scrollbar: this.getProp(this.tableOption, 'scrollbar'),
        curScrollTop: 0,
        isDragging: false,
        draggingStartX: null,
        draggingEndX: null,
        minColWidth: 30,
        draggingCol: null,
        colIndex: null,
        renderCell: [],
        cellVms: {},
        curHeight: 0
      }
    },
    components: {
      ZpCheckbox
    },
    mounted () {
      const tableStyles = window.getComputedStyle(this.$refs.tableSelf, null)
      this.bodyWrapper = this.$refs.tableBodyWrapper
      this.headWrapper = this.$refs.tableHeadWrapper
      this.scroller = this.scrollbar ? this.bodyWrapper.$refs.scrollerWrap : this.bodyWrapper.$el
      this.setEvts()
      this.renderTable()
      this.borderWidth = parseInt(tableStyles.getPropertyValue('border-top-width'), 10) || parseInt(tableStyles.getPropertyValue('border-bottom-width'), 10)
    },
    beforeDestroy () {
      this.autosize && resizeEvent.removeResizeListener(this.$el, this.updateLayout)
      if (this.renderCell.length) {
        for (let cell of this.renderCell) {
          cell.$destroy && cell.$destroy(true)
        }
      }
    },
    methods: {
      getProp (data, prop, val = true) {
        return data.hasOwnProperty(prop) ? data[prop] : val
      },
      adjustCol () { // 调整col
        const tableRect = this.$refs.tableSelf.getBoundingClientRect()
        this.oriWidth = tableRect.width
        this.oriHeight = tableRect.height
        !this.scrollbar && (this.scroller.style.overflow = 'auto')
        this.scrollX = this.scroller.scrollWidth > this.scroller.offsetWidth
        this.scrollY = this.scroller.scrollHeight > this.scroller.offsetHeight
        const leewayCol = [...this.$refs.tableHeadColgroup.querySelectorAll('col:last-child')][0]
        const leewayColName = leewayCol.getAttribute('name')
        const leewayColWidth = parseInt(leewayCol.getAttribute('width'), 10)
        if (this.scrollY && !leewayColName) {
          leewayCol.setAttribute('width', leewayColWidth + this.scrollbarWidth)
          leewayCol.setAttribute('name', 'zp-leeway')
        } else if (!this.scrollY && leewayColName) {
          leewayCol.setAttribute('width', leewayColWidth - this.scrollbarWidth)
          leewayCol.removeAttribute('name')
        }
      },
      setEvts () { // 设置事件
        let timer
        const startHandle = fn => { // scrollStart事件
          if (timer) {
            clearTimeout(timer)
            timer = null
          } else {
            fn && fn()
          }
          timer = setTimeout(() => {
            timer = null
          }, 1000)
        }
        this.scroller.addEventListener('scroll', evt => {
          if (this.headWrapper) {
            startHandle(this.adjustCol)
            this.headWrapper.scrollLeft = evt.target.scrollLeft
          }
          if (this.bodyWrapper && this.borderWidth) {

            if (this.scroller.scrollTop === (this.scroller.scrollHeight - this.scroller.offsetHeight + (this.scrollbar ? this.scrollbarWidth : 0))) {
              this.scroller.scrollTop -= 1
            }
            this.fixed && (this.$refs.fixedTableBodyWrapper.scrollTop = evt.target.scrollTop)
          }
          this.$emit('scroll-action', evt)
        })
        this.autosize && resizeEvent.addResizeListener(this.$el, this.updateLayout)
      },
      getClosest (el, selector) { // 获取最近的元素
        let matchesFn
        let parentEl
        ['matches', 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'oMatchesSelector'].some(fn => {
          if (typeof document.body[fn] === 'function') {
            matchesFn = fn
            return true
          }
          return false
        })
        while (el) {
          parentEl = el.parentElement
          if (parentEl && parentEl[matchesFn](selector)) {
            return parentEl
          }
          el = parentEl
        }
        return null
      },
      updateLayout () { // 调整布局
        this.adjustCol()
        if (this.borderWidth) {
          if (this.scrollY || (this.headWrapper.offsetHeight + this.$refs.tableBody.offsetHeight + this.borderWidth * 2 >= this.oriHeight)) {
            // const allRows = this.$refs.tableBody.rows
            const SELECTORS_STR = `tr:not([style*="display:none"]):not([style*="display: none"])`
            const allRows = this.$refs.tableBody.querySelectorAll(SELECTORS_STR)
            let lastFixedRow
            let lastRow
            try {
              lastRow = [...allRows[allRows.length - 1].querySelectorAll('td')]
            } catch (e) {
              lastRow = []
            }
            if (this.fixed) {
              // const allFixedRows = this.$refs.fixedTableBody.rows
              const allFixedRows = this.$refs.fixedTableBody.querySelectorAll(SELECTORS_STR)
              try {
                lastFixedRow = [...allFixedRows[allFixedRows.length - 1].querySelectorAll('td')]
              } catch (e) {
                lastFixedRow = []
              }
            }
            lastRow.forEach((row, index) => {
              lastFixedRow && (lastFixedRow[index].style.borderBottomWidth = 0)
              row.style.borderBottomWidth = 0
            })
          }
        }
        if (this.scrollX && this.fixed && !this.scrollbar) {
          this.$refs.fixedTableSelf.style.bottom = `${this.scrollbarWidth}px`
        }
        (this.$refs.tableHead.offsetWidth < this.headWrapper.offsetWidth) && this.renderTable(true)
      },
      appendContent (...args) { // 增加结点
        for (let item of args) {
          item[0].insertAdjacentHTML('beforeend', item[1])
        }
        this.scroller.scrollTop = this.curScrollTop
      },
      removeContent (...args) { // 移除结点
        for (let item of args) {
          while (item.firstChild) {
            item.removeChild(item.firstChild)
          }
        }
      },
      setCheckbox (status, force) { // 设置checkbox
        if (force) {
          this.allCks.forEach((ck, index) => {
            this.$set(this.allCks, index, status)
          })
        } else {
          if (!status) {
            this.checkAll = false
          } else {
            const cked = [].filter.call(this.allCks, ck => {
              return ck
            })
            if (this.allCks.length === cked.length) {
              this.checkAll = true
            }
          }
        }
      },
      getIndent (row, index) { // 获取缩进
        if (row.level && index === 0) {
          return `${parseInt(row.level, 10) * this.textIndent}px`
        } else {
          return 0
        }
      },
      getLevel (row, level = 0) { // 获取当前层级
        let lev = level
        if (row.hasOwnProperty(this.parentId)) {
          lev += 1
          return this.getLevel(row.parent, lev)
        } else {
          return lev
        }
      },
      setColPos () { // 保存当前col位置
        const posArray = []
        ;[...this.$refs.tableHeadColgroup.querySelectorAll('col')].forEach(col => {
          posArray.push(col.getAttribute('width'))
        })
        this.setCookie(this.uid, posArray, null)
      },
      getColPos (index) { // 获取当前col位置
        const posArray = this.getCookie(this.uid).split(',')
        if (posArray.length) {
          for (let [colIndex, pos] of posArray.entries()) {
            if (colIndex === index) {
              return pos
            }
          }
        }
        return null
      },
      renderTable (force) { // 表单渲染
        if (!this.tableOption.data || !this.tableOption.columns) {
          return false
        }
        this.fixed = !!this.tableOption.fixed
        const headColgroup = this.$refs.tableHeadColgroup
        const bodyColgroup = this.$refs.tableBodyColgroup
        const thead = this.$refs.tableThead
        const tbody = this.$refs.tableTbody
        const len = this.tableOption.columns.length
        const fixedHeadColgroup = this.$refs.fixedTableHeadColgroup
        const fixedBodyColgroup = this.$refs.fixedTableBodyColgroup
        const fixedThead = this.$refs.fixedTableThead
        const fixedTbody = this.$refs.fixedTableTbody
        let headColContent = ''
        let bodyColContent = ''
        const rowClass = this.tableOption.rowClass ? ` ${this.tableOption.rowClass}"` : ''
        let headContent = `<tr class="zp-column${rowClass}">`
        let bodyContent = ''
        let tableWidth = 0
        let ths
        let trs
        let expandItems
        let fixedTrs
        let fixedExpandItems
        const setHeadCellItem = (column, index, more) => {
          let fixedClass = ''
          if (!more) {
            let cellWidth = column.width || Math.round(curWidth / len)
            if (index === 0 && this.fixed) {
              this.fixedWidth = cellWidth
              fixedClass = ' zp-non-evt'
            }
            tableWidth += cellWidth
            if (index === len - 1 && tableWidth < curWidth) { // 自动补全宽度
              cellWidth += curWidth - tableWidth
            }
            headColContent += `<col width="${this.getColPos(index) || cellWidth}">`
          }
          const headClass = column.headClass ? ` class="${column.headClass}"` : ''
          let title = column.title || ''
          if (column.hasOwnProperty('checkable')) {
            this.checkable = column.checkable ? ' checked' : ''
            title = `<div class="zp-has-ck-all"><div class="zp-ck-all"></div></div>`
          }
          headContent += `<th${headClass}><div class="zp-cell${fixedClass}">${title}</div></th>`
        }
        const setRenderFn = (section, className, renderFn) => { // 设置渲染方法
          const cellFn = [...section.querySelectorAll(className)]
          const data = this.tableOption.data
          const self = this
          for (let [index, cell] of cellFn.entries()) {
            /* eslint-disable no-new */
            const uid = Math.random().toString(36).substr(2, 9)
            renderFn[index] && (this.cellVms[uid] = new Vue({
              el: cell,
              render: h => {
                return renderFn[index].render.call(this, h, data[renderFn[index].index], uid)
              },
              created () {
                self.renderCell.push(this)
              }
            }))
          }
        }
        const setHoverClass = (tr, syncTr, status) => { // 设置hover状态
          if (status) {
            tr.classList.add('zp-table-row-hover')
            syncTr && syncTr.classList.add('zp-table-row-hover')
          } else {
            tr.classList.remove('zp-table-row-hover')
            syncTr && syncTr.classList.remove('zp-table-row-hover')
          }
        }
        const setExpandStatus = (row, status) => { // 设置展开项
          for (let item of row) {
            item.visible = status
            !status && (item.expand = status)
            if (item.hasOwnProperty('children') && !status) {
              setExpandStatus(item.children, status)
            } else {
              setTimeout(() => {
                this.renderTable(true)
              }, 300)
            }
          }
        }
        const setItemAction = (index, item) => { // 设置展开树
          const expand = !!item.classList.contains('zp-expand-icon-expand')
          const row = this.tableOption.data[index]
          if (expand) {
            row.expand = false
            item.classList.remove('zp-expand-icon-expand')
            row.children && setExpandStatus(row.children, false)
          } else {
            // this.tableOption.expandClick && this.getData(index, row)
            this.getData(index, row, () => {
              row.landing && row.children && setExpandStatus(row.children, true)
            }, item)
            row.expand = true
            item.classList.add('zp-expand-icon-expand')
          }
        }
        if (force) {
          this.removeContent(headColgroup, thead, bodyColgroup, tbody)
          this.fixed && this.removeContent(fixedHeadColgroup, fixedThead, fixedBodyColgroup, fixedTbody)
        }
        const styles = window.getComputedStyle(this.$refs.tableHeadWrapper, null)
        const curWidth = parseInt(styles.getPropertyValue('width'), 10)
        this.renderFn = []
        this.expandRenderFn = []
        if (!this.tableOption.data.length) {
          for (let [colIndex, column] of this.tableOption.columns.entries()) {
            setHeadCellItem(column, colIndex)
          }
        } else {
          for (let [index, data] of this.tableOption.data.entries()) {
            let visibleStyle = ''
            const hasExpand = !!data.hasOwnProperty('isExpand')
            let expandClass = hasExpand ? 'zp-table-row zp-table-row-expand' : 'zp-table-row zp-table-row-solo'
            if (data.hasOwnProperty('visible') && data.visible === false) {
              visibleStyle = ' style="display: none;"'
            }
            bodyContent += `<tr class="${expandClass}${rowClass}"${visibleStyle}>`
            for (let [colIndex, column] of this.tableOption.columns.entries()) {
              index === 0 && setHeadCellItem(column, colIndex)
              const itemClass = column.itemClass ? ` class="${column.itemClass}"` : ''
              let expandContent = ''
              let expandStyle = ''
              if (this.tableOption.hasOwnProperty('expand')) {
                this.expand = this.tableOption.expand
                if (this.expand === 'tree') {
                  colIndex === 0 && (expandStyle = ` style="margin-left: ${this.getIndent(data, colIndex)};"`) && (expandContent = !data[this.isLeaf] ? '<i class="zp-expand-node zp-expand-icon zp-expand-icon-hide"></i>' : (data.expand ? '<i class="zp-expand-node zp-expand-icon zp-expand-icon-expand"></i>' : '<i class="zp-expand-node zp-expand-icon"></i>'))
                } else { // expandProp
                  column.expandProp && (expandContent = data.expand ? '<i class="zp-expand-node zp-expand-icon zp-expand-icon-expand"></i>' : '<i class="zp-expand-node zp-expand-icon"></i>')
                }
              }
              if (hasExpand) {
                const spanNum = len - colIndex
                let adjustStyle = ''
                const lastColumn = this.tableOption.columns[colIndex - 1]
                if (!colIndex) {
                  adjustStyle = ` style="border-right-width: 0;"`
                }
                if (!lastColumn || (lastColumn && !lastColumn.colSpan)) {
                  const colSpan = spanNum ? ` colspan="${spanNum}"` : ''
                  this.expandRenderFn.push({
                    render: data.render,
                    index
                  })
                  bodyContent += `<td${itemClass}${colSpan}${adjustStyle}><div class="zp-cell zp-non-evt"><i class="zp-expand-node zp-expand-icon-hide"></i><div class="zp-expand-holder"></div></div></td>`
                } else {
                  bodyContent += ''
                }
                column.colSpan = true
              } else if (data.hasOwnProperty(column.prop)) {
                let cellData = data[column.prop]
                if (column.hasOwnProperty('filter')) { // 过滤器
                  cellData = column.filter(data[column.prop])
                }
                bodyContent += `<td${itemClass}><div class="zp-cell"${expandStyle}>${expandContent}${cellData}</div></td>`
              } else if (column.hasOwnProperty('render')) { // JSX
                bodyContent += `<td${itemClass}><div class="zp-cell zp-non-evt">${expandContent}<div class="zp-tree-holder"></div></div></td>`
                this.renderFn.push({
                  render: column.render,
                  index
                })
              } else if (column.hasOwnProperty('checkable')) { // 存在checkbox
                bodyContent += `<td${itemClass}><div class="zp-cell zp-cell-center zp-non-evt"><div class="zp-has-ck"><div class="zp-ck"></div></div></div></td>`
              } else {
                bodyContent += `<td${itemClass}><div class="zp-cell"></div></td>`
              }
            }
            bodyContent += '</tr>'
          }
        }
        const getMouseX = evt => { // 设置坐标X轴
          return evt.clientX
        }
        const handleDragMove = evt => { // 拖拽中事件
          this.isDragging && setDragLine(evt)
        }
        const setDragLine = evt => { // 设置拖拽参考线
          const dragLine = this.$refs.dragLine
          const offsetX = this.$refs.tableSelf.getBoundingClientRect().left
          if (this.draggingCol.width + (getMouseX(evt) - this.draggingStartX) <= this.minColWidth) {
            return false
          }
          dragLine.style.left = `${getMouseX(evt) - offsetX}px`
        }
        const handleDragEnd = evt => { // 拖拽结束事件
          if (!this.isDragging) {
            return false
          }
          this.draggingEndX = getMouseX(evt)
          const diff = this.draggingEndX - this.draggingStartX
          const leeway = this.draggingCol.width + diff
          const colWidth = leeway < this.minColWidth ? this.minColWidth : leeway
          const colHead = this.$refs.tableHeadColgroup.querySelectorAll('col')[this.colIndex]
          const colBody = this.$refs.tableBodyColgroup.querySelectorAll('col')[this.colIndex]
          if (diff < 0 && thead.offsetWidth + diff < this.$refs.tableSelf.offsetWidth) {
            const nextColHead = colHead.nextElementSibling
            const nextColBody = colBody.nextElementSibling
            const nextColWidth = parseInt(nextColHead.getAttribute('width'), 10) - diff
            nextColHead.setAttribute('width', nextColWidth)
            nextColBody.setAttribute('width', nextColWidth)
          }
          colHead.setAttribute('width', colWidth)
          colBody.setAttribute('width', colWidth)
          this.setColPos()
          this.isDragging = false
          this.draggingCol = null
          document.body.classList.remove('zp-drag-on')
          document.body.style.cursor = ''
          document.removeEventListener('mousemove', handleDragMove)
          document.removeEventListener('mouseup', handleDragEnd)
          this.scroller && this.$refs.tableBodyWrapper.updateScrollbar()
        }
        const handleDragOut = evt => { // 拖拽离开事件
          document.body.style.cursor = ''
        }
        const setColDragable = (handler, index) => { // 设置拖拽事件
          handler.addEventListener('mousedown', evt => {
            if (!this.draggingCol) {
              return false
            }
            this.isDragging = true
            this.colIndex = index
            this.draggingStartX = getMouseX(evt)
            document.body.classList.add('zp-drag-on')
            setDragLine(evt)
            document.addEventListener('mousemove', handleDragMove)
            document.addEventListener('mouseup', handleDragEnd)
          })
          handler.addEventListener('mousemove', evt => {
            this.isDragging && setDragLine(evt)
            const rect = handler.parentNode.getBoundingClientRect()
            if (rect.width >= this.minColWidth && rect.right - getMouseX(evt) < 10) {
              if (!this.isDragging) {
                this.draggingCol = rect
              }
              document.body.style.cursor = 'col-resize'
            } else {
              if (!this.isDragging) {
                this.draggingCol = null
                document.body.style.cursor = ''
              }
            }
          })
          handler.addEventListener('mouseout', handleDragOut)
        }
        headContent += '</tr>'
        bodyColContent = headColContent
        this.appendContent([headColgroup, headColContent], [bodyColgroup, bodyColContent], [thead, headContent], [tbody, bodyContent])
        if (this.fixed) {
          const fixedTable = this.$refs.fixedTableSelf
          this.appendContent([fixedHeadColgroup, headColContent], [fixedBodyColgroup, bodyColContent], [fixedThead, headContent], [fixedTbody, bodyContent])
          fixedTable.style.width = `${this.fixedWidth}px`
          fixedTable.style.overflow = 'hidden'
          this.$refs.fixedTableHead.style.width = this.$refs.fixedTableBody.style.width = `${tableWidth}px`
          this.$refs.fixedTableBodyWrapper.style.top = `${this.$refs.fixedTableHeadWrapper.offsetHeight}px`
        }
        ths = [...thead.querySelectorAll('.zp-cell')].slice(0, -1)
        trs = [...tbody.querySelectorAll('tr')]
        expandItems = [...tbody.querySelectorAll('.zp-expand-node')]
        this.$refs.tableHead.style.width = this.$refs.tableBody.style.width = `${tableWidth}px`
        if (this.tableOption.height && !this.scrollbar) {
          this.scroller.style.height = `${this.tableOption.height - this.headWrapper.offsetHeight}px`
        }
        if (this.renderFn.length) {
          setRenderFn(tbody, '.zp-tree-holder', this.renderFn)
          this.fixed && setRenderFn(this.$refs.fixedTableTbody, '.zp-tree-holder', this.renderFn)
        }
        if (this.expandRenderFn.length) {
          setRenderFn(tbody, '.zp-expand-holder', this.expandRenderFn)
          this.fixed && setRenderFn(this.$refs.fixedTableTbody, '.zp-expand-holder', this.expandRenderFn)
        }
        if (this.checkable !== null) {
          const self = this
          const curHead = this.fixed ? fixedThead : thead
          const curBody = this.fixed ? fixedTbody : tbody
          this.checkAll = !!this.checkable
          new Vue({
            el: curHead.querySelector('.zp-ck-all'),
            render: h => { // render中无v-model --///
              /* https://cn.vuejs.org/v2/guide/render-function.html#v-model
              render 函数中没有与 v-model 相应的 api - 你必须自己来实现相应的逻辑,
              这就是深入底层要付出的，尽管麻烦了一些，但相对于 v-model 来说，你可以更灵活地控制。*/
              return h('zp-checkbox', {
                props: {
                  value: self.checkAll
                },
                on: {
                  input (val) {
                    self.checkAll = val
                    self.setCheckbox(val, true)
                  }
                }
              })
            }
          })
          ;[...curBody.querySelectorAll('.zp-ck')].map((ck, index) => {
            const self = this
            this.allCks[index] = !!this.checkable
            new Vue({
              el: ck,
              render: h => { // render中无v-model --///
                /* https://cn.vuejs.org/v2/guide/render-function.html#v-model
                render 函数中没有与 v-model 相应的 api - 你必须自己来实现相应的逻辑,
                这就是深入底层要付出的，尽管麻烦了一些，但相对于 v-model 来说，你可以更灵活地控制。*/
                return h('zp-checkbox', {
                  props: {
                    value: self.allCks[index]
                  },
                  on: {
                    input (val) {
                      self.$set(self.allCks, index, val)
                      self.setCheckbox(val)
                    }
                  }
                })
              }
            })
          })
        }
        if (this.fixed) {
          fixedTrs = [...fixedTbody.querySelectorAll('tr')]
          fixedExpandItems = [...fixedTbody.querySelectorAll('.zp-expand-node')]
          this.tableOption.rowClick && fixedTrs.map((tr, index) => {
            return tr.addEventListener('click', evt => {
              if (!this.getClosest(evt.target, '.zp-non-evt')) {
                this.tableOption.rowClick(evt, this.tableOption.data[index])
              }
            })
          })
        }
        this.dragable && ths.map((...args) => setColDragable(...args))
        trs.map((tr, index) => {
          tr.addEventListener('mouseenter', evt => {
            setHoverClass(tr, fixedTrs && fixedTrs[index], true)
          })
          tr.addEventListener('mouseleave', evt => {
            setHoverClass(tr, fixedTrs && fixedTrs[index])
          })
          if (this.fixed) {
            fixedTrs[index].addEventListener('mouseenter', evt => {
              setHoverClass(fixedTrs[index], tr, true)
            })
            fixedTrs[index].addEventListener('mouseleave', evt => {
              setHoverClass(fixedTrs[index], tr)
            })
          }
          this.tableOption.rowClick && tr.addEventListener('click', evt => {
            if (!this.getClosest(evt.target, '.zp-non-evt')) {
              this.tableOption.rowClick(evt, this.tableOption.data[index])
            }
          })
          return tr
        })
        if (this.expand) {
          expandItems.map((item, index) => {
            item.addEventListener('click', evt => {
              this.curScrollTop = this.scroller.scrollTop
              setItemAction(index, item)
            })
          })
          this.fixed && fixedExpandItems.map((item, index) => {
            item.addEventListener('click', evt => {
              this.curScrollTop = this.scroller.scrollTop
              setItemAction(index, item)
            })
          })
        }
        if (this.scrollbar) {
          const curHeight = this.tableOption.height - this.headWrapper.offsetHeight + this.scrollbarWidth
          this.$refs.tableBodyWrapper.curHeight = isNaN(curHeight) ? null : curHeight
          this.$refs.tableBodyWrapper.updateScrollbar()
        }
      // force && this.updateLayout()
      },
      async getData (index, row, callback, item) { // 获取子节点数据
        const getId = (min = 10000, max = 99999) => { // 随机数
          return Math.round(Math.random() * (max - min) + min)
        }
        // const handleError = fn => (...params) => fn(...params).catch(e => {
        //   console.log(`${e}`)
        // })
        if (!row.expand) {
          if (!row.landing) {
            let data = []
            if (this.tableOption.expandClick) {
              try {
                data = await this.tableOption.expandClick(index, row)
              } catch (e) {
                console.error(`${e}`)
                setTimeout(() => {
                  row.landing = false
                }, 300)
              }
            } else if (this.expand !== 'tree') { // 非树表格
              if (!row.hasOwnProperty(this.id)) {
                row[this.id] = getId()
              }
              let curData = Object.assign({}, row)
              curData[this.id] = getId()
              curData[this.parentId] = row[this.id]
              curData.isExpand = true
              curData.render = this.tableOption.expandRender || ''
              data = [curData]
            }
            if (data.length) {
              row.children = data
              for (let datum of data) {
                datum.parent = row
                datum.level = this.getLevel(datum)
              }
              this.tableOption.data.splice(index + 1, 0, ...data)
            }
            row.landing = true
          }
        }
        callback && callback()
      }
    },
    computed: {
      uid () {
        return Math.random().toString(36).substr(2, 9)
      }
    }
  }
</script>

<style>
  .zp-table-head-wrapper {
    overflow: hidden;
  }
  .zp-table-head-wrapper,
  .zp-table-body-wrapper {
    width: 100%;
  }
  .zp-table-body-wrapper {
    overflow: auto;
    position: relative;
    min-height: 40px;
  }
  .zp-table-fixed-body-wrapper {
    min-height: 40px;
  }
  .zp-table {
    width: 100%;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    max-width: 100%;
    background-color: #fff;
    border: 1px solid #e6e8ea;
    font-size: 14px;
    color: #323c47;
  }
  .zp-cell {
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    word-break: break-all;
    /* line-height: 24px; */
    padding-left: 18px;
    padding-right: 18px;
  }
  .zp-table td,
  .zp-table th {
    height: 40px;
    min-width: 0;
    box-sizing: border-box;
    text-overflow: ellipsis;
    vertical-align: middle;
    position: relative;
    border-right: 1px solid #e6e8ea;
    overflow: hidden;
    white-space: nowrap;
  }
  .zp-table th {
    background: #f7f8fa;
    border-bottom: 1px solid #e6e8ea;
  }
  .zp-table td {
    border-bottom: 1px solid #e6e8ea;
  }
  .zp-table tr th:last-child,
  .zp-table tr td:last-child {
    border-right-width: 0;
  }
  /* .zp-table-body-wrapper table,
  .zp-table-fixed-body-wrapper table {
    line-height: 40px;
    background-image: -moz-linear-gradient(transparent 50%, #f7f8fa 50%);
    background-image: -webkit-linear-gradient(transparent 50%, #f7f8fa 50%);
    background-image: -o-linear-gradient(transparent 50%, #f7f8fa 50%);
    background-image: linear-gradient(transparent 50%, #f7f8fa 50%);
    background-size: 100% 80px;
  } */
  .zp-table-row-solo:nth-child(odd) {
    background: #fff;
  }
  .zp-table-row-solo:nth-child(even) {
    background: #f7f8fa;
  }
  .zp-table-row:not(.zp-table-row-solo) ~ .zp-table-row-solo:nth-child(odd) {
    background: #f7f8fa;
  }
  .zp-table-row:not(.zp-table-row-solo) ~ .zp-table-row-solo:nth-child(even) {
    background: #fff;
  }
  .zp-table-row:not(.zp-table-row-solo) ~ .zp-table-row:not(.zp-table-row-solo) ~ .zp-table-row-solo:nth-child(odd) {
    background: #fff;
  }
  .zp-table-row:not(.zp-table-row-solo) ~ .zp-table-row:not(.zp-table-row-solo) ~ .zp-table-row-solo:nth-child(even) {
    background: #f7f8fa;
  }
  .zp-table table {
    table-layout: fixed;
  }
  .zp-cell-left {
    text-align: left;
  }
  .zp-cell-center {
    text-align: center;
  }
  .zp-cell-right {
    text-align: right;
  }
  .zp-table-row-hover {
    background: #f3f7f9!important;
  }
  .zp-table .zp-table-empty {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    text-align: center;
  }
  .zp-table .zp-table-empty label {
    -moz-transform: translateY(-50%);
    -webkit-transform: translateY(-50%);
    -o-transform: translateY(-50%);
    transform: translateY(-50%);
    position: absolute;
    top: 50%;
  }
  .zp-table-fixed {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    background: #fff;
    box-shadow: 1px 0 8px #dedede;
  }
  .zp-table-fixed tr td:first-child,
  .zp-table-fixed tr th:first-child {
    border-right: none;
  }
  .zp-table-fixed-body-wrapper {
    position: absolute;
    left: 0;
    overflow: hidden;
    bottom: 0;
  }
  .zp-expand-icon-expand {
    -moz-transform: rotate(0deg)!important;
    -webkit-transform: rotate(0deg)!important;
    -o-transform: rotate(0deg)!important;
    transform: rotate(0deg)!important;
  }
  .zp-expand-icon {
    display: inline-block;
    width: 14px;
    height: 8px;
    margin-left: 10px;
    background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAICAYAAADJEc7MAAAAAXNSR0IArs4c6QAAAKBJREFUGBmFkFEOwiAQRIFLNB4HDuRP/VD/tdhUbTwQcBtvAc40bGI1DSSbZXbetICOMfZKqZ219oDeXOAnQG9TSulQfUrp3kqRIcvMwoYQRlRBPbbC9Cozrhh87UYDR3muDAjO6JH59RYNwNfwLABmc515mbHrb8E9wAF3OBpjXtQ5573W2uPxTtSy/oI08IcrmoCDc+4sgWbHfS6sLfADvGRlngSVsjQAAAAASUVORK5CYII=') no-repeat;
    -moz-transition: -moz-transform .3s;
    -webkit-transition: -webkit-transform .3s;
    -o-transition: -o-transform .3s;
    transition: transform .3s;
    cursor: pointer;
    -moz-transform: rotate(-90deg);
    -webkit-transform: rotate(-90deg);
    -o-transform: rotate(-90deg);
    transform: rotate(-90deg);
    margin-right: 5px;
  }
  .zp-expand-icon-hide {
    visibility: hidden;
  }
  .zp-drag {
    position: absolute;
    cursor: col-resize;
    top: 0;
    right: 0;
    bottom: 0;
    width: 5px;
    background: red;
    overflow: hidden;
  }
  .zp-drag-line {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 0;
    overflow: hidden;
    border-left: 2px dashed #e6e8ea;
  }
  .zp-drag-on {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
</style>