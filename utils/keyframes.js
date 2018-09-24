
let addKeyFrames
const stylesheet = document.createElement('style')

if (CSS && CSS.supports && CSS.supports('animation: name')){
  // the browser supports unprefixed version.
  addKeyFrames = (name, frames) => {
    const rules = document.createTextNode(`@keyframes ${name}{${frames}}`)
    stylesheet.appendChild(rules)
    document.head.appendChild(stylesheet)
  }
} else {
  addKeyFrames = (name, frames) => {
    const styles = window.getComputedStyle(document.documentElement, '')
    const pre = ([...styles].join('').match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o']))[1]
    const str = `${name}{${frames}}`
    const rules = document.createTextNode(`@-${pre}-keyframes ${str}`)
    stylesheet.appendChild(rules)
    document.head.appendChild(stylesheet)
  }
}

module.exports = addKeyFrames