<template>
  <div class="auth-wrapper auth-v1 px-2">
    <div class="auth-inner py-2">
      <b-card class="mb-0">
        <b-link class="brand-logo">
          <h2 class="brand-text text-primary ml-1">{{ $t('clinic.brandText') }}</h2>
        </b-link>

        <b-card-title class="mb-1">{{ $t('auth.resetPassword') }}</b-card-title>
        <b-card-text class="mb-2">{{ $t('auth.resetPasswordDesc') }}</b-card-text>

        <b-alert v-if="error" variant="danger" show>{{ error }}</b-alert>
        <b-alert v-if="success" variant="success" show>{{ success }}</b-alert>

        <b-form class="auth-login-form mt-2" @submit.prevent="handleSubmit">
          <b-form-group :label="$t('clinic.email')" label-for="email">
            <b-form-input
              id="email"
              v-model="form.email"
              type="email"
              :placeholder="$t('clinic.email')"
              required
            />
          </b-form-group>

          <b-form-group :label="$t('auth.newPassword')" label-for="password">
            <b-form-input
              id="password"
              v-model="form.password"
              type="password"
              :placeholder="$t('auth.newPassword')"
              required
            />
          </b-form-group>

          <b-form-group :label="$t('auth.confirmPassword')" label-for="password_confirmation">
            <b-form-input
              id="password_confirmation"
              v-model="form.password_confirmation"
              type="password"
              :placeholder="$t('auth.confirmPassword')"
              required
            />
          </b-form-group>

          <b-button type="submit" variant="primary" block :disabled="loading">
            <b-spinner v-if="loading" small class="mr-1" />
            {{ $t('auth.resetPassword') }}
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
      form: {
        token: '',
        email: '',
        password: '',
        password_confirmation: '',
      },
      error: '',
      success: '',
      loading: false,
    }
  },
  created() {
    this.form.token = this.$route.query.token || ''
    this.form.email = this.$route.query.email || ''
  },
  methods: {
    async handleSubmit() {
      this.loading = true
      this.error = ''
      this.success = ''
      try {
        await authService.resetPassword(this.form)
        this.success = this.$t('auth.passwordResetSuccess')
        setTimeout(() => this.$router.push({ name: 'login' }), 2000)
      } catch (e) {
        this.error = e.response?.data?.message || this.$t('messages.saveError')
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
