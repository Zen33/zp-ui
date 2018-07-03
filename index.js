import Collapse from './components/collapse/'
import Dropdownlist from './components/dropdownlist/'
import Experience from './components/experience/'
import DynamicNumbers from './components/dynamicnumbers/'
import Progress from './components/progress/'
import Table from './components/table/'
import Pagination from './components/pagination/'
import Timeline from './components/timeline/'
import { Checkbox, CheckboxGroup } from './components/checkbox/'
import { Radio, RadioGroup } from './components/radio/'
import Switch from './components/switch/'
import Cascader from './components/cascader/'
import { Watermark, WatermarkDirective } from './components/watermark/'
import Dialog from './components/dialog/'
import DialogBox from './components/dialog/main'
import Slider from './components/slider/'
import Tooltip from './components/tooltip/'
import Popover from './components/popover/'
import Scroller from './components/scroller/'
import Message from './components/message/'
import Information from './components/information/'
import { Carousel, CarouselItem } from './components/carousel/'
import Breadcrumb from './components/breadcrumb/'
import Upload from './components/upload/'
import Sheet from './components/sheet/'
import Rate from './components/rate/'

const components = [
  Collapse,
  Dropdownlist,
  Experience,
  DynamicNumbers,
  Progress,
  Table,
  Pagination,
  Timeline,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  Switch,
  Cascader,
  Dialog,
  DialogBox,
  Slider,
  Tooltip,
  Popover,
  Scroller,
  Carousel,
  CarouselItem,
  Breadcrumb,
  Upload,
  Sheet,
  Rate
]

const install = Vue => {
  components.map(component => {
    Vue.component(component.name, component)
  })
  Vue.directive(Watermark.name, WatermarkDirective)
  
  Vue.prototype.$alert = DialogBox.alert
  Vue.prototype.$confirm = DialogBox.confirm
  Vue.prototype.$message = Message
  Vue.prototype.$info = Information
}

window.Vue && install(window.Vue)

const ZpUI = {}

ZpUI.install = install

export default ZpUI
export {
  Collapse,
  Dropdownlist,
  Experience,
  DynamicNumbers,
  Progress,
  Table,
  Pagination,
  Timeline,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  Switch,
  Cascader,
  Dialog,
  DialogBox,
  Watermark,
  WatermarkDirective,
  Slider,
  Tooltip,
  Popover,
  Scroller,
  Carousel,
  CarouselItem,
  Breadcrumb,
  Message,
  Information,
  Upload,
  Sheet,
  Rate
}
