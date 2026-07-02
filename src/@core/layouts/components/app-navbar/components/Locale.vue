<template>
  <b-nav-item-dropdown right class="dropdown-language">
    <template #button-content>
      <feather-icon icon="GlobeIcon" size="20" />
      <span class="ml-50 d-none d-md-inline">{{ currentLocaleName }}</span>
    </template>
    <b-dropdown-item
      v-for="locale in locales"
      :key="locale.code"
      :active="currentLocale === locale.code"
      @click="changeLocale(locale.code)"
    >
      {{ locale.name }}
    </b-dropdown-item>
  </b-nav-item-dropdown>
</template>

<script>
import { BDropdownItem, BNavItemDropdown } from 'bootstrap-vue'
import { mapActions, mapGetters } from 'vuex'

export default {
  components: {
    BDropdownItem,
    BNavItemDropdown,
  },
  computed: {
    ...mapGetters('language', ['currentLocale']),
    locales() {
      return [
        { code: 'en', name: 'English' },
        { code: 'ar', name: 'العربية' },
      ]
    },
    currentLocaleName() {
      return this.locales.find(locale => locale.code === this.currentLocale)?.name || 'English'
    },
  },
  methods: {
    ...mapActions('language', ['changeLocale']),
  },
}
</script>
