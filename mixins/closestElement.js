export default {
  methods: {
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
    }
  }
}