<template>
  <div>
    <div v-if="pageLoading" class="text-center py-5">
      <b-spinner variant="primary" class="mb-1" />
      <div class="text-muted">{{ $t('messages.loading') }}</div>
    </div>

    <template v-else>
      <b-card :title="$t('menu.schedule')">
      <b-form @submit.prevent="saveAvailability">
        <b-form-group :label="$t('reservation.appointmentDuration')" class="mb-2">
          <b-form-select v-model="appointmentDuration" :options="durationOptions" />
        </b-form-group>

        <div v-for="day in days" :key="day.index" class="mb-3">
          <div class="d-flex align-items-center mb-1">
            <h5 class="mb-0 mr-2">{{ dayName(day.index) }}</h5>
            <b-button type="button" size="sm" variant="outline-primary" @click="addSlot(day.index)">
              <feather-icon icon="PlusIcon" size="14" />
              {{ $t('actions.add') }}
            </b-button>
          </div>

          <div v-if="getSlots(day.index).length === 0" class="text-muted small mb-1">
            —
          </div>

          <b-row
            v-for="(slot, idx) in getSlots(day.index)"
            :key="slot._key"
            class="mb-1 align-items-center"
          >
            <b-col cols="5" md="4">
              <b-form-input type="time" v-model="slot.start_time" required />
            </b-col>
            <b-col cols="5" md="4">
              <b-form-input type="time" v-model="slot.end_time" required />
            </b-col>
            <b-col cols="2" md="2">
              <b-button type="button" size="sm" variant="outline-danger" v-b-tooltip.hover :title="$t('actions.remove')" @click="removeSlot(day.index, idx)">
                <feather-icon icon="TrashIcon" size="14" />
              </b-button>
            </b-col>
          </b-row>
        </div>

        <div class="text-end">
          <b-button type="submit" variant="primary" :disabled="saving">
            <b-spinner v-if="saving" small class="mr-1" />
            {{ $t('actions.save') }}
          </b-button>
        </div>
      </b-form>
      </b-card>

      <b-card class="mt-2" :title="$t('reservation.holidays')">
      <b-form @submit.prevent="addHoliday">
        <b-row>
          <b-col cols="12" sm="6" md="3">
            <b-form-select v-model="newHoliday.type" :options="holidayTypeOptions" />
          </b-col>
          <b-col md="3" v-if="newHoliday.type === 'date'">
            <b-form-input type="date" v-model="newHoliday.date" required />
          </b-col>
          <b-col md="3" v-else>
            <b-form-select v-model="newHoliday.recurring_day_of_week" :options="dayOptions" required />
          </b-col>
          <b-col cols="12" sm="6" md="4">
            <b-form-input v-model="newHoliday.reason" :placeholder="$t('reservation.reason')" />
          </b-col>
          <b-col cols="6" md="2" class="text-end">
            <b-button type="submit" variant="warning" :disabled="addingHoliday">
              <b-spinner v-if="addingHoliday" small class="mr-1" />
              {{ $t('actions.add') }}
            </b-button>
          </b-col>
        </b-row>
      </b-form>

      <b-table :items="holidays" :fields="holidayFields" small responsive class="mt-2">
        <template #cell(date)="data">
          {{ holidayDisplay(data.item) }}
        </template>
        <template #cell(actions)="data">
          <b-button size="sm" variant="danger" v-b-tooltip.hover :title="$t('actions.delete')" @click="removeHoliday(data.item)">
            <feather-icon icon="TrashIcon" />
          </b-button>
        </template>
      </b-table>

      <b-pagination
        v-model="holidaysPagination.current_page"
        :total-rows="holidaysPagination.total"
        :per-page="holidaysPagination.per_page"
        @change="onHolidaysPageChange"
        class="mt-2"
        align="center"
      />
      <div class="text-center text-muted small mt-1" v-if="holidaysPagination.total">
        {{ paginationCountText(holidaysPagination) }}
      </div>
      </b-card>
    </template>
  </div>
</template>

<script>
import { BCard, BForm, BTable, BPagination, BButton, BRow, BCol, BFormInput, BSpinner, BFormGroup, BFormSelect, VBTooltip } from 'bootstrap-vue'
import scheduleService from '@/services/schedule'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'

let slotKeyCounter = 0

