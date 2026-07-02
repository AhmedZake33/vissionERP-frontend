import { localize } from 'vee-validate'

const applyDocumentLocale = locale => {
  const isRTL = locale === 'ar'
  document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr')
  document.documentElement.setAttribute('lang', locale)
  document.body.classList.toggle('rtl', isRTL)
}

export default {
  namespaced: true,
  state: {
    locale: localStorage.getItem('locale') || 'en',
    availableLocales: [
      { code: 'en', name: 'English' },
      { code: 'ar', name: 'العربية' },
    ],
  },
  getters: {
    currentLocale: state => state.locale,
    availableLocales: state => state.availableLocales,
    isRTL: state => state.locale === 'ar',
  },
  mutations: {
    SET_LOCALE(state, locale) {
      state.locale = locale
      localStorage.setItem('locale', locale)
    },
  },
  actions: {
    async changeLocale({ commit }, locale) {
      commit('SET_LOCALE', locale)
      commit('appConfig/SET_RTL', locale === 'ar', { root: true })
      applyDocumentLocale(locale)

      const { default: i18n } = await import('@/libs/i18n')
      i18n.locale = locale
      localize(locale)
    },
    async initializeLocale({ commit }, locale) {
      commit('SET_LOCALE', locale)
      commit('appConfig/SET_RTL', locale === 'ar', { root: true })
      applyDocumentLocale(locale)

      const { default: i18n } = await import('@/libs/i18n')
      i18n.locale = locale
      localize(locale)
    },
  },
}
