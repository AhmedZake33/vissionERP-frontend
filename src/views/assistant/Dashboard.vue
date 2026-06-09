<template>
  <div>
    <!-- Sound Permission Banner -->
    <b-row v-if="!soundEnabled">
      <b-col cols="12">
        <b-alert show variant="warning" class="d-flex align-items-center justify-content-between mb-1">
          <div>
            <feather-icon icon="VolumeXIcon" class="mr-50" />
            {{ $t('assistantCall.soundDisabled') }}
          </div>
          <b-button variant="warning" size="sm" @click="enableSound">
            <feather-icon icon="Volume2Icon" class="mr-25" />
            {{ $t('assistantCall.enableSound') }}
          </b-button>
        </b-alert>
      </b-col>
    </b-row>

    <!-- Incoming Assistant Calls Alert -->
    <b-row v-if="activeCalls.length > 0">
      <b-col cols="12">
        <b-card
          class="assistant-call-alert border-danger"
          :class="{ 'call-highlight': hasNewCall }"
          border-variant="danger"
        >
          <div class="d-flex align-items-center mb-1">
            <b-avatar variant="danger" size="40" class="mr-1">
              <feather-icon icon="PhoneCallIcon" size="20" />
            </b-avatar>
            <h4 class="text-danger mb-0">
              {{ $t('assistantCall.incomingCalls') }}
            </h4>
          </div>
          <b-list-group flush>
            <b-list-group-item
              v-for="call in activeCalls"
              :key="call.id"
              class="d-flex justify-content-between align-items-center px-0"
              :variant="call.status === 'pending' ? 'warning' : 'info'"
            >
              <div>
                <feather-icon icon="AlertCircleIcon" class="text-danger mr-50" />
                <strong>{{ call.doctor ? call.doctor.name : $t('assistantCall.doctor') }}</strong>
                <span v-if="currentUserRole === 'assistant'">{{ $t('assistantCall.isRequestingAssistance') }}</span>
                <b-badge :variant="call.status === 'pending' ? 'warning' : 'info'" class="ml-50">
                  {{ $t('assistantCall.' + call.status) }}
                </b-badge>
                <small v-if="call.message" class="d-block text-muted mt-25">{{ call.message }}</small>
              </div>
              <div>
                <b-button
                  v-if="call.status === 'pending'"
                  variant="success"
                  size="sm"
                  class="mr-50"
                  @click="acceptCall(call)"
                >
                  <feather-icon icon="CheckIcon" class="mr-25" />
                  {{ $t('assistantCall.accept') }}
                </b-button>
                <b-button
                  v-if="call.status === 'accepted' && call.assistant_id === currentUserId"
                  variant="primary"
                  size="sm"
                  @click="completeCallAction(call)"
                >
                  <feather-icon icon="CheckCircleIcon" class="mr-25" />
                  {{ $t('assistantCall.markDone') }}
                </b-button>
              </div>
            </b-list-group-item>
          </b-list-group>
        </b-card>
      </b-col>
    </b-row>

    <!-- Statistics Cards -->
    <b-row class="match-height">
      <b-col cols="12" sm="6" lg="3">
        <b-card class="text-center">
          <b-avatar
            variant="light-primary"
            size="45"
          >
            <feather-icon
              icon="UsersIcon"
              size="21"
            />
          </b-avatar>
          <h2 class="font-weight-bolder mt-1">
            {{ stats.totalClients }}
          </h2>
          <p class="card-text">
            {{ $t('dashboard.totalClients') }}
          </p>
        </b-card>
      </b-col>

      <b-col cols="12" sm="6" lg="3">
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
            {{ $t('dashboard.totalReservations') }}
          </p>
        </b-card>
      </b-col>

      <b-col cols="12" sm="6" lg="3">
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
            {{ $t('reservation.pending') }}
          </p>
        </b-card>
      </b-col>

      <b-col cols="12" sm="6" lg="3">
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
            {{ $t('reservation.completed') }}
          </p>
        </b-card>
      </b-col>
    </b-row>

    <!-- Quick Actions -->
    <b-row>
      <b-col cols="12">
        <b-card :title="$t('dashboard.quickActions')">
          <div class="d-flex flex-wrap" style="gap: 0.5rem;">
          <b-button
            variant="primary"
            :to="{ name: 'assistant-clients' }"
          >
            <feather-icon icon="UserPlusIcon" class="mr-50" />
            {{ $t('client.addClient') }}
          </b-button>
          <b-button
            variant="success"
            :to="{ name: 'assistant-reservations' }"
          >
            <feather-icon icon="PlusIcon" class="mr-50" />
            {{ $t('actions.newReservation') }}
          </b-button>
          </div>
        </b-card>
      </b-col>
    </b-row>

    <!-- Today's Reservations -->
    <b-row>
      <b-col cols="12">
        <b-card :title="`${$t('dashboard.todayAppointments')} (${stats.currentReservations})`">
          <b-table
            :items="todayReservations"
            :fields="translatedFields"
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
                variant="primary"
                size="sm"
                :to="{ name: 'assistant-reservations' }"
              >
                {{ $t('actions.view') }}
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
  BListGroup,
  BListGroupItem,
  BAlert,
} from 'bootstrap-vue'
import clientsService from '@/services/clients'
import reservationsService from '@/services/reservations'
import assistantCallsService from '@/services/assistantCalls'
import { updateEchoAuth } from '@/libs/echo'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'

