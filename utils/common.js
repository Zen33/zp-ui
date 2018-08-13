export default {
  isObject (obj) { // 是否为对象
    return (!!obj) && (obj.constructor === Object)
  },
  isEmptyObject (obj) { // 是否为空对象
    return this.isObject(obj) && (Object.keys(obj).length === 0)
  },
  isNumber (n) { // 是否为数字
    return !isNaN(parseFloat(n)) && isFinite(n)
  }
}
