<!-- Radio Group -->
<template>
  <div class="zp-radio-group">
    <slot></slot>
  </div>
</template>

<script>
  export default {
    name: 'zp-radio-group',
    props: ['value'],
    watch: {
      value (val) {
        this.$emit('change', val)
      }
    }
  }
</script>
