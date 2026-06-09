import { subscribeToDoctorChannel, subscribeToAssistantChannel, leaveChannel, updateEchoAuth } from '@/libs/echo'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'
import store from '@/store'

/**
 * Global broadcast plugin – subscribes to WebSocket channels once after login
 * and shows toast notifications on any page. Emits Vuex events so individual
 * pages (e.g. Reservations) can react and refresh their data.
 */

let channel = null
let subscribed = false
let subscribedChannelName = null

// ── notification sound ────────────────────────────────────
let notificationAudio = null
let audioUnlocked = false

function ensureAudio() {
  if (!notificationAudio) {
    notificationAudio = new Audio()
    notificationAudio.volume = 0.5
  }
}

// Generate a proper notification beep WAV dynamically
function generateNotificationWav() {
  const sampleRate = 22050
  const duration = 0.4
  const numSamples = Math.floor(sampleRate * duration)
  const buffer = new ArrayBuffer(44 + numSamples * 2)
  const view = new DataView(buffer)

  // WAV header
  const writeString = (offset, str) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)) }
  writeString(0, 'RIFF')
  view.setUint32(4, 36 + numSamples * 2, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(36, 'data')
  view.setUint32(40, numSamples * 2, true)

  // Two-tone beep: D5 then A5
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate
    const freq = t < 0.2 ? 587.33 : 880
    const envelope = t < 0.2
      ? Math.max(0, 1 - t / 0.2 * 0.7)
      : Math.max(0, 1 - (t - 0.2) / 0.2 * 0.9)
    const sample = Math.sin(2 * Math.PI * freq * t) * envelope * 0.4
    view.setInt16(44 + i * 2, Math.max(-32768, Math.min(32767, sample * 32767)), true)
  }

  const blob = new Blob([buffer], { type: 'audio/wav' })
  return URL.createObjectURL(blob)
}

function playNotificationSound() {
  try {
    ensureAudio()
    if (!notificationAudio.src) {
      notificationAudio.src = generateNotificationWav()
    }
    notificationAudio.currentTime = 0
    const p = notificationAudio.play()
    if (p) {
      p.catch(() => {
        // Autoplay blocked — try Web Audio API fallback
        playFallbackSound()
      })
    }
  } catch (e) {
    playFallbackSound()
  }
}

function playFallbackSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()

    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime)
    gain1.gain.setValueAtTime(0.3, ctx.currentTime)
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(ctx.currentTime)
    osc1.stop(ctx.currentTime + 0.3)

    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15)
    gain2.gain.setValueAtTime(0.01, ctx.currentTime)
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.15)
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(ctx.currentTime + 0.15)
    osc2.stop(ctx.currentTime + 0.5)

    setTimeout(() => ctx.close(), 600)
  } catch (e) {
    console.warn('[WS] Could not play notification sound', e)
  }
}

// ── toast helper (needs the Vue instance) ─────────────────
function showToast(vm, variant, icon, title, text) {
  if (vm && vm.$toast) {
    vm.$toast(
      { component: ToastificationContent, props: { title, text, variant, icon } },
      { timeout: 6000 },
    )
  }
}

// ── subscribe / unsubscribe ───────────────────────────────
function subscribe(vm) {
  // Prevent duplicate subscriptions
  if (subscribed) return

  const user = store.state.auth?.user
  if (!user) return

  updateEchoAuth()

  const handlers = {
    onCreated(data) {
      const name = data.reservation?.client?.name || 'Unknown'
      const date = data.reservation?.appointment_date
        ? new Date(data.reservation.appointment_date).toLocaleString()
        : ''
      showToast(vm, 'success', 'BellIcon', 'New Reservation', `New appointment for ${name}` + (date ? ` on ${date}` : ''))
      playNotificationSound()
      store.commit('broadcast/RESERVATION_EVENT', { type: 'created', data })
    },
    onReordered(data) {
      showToast(vm, 'info', 'ListIcon', 'Queue Reordered', data.message || 'Waiting queue order changed')
      playNotificationSound()
      store.commit('broadcast/RESERVATION_EVENT', { type: 'reordered', data })
    },
    onUpdated(data) {
      const name = data.reservation?.client?.name || 'Unknown'
      showToast(vm, 'info', 'EditIcon', 'Reservation Updated', `Appointment updated for ${name}`)
      playNotificationSound()
      store.commit('broadcast/RESERVATION_EVENT', { type: 'updated', data })
    },
    onCompleted(data) {
      const name = data.reservation?.client?.name || 'Unknown'
      showToast(vm, 'success', 'CheckCircleIcon', 'Reservation Completed', `Appointment completed for ${name}`)
      playNotificationSound()
      store.commit('broadcast/RESERVATION_EVENT', { type: 'completed', data })
    },
    onDeleted(data) {
      showToast(vm, 'warning', 'TrashIcon', 'Reservation Deleted', data.message || 'A reservation has been deleted')
      playNotificationSound()
      store.commit('broadcast/RESERVATION_EVENT', { type: 'deleted', data })
    },
  }

  if (user.role === 'doctor' || user.role === 'sub-doctor') {
    subscribedChannelName = `private-doctor.${user.id}`
    channel = subscribeToDoctorChannel(user.id, handlers)
    console.log(`[WS] Global: subscribed to doctor.${user.id}`)
  } else if (user.role === 'assistant') {
    const doctorId = user.doctor_id || user.doctor?.id
    if (!doctorId) return

    subscribedChannelName = `assistant.reservations.${doctorId}`
    channel = subscribeToAssistantChannel(doctorId, handlers)
    console.log(`[WS] Global: subscribed to assistant.reservations.${doctorId}`)
  }

  subscribed = true
}

function unsubscribe() {
  if (subscribedChannelName) {
    leaveChannel(subscribedChannelName)
  }
  channel = null
  subscribed = false
  subscribedChannelName = null
  console.log('[WS] Global: unsubscribed')
}

// ── Vue plugin ────────────────────────────────────────────
export default {
  install(Vue) {
    // Unlock audio on first user interaction (browsers require a gesture)
    const unlockAudio = () => {
      ensureAudio()
      if (!notificationAudio.src) {
        notificationAudio.src = generateNotificationWav()
      }
      notificationAudio.volume = 0
      const p = notificationAudio.play()
      if (p) p.then(() => { notificationAudio.pause(); notificationAudio.volume = 0.5; notificationAudio.currentTime = 0; audioUnlocked = true }).catch(() => {})
      document.removeEventListener('click', unlockAudio)
      document.removeEventListener('keydown', unlockAudio)
    }
    document.addEventListener('click', unlockAudio, { once: true })
    document.addEventListener('keydown', unlockAudio, { once: true })

    Vue.mixin({
      created() {
        // Only run on the root Vue instance
        if (this.$root !== this) return

        // Watch login state and subscribe/unsubscribe automatically
        this.$watch(
          () => store.getters['auth/isLoggedIn'],
          (loggedIn) => {
            if (loggedIn) {
              if (!subscribed) {
                this.$nextTick(() => subscribe(this))
              }
            } else {
              unsubscribe()
            }
          },
          { immediate: true },
        )
      },
    })
  },
}
