import { subscribeToDoctorChannel, subscribeToAssistantChannel, leaveChannel, updateEchoAuth } from '@/libs/echo'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'

/**
 * Vue 2 mixin for real-time reservation updates via Laravel Reverb WebSocket.
 *
 * Usage: add `mixins: [realtimeReservationsMixin]` to any Reservations view.
 * The host component MUST have a `fetchReservations()` method which will be
 * called automatically whenever a reservation event is received.
 */

// Create a reusable notification sound using Web Audio API
function playNotificationSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()

    // First tone
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
    gain1.gain.setValueAtTime(0.3, ctx.currentTime)
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(ctx.currentTime)
    osc1.stop(ctx.currentTime + 0.3)

    // Second tone (higher, slight delay)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15) // A5
    gain2.gain.setValueAtTime(0.01, ctx.currentTime)
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.15)
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(ctx.currentTime + 0.15)
    osc2.stop(ctx.currentTime + 0.5)

    // Clean up
    setTimeout(() => ctx.close(), 600)
  } catch (e) {
    // Audio may be blocked by browser policy – fail silently
    console.warn('[WS] Could not play notification sound', e)
  }
}

export default {
  data() {
    return {
      wsConnected: false,
      wsNotifications: [],
    }
  },

  mounted() {
    this.subscribeToReservations()
  },

  beforeDestroy() {
    this.unsubscribeFromReservations()
  },

  methods: {
    /**
     * Subscribe to the correct WebSocket channel based on user role
     */
    subscribeToReservations() {
      const user = this.$store.state.auth?.user || JSON.parse(localStorage.getItem('user'))
      if (!user) {
        console.warn('[WS] No user found – skipping real-time subscription')
        return
      }

      // Ensure the auth token is current
      updateEchoAuth()

      const handlers = {
        onCreated: this._onReservationCreated,
        onUpdated: this._onReservationUpdated,
        onCompleted: this._onReservationCompleted,
        onDeleted: this._onReservationDeleted,
      }

      if (user.role === 'doctor' || user.role === 'sub-doctor') {
        this._wsChannel = subscribeToDoctorChannel(user.id, handlers)
        console.log(`[WS] Subscribed to doctor.${user.id}`)
      } else if (user.role === 'assistant') {
        const doctorId = user.doctor_id || user.doctor?.id
        if (!doctorId) return

        this._wsChannel = subscribeToAssistantChannel(doctorId, handlers)
        console.log(`[WS] Subscribed to assistant.reservations.${doctorId}`)
      }

      this.wsConnected = true
    },

    /**
     * Unsubscribe when the component is destroyed
     */
    unsubscribeFromReservations() {
      const user = this.$store.state.auth?.user || JSON.parse(localStorage.getItem('user'))
      if (user) {
        if (user.role === 'doctor' || user.role === 'sub-doctor') {
          leaveChannel(`doctor.${user.id}`)
        } else if (user.role === 'assistant') {
          const doctorId = user.doctor_id || user.doctor?.id
          if (doctorId) leaveChannel(`assistant.reservations.${doctorId}`)
        }
      }
      this._wsChannel = null
      this.wsConnected = false
      console.log('[WS] Unsubscribed from real-time updates')
    },

    /* ── event handlers ─────────────────────────────────── */

    _onReservationCreated(data) {
      console.log('[WS] Reservation created', data)
      const clientName = data.reservation?.client?.name || 'Unknown'
      const appointmentDate = data.reservation?.appointment_date
        ? new Date(data.reservation.appointment_date).toLocaleString()
        : ''
      this._pushNotification(
        'success',
        'BellIcon',
        'New Reservation',
        `New appointment for ${clientName}` + (appointmentDate ? ` on ${appointmentDate}` : ''),
      )
      playNotificationSound()
      this.fetchReservations()
    },

    _onReservationUpdated(data) {
      console.log('[WS] Reservation updated', data)
      const clientName = data.reservation?.client?.name || 'Unknown'
      this._pushNotification(
        'info',
        'EditIcon',
        'Reservation Updated',
        `Appointment updated for ${clientName}`,
      )
      playNotificationSound()
      this.fetchReservations()
    },

    _onReservationCompleted(data) {
      console.log('[WS] Reservation completed', data)
      const clientName = data.reservation?.client?.name || 'Unknown'
      this._pushNotification(
        'success',
        'CheckCircleIcon',
        'Reservation Completed',
        `Appointment completed for ${clientName}`,
      )
      playNotificationSound()
      this.fetchReservations()
    },

    _onReservationDeleted(data) {
      console.log('[WS] Reservation deleted', data)
      this._pushNotification(
        'warning',
        'TrashIcon',
        'Reservation Deleted',
        data.message || 'A reservation has been deleted',
      )
      playNotificationSound()
      this.fetchReservations()
    },

    /* ── helpers ─────────────────────────────────────────── */

    _pushNotification(variant, icon, title, text) {
      // Show a toast notification
      if (this.$toast) {
        this.$toast({
          component: ToastificationContent,
          props: { title, text, variant, icon },
        }, {
          timeout: 6000,
        })
      }

      // Also keep in local array for potential notification dropdown
      this.wsNotifications.unshift({
        id: Date.now(),
        variant,
        title,
        text,
        timestamp: new Date(),
      })
      if (this.wsNotifications.length > 20) {
        this.wsNotifications.pop()
      }
    },
  },
}
