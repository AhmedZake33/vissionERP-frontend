import { $themeBreakpoints } from '@themeConfig'

export default {
  watch: {
    $route(to, from) {
      // Only hide sidebar on route change for small screens
      // Skip if this is the first navigation (from login to dashboard)
      const windowWidth = this.$store.state.app.windowWidth
      const isSmallScreen = windowWidth > 0 && windowWidth < $themeBreakpoints.xl
      
      if (isSmallScreen) {
        this.isVerticalMenuActive = false
      }
    },
  },
}
