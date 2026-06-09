<template>
  <div v-if="visible" class="card p-2 shadow-sm" style="min-width:220px">
    <div class="d-flex align-items-start">
      <div class="mr-2">
        <b-avatar variant="danger" size="36">
          <feather-icon icon="PhoneCallIcon" size="16" />
        </b-avatar>
      </div>
      <div class="flex-grow-1">
        <div class="font-weight-bold text-truncate">{{ titleText }}</div>
        <small class="text-muted d-block text-truncate">{{ subtitleText }}</small>
      </div>
    </div>
    <div class="d-flex justify-content-end mt-2">
      <b-button size="sm" variant="success" class="mr-1" @click="onAccept">
        <feather-icon icon="CheckIcon" class="mr-25" /> {{ $t('assistantCall.accept') }}
      </b-button>
      <b-button size="sm" variant="light" @click="onDismiss">
        {{ $t('actions.close') || 'Close' }}
      </b-button>
    </div>
  </div>
</template>

<script>
import { BButton, BAvatar } from 'bootstrap-vue'

export default {
  name: 'AssistantCallMiniWidget',
  components: { BButton, BAvatar },
  data() {
    return {
      dismissedCallIds: [],
    }
  },
  computed: {
    activeCalls() {
      return this.$store.state.assistantCalls?.activeCalls || []
    },
    currentUser() {
      return this.$store.state.auth.user || JSON.parse(localStorage.getItem('user') || 'null')
    },
    pendingCall() {
      return this.activeCalls.find(c => c.status === 'pending' && !this.dismissedCallIds.includes(c.id))
    },
    visible() {
      return !!(this.pendingCall && this.currentUser && this.currentUser.role === 'assistant')
    },
    titleText() {
      if (!this.pendingCall) return ''
      return this.pendingCall.doctor?.name || this.$t('assistantCall.doctor')
    },
    subtitleText() {
      if (!this.pendingCall) return ''
      return this.pendingCall.message || this.$t('assistantCall.isRequestingAssistance')
    },
  },
  methods: {
    async onAccept() {
      if (!this.pendingCall) return
      try {
        // Stop any repeating audible alert in Dashboard
        try { window.dispatchEvent(new Event('assistantCalls:stopSound')) } catch (e) {}
        await this.$assistantCalls.accept(this.pendingCall.id)
        this.$toast && this.$toast(this.$t('assistantCall.callAccepted'))
      } catch (e) {
        console.error('Accept failed', e)
        this.$toast && this.$toast({ component: this.$root.$options.components.ToastificationContent, props: { title: this.$t('assistantCall.loadError'), variant: 'danger' } })
      }
    },
    onDismiss() {
      if (this.pendingCall) this.dismissedCallIds.push(this.pendingCall.id)
    },
  },
}
</script>

<style scoped>
.card { border-radius: 8px; }
.text-truncate { max-width: 160px; }
</style>
