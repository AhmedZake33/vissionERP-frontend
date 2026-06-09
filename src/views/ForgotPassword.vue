<template>
  <div class="auth-wrapper auth-v1 px-2">
    <div class="auth-inner py-2">
      <b-card class="mb-0">
        <b-link class="brand-logo">
          <h2 class="brand-text text-primary ml-1">{{ $t('clinic.brandText') }}</h2>
        </b-link>

        <b-card-title class="mb-1">{{ $t('auth.forgotPassword') }}</b-card-title>
        <b-card-text class="mb-2">{{ $t('auth.forgotPasswordDesc') }}</b-card-text>

        <b-alert v-if="error" variant="danger" show>{{ error }}</b-alert>
        <b-alert v-if="success" variant="success" show>{{ success }}</b-alert>

        <b-form class="auth-login-form mt-2" @submit.prevent="handleSubmit">
          <b-form-group :label="$t('clinic.email')" label-for="email">
            <b-form-input
              id="email"
              v-model="email"
              type="email"
              :placeholder="$t('clinic.email')"
              required
              autofocus
            />
          </b-form-group>

          <b-button type="submit" variant="primary" block :disabled="loading">
            <b-spinner v-if="loading" small class="mr-1" />
            {{ $t('auth.sendResetLink') }}
          </b-button>
        </b-form>

        <p class="text-center mt-2">
          <b-link :to="{ name: 'login' }">
            <feather-icon icon="ChevronLeftIcon" /> {{ $t('auth.backToLogin') }}
          </b-link>
        </p>
      </b-card>
    </div>
  </div>
</template>

<style lang="scss">
@import '@core/scss/vue/pages/page-auth.scss';
</style>

<script>
import {
  BCard,
  BCardTitle,
  BCardText,
  BForm,
  BFormGroup,
  BFormInput,
  BButton,
  BLink,
  BAlert,
  BSpinner,
} from 'bootstrap-vue'
import authService from '@/services/auth'

export default {
  components: {
    BCard,
    BCardTitle,
    BCardText,
    BForm,
    BFormGroup,
    BFormInput,
    BButton,
    BLink,
    BAlert,
    BSpinner,
  },
  data() {
    return {
      email: '',
      error: '',
      success: '',
      loading: false,
    }
  },
  methods: {
    async handleSubmit() {
      this.loading = true
      this.error = ''
      this.success = ''
      try {
        await authService.forgotPassword({ email: this.email })
        this.success = this.$t('auth.resetLinkSent')
        this.email = ''
      } catch (e) {
        this.error = e.response?.data?.message || this.$t('messages.saveError')
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
