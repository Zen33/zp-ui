export default (el, opts) => {
  let isPicking = false
  const isSupportTouch = !!('ontouchstart' in window)
  const getEvt = evt => {
    return isSupportTouch ? evt.changedTouches[0] || evt.touches[0] : evt
  }
  const onPick = evt => {
    opts.pick && opts.pick(getEvt(evt))
  }
  const offPick = evt => {
    if (!isSupportTouch) {
      document.removeEventListener('mousemove', onPick)
      document.removeEventListener('mouseup', offPick)
    }
    isPicking = false
    opts.pickEnd && opts.pickEnd(getEvt(evt))
  }
  el.addEventListener(isSupportTouch ? 'touchstart' : 'mousedown', evt => {
    if (isPicking) {
      return false
    }
    evt.preventDefault()
    if (!isSupportTouch) {
      document.addEventListener('mousemove', onPick)
      document.addEventListener('mouseup', offPick)
    }
    isPicking = true
    opts.pickStart && opts.pickStart(getEvt(evt))
  })
  if (isSupportTouch) {
    el.addEventListener('touchmove', onPick)
    el.addEventListener('touchend', offPick)
    el.addEventListener('touchcancel', offPick)
  }
}
