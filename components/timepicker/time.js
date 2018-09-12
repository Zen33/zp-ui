import dateUtil from '../../utils/date'
import Utils from '../../utils/common'

const DEFAULT_FORMAT = 'HH:mm:ss'

const toDate = date => {
  return Utils.isDate(date) ? new Date(date) : null
}

export const parseDate = (string, format = DEFAULT_FORMAT) => {
  return dateUtil.parse(string, extractTimeFormat(format))
}

export const formatDate = (date, format = DEFAULT_FORMAT) => {
  date = toDate(date)
  if (date) {
    return dateUtil.format(date, extractTimeFormat(format))
  }
}

const extractTimeFormat = format => {
  return format.replace(/\W?D{1,2}|\W?Do|\W?d{1,4}|\W?M{1,4}|\W?y{2,4}/g, '').trim()
}

export const getArrayBtwTwoTimes = (start, end) => {
  start = dateUtil.parse(start, DEFAULT_FORMAT)
  end = dateUtil.parse(end, DEFAULT_FORMAT)
  const curDate = new Date(start.getTime())
  const dates = []
  while (curDate <= end) {
    const date = new Date(curDate).getHours()
    dates.push(date)
    curDate.setHours(date + 1, 0, 0, 0)
  }
  return dates
}

export const getRangeHours = ranges => {
  let hours = []
  let rangeHours = []
  for (let range of ranges) {
    if (Array.isArray(range)) {
      hours = hours.concat(getArrayBtwTwoTimes(range[0], range[1]))
    } else {
      hours = getArrayBtwTwoTimes(ranges[0], ranges[1])
    }
  }
  const len = hours.length
  // hours = [...new Set(hours)].sort((a, b) => a - b)
  for (let i = 0; i < 24; i++) {
    rangeHours[i] = {
      disabled: len ? hours.indexOf(i) === -1 : false,
      value: i
    }
  }
  return rangeHours
}
