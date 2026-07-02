<template>
  <div class="auth-wrapper auth-v1 px-2 erp-auth">
    <div class="auth-inner py-2">
      <b-card class="mb-0">
        <b-link class="brand-logo" :to="{ name: 'login' }">
          <span class="erp-auth__mark">V</span>
          <h2 class="brand-text ml-1">VisionERP</h2>
        </b-link>
        <b-card-title class="mb-1">Create your workspace</b-card-title>
        <b-card-text class="mb-2">Set up an account for your company operations.</b-card-text>
        <b-alert v-if="error" variant="danger" show>{{ error }}</b-alert>
        <b-form @submit.prevent="submit">
          <b-form-group label="Full name"><b-form-input v-model="form.name" required /></b-form-group>
          <b-form-group label="Email"><b-form-input v-model="form.email" type="email" required /></b-form-group>
          <b-form-group label="Password"><b-form-input v-model="form.password" type="password" required /></b-form-group>
          <b-form-group label="Confirm password"><b-form-input v-model="form.password_confirmation" type="password" required /></b-form-group>
          <b-button type="submit" variant="primary" block :disabled="loading"><b-spinner v-if="loading" small class="mr-50" /> Create account</b-button>
        </b-form>
        <p class="text-center mt-2 mb-0">Already registered? <b-link :to="{ name: 'login' }">Sign in</b-link></p>
      </b-card>
    </div>
  </div>
</template>

<script>
import authService from '@/services/auth'

export default {
  data() {
    return { form: { name: '', email: '', password: '', password_confirmation: '' }, loading: false, error: '' }
  },
  methods: {
    async submit() {
      this.loading = true
      this.error = ''
      try {
        await authService.register(this.form)
        this.$router.push({ name: 'login' })
      } catch (error) {
        const errors = error.response?.data?.errors
        this.error = errors ? Object.values(errors).flat().join(' ') : (error.response?.data?.message || 'Registration failed.')
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="scss">
@import '@core/scss/vue/pages/page-auth.scss';
.erp-auth .card { border-radius: 6px; border: 1px solid #e5e7eb; box-shadow: 0 12px 35px rgba(23, 32, 42, 0.09); }
.erp-auth__mark { display: inline-flex; width: 36px; height: 36px; align-items: center; justify-content: center; border-radius: 6px; background: #16856b; color: #fff; font-weight: 800; }
</style>
