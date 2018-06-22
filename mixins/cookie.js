export default {
  methods: {
    getCookie (name) { // 获取cookie
      const cookieContent = '; ' + document.cookie
      const cookies = cookieContent.split(`; ${name}=`)
      return !!(cookies.length - 1) ? cookies.pop().split(';').shift() : ''
    },
    setCookie (name, val, days = 1) { // 设置cookie
      let expires = ''
      if (days) {
        const date = new Date()
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
        expires = `; expires=${date.toUTCString()}`
      }
      document.cookie = `${name}=${val}${expires}; path=/`
    },
    removeCookie (name) { // 移除cookie
      this.setCookie(name, '', -1)
    }
  }
}
