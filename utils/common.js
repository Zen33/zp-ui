export default {
  isObject (obj) { // 是否为对象
    return (!!obj) && (obj.constructor === Object)
  },
  isEmptyObject (obj) { // 是否为空对象
    return this.isObject(obj) && (Object.keys(obj).length === 0)
  },
  isNumber (n) { // 是否为数字
    return !isNaN(parseFloat(n)) && isFinite(n)
  },
  isDate (d) { // 是否为日期
    if (d === null || d === undefined) {
      return false
    }
    if (isNaN(new Date(d).getTime())) { 
      return false
    }
    return true
  },
  getDotNotationVal (obj, prop, val) { // 获取形如a.b.c value
    if (!prop) {
      return obj
    }
    const props = prop.split('.')
    const final = props.pop()
    let key
    while ((key = props.shift())) {
      if (typeof obj[key] === 'undefined') {
        return undefined
      }
      obj = obj[key]
    }
    return val ? (obj[final] = val) : obj[final]
  }
}
