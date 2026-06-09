<template>
  <div>
    <b-card :title="$t('auth.changePassword')">
      <b-alert v-if="error" variant="danger" show>{{ error }}</b-alert>
      <b-alert v-if="success" variant="success" show>{{ success }}</b-alert>

      <b-form @submit.prevent="handleSubmit">
        <b-row>
          <b-col cols="12" md="6">
            <b-form-group :label="$t('auth.currentPassword')" label-for="current_password">
              <b-form-input
                id="current_password"
                v-model="form.current_password"
                type="password"
                :placeholder="$t('auth.currentPassword')"
                required
              />
            </b-form-group>

            <b-form-group :label="$t('auth.newPassword')" label-for="new_password">
              <b-form-input
                id="new_password"
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

            <b-button type="submit" variant="primary" :disabled="loading">
              <b-spinner v-if="loading" small class="mr-1" />
              {{ $t('auth.changePassword') }}
            </b-button>
          </b-col>
        </b-row>
      </b-form>
    </b-card>
  </div>
</template>

<script>
import authService from '@/services/auth'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'

export default {
  data() {
    return {
      form: {
        current_password: '',
        password: '',
        password_confirmation: '',
      },
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
        await authService.changePassword(this.form)
        this.$toast({
          component: ToastificationContent,
          props: { title: this.$t('messages.success'), text: this.$t('auth.passwordChangedSuccess'), variant: 'success' },
        })
        this.form = { current_password: '', password: '', password_confirmation: '' }
      } catch (e) {
        this.error = e.response?.data?.message || this.$t('messages.saveError')
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