export default {
  directives: {
    'b-tooltip': VBTooltip,
  },
  components: { BCard, BForm, BTable, BPagination, BButton, BRow, BCol, BFormInput, BSpinner, BFormGroup, BFormSelect },
  data() {
    return {
      user: null,
      days: [
        { index: 0 },
        { index: 1 },
        { index: 2 },
        { index: 3 },
        { index: 4 },
        { index: 5 },
        { index: 6 },
      ],
      availabilitySlots: [],
      appointmentDuration: 30,
      holidays: [],
      holidaysPagination: {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
      },
      holidayFields: [
        { key: 'date', label: this.$t('reservation.date') },
        { key: 'reason', label: this.$t('reservation.reason') },
        { key: 'actions', label: this.$t('table.actions') },
      ],
      saving: false,
      addingHoliday: false,
      pageLoading: true,
      newHoliday: { type: 'date', date: '', recurring_day_of_week: null, reason: '' },
    }
  },
  async mounted() {
    this.user = JSON.parse(localStorage.getItem('user') || 'null')
    if (this.user) {
      await Promise.all([
        this.fetchAvailability(),
        this.fetchHolidays(),
      ])
    }
    this.pageLoading = false
  },
  methods: {
    dayName(idx) {
      const isAr = this.$i18n.locale === 'ar'
      const namesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const namesAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
      return isAr ? namesAr[idx] : namesEn[idx]
    },
    getSlots(dayIndex) {
      return this.availabilitySlots.filter(s => s.day_of_week === dayIndex)
    },
    addSlot(dayIndex) {
      this.availabilitySlots.push({
        _key: ++slotKeyCounter,
        day_of_week: dayIndex,
        start_time: '',
        end_time: '',
      })
    },
    removeSlot(dayIndex, idx) {
      const daySlots = this.availabilitySlots.filter(s => s.day_of_week === dayIndex)
      const target = daySlots[idx]
      const globalIdx = this.availabilitySlots.indexOf(target)
      if (globalIdx !== -1) {
        this.availabilitySlots.splice(globalIdx, 1)
      }
    },
    async fetchAvailability() {
      try {
        const res = await scheduleService.getAvailability(this.user.id)
        const slots = res.data || []
        const firstDurationSlot = slots.find(slot => slot.slot_duration_minutes)
        this.appointmentDuration = firstDurationSlot ? firstDurationSlot.slot_duration_minutes : 30
        this.availabilitySlots = slots.map(slot => ({
          _key: ++slotKeyCounter,
          day_of_week: slot.day_of_week,
          start_time: slot.start_time ? slot.start_time.substring(0, 5) : '',
          end_time: slot.end_time ? slot.end_time.substring(0, 5) : '',
        }))
      } catch (e) {
        // silent
      }
    },
    async saveAvailability() {
      this.saving = true
      try {
        const slots = this.availabilitySlots
          .filter(r => r.start_time && r.end_time)
          .map(r => ({ day_of_week: r.day_of_week, start_time: r.start_time, end_time: r.end_time }))
        await scheduleService.updateAvailability(this.user.id, slots, Number(this.appointmentDuration) || 30)
        this.$toast({
          component: ToastificationContent,
          props: { title: this.$t('messages.success'), text: this.$t('messages.scheduleSaved'), variant: 'success' },
        })
      } catch (error) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.error'),
            text: error.response?.data?.message || error.response?.data?.error || this.$t('messages.scheduleSaveError'),
            variant: 'danger',
          },
        })
      } finally {
        this.saving = false
      }
    },
    async fetchHolidays() {
      try {
        const params = {
          page: this.holidaysPagination.current_page,
        }
        const res = await scheduleService.getHolidays(this.user.id, params)
        this.holidays = res.data.data
        this.holidaysPagination = {
          current_page: res.data.current_page,
          last_page: res.data.last_page,
          per_page: res.data.per_page,
          total: res.data.total,
        }
      } catch (e) {
        // silent
      }
    },
    async addHoliday() {
      this.addingHoliday = true
      try {
        const payload = {
          reason: this.newHoliday.reason,
        }

        if (this.newHoliday.type === 'weekly') {
          payload.recurring_day_of_week = this.newHoliday.recurring_day_of_week
        } else {
          payload.date = this.newHoliday.date
        }

        await scheduleService.addHoliday(this.user.id, payload)
        this.newHoliday = { type: 'date', date: '', recurring_day_of_week: null, reason: '' }
        this.fetchHolidays()
      } catch (error) {
        this.$toast({
          component: ToastificationContent,
          props: { title: this.$t('messages.error'), text: this.$t('messages.addHolidayError'), variant: 'danger' },
        })
      } finally {
        this.addingHoliday = false
      }
    },
    async removeHoliday(item) {
      if (!confirm(this.$t('messages.deleteConfirm'))) return
      try {
        await scheduleService.deleteHoliday(this.user.id, item.id)
        this.fetchHolidays()
      } catch (error) {
        this.$toast({
          component: ToastificationContent,
          props: { title: this.$t('messages.error'), text: this.$t('messages.deleteError'), variant: 'danger' },
        })
      }
    },
    onHolidaysPageChange(page) {
      this.holidaysPagination.current_page = page
      this.fetchHolidays()
    },
    holidayDisplay(item) {
      if (item.recurring_day_of_week === null || item.recurring_day_of_week === undefined) {
        return item.date
      }

      return `${this.dayName(item.recurring_day_of_week)} (${this.$t('reservation.everyWeek')})`
    },
    paginationCountText(paginationState) {
      if (!paginationState?.total) return '0 / 0'
      const from = ((paginationState.current_page - 1) * paginationState.per_page) + 1
      const to = Math.min(paginationState.current_page * paginationState.per_page, paginationState.total)
      return `${from}-${to} / ${paginationState.total}`
    },
  },
  computed: {
    durationOptions() {
      return [5, 10, 15, 20, 30, 45, 60].map(value => ({
        value,
        text: `${value} ${this.$t('reservation.minutes')}`,
      }))
    },
    holidayTypeOptions() {
      return [
        { value: 'date', text: this.$t('reservation.oneTimeHoliday') },
        { value: 'weekly', text: this.$t('reservation.weeklyHoliday') },
      ]
    },
    dayOptions() {
      return this.days.map(day => ({
        value: day.index,
        text: this.dayName(day.index),
      }))
    },
  },
}
</script>

