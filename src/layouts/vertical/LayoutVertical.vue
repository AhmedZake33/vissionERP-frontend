<template>
  <layout-vertical>

    <router-view />

  </layout-vertical>
</template>

<script>
import LayoutVertical from '@core/layouts/layout-vertical/LayoutVertical.vue'

export default {
  components: {
    LayoutVertical,
  },
}
</script>
