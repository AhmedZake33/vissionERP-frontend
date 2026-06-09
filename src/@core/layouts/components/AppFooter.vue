<template>
  <p class="clearfix mb-0">
    <span class="float-md-left d-block d-md-inline-block mt-25">
      COPYRIGHT © {{ new Date().getFullYear() }} <a href="https://tafratech.com" target="_blank" class="text-bold-800 grey darken-2">TAFRATECH </a>
      <span class="d-none d-sm-inline-block">, All rights Reserved</span>
    </span>

    
  </p>
</template>

<script>
import { BLink } from 'bootstrap-vue'

export default {
  components: {
    BLink,
  },
}
</script>
