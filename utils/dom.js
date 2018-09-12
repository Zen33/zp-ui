// https://github.com/joakimbeng/kebab-case
const KEBAB_REGEX = /[A-Z\u00C0-\u00D6\u00D8-\u00DE]/g
const REVERSE_REGEX = /-[a-z\u00E0-\u00F6\u00F8-\u00FE]/g
const kebabCase = str => {
	return str.replace(KEBAB_REGEX, match => {
		return `-${match.toLowerCase()}`
	})
}
const reverse = str => {
	return str.replace(REVERSE_REGEX, match => {
		return match.slice(1).toUpperCase()
	})
}

export const domStyle = (el, props, val, pseudo) => {
  if (!el || !props) {
    return
  }
  if (props === Object(props)) {
    for (let prop in props) {
      domStyle(el, kebabCase(prop), props[prop])
    }
    return props
  }
  const context = (el.ownerDocument || document)['defaultView']
  // if (!context.hasOwnProperty('getComputedStyle')) {
  if (typeof context.getComputedStyle !== 'function') {
    context.getComputedStyle = (el, pseudo) => {
      return {
        el,
        getPropertyValue (prop) {
          prop === 'float' && (prop = 'styleFloat')
          prop = reverse(prop)
          return el.currentStyle ? el.currentStyle[prop] : el.style[prop]
        }
      }
    }
  }
  if (typeof val !== 'undefined') {
    el.style[reverse(props === 'float' ? 'cssFloat' : props)] = val || ''
    return val
  }
  return context.getComputedStyle(el, pseudo || null).getPropertyValue(kebabCase(props === 'cssFloat' ? 'float' : props))
}
