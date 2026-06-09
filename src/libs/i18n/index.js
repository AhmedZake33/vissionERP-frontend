import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

function loadLocaleMessages() {
  const locales = require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.json$/i)
  const messages = {}
  locales.keys().forEach(key => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i)
    if (matched && matched.length > 1) {
      const locale = matched[1]
      messages[locale] = locales(key)
    }
  })
  return messages
}

// Get stored locale or default to 'en'
const getStoredLocale = () => {
  return localStorage.getItem('locale') || 'en'
}

// Set HTML direction based on locale
const setHTMLDirection = (locale) => {
  const html = document.documentElement
  if (locale === 'ar') {
    html.setAttribute('dir', 'rtl')
    html.setAttribute('lang', 'ar')
  } else {
    html.setAttribute('dir', 'ltr')
    html.setAttribute('lang', 'en')
  }
}

const i18n = new VueI18n({
  locale: getStoredLocale(),
  fallbackLocale: 'en',
  messages: loadLocaleMessages(),
})

// Set initial direction
setHTMLDirection(i18n.locale)

export default i18n
