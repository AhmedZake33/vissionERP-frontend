import { localize } from 'vee-validate'

export default {
  namespaced: true,
  state: {
    locale: localStorage.getItem('locale') || 'en',
    availableLocales: [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'ar', name: 'العربية', flag: '🇸🇦' }
    ]
  },
  getters: {
    currentLocale: state => state.locale,
    availableLocales: state => state.availableLocales,
    isRTL: state => state.locale === 'ar'
  },
  mutations: {
    SET_LOCALE(state, locale) {
      state.locale = locale
      localStorage.setItem('locale', locale)
    }
  },
  actions: {
    changeLocale({ commit, dispatch }, locale) {
      commit('SET_LOCALE', locale)

      // Sync appConfig RTL state immediately (before async import)
      const isRTL = locale === 'ar'
      commit('appConfig/SET_RTL', isRTL, { root: true })

      // Import i18n instance dynamically to avoid circular dependency
      import('@/libs/i18n').then(({ default: i18n }) => {
        // Update i18n locale (this triggers reactive $t() updates in all components)
        i18n.locale = locale
        
        // Update vee-validate locale
        localize(locale)
      })
    },
    initializeLocale({ commit }, locale) {
      commit('SET_LOCALE', locale)
      
      // Sync appConfig RTL state (used by Vuexy internal components)
      const isRTL = locale === 'ar'
      commit('appConfig/SET_RTL', isRTL, { root: true })
      
      // Import i18n instance dynamically
      import('@/libs/i18n').then(({ default: i18n }) => {
        // Update i18n locale
        i18n.locale = locale
        
        // Update vee-validate locale
        localize(locale)
      })
    }
  }
}