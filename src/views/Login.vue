<template>
  <div class="auth-wrapper auth-v1 px-2">
    <div class="position-absolute auth-language-switcher">
      <language-switcher />
    </div>
    <div class="auth-inner py-2">
      <b-card class="mb-0">
        <b-link class="brand-logo">
          <span class="erp-auth__mark">V</span>
          <h2 class="brand-text ml-1">VisionERP</h2>
        </b-link>

        <b-card-title class="mb-1">{{ $t('erp.login.title') }}</b-card-title>
        <b-card-text class="mb-2">{{ $t('erp.login.description') }}</b-card-text>

        <b-alert v-if="error" variant="danger" show>
          {{ error }}
        </b-alert>

        <b-form class="auth-login-form mt-2" @submit.prevent="handleLogin">
          <b-form-group :label="$t('clinic.email')" label-for="login-email">
            <b-form-input
              id="login-email"
              v-model="email"
              type="email"
              :placeholder="$t('clinic.email')"
              required
            />
          </b-form-group>

          <b-form-group :label="$t('clinic.password')" label-for="login-password">
            <b-input-group>
              <b-form-input
                id="login-password"
                v-model="password"
                :type="passwordFieldType"
                :placeholder="$t('clinic.password')"
                required
              />
              <b-input-group-append>
                <b-button
                  variant="outline-secondary"
                  type="button"
                  class="btn-icon"
                  @click="togglePasswordVisibility"
                >
                  <feather-icon :icon="passwordToggleIcon" />
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>

          <div class="d-flex justify-content-end mb-1">
            <b-link :to="{ name: 'forgot-password' }" class="small">
              {{ $t('auth.forgotPassword') }}
            </b-link>
          </div>

          <b-button type="submit" variant="primary" block :disabled="loading">
            <b-spinner v-if="loading" small class="mr-1" />
            {{ $t('actions.signIn') }}
          </b-button>
          <p class="text-center mt-2 mb-0">
            New to VisionERP? <b-link :to="{ name: 'register' }">Create an account</b-link>
          </p>
        </b-form>
      </b-card>
    </div>
  </div>
</template>

<script>
import {
  BCard,
  BCardTitle,
  BCardText,
  BForm,
  BFormGroup,
  BFormInput,
  BInputGroup,
  BInputGroupAppend,
  BButton,
  BLink,
  BAlert,
  BSpinner,
} from 'bootstrap-vue'
import authService from '@/services/auth'
import { erpHomePathForPermissions, hasErpPermission } from '@/utils/erpHomeRoute'

export default {
  components: {
    BCard,
    BCardTitle,
    BCardText,
    BForm,
    BFormGroup,
    BFormInput,
    BInputGroup,
    BInputGroupAppend,
    BButton,
    BLink,
    BAlert,
    BSpinner,
  },
  data() {
    return {
      email: '',
      password: '',
      passwordFieldType: 'password',
      error: '',
      loading: false,
    }
  },
  computed: {
    passwordToggleIcon() {
      return this.passwordFieldType === 'password' ? 'EyeIcon' : 'EyeOffIcon'
    },
  },
  methods: {
    togglePasswordVisibility() {
      this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password'
    },
    async handleLogin() {
      this.loading = true
      this.error = ''

      try {
        const response = await authService.login({
          email: this.email,
          password: this.password,
        })

        // Store user data in Vuex store
        this.$store.dispatch('auth/login', {
          token: response.data.token,
          user: response.data.user,
          permissions: response.data.permissions || [],
          roles: response.data.roles || [],
        })

        // Redirect to role-specific dashboards
        const permissions = response.data.permissions || []
        const role = response.data.user.role
        let target = '/dashboard'
        if (role === 'super_admin') target = '/super-admin'
        else if (hasErpPermission(permissions)) target = erpHomePathForPermissions(permissions)
        else if (role === 'doctor') target = '/doctor/dashboard'
        else if (role === 'assistant') target = '/assistant/dashboard'
        else if (role === 'sub-doctor') target = '/doctor/dashboard'
        this.$router.push(target).catch(() => {})
      } catch (error) {
        const data = error.response?.data
        this.error = data?.errors?.email?.[0] || data?.message || 'Login failed. Please try again.'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="scss">
@import '@core/scss/vue/pages/page-auth.scss';
.auth-inner .card { border-radius: 6px; border: 1px solid #e5e7eb; box-shadow: 0 12px 35px rgba(23, 32, 42, 0.09); }
.erp-auth__mark { display: inline-flex; width: 36px; height: 36px; align-items: center; justify-content: center; border-radius: 6px; background: #16856b; color: #fff; font-weight: 800; }
.auth-language-switcher { top: 1rem; right: 1rem; z-index: 2; }
[dir='rtl'] .auth-language-switcher { right: auto; left: 1rem; }
</style>
