import Vue from 'vue'
import Utils from '../utils/common'

const i18nContent = {}
const defaultLang ='zh-CN'
const lang = Vue.config && Vue.config.lang || defaultLang
i18nContent[lang] = i18nContent[lang] || require(`./${lang}`)

export const t = (prop, ...args) => {
  if (i18nContent[lang]) {
    const i18nObj = i18nContent[lang].default || i18nContent[lang]
    let content = Utils.getDotNotationVal(i18nObj, prop)
    if (!content) {
      return ''
    }
    const RE_BRACE = /(%|)\{([0-9a-zA-Z_]+)\}/g
    const keyword = content.match(RE_BRACE)
    const len = args.length

    if (Array.isArray(keyword) && len) {
      for (let i = 0; i < len; i++) {
        content = content.split(keyword[i]).join(args[i])
      }
    }
    return content
  }
  return ''
}
