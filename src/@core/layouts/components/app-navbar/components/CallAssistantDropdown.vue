<template>
  <b-nav-item-dropdown
    v-if="isDoctor || isAssistant"
    :right="!isRTL"
    toggle-class="d-flex align-items-center"
    menu-class="call-assistant-dropdown-menu"
    no-caret
  >
    <!-- Toggle Button -->
    <template #button-content>
      <div class="position-relative">
        <feather-icon
          icon="PhoneCallIcon"
          size="21"
          :class="activeCalls.length > 0 ? 'text-danger' : ''"
        />
        <b-badge
          v-if="activeCalls.length > 0"
          pill
          variant="danger"
          class="badge-up"
          style="font-size: 0.7rem;"
        >
          {{ activeCalls.length }}
        </b-badge>
      </div>
    </template>

    <!-- Dropdown Header -->
    <li class="dropdown-menu-header">
      <div class="dropdown-header d-flex align-items-center py-75 px-2">
        <h6 class="font-weight-bolder mb-0 mr-auto">
          {{ $t('assistantCall.callAssistant') }}
        </h6>
      </div>
    </li>

    <!-- Call Form (doctors only) -->
    <li v-if="isDoctor" class="px-2 py-75">
      <div class="d-flex align-items-center">
        <b-form-select
          v-if="assistantsList.length !== 1"
          v-model="selectedAssistantId"
          :options="assistantOptions"
          size="sm"
          class="flex-grow-1"
          :class="isRTL ? 'ml-50' : 'mr-50'"
        />
        <div
          v-else
          class="flex-grow-1 small text-muted"
          :class="isRTL ? 'ml-50' : 'mr-50'"
        >
          {{ assistantsList[0].name }}
        </div>
        <b-button
          variant="danger"
          size="sm"
          :disabled="callLoading || (!selectedAssistantId && assistantsList.length !== 1)"
          class="text-nowrap"
          @click="callAssistant"
        >
          <b-spinner v-if="callLoading" small />
          <feather-icon v-else icon="PhoneCallIcon" size="14" />
        </b-button>
      </div>
    </li>

    <!-- Divider -->
    <li v-if="activeCalls.length > 0">
      <b-dropdown-divider />
    </li>

    <!-- Active Calls Header -->
    <li v-if="activeCalls.length > 0" class="px-2 py-50">
      <small class="text-muted font-weight-bold">{{ $t('assistantCall.activeCalls') }}</small>
    </li>

    <!-- Active Calls List -->
    <li
      v-for="call in activeCalls"
      :key="call.id"
      class="px-2 py-50"
    >
      <div class="d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center" style="min-width: 0;">
          <b-avatar
            size="32"
            variant="light-danger"
            :class="isRTL ? 'ml-50' : 'mr-50'"
          >
            <feather-icon icon="UserIcon" size="14" />
          </b-avatar>
          <div style="min-width: 0;">
            <p class="mb-0 font-weight-bold text-truncate" style="max-width: 120px;">
              {{ call.assistant ? call.assistant.name : '—' }}
            </p>
            <b-badge
              :variant="call.status === 'pending' ? 'light-warning' : 'light-info'"
              pill
              class="font-small-2"
            >
              {{ $t('assistantCall.' + call.status) }}
            </b-badge>
          </div>
        </div>
        <div>
          <b-button
            v-if="isAssistant && call.status === 'pending'"
            variant="primary"
            size="sm"
            class="btn-icon p-25 mr-50"
            :title="$t('assistantCall.accept')"
            @click.stop="acceptCall(call)"
          >
            <feather-icon icon="UserCheckIcon" size="14" />
          </b-button>

          <b-button
            v-if="call.status === 'accepted'"
            variant="flat-success"
            size="sm"
            class="btn-icon p-25"
            :title="$t('assistantCall.markDone')"
            @click.stop="markCallDone(call)"
          >
            <feather-icon icon="CheckCircleIcon" size="16" />
          </b-button>
        </div>
      </div>
    </li>

    <!-- Empty state -->
    <li v-if="activeCalls.length === 0" class="px-2 py-75 text-center">
      <small class="text-muted">{{ $t('assistantCall.noActiveCalls') }}</small>
    </li>
  </b-nav-item-dropdown>
</template>

<script>
import {
  BNavItemDropdown,
  BBadge,
  BButton,
  BFormSelect,
  BAvatar,
  BSpinner,
  BDropdownDivider,
} from 'bootstrap-vue'
import assistantsService from '@/services/assistants'
import { updateEchoAuth } from '@/libs/echo'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'

// Small notification sound helper. Respects the assistant sound preference stored in localStorage as 'assistantCallSoundEnabled'.
function playNotificationSound() {
  try {
    if (localStorage.getItem('assistantCallSoundEnabled') !== 'true') return
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, now)
    gain.gain.setValueAtTime(0.25, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.25)
    setTimeout(() => { try { ctx.close() } catch (e) {} }, 500)
  } catch (e) {
    console.warn('[WS] Could not play notification sound', e)
  }
}

