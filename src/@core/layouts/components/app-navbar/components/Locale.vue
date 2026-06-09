<template>
  <div id="dropdown-grouped" variant="link" class="dropdown-language" right>
    <span class="pointer mx-1"
          v-for="localeObj in locales"
          v-if="$i18n.locale != localeObj.locale"
          :key="localeObj.locale" @click="changeLocal(localeObj)">
      <span class="ml-50">{{ localeObj.name }}</span>
    </span>
  </div>
</template>

<script>
import { BNavItemDropdown, BDropdownItem, BImg } from 'bootstrap-vue'

export default {
  components: {
    BNavItemDropdown,
    BDropdownItem,
    BImg,
  },
  computed: {
    currentLocale() {
      return this.locales.find(l => l.locale === this.$i18n.locale)
    },
  },
  mounted() {
    const lang = localStorage.getItem('locale') || 'en'
    if (lang) {
      this.$i18n.locale = lang
      const local = this.locales.find(l => l.locale === this.$i18n.locale)
      this.$store.commit('appConfig/SET_RTL', local.RTL)
    }
  },
  setup() {
    const locales = [
      {
        locale: 'en',
        img: '',
        name: 'English',
        RTL: false,
      },
      {
        locale: 'ar',
        img: '',
        name: 'عربى',
        RTL: true,
      },
    ]
    return {
      locales,
    }
  },
  methods: {
    changeLocal(localeObj) {
      this.$store.commit('appConfig/SET_RTL', localeObj.RTL)
      this.$i18n.locale = localeObj.locale
      localStorage.setItem('locale', localeObj.locale)
    },
  },
}
</script>

<style></style>
