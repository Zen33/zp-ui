<!-- Tab Pane -->
<template>
  <div class="zp-tabs-pane" v-show="active">
    <slot></slot>
  </div>
</template>

<script>
  export default {
    name: 'zp-tab-pane',
    props: {
      label: String,
      name: String
    },
    data () {
      return {
        index: null
      }
    },
    computed: {
      active () {
        return this.$parent.tabName === this.paneName
      },
      paneName () {
        return this.name || this.index
      }
    }
  }
</script>
