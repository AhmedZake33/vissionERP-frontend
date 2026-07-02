<template>
  <transition name="fade">
    <div
      v-if="isApiLoading"
      class="page-api-loader"
    >
      <div class="page-api-loader__box">
        <b-spinner
          small
          variant="primary"
        />
        <span>{{ $t('erp.common.loading') }}</span>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  computed: {
    isApiLoading() {
      return this.$store.getters['app/isApiLoading']
    },
  },
}
</script>

<style lang="scss">
.app-content.content {
  position: relative;
}

.page-api-loader {
  align-items: center;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(2px);
  display: flex;
  inset: 0;
  justify-content: center;
  min-height: 220px;
  position: absolute;
  z-index: 1200;
}

.page-api-loader__box {
  align-items: center;
  align-self: flex-start;
  background: #fff;
  border: 1px solid rgba(34, 41, 47, 0.08);
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(34, 41, 47, 0.12);
  color: #5e5873;
  display: inline-flex;
  font-weight: 600;
  gap: 0.75rem;
  margin-top: 18vh;
  min-height: 52px;
  padding: 0.875rem 1.125rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
