export default {
  computed: {
    transitionend () {
      const el = document.createElement('div')
      const transitions = {
        'transition': 'transitionend',
        // 'OTransition': 'otransitionend',
        'MozTransition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd'
      }
      let transitionend
      for (let key in transitions) {
        if (transitions.hasOwnProperty(key) && el.style[key] !== undefined) {
          return (transitionend = transitions[key])
        }
      }
      return transitionend
    }
  }
}
