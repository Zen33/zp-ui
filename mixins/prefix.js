export default {
  computed: {
    prefix () {
      const styles = window.getComputedStyle(document.documentElement, '')
      const pre = ([...styles].join('').match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o']))[1]
      const dom = ('WebKit|O|Moz|MS|').match(new RegExp(`(${pre})`, 'i'))[1]
      return {
        dom,
        lowercase: pre,
        css: `-${pre}-`,
        js: pre[0].toUpperCase() + pre.substr(1)
      }
    }
  }
}