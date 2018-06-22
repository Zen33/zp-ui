import Carousel from './Carousel.vue'
import CarouselItem from './CarouselItem.vue'

Carousel.install = Vue => {
  Vue.component(Carousel.name, Carousel)
}
CarouselItem.install = Vue => {
  Vue.component(CarouselItem.name, CarouselItem)
}

export {
  Carousel,
  CarouselItem
}
