<template>
  <div>
    <!-- Welcome Card -->
    <b-row>
      <b-col cols="12">
        <b-card>
          <b-row>
            <b-col cols="12" md="8">
              <h2>{{ $t('dashboard.welcomeBack') }}, {{ user ? user.name : $t('reservation.doctor') }}! 👨‍⚕️</h2>
              <p class="mb-2">
                {{ $t('dashboard.doctorOverview') }}
              </p>
            </b-col>
            <b-col cols="12" md="4" class="text-md-right mt-1 mt-md-0">
              <b-button
                variant="primary"
                :to="{ name: 'doctor-reservations' }"
              >
                <feather-icon icon="CalendarIcon" class="mr-50" />
                {{ $t('actions.viewAllReservations') }}
              </b-button>
            </b-col>
          </b-row>
        </b-card>
      </b-col>
    </b-row>

    <!-- Statistics Cards -->
    <b-row class="match-height">
      <b-col cols="12" sm="6" lg="4">
        <b-card class="text-center">
          <b-avatar
            variant="light-info"
            size="45"
          >
            <feather-icon
              icon="CalendarIcon"
              size="21"
            />
          </b-avatar>
          <h2 class="font-weight-bolder mt-1">
            {{ stats.totalReservations }}
          </h2>
          <p class="card-text">
            {{ $t('dashboard.totalAppointments') }}
          </p>
        </b-card>
      </b-col>

      <b-col cols="12" sm="6" lg="4">
        <b-card class="text-center">
          <b-avatar
            variant="light-warning"
            size="45"
          >
            <feather-icon
              icon="ClockIcon"
              size="21"
            />
          </b-avatar>
          <h2 class="font-weight-bolder mt-1">
            {{ stats.pendingReservations }}
          </h2>
          <p class="card-text">
            {{ $t('dashboard.pendingCount') }}
          </p>
        </b-card>
      </b-col>

      <b-col cols="12" sm="6" lg="4">
        <b-card class="text-center">
          <b-avatar
            variant="light-success"
            size="45"
          >
            <feather-icon
              icon="CheckCircleIcon"
              size="21"
            />
          </b-avatar>
          <h2 class="font-weight-bolder mt-1">
            {{ stats.completedReservations }}
          </h2>
          <p class="card-text">
            {{ $t('dashboard.completedCount') }}
          </p>
        </b-card>
      </b-col>
    </b-row>

    <!-- Today's Appointments -->
    <b-row>
      <b-col cols="12">
        <b-card :title="`${$t('dashboard.todayAppointments')} (${stats.currentReservations})`">
          <b-table
            :items="todayReservations"
            :fields="fields"
            responsive
            striped
            hover
            :busy="loading"
            show-empty
            :empty-text="$t('dashboard.noAppointmentsToday')"
          >
            <template #cell(status)="data">
              <b-badge :variant="getStatusVariant(data.value)">
                {{ $t('reservation.' + data.value) }}
              </b-badge>
            </template>

            <template #cell(actions)="data">
              <b-button
                v-if="canCompleteReservation(data.item)"
                v-b-tooltip.hover
                :title="$t('reservation.completeReservation')"
                variant="success"
                size="sm"
                :to="{ name: 'doctor-reservations' }"
              >
                <feather-icon icon="CheckIcon" size="14" />
              </b-button>
            </template>

            <template #table-busy>
              <div class="text-center my-2">
                <b-spinner class="align-middle" />
              </div>
            </template>
          </b-table>
        </b-card>
      </b-col>
    </b-row>

    <!-- Recent Activity -->
    <b-row>
      <b-col cols="12">
        <b-card :title="$t('dashboard.recentCompleted')">
          <b-table
            :items="completedReservations"
            :fields="completedFields"
            responsive
            striped
            hover
            show-empty
            :empty-text="$t('dashboard.noCompletedYet')"
          >
            <template #cell(completed_at)="data">
              {{ formatDateTime(data.value) }}
            </template>
          </b-table>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import {
  BCard,
  BRow,
  BCol,
  BAvatar,
  BButton,
  BTable,
  BBadge,
  BSpinner,
  VBTooltip,
} from 'bootstrap-vue'
import reservationsService from '@/services/reservations'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'

