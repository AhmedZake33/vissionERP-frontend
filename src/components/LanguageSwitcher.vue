<template>
  <div class="language-switcher">
    <b-button-group>
      <b-button
        :variant="currentLocale === 'en' ? 'primary' : 'outline-primary'"
        size="sm"
        :title="$t('erp.language.english')"
        @click="switchLanguage('en')"
      >
        EN
      </b-button>
      <b-button
        :variant="currentLocale === 'ar' ? 'primary' : 'outline-primary'"
        size="sm"
        :title="$t('erp.language.arabic')"
        @click="switchLanguage('ar')"
      >
        ع
      </b-button>
    </b-button-group>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'LanguageSwitcher',
  computed: {
    ...mapGetters('language', ['currentLocale']),
  },
  methods: {
    ...mapActions('language', ['changeLocale']),
    switchLanguage(locale) {
      if (this.currentLocale !== locale) this.changeLocale(locale)
    },
  },
}
</script>

<style lang="scss" scoped>
.language-switcher {
  .btn-group {
    overflow: hidden;
    border-radius: 6px;
    box-shadow: 0 4px 25px rgba(0, 0, 0, 0.1);
  }

  .btn {
    min-width: 42px;
    border-radius: 0;
    font-size: 0.875rem;
    font-weight: 600;
  }
}
</style>