export default {
  components: {
    BNavItemDropdown,
    BBadge,
    BButton,
    BFormSelect,
    BAvatar,
    BSpinner,
    BDropdownDivider,
  },
  data() {
    return {
      user: null,
      callLoading: false,
      selectedAssistantId: null,
      assistantsList: [],
    }
  },
  computed: {
    activeCalls() {
      return this.$store.state.assistantCalls?.activeCalls || []
    },
    isDoctor() {
      return this.user && this.user.role === 'doctor'
    },
    isAssistant() {
      return this.user && this.user.role === 'assistant'
    },
    isRTL() {
      return this.$store.state.appConfig.layout.isRTL
    },
    assistantOptions() {
      const placeholder = [{ value: null, text: this.$t('assistantCall.selectAssistant'), disabled: true }]
      const options = this.assistantsList.map(a => ({ value: a.id, text: a.name }))
      return placeholder.concat(options)
    },
  },
  mounted() {
    this.user = JSON.parse(localStorage.getItem('user') || 'null')
    if (this.isDoctor) {
      this.fetchAssistants()
      this.fetchActiveCalls()
      this.listenForCallEvents()
    } else if (this.isAssistant) {
      this.fetchActiveCalls()
      this.listenForCallEvents()
    }
  },
  beforeDestroy() {
    if (this._callChannel && this.user) {
      try {
        // leave the subscribed channel depending on role
        if (this.isDoctor) window.Echo.leave(`clinic.${this.user.id}.assistant-calls`)
        else if (this.isAssistant) window.Echo.leave(`assistant.${this.user.id}`)
      } catch (e) { /* ignore */ }
    }
  },
  methods: {
    async callAssistant() {
      const assistantId = this.selectedAssistantId || (this.assistantsList.length === 1 ? this.assistantsList[0].id : null)
      if (!assistantId) return
      this.callLoading = true
      try {
        const response = await this.$store.dispatch('assistantCalls/createCall', { assistant_id: assistantId })
        const newCall = response.data?.call
        if (newCall) {
          // store action already added the call; keep local selectedAssistantId unchanged
        }
        this.$toast({
          component: ToastificationContent,
          props: { title: this.$t('assistantCall.callSent'), variant: 'success', icon: 'PhoneCallIcon' },
        })
      } catch (error) {
        this.$toast({
          component: ToastificationContent,
          props: { title: this.$t('assistantCall.callFailed'), variant: 'danger', icon: 'AlertTriangleIcon' },
        })
      } finally {
        this.callLoading = false
      }
    },
    async fetchAssistants() {
      try {
        const response = await assistantsService.getAssistants()
        this.assistantsList = response.data.data || response.data || []
      } catch (e) {
        console.error('Failed to fetch assistants', e)
      }
    },
    async fetchActiveCalls() {
      try {
        await this.$store.dispatch('assistantCalls/fetchActiveCalls')
      } catch (e) {
        console.error('Failed to fetch active calls', e)
      }
    },
    async markCallDone(call) {
      try {
        await this.$store.dispatch('assistantCalls/completeCall', call.id)
        this.$toast({
          component: ToastificationContent,
          props: { title: this.$t('assistantCall.callCompleted'), variant: 'success', icon: 'CheckCircleIcon' },
        })
      } catch (e) {
        console.error('Failed to complete call', e)
      }
    },
    async acceptCall(call) {
      try {
        await this.$store.dispatch('assistantCalls/acceptCall', call.id)
        this.$toast({
          component: ToastificationContent,
          props: { title: this.$t('assistantCall.callAccepted'), variant: 'success', icon: 'UserCheckIcon' },
        })
      } catch (e) {
        console.error('Failed to accept call', e)
      }
    },
    handleCallEvent(data) {
      const call = data.call
      if (!call) return

      // Let the Vuex store handle call state
      try {
        this.$store.dispatch('assistantCalls/processCallEvent', data)
      } catch (e) {
        console.error('Failed to process call event in store', e)
      }

      if (data.action === 'created') {
        // show a toast to assistants (sound handled globally by plugin)
        if (this.isAssistant) {
          this.$toast({
            component: ToastificationContent,
            props: {
              title: this.$t('assistantCall.incomingCalls'),
              text: `${call.doctor?.name || this.$t('assistantCall.doctor')} ${this.$t('assistantCall.isRequestingAssistance')}`,
              icon: 'PhoneCallIcon',
              variant: 'danger',
            },
          })
        }
      } else if (data.action === 'accepted') {
        // Only notify doctors when an assistant accepts a call
        if (this.isDoctor) {
          this.$toast({
            component: ToastificationContent,
            props: {
              title: this.$t('assistantCall.callAccepted'),
              text: call.assistant?.name || '',
              variant: 'info',
              icon: 'UserCheckIcon',
            },
          })
        }
      }
    },
    listenForCallEvents() {
      if (!window.Echo || !this.user) return
      try {
        updateEchoAuth()
        if (this.isDoctor) {
          this._callChannel = window.Echo.private(`clinic.${this.user.id}.assistant-calls`)
            .listen('.assistant.call', data => this.handleCallEvent(data))
        } else if (this.isAssistant) {
          this._callChannel = window.Echo.private(`assistant.${this.user.id}`)
            .listen('.assistant.call', data => this.handleCallEvent(data))
        }
      } catch (e) {
        console.error('[WS] Failed to subscribe to assistant-call channel', e)
      }
    },
  },
}
</script>

<style>
.call-assistant-dropdown-menu {
  min-width: min(280px, calc(100vw - 2rem));
}
.badge-up {
  position: absolute;
  top: -8px;
}
[dir="ltr"] .badge-up {
  right: -8px;
}
[dir="rtl"] .badge-up {
  left: -8px;
}
</style>
