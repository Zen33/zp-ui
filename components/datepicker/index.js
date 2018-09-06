import DatePicker from './DatePicker.vue'
import Calendar from './Calendar.vue'
import AlmanacPicker from './AlmanacPicker.vue'

DatePicker.install = Vue => {
  Vue.component(DatePicker.name, DatePicker)
}

Calendar.install = Vue => {
  Vue.component(Calendar.name, Calendar)
}

AlmanacPicker.install = Vue => {
  Vue.component(AlmanacPicker.name, AlmanacPicker)
}

export {
  DatePicker,
  Calendar,
  AlmanacPicker
}
