<template>
  <div
    id="app"
    class="h-100"
    :class="[skinClasses]"
  >
    <component :is="layout">
      <router-view :key="$route.fullPath" />
    </component>

    <assistant-call-mini-widget class="assistant-mini-widget-root" />

    <scroll-to-top v-if="enableScrollToTop" />
  </div>
</template>



<script>
import ScrollToTop from '@core/components/scroll-to-top/ScrollToTop.vue'

// This will be populated in `beforeCreate` hook
import { $themeColors, $themeBreakpoints, $themeConfig } from '@themeConfig'
import { provideToast } from 'vue-toastification/composition'
import { watch } from '@vue/composition-api'
import useAppConfig from '@core/app-config/useAppConfig'

import { useWindowSize, useCssVar } from '@vueuse/core'

import store from '@/store'

const LayoutVertical = () => import('@/layouts/vertical/LayoutVertical.vue')
const LayoutHorizontal = () => import('@/layouts/horizontal/LayoutHorizontal.vue')
const LayoutFull = () => import('@/layouts/full/LayoutFull.vue')

export default {
  components: {

    // Layouts
    LayoutHorizontal,
    LayoutVertical,
    LayoutFull,

    ScrollToTop,
    // Global assistant mini widget
    AssistantCallMiniWidget: () => import('@/components/AssistantCallMiniWidget.vue'),
  },
  // ! We can move this computed: layout & contentLayoutType once we get to use Vue 3
  // Currently, router.currentRoute is not reactive and doesn't trigger any change
  computed: {
    layout() {
      if (this.$route.meta.layout === 'full') return 'layout-full'
      return `layout-${this.contentLayoutType}`
    },
    contentLayoutType() {
      return this.$store.state.appConfig.layout.type
    },
  },
  beforeCreate() {
    // Set colors in theme
    const colors = ['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'light', 'dark']

    // eslint-disable-next-line no-plusplus
    for (let i = 0, len = colors.length; i < len; i++) {
      $themeColors[colors[i]] = useCssVar(`--${colors[i]}`, document.documentElement).value.trim()
    }

    // Set Theme Breakpoints
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl']

    // eslint-disable-next-line no-plusplus
    for (let i = 0, len = breakpoints.length; i < len; i++) {
      $themeBreakpoints[breakpoints[i]] = Number(useCssVar(`--breakpoint-${breakpoints[i]}`, document.documentElement).value.slice(0, -2))
    }

    // Set RTL
    const { isRTL } = $themeConfig.layout
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr')
  },
  setup() {
    const { skin, skinClasses } = useAppConfig()
    const { enableScrollToTop } = $themeConfig.layout

    // If skin is dark when initialized => Add class to body
    if (skin.value === 'dark') document.body.classList.add('dark-layout')

    // Provide toast for Composition API usage
    provideToast({
      hideProgressBar: true,
      closeOnClick: false,
      closeButton: false,
      icon: false,
      timeout: 3000,
      transition: 'Vue-Toastification__fade',
    })

    // Set Window Width in store
    store.commit('app/UPDATE_WINDOW_WIDTH', window.innerWidth)
    const { width: windowWidth } = useWindowSize()
    watch(windowWidth, val => {
      store.commit('app/UPDATE_WINDOW_WIDTH', val)
    })

    return {
      skinClasses,
      enableScrollToTop,
    }
  },
}
</script>

<style lang="scss">
.card {
  box-shadow: none !important;
}

.header-navbar.navbar-shadow {
  box-shadow: none !important;
}

.pointer {
  cursor: pointer !important;
}

.modal .modal-header .close {
  margin: 0;
}

.main-menu.menu-light .navigation > li ul li > a {
  padding-left: 10px !important;
}

.vs--single {
  .vs__selected-options {
    width: 0;
  }

  .vs__selected {
    display: inline-block;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 100%;
    overflow: hidden;
  }
}

.gap {
  gap: 0.5rem;
}

/* Floating assistant mini-widget placement */
.assistant-mini-widget-root {
  position: fixed;
  right: 1rem;
  bottom: 1.25rem;
  z-index: 1050;
}

@media (min-width: 992px) {
  /* hide on large screens as navbar already shows calls */
  .assistant-mini-widget-root { display: none; }
}

/*! rtl:begin:ignore */

html[dir='rtl'] body .v-select {
  direction: rtl !important;
}

[dir='rtl'] .vs__search,
[dir='rtl'] .vs__search:focus {
  text-align: right;
}

[dir='rtl']
.vertical-layout.vertical-menu-modern
.main-menu
ul
.navigation
li.has-sub
a:after {
  transform: rotate(180deg) !important;
}

html[dir='rtl']
.vue-form-wizard
.wizard-card-footer
.wizard-footer-right
.wizard-btn::after {
  transform: rotate(180deg);
  display: inline-block;
}

[dir='ltr']
.table.b-table
> thead
> tr
> [aria-sort]:not(.b-table-sort-icon-left),
[dir='ltr']
.table.b-table
> tfoot
> tr
> [aria-sort]:not(.b-table-sort-icon-left) {
  background-position: left calc(2.5rem / 3) center !important;
}

[dir='rtl']
.table.b-table
> thead
> tr
> [aria-sort]:not(.b-table-sort-icon-left),
[dir='rtl']
.table.b-table
> tfoot
> tr
> [aria-sort]:not(.b-table-sort-icon-left) {
  background-position: right calc(2.5rem / 2) center !important;
}

[dir='ltr'] .right_left {
  direction: rtl !important;
}

[dir='rtl'] .left_right {
  direction: ltr !important;
}

[dir='rtl'] .left_right > * {
  direction: ltr !important;
}

/*! rtl:end:ignore */
</style>