export default {
  directives: {
    'b-tooltip': VBTooltip,
  },
  components: {
    BCard,
    BRow,
    BCol,
    BAvatar,
    BButton,
    BTable,
    BBadge,
    BSpinner,
  },
  data() {
    return {
      user: null,
      loading: false,
      stats: {
        totalReservations: 0,
        pendingReservations: 0,
        completedReservations: 0,
        currentReservations: 0,
      },
      todayReservations: [],
      completedReservations: [],
      fields: [],
      completedFields: [],
    }
  },
  mounted() {
    this.user = JSON.parse(localStorage.getItem('user') || 'null')
    // Set translated table fields
    this.fields = [
      { key: 'client.name', label: this.$t('client.name'), sortable: true },
      { key: 'appointment_date', label: this.$t('reservation.time'), formatter: this.formatTime },
      { key: 'status', label: this.$t('reservation.status') },
      { key: 'actions', label: this.$t('actions.actions') },
    ]
    this.completedFields = [
      { key: 'client.name', label: this.$t('client.name') },
      { key: 'diagnosis', label: this.$t('reservation.diagnosis') },
      { key: 'completed_at', label: this.$t('reservation.completedAt') },
    ]
    this.fetchStats()
    this.fetchTodayReservations()
    this.fetchCompletedReservations()

    // Watch broadcast events for real-time updates
    this.$watch('$store.state.broadcast.eventCounter', () => {
      this.fetchStats()
      this.fetchTodayReservations()
      this.fetchCompletedReservations()
    })
  },
  methods: {
    async fetchStats() {
      try {
        const [pendingRes, confirmedRes, completedRes] = await Promise.all([
          reservationsService.getReservations({ status: 'pending', own_only: 1 }),
          reservationsService.getReservations({ status: 'confirmed', own_only: 1 }),
          reservationsService.getReservations({ status: 'completed', own_only: 1 }),
        ])

        const pending = pendingRes.data.total || 0
        const confirmed = confirmedRes.data.total || 0
        const completed = completedRes.data.total || 0
        this.stats.totalReservations = pending + confirmed + completed
        this.stats.pendingReservations = pending + confirmed
        this.stats.completedReservations = completed
      } catch (error) {
        console.error('Failed to fetch stats', error)
      }
    },
    async fetchTodayReservations() {
      this.loading = true
      try {
        const today = this.getTodayDate()
        const response = await reservationsService.getReservations({ date_from: today, date_to: today, own_only: 1 })
        this.todayReservations = response.data.data || []
        this.stats.currentReservations = response.data.total || this.todayReservations.length
      } catch (error) {
        console.error('Failed to fetch today reservations', error)
        this.stats.currentReservations = 0
      } finally {
        this.loading = false
      }
    },
    getTodayDate() {
      const d = new Date()
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    async fetchCompletedReservations() {
      try {
        const response = await reservationsService.getReservations({ status: 'completed', own_only: 1 })
        this.completedReservations = (response.data.data || []).slice(0, 5)
      } catch (error) {
        console.error('Failed to fetch completed reservations', error)
      }
    },
    getStatusVariant(status) {
      const variants = {
        pending: 'warning',
        confirmed: 'info',
        completed: 'success',
        cancelled: 'danger',
      }
      return variants[status] || 'secondary'
    },
    canCompleteReservation(reservation) {
      return reservation && !['completed', 'cancelled'].includes(reservation.status)
    },
    formatDateTime(value) {
      if (!value) return 'N/A'
      // Parse as local time since backend returns Y-m-d H:i:s format
      const date = new Date(value + (value.includes(' ') ? '' : ''))
      return date.toLocaleString()
    },
    formatTime(value) {
      if (!value) return 'N/A'
      // Parse as local time since backend returns Y-m-d H:i:s format
      const date = new Date(value + (value.includes(' ') ? '' : ''))
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
  },
}
</script>
