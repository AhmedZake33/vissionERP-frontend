<template>
  <div class="language-switcher">
    <b-button-group>
      <b-button
        :variant="currentLocale === 'en' ? 'primary' : 'outline-primary'"
        size="sm"
        @click="switchLanguage('en')"
        title="English"
      >
        EN
      </b-button>
      <b-button
        :variant="currentLocale === 'ar' ? 'primary' : 'outline-primary'"
        size="sm"
        @click="switchLanguage('ar')"
        title="العربية"
      >
        ع
      </b-button>
    </b-button-group>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'LanguageSwitcher',
  computed: {
    ...mapGetters('language', ['currentLocale']),
  },
  methods: {
    ...mapActions('language', ['changeLocale']),
    switchLanguage(locale) {
      if (this.currentLocale !== locale) {
        this.changeLocale(locale)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.language-switcher {
  .btn-group {
    box-shadow: 0 4px 25px 0 rgba(0, 0, 0, 0.1);
    border-radius: 6px;
    overflow: hidden;
    
    .btn {
      border-radius: 0;
      min-width: 45px;
      font-weight: 600;
      font-size: 0.875rem;
      
      &:first-child {
        border-top-left-radius: 6px;
        border-bottom-left-radius: 6px;
      }
      
      &:last-child {
        border-top-right-radius: 6px;
        border-bottom-right-radius: 6px;
      }
    }
  }
}
</style>