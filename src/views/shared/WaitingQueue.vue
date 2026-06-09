<template>
  <div>
    <!-- Queue Stats Cards -->
    <b-row class="mb-2">
      <b-col cols="6" md="3">
        <b-card class="text-center border-primary">
          <div class="d-flex align-items-center justify-content-center">
            <div class="rounded-circle bg-light-primary p-1 mr-1">
              <feather-icon icon="UsersIcon" size="24" class="text-primary" />
            </div>
            <div>
              <h3 class="mb-0 text-primary">{{ stats.total_checked_in }}</h3>
              <small class="text-muted">{{ $t('queue.checkedIn') }}</small>
            </div>
          </div>
        </b-card>
      </b-col>
      <b-col cols="6" md="3">
        <b-card class="text-center border-warning">
          <div class="d-flex align-items-center justify-content-center">
            <div class="rounded-circle bg-light-warning p-1 mr-1">
              <feather-icon icon="ClockIcon" size="24" class="text-warning" />
            </div>
            <div>
              <h3 class="mb-0 text-warning">{{ stats.waiting }}</h3>
              <small class="text-muted">{{ $t('queue.waiting') }}</small>
            </div>
          </div>
        </b-card>
      </b-col>
      <b-col cols="6" md="3">
        <b-card class="text-center border-success">
          <div class="d-flex align-items-center justify-content-center">
            <div class="rounded-circle bg-light-success p-1 mr-1">
              <feather-icon icon="CheckCircleIcon" size="24" class="text-success" />
            </div>
            <div>
              <h3 class="mb-0 text-success">{{ stats.completed }}</h3>
              <small class="text-muted">{{ $t('queue.completed') }}</small>
            </div>
          </div>
        </b-card>
      </b-col>
      <b-col cols="6" md="3">
        <b-card class="text-center border-info">
          <div class="d-flex align-items-center justify-content-center">
            <div class="rounded-circle bg-light-info p-1 mr-1">
              <feather-icon icon="ActivityIcon" size="24" class="text-info" />
            </div>
            <div>
              <h3 class="mb-0 text-info">{{ stats.currently_serving || '—' }}</h3>
              <small class="text-muted">{{ $t('queue.nowServing') }}</small>
            </div>
          </div>
        </b-card>
      </b-col>
    </b-row>

    <!-- Filters & Queue -->
    <b-card>
      <b-row class="mb-2 align-items-center">
        <b-col cols="12" md="4">
          <h4 class="mb-0">
            <feather-icon icon="ListIcon" size="20" class="mr-50" />
            {{ $t('queue.title') }}
          </h4>
        </b-col>
        <b-col cols="6" md="3">
          <b-form-input
            v-model="filterDate"
            type="date"
            @change="fetchQueue"
          />
        </b-col>
        <b-col cols="12" md="2" class="text-right mt-1 mt-md-0">
          <b-button variant="outline-primary" size="sm" @click="fetchQueue" :disabled="loading">
            <feather-icon icon="RefreshCwIcon" class="mr-50" />
            {{ $t('queue.refresh') }}
          </b-button>
        </b-col>
      </b-row>

      <!-- Queue List -->
      <div v-if="loading" class="text-center my-3">
        <b-spinner variant="primary" />
        <p class="mt-1 text-muted">{{ $t('messages.loading') }}</p>
      </div>

      <div v-else-if="queue.length === 0" class="text-center my-3">
        <feather-icon icon="InboxIcon" size="48" class="text-muted mb-1" />
        <p class="text-muted">{{ $t('queue.noPatients') }}</p>
      </div>

      <div v-else>
        <div
          v-for="(item, index) in queue"
          :key="item.id"
          class="queue-item d-flex align-items-center p-1 mb-1 rounded border"
          :class="queueItemClass(item)"
          draggable="true"
          @dragstart="onDragStart($event, item.id)"
          @dragover.prevent="onDragOver($event, index)"
          @dragend="onDragEnd($event)"
        >
          <!-- Waiting Number Badge -->
          <div class="queue-number mr-1" :class="queueNumberClass(item)">
            <span class="font-weight-bolder">{{ item.waiting_number }}</span>
          </div>

          <!-- Patient Info -->
          <div class="flex-grow-1">
            <div class="d-flex align-items-center mb-25">
              <h6 class="mb-0 mr-1">{{ item.client ? item.client.name : '—' }}</h6>
              <b-badge :variant="queueBadgeVariant(item)" pill>
                {{ $t('queue.' + item.queue_status) }}
              </b-badge>
              <b-badge v-if="item.is_current" variant="danger" pill class="ml-50 pulse-badge">
                {{ $t('queue.current') }}
              </b-badge>
            </div>
            <div class="d-flex flex-wrap text-muted small">
              <span class="mr-1">
                <feather-icon icon="UserIcon" size="12" class="mr-25" />
                {{ item.doctor ? item.doctor.name : '—' }}
              </span>
              <span class="mr-1">
                <feather-icon icon="ClockIcon" size="12" class="mr-25" />
                {{ formatTime(item.appointment_date) }}
              </span>
              <span class="mr-1">
                <feather-icon icon="LogInIcon" size="12" class="mr-25" />
                {{ $t('queue.checkedInAt') }}: {{ formatTime(item.checked_in_at) }}
              </span>
              <span v-if="item.estimated_wait !== null && item.estimated_wait > 0" class="text-warning">
                <feather-icon icon="AlertCircleIcon" size="12" class="mr-25" />
                ~{{ item.estimated_wait }} {{ $t('queue.minutes') }}
              </span>
            </div>
          </div>

          <!-- Actions (assistant only) -->
          <div v-if="userRole === 'assistant'" class="ml-1">
            <b-button
              v-if="item.queue_status !== 'completed'"
              v-b-tooltip.hover
              :title="$t('queue.undoCheckIn')"
              variant="outline-danger"
              size="sm"
              @click="undoCheckIn(item)"
            >
              <feather-icon icon="XIcon" size="14" />
            </b-button>
          </div>
        </div>
      </div>

      <!-- Auto-refresh indicator -->
      <div class="text-center mt-2">
        <small class="text-muted">
          <feather-icon icon="RefreshCwIcon" size="12" class="mr-25" />
          {{ $t('queue.autoRefresh') }}
        </small>
      </div>
    </b-card>
  </div>
</template>

<script>
import {
  BCard,
  BRow,
  BCol,
  BButton,
  BFormInput,
  BFormSelect,
  BSpinner,
  BBadge,
  VBTooltip,
} from 'bootstrap-vue'
import reservationsService from '@/services/reservations'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'

export default {
  components: {
    BCard,
    BRow,
    BCol,
    BButton,
    BFormInput,
    BFormSelect,
    BSpinner,
    BBadge,
  },
  directives: {
    'b-tooltip': VBTooltip,
  },
  data() {
    return {
      queue: [],
      stats: {
        total_checked_in: 0,
        waiting: 0,
        completed: 0,
        avg_consultation_minutes: 15,
        currently_serving: null,
      },
      loading: false,
      filterDate: this.getTodayDate(),
      refreshInterval: null,
      draggingIndex: null,
      lastOverId: null,
      movedDuringDrag: false,
    }
  },
  computed: {
    userRole() {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}')
      return userData.role || ''
    },
  },
  mounted() {
    this.fetchQueue()
    // Auto-refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.fetchQueue()
    }, 30000)
  },
  beforeDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
  },
  watch: {
    '$store.state.broadcast.eventCounter'() {
      this.fetchQueue()
    },
  },
  methods: {
    async fetchQueue() {
      this.loading = true
      try {
        const params = { date: this.filterDate }
        const response = await reservationsService.getWaitingQueue(params)
        this.queue = response.data.queue || []
        this.stats = response.data.stats || this.stats
      } catch (error) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.error'),
            text: this.$t('queue.loadError'),
            variant: 'danger',
          },
        })
      } finally {
        this.loading = false
      }
    },
    async undoCheckIn(item) {
      const result = await this.$swal({
        title: this.$t('queue.undoCheckInConfirm'),
        text: this.$t('queue.undoCheckInText', { name: item.client?.name || '' }),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: this.$t('actions.confirm'),
        cancelButtonText: this.$t('actions.cancel'),
        customClass: {
          confirmButton: 'btn btn-danger',
          cancelButton: 'btn btn-outline-secondary ml-1',
        },
        buttonsStyling: false,
      })
      if (!result.isConfirmed) return

      try {
        await reservationsService.undoCheckIn(item.id)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.success'),
            text: this.$t('queue.checkInUndone'),
            variant: 'success',
          },
        })
        this.fetchQueue()
      } catch (error) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.error'),
            text: error.response?.data?.error || this.$t('queue.undoError'),
            variant: 'danger',
          },
        })
      }
    },
    async onDragStart(event, id) {
      try {
        event.dataTransfer.setData('text/plain', String(id))
        this.draggingIndex = id
        this.movedDuringDrag = false
      } catch (e) {
        // ignore
      }
      // Do not refresh the queue while dragging — it interferes with user reorder
    },

    onDragOver(event, index) {
      const target = this.queue[index]
      if (!target) return
      const targetId = target.id
      if (this.lastOverId === targetId) return
      this.lastOverId = targetId
      let draggedId = null
      if (this.draggingIndex !== null) {
        draggedId = this.draggingIndex
      } else {
        draggedId = parseInt(event.dataTransfer.getData('text/plain'), 10)
      }
      if (isNaN(draggedId)) return
      const from = this.queue.findIndex(i => i.id === draggedId)
      if (from === -1 || from === index) return
      const item = this.queue.splice(from, 1)[0]
      this.queue.splice(index, 0, item)
      this.movedDuringDrag = true
    },

    async onDragEnd(event) {
      this.lastOverId = null
      if (this.movedDuringDrag) {
        this.movedDuringDrag = false
        await this.syncOrder()
      }
      this.draggingIndex = null
    },
    
    async syncOrder() {
      try {
        const orderedIds = this.queue.map(i => i.id)
        console.debug('syncOrder: orderedIds', orderedIds)
        await reservationsService.reorderWaitingQueue(orderedIds)
        console.debug('syncOrder: reorder request sent')
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.success'),
            text: this.$t('queue.reorderSuccess') || 'Queue reordered',
            variant: 'success',
          },
        })
        // Refresh queue from server to get updated estimated times and statuses
        this.fetchQueue()
      } catch (error) {
        console.error('syncOrder error', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.error'),
            text: error.response?.data?.error || this.$t('queue.reorderError') || 'Unable to reorder',
            variant: 'danger',
          },
        })
        // Re-fetch to restore server state
        this.fetchQueue()
      }
    },
    queueItemClass(item) {
      if (item.queue_status === 'completed') return 'border-success bg-light-success queue-completed'
      if (item.is_current) return 'border-danger bg-light-danger queue-current'
      return 'border-warning'
    },
    queueNumberClass(item) {
      if (item.queue_status === 'completed') return 'bg-success text-white'
      if (item.is_current) return 'bg-danger text-white'
      return 'bg-warning text-white'
    },
    queueBadgeVariant(item) {
      const map = { serving: 'danger', waiting: 'warning', completed: 'success' }
      return map[item.queue_status] || 'secondary'
    },
    formatTime(value) {
      if (!value) return '—'
      const date = new Date(value)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    getTodayDate() {
      const d = new Date()
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    },
  },
}
</script>

<style scoped>
.queue-number {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.queue-item {
  transition: all 0.3s ease;
}

.queue-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.queue-completed {
  opacity: 0.6;
}

.queue-current {
  animation: pulse-border 2s infinite;
}

.pulse-badge {
  animation: pulse-opacity 1.5s infinite;
}

@keyframes pulse-border {
  0% { box-shadow: 0 0 0 0 rgba(234, 84, 85, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(234, 84, 85, 0); }
  100% { box-shadow: 0 0 0 0 rgba(234, 84, 85, 0); }
}

@keyframes pulse-opacity {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.bg-light-success { background-color: rgba(40, 199, 111, 0.12) !important; }
.bg-light-danger { background-color: rgba(234, 84, 85, 0.12) !important; }
.bg-light-primary { background-color: rgba(115, 103, 240, 0.12) !important; }
.bg-light-warning { background-color: rgba(255, 159, 67, 0.12) !important; }
.bg-light-info { background-color: rgba(0, 207, 232, 0.12) !important; }
</style>
