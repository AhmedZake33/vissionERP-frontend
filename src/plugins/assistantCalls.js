import { updateEchoAuth } from '@/libs/echo'
import store from '@/store'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'

// Audio helpers with repeat support for assistant alerts
let _audioCtx = null
let _repeatInterval = null
let _repeatCount = 0
let _currentAlertCallId = null

function ensureAudioContext() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return null
    if (!_audioCtx) _audioCtx = new AudioCtx()
    if (_audioCtx.state === 'suspended') _audioCtx.resume().catch(() => {})
    return _audioCtx
  } catch (e) {
    console.warn('[assistantCalls] audio init failed', e)
    return null
  }
}

function playBeepSequence() {
  try {
    if (localStorage.getItem('assistantCallSoundEnabled') !== 'true') return
    const ctx = ensureAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const playBeep = (startTime, freq, duration) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.7, startTime)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration)
      osc.start(startTime)
      osc.stop(startTime + duration)
    }
    playBeep(now, 880, 0.18)
    playBeep(now + 0.22, 1100, 0.18)
    playBeep(now + 0.44, 1320, 0.24)
  } catch (e) {
    console.warn('[assistantCalls] play error', e)
  }
}

function startRepeatingAlert(callId) {
  if (!callId) return
  _currentAlertCallId = callId
  _repeatCount = 0
  // Play immediately
  playBeepSequence()
  // Repeat every 3s up to ~30s
  if (_repeatInterval) clearInterval(_repeatInterval)
  _repeatInterval = setInterval(() => {
    _repeatCount++
    if (_repeatCount >= 10) {
      stopRepeatingAlert()
      return
    }
    playBeepSequence()
  }, 3000)
}

function stopRepeatingAlert() {
  _currentAlertCallId = null
  _repeatCount = 0
  if (_repeatInterval) { clearInterval(_repeatInterval); _repeatInterval = null }
  try { if (_audioCtx && _audioCtx.close) { _audioCtx.close().catch(() => {}); _audioCtx = null } } catch (e) { /* ignore */ }
}

function playShortBeep() { playBeepSequence() }

export default {
  install(Vue) {
    let callChannel = null

    function handleEvent(data) {
      try {
        store.dispatch('assistantCalls/processCallEvent', data)
      } catch (e) {
        console.error('[assistantCalls] failed to process event', e)
      }

      const call = data.call
      if (!call) return

      // Determine current user and roles
      const user = store.state.auth.user || JSON.parse(localStorage.getItem('user') || 'null')
      const isAssistant = user && user.role === 'assistant'

      if (data.action === 'created' && isAssistant) {
        // Start a repeating alert sequence for assistants (will auto-stop after timeout)
        startRepeatingAlert(call.id)
        if (Vue.prototype.$toast) {
          Vue.prototype.$toast({
            component: ToastificationContent,
            props: {
              title: Vue.prototype.$t ? Vue.prototype.$t('assistantCall.incomingCalls') : 'Incoming Call',
              text: `${call.doctor?.name || 'Doctor'} ${Vue.prototype.$t ? Vue.prototype.$t('assistantCall.isRequestingAssistance') : ''}`,
              icon: 'PhoneCallIcon',
              variant: 'danger',
            },
          })
        }
      }

      // Stop any repeating alerts for assistants when call is accepted/completed
      if ((data.action === 'accepted' || data.action === 'completed') && isAssistant) {
        stopRepeatingAlert()
      }

      // Notify doctors with a short beep when an assistant accepts
      if (data.action === 'accepted' && user && user.role === 'doctor') {
        playShortBeep()
      }
    }

    function subscribe() {
      if (!window.Echo) return
      const user = store.state.auth.user || JSON.parse(localStorage.getItem('user') || 'null')
      if (!user) return
      updateEchoAuth()

      // Leave existing
      try { if (callChannel) callChannel.stopListening() } catch (e) {}

      if (user.role === 'assistant') {
        callChannel = window.Echo.private(`assistant.${user.id}`)
          .listen('.assistant.call', handleEvent)
      } else if (user.role === 'doctor') {
        callChannel = window.Echo.private(`clinic.${user.id}.assistant-calls`)
          .listen('.assistant.call', handleEvent)
      }
    }

    function unsubscribe() {
      try {
        if (callChannel && callChannel.channelName) {
          window.Echo.leave(callChannel.channelName)
        }
      } catch (e) { /* ignore */ }
      callChannel = null
    }

    // Stop repeating alert when a global stop event is fired (e.g., user accepted from another view)
    const _stopHandler = () => stopRepeatingAlert()
    try { window.addEventListener('assistantCalls:stopSound', _stopHandler) } catch (e) { /* ignore */ }

    // Expose helper methods
    Vue.prototype.$assistantCalls = {
      async accept(callId) { try { const res = await store.dispatch('assistantCalls/acceptCall', callId); window.dispatchEvent(new Event('assistantCalls:stopSound')); return res } catch (e) { throw e } },
      async complete(callId) { try { const res = await store.dispatch('assistantCalls/completeCall', callId); window.dispatchEvent(new Event('assistantCalls:stopSound')); return res } catch (e) { throw e } },
      fetchActive() { return store.dispatch('assistantCalls/fetchActiveCalls') },
      stop() { stopRepeatingAlert() },
    }

    // Watch auth changes to (re)subscribe
    store.watch(
      (state) => state.auth.user,
      (newUser, oldUser) => {
        if (newUser) subscribe()
        else unsubscribe()
      },
      { immediate: true }
    )
  }
}
