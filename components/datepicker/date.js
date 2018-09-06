import { t } from '../../i18n'
import dateUtil from '../../utils/date'
import Utils from '../../utils/common'

const DEFAULT_FORMAT = 'yyyy-MM-dd'
export const weeks = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map(day => t(`date.weeks.${day}`))
export const monthShort = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
const i18nProps = () => {
  return {
    dayNamesShort: weeks,
    dayNames: weeks,
    monthNamesShort: monthShort.map(month => t(`date.months.${ month }`)),
    monthNames: monthShort.map((ignore, index) => t(`date.month${ index + 1 }`)),
    amPm: ['am', 'pm']
  }
}

export const getDayCountOfMonth = (year, month) => {
  const months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (month === 1) {
    if ((year % 400 === 0) || (year % 4 === 0 && year % 100 !== 0)) {
      return 29
    }
    return months[1]
  }
  return months[month]
}

const toDate = date => {
  return Utils.isDate(date) ? new Date(date) : null
}

export const parseDate = (string, format = DEFAULT_FORMAT) => {
  return dateUtil.parse(string, extractDateFormat(format), i18nProps())
}

export const formatDate = (date, format = DEFAULT_FORMAT) => {
  date = toDate(date)
  if (date) {
    return dateUtil.format(date, extractDateFormat(format), i18nProps())
  }
}

const extractDateFormat = format => {
  return format.replace(/\W?m{1,2}|\W?ZZ/g, '').replace(/\W?h{1,2}|\W?s{1,3}|\W?a/gi, '').trim()
}

const extractTimeFormat = format => {
  return format.replace(/\W?D{1,2}|\W?Do|\W?d{1,4}|\W?M{1,4}|\W?y{2,4}/g, '').trim()
}

export const getArrayBtwTwoDates = (start, end, format = true) => {
  const curDate = new Date(start.getTime())
  const dates = []
  while (curDate <= end) {
    const date = new Date(curDate)
    dates.push(format ? formatDate(date) : date)
    curDate.setDate(curDate.getDate() + 1)
  }
  return dates
}

export const getPrevMonthDate = (date = new Date()) => {
  const day = new Date(date.getFullYear(), date.getMonth(), 0)
  return getFirstDateOfMonth(day)
  // return new Date(date.getFullYear() - (date.getMonth() > 0 ? 0 : 1), (date.getMonth() - 1 + 12) % 12, 1)
}
export const getNextMonthDate = (date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1)
}
export const getPrevYearDate = (date = new Date()) => {
  return new Date(date.getFullYear() - 1, date.getMonth())
}
export const getNextYearDate = (date = new Date()) => {
  return new Date(date.getFullYear() + 1, date.getMonth())
}
export const getFirstDateOfMonth = (date = new Date()) => {
  date.setDate(1)
  date.setHours(0, 0, 0, 0)
  return date
}
