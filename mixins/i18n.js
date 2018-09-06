import { t } from '../i18n/'

export default {
  methods: {
    t (...args) {
      return t.apply(this, args)
    }
  }
}