export default {
  components: {
    BCard,
    BRow,
    BCol,
    BAvatar,
    BButton,
    BTable,
    BBadge,
    BSpinner,
    BListGroup,
    BListGroupItem,
    BAlert,
  },
  data() {
    return {
      loading: false,
      activeCalls: [],
      hasNewCall: false,
      currentUserId: null,
      currentUserRole: null,
      soundEnabled: false,
      audioContext: null,
      callSoundInterval: null,
      _audioUnlockHandler: null,
      stats: {
        totalClients: 0,
        totalReservations: 0,
        pendingReservations: 0,
        completedReservations: 0,
        currentReservations: 0,
      },
      todayReservations: [],
      fields: [
        { key: 'client.name', label: 'table.client', sortable: true },
        { key: 'doctor.name', label: 'table.doctor', sortable: true },
        { key: 'appointment_date', label: 'table.appointment', formatter: this.formatDateTime },
        { key: 'status', label: 'table.status' },
        { key: 'actions', label: 'table.actions' },
      ],
    }
  },
  computed: {
    translatedFields() {
      return this.fields.map(field => ({
        ...field,
        label: this.$t(field.label),
      }))
    },
  },
  watch: {
    '$store.state.broadcast.eventCounter'() {
      this.fetchStats()
      this.fetchTodayReservations()
    },
  },
  mounted() {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    this.currentUserId = user ? user.id : null
    this.currentUserRole = user ? user.role : null
    this.soundEnabled = localStorage.getItem('assistantCallSoundEnabled') === 'true'
    // Try to restore AudioContext if previously enabled
    if (this.soundEnabled) {
      this.initAudioContext()
      // Unlock AudioContext on first user interaction (browsers require a gesture after page reload)
      this._audioUnlockHandler = () => {
        if (this.audioContext && this.audioContext.state === 'suspended') {
          this.audioContext.resume()
        }
        document.removeEventListener('click', this._audioUnlockHandler)
        document.removeEventListener('keydown', this._audioUnlockHandler)
      }
      document.addEventListener('click', this._audioUnlockHandler, { once: false })
      document.addEventListener('keydown', this._audioUnlockHandler, { once: false })
    }
    // Listen for global stop-sound events (e.g., accept from other views)
    this._assistantCallsStopHandler = () => { this.stopCallSound() }
    window.addEventListener('assistantCalls:stopSound', this._assistantCallsStopHandler)
    this.fetchStats()
    this.fetchTodayReservations()
    this.fetchActiveCalls()
    this.listenForCallEvents(user)
  },
  beforeDestroy() {
    this.stopCallSound()
    if (this._audioUnlockHandler) {
      document.removeEventListener('click', this._audioUnlockHandler)
      document.removeEventListener('keydown', this._audioUnlockHandler)
    }
    if (this._assistantCallsStopHandler) {
      window.removeEventListener('assistantCalls:stopSound', this._assistantCallsStopHandler)
    }
    if (this.audioContext) {
      try { this.audioContext.close() } catch (e) { /* ignore */ }
    }
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (user) {
      try { window.Echo.leave(`assistant.${user.id}`) } catch (e) { /* ignore */ }
      if (user.doctor_id) {
        try { window.Echo.leave(`clinic.${user.doctor_id}.assistant-calls`) } catch (e) { /* ignore */ }
      }
    }
  },
  methods: {
    async fetchStats() {
      try {
        const [clientsRes, pendingRes, confirmedRes, completedRes] = await Promise.all([
          clientsService.getClients(),
          reservationsService.getReservations({ status: 'pending' }),
          reservationsService.getReservations({ status: 'confirmed' }),
          reservationsService.getReservations({ status: 'completed' }),
        ])

        const pending = pendingRes.data.total || 0
        const confirmed = confirmedRes.data.total || 0
        const completed = completedRes.data.total || 0
        this.stats.totalClients = clientsRes.data.total || 0
        this.stats.totalReservations = pending + confirmed + completed
        this.stats.pendingReservations = pending + confirmed
        this.stats.completedReservations = completed
      } catch (error) {
        console.error('Failed to fetch stats', error)
      }
    },
    getTodayDate() {
      const d = new Date()
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    async fetchTodayReservations() {
      this.loading = true
      try {
        const today = this.getTodayDate()
        const response = await reservationsService.getReservations({ date_from: today, date_to: today })
        this.todayReservations = response.data.data || []
        this.stats.currentReservations = response.data.total || this.todayReservations.length
      } catch (error) {
        console.error('Failed to fetch reservations', error)
        this.stats.currentReservations = 0
      } finally {
        this.loading = false
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
    formatDateTime(value) {
      if (!value) return this.$t('reservation.na')
      // Parse as local time since backend returns Y-m-d H:i:s format
      const date = new Date(value + (value.includes(' ') ? '' : ''))
      return date.toLocaleString()
    },

    // â”€â”€ Assistant Call Methods â”€â”€
    async fetchActiveCalls() {
      try {
        const response = await assistantCallsService.getActiveCalls()
        this.activeCalls = response.data.data || response.data || []
      } catch (error) {
        console.error('Failed to fetch active calls', error)
      }
    },
    async acceptCall(call) {
      this.stopCallSound()
      try {
        await assistantCallsService.acceptCall(call.id)
        // Update status in-place immediately (WebSocket event will also arrive)
        const idx = this.activeCalls.findIndex(c => c.id === call.id)
        if (idx !== -1) {
          this.$set(this.activeCalls, idx, { ...this.activeCalls[idx], status: 'accepted', assistant_id: this.currentUserId })
        }
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('assistantCall.callAccepted'),
            icon: 'CheckCircleIcon',
            variant: 'success',
          },
        })
      } catch (error) {
        console.error('Failed to accept call', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('assistantCall.loadError'),
            icon: 'AlertTriangleIcon',
            variant: 'danger',
          },
        })
      }
    },
    async completeCallAction(call) {
      this.stopCallSound()
      try {
        await assistantCallsService.completeCall(call.id)
        // Remove from list immediately (WebSocket event will also handle it)
        this.activeCalls = this.activeCalls.filter(c => c.id !== call.id)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('assistantCall.callCompleted'),
            icon: 'CheckCircleIcon',
            variant: 'success',
          },
        })
      } catch (error) {
        console.error('Failed to complete call', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('assistantCall.loadError'),
            icon: 'AlertTriangleIcon',
            variant: 'danger',
          },
        })
      }
    },
    handleCallEvent(event) {
      const call = event.call
      if (!call) return

      if (event.action === 'created') {
        // Add new call if not already present
        if (!this.activeCalls.find(c => c.id === call.id)) {
          this.activeCalls.push(call)
        }
        this.hasNewCall = true
        this.playCallSound()
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('assistantCall.incomingCalls'),
            text: `${call.doctor?.name || this.$t('assistantCall.doctor')} ${this.$t('assistantCall.isRequestingAssistance')}`,
            icon: 'PhoneCallIcon',
            variant: 'danger',
          },
        })
        setTimeout(() => { this.hasNewCall = false }, 5000)
      } else if (event.action === 'accepted') {
        // Update status in-place
        const idx = this.activeCalls.findIndex(c => c.id === call.id)
        if (idx !== -1) {
          this.$set(this.activeCalls, idx, { ...this.activeCalls[idx], ...call })
        }
      } else if (event.action === 'completed') {
        // Remove completed call
        this.activeCalls = this.activeCalls.filter(c => c.id !== call.id)
      }
    },
    listenForCallEvents(user) {
      if (!user || !window.Echo) return
      try {
        updateEchoAuth()
        // Listen on the assistant's personal channel for targeted calls
        this._callChannel = window.Echo.private(`assistant.${user.id}`)
          .listen('.assistant.call', event => {
            this.handleCallEvent(event)
          })

        // Also listen on the clinic channel for general updates
        if (user.doctor_id) {
          this._clinicChannel = window.Echo.private(`clinic.${user.doctor_id}.assistant-calls`)
            .listen('.assistant.call', event => {
              this.handleCallEvent(event)
            })
        }
      } catch (error) {
        console.error('Failed to listen for call events', error)
      }
    },
    playCallSound() {
      if (!this.soundEnabled || !this.audioContext) return
      this.stopCallSound()

      const playAlertSequence = () => {
        try {
          if (this.audioContext.state === 'suspended') {
            this.audioContext.resume()
          }
          const now = this.audioContext.currentTime
          const playBeep = (startTime, freq, duration) => {
            const osc = this.audioContext.createOscillator()
            const gain = this.audioContext.createGain()
            osc.connect(gain)
            gain.connect(this.audioContext.destination)
            osc.frequency.value = freq
            osc.type = 'sine'
            gain.gain.setValueAtTime(0.7, startTime)
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration)
            osc.start(startTime)
            osc.stop(startTime + duration)
          }
          // Urgent three-tone alert
          playBeep(now, 880, 0.2)
          playBeep(now + 0.25, 1100, 0.2)
          playBeep(now + 0.5, 1320, 0.3)
        } catch (e) {
          console.warn('Could not play call sound', e)
        }
      }

      // Play immediately, then repeat every 3 seconds for 30 seconds
      playAlertSequence()
      let count = 0
      this.callSoundInterval = setInterval(() => {
        count++
        if (count >= 10) {
          this.stopCallSound()
          return
        }
        playAlertSequence()
      }, 3000)
    },
    stopCallSound() {
      if (this.callSoundInterval) {
        clearInterval(this.callSoundInterval)
        this.callSoundInterval = null
      }
    },
    initAudioContext() {
      try {
        if (!this.audioContext) {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
        }
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume()
        }
      } catch (e) {
        console.warn('AudioContext not available', e)
      }
    },
    enableSound() {
      this.initAudioContext()
      this.soundEnabled = true
      localStorage.setItem('assistantCallSoundEnabled', 'true')

      // Play a short test beep so the user knows it works
      try {
        const now = this.audioContext.currentTime
        const osc = this.audioContext.createOscillator()
        const gain = this.audioContext.createGain()
        osc.connect(gain)
        gain.connect(this.audioContext.destination)
        osc.frequency.value = 660
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.2, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
        osc.start(now)
        osc.stop(now + 0.15)
      } catch (e) { /* ignore */ }

      this.$toast({
        component: ToastificationContent,
        props: {
          title: this.$t('assistantCall.soundEnabled'),
          icon: 'Volume2Icon',
          variant: 'success',
        },
      })
    },
  },
}
</script>

<style scoped>
.assistant-call-alert {
  animation: fadeIn 0.3s ease-in;
}

.call-highlight {
  animation: callPulse 0.8s ease-in-out 3;
  box-shadow: 0 0 20px rgba(234, 84, 85, 0.5);
}

@keyframes callPulse {
  0% {
    box-shadow: 0 0 5px rgba(234, 84, 85, 0.3);
    border-color: #ea5455;
  }
  50% {
    box-shadow: 0 0 25px rgba(234, 84, 85, 0.7);
    border-color: #ff6b6b;
  }
  100% {
    box-shadow: 0 0 5px rgba(234, 84, 85, 0.3);
    border-color: #ea5455;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
