export default {
  computed: {
    scrollbarWidth () {
      let outer = document.createElement('div')
      outer.style.visibility = 'hidden'
      outer.style.width = '100px'
      outer.style.msOverflowStyle = 'scrollbar'
      outer.style.top = '-9999px'
      document.body.appendChild(outer)
      const widthNoScroll = outer.offsetWidth
      outer.style.overflow = 'scroll'
      let inner = document.createElement('div')
      inner.style.width = '100%'
      outer.appendChild(inner)
      const widthWithScroll = inner.offsetWidth
      outer.parentNode.removeChild(outer)
      return widthNoScroll - widthWithScroll
    }
  }
}
