<template>
  <div>
    <b-card>
      <h2>{{ $t('dashboard.welcome') }}</h2>
      <hr>
      
      <div v-if="user">
        <b-alert variant="success" show>
          <h4 class="alert-heading">{{ $t('dashboard.hello') }}, {{ user.name }}!</h4>
          <p>{{ $t('dashboard.loggedInAs') }} <strong>{{ user.role }}</strong></p>
        </b-alert>

        <b-card-text class="mt-3">
          <h5>{{ $t('dashboard.quickLinks') }}:</h5>
          <div v-if="user.role === 'doctor'">
            <b-button variant="primary" :to="{ name: 'doctor-reservations' }" class="mt-2">
              {{ $t('actions.viewAllReservations') }}
            </b-button>
          </div>
          <div v-else-if="user.role === 'assistant'">
            <b-button variant="primary" :to="{ name: 'assistant-clients' }" class="mr-2 mt-2">
              {{ $t('actions.manageClients') }}
            </b-button>
            <b-button variant="info" :to="{ name: 'assistant-reservations' }" class="mt-2">
              {{ $t('actions.manageReservations') }}
            </b-button>
          </div>
        </b-card-text>
      </div>
    </b-card>
  </div>
</template>

<script>
import {
  BCard,
  BCardText,
  BAlert,
  BButton,
} from 'bootstrap-vue'

export default {
  components: {
    BCard,
    BCardText,
    BAlert,
    BButton,
  },
  data() {
    return {
      user: null,
    }
  },
  mounted() {
    const userData = localStorage.getItem('user')
    if (userData) {
      this.user = JSON.parse(userData)
    }
  },
}
</script>
