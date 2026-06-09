<template>
  <div>
    <b-card :title="$t('reports.title')">
      <b-form @submit.prevent="fetchSummary">
        <b-row>
          <b-col cols="12" sm="6" md="3">
            <b-form-group :label="$t('reservation.from')">
              <b-form-input v-model="filters.date_from" type="date" />
            </b-form-group>
          </b-col>
          <b-col cols="12" sm="6" md="3">
            <b-form-group :label="$t('reservation.to')">
              <b-form-input v-model="filters.date_to" type="date" />
            </b-form-group>
          </b-col>
          <b-col md="3" class="d-flex align-items-end">
            <b-button variant="primary" class="mr-1" type="submit" :disabled="loading">
              <b-spinner v-if="loading" small class="mr-50" />
              {{ $t('filters.apply') }}
            </b-button>
            <b-button variant="outline-secondary" @click="resetFilters" :disabled="loading">
              {{ $t('filters.reset') }}
            </b-button>
          </b-col>
        </b-row>
      </b-form>

      <div class="d-flex justify-content-end mt-1">
        <b-button variant="success" @click="downloadPdf" :disabled="loading || exportingPdf">
          <b-spinner v-if="exportingPdf" small class="mr-50" />
          <feather-icon icon="DownloadIcon" class="mr-50" />
          {{ $t('reports.exportPdf') }}
        </b-button>
      </div>
    </b-card>

    <div v-if="pageLoading" class="text-center py-5">
      <b-spinner variant="primary" class="mb-1" />
      <div class="text-muted">{{ $t('messages.loading') }}</div>
    </div>

    <template v-else>
      <b-row>
        <b-col cols="12" md="6">
          <b-card :title="$t('reports.reservationsSummary')">
            <p><strong>{{ $t('reports.totalReservations') }}:</strong> {{ summary.reservations.total }}</p>
            <p><strong>{{ $t('reservation.pending') }}:</strong> {{ summary.reservations.pending }}</p>
            <p><strong>{{ $t('reservation.confirmed') }}:</strong> {{ summary.reservations.confirmed }}</p>
            <p><strong>{{ $t('reservation.completed') }}:</strong> {{ summary.reservations.completed }}</p>
            <p><strong>{{ $t('reservation.cancelled') }}:</strong> {{ summary.reservations.cancelled }}</p>
            <p><strong>{{ $t('reservation.requiresXray') }}:</strong> {{ summary.reservations.requires_xray }}</p>
            <p><strong>{{ $t('reservation.requiresLab') }}:</strong> {{ summary.reservations.requires_lab }}</p>
          </b-card>
        </b-col>

        <b-col cols="12" md="6">
          <b-card :title="$t('reports.financialSummary')">
            <p><strong>{{ $t('financial.totalAmount') }}:</strong> {{ formatCurrency(summary.financials.total_amount) }}</p>
            <p><strong>{{ $t('financial.totalPaid') }}:</strong> {{ formatCurrency(summary.financials.total_paid) }}</p>
            <p><strong>{{ $t('financial.totalRemaining') }}:</strong> {{ formatCurrency(summary.financials.total_remaining) }}</p>
            <p><strong>{{ $t('financial.totalRecords') }}:</strong> {{ summary.financials.total_records }}</p>
          </b-card>
        </b-col>
      </b-row>

      <b-row>
        <b-col cols="12" lg="6">
          <b-card :title="$t('reports.incomeByInvoiceType')">
            <b-table small responsive :items="incomeTypeRows" :fields="breakdownFields" show-empty>
              <template #empty>
                <div class="text-center text-muted">{{ $t('messages.noData') }}</div>
              </template>
              <template #cell(amount)="data">{{ formatCurrency(data.value) }}</template>
            </b-table>
          </b-card>
        </b-col>
        <b-col cols="12" lg="6">
          <b-card :title="$t('reports.incomeByPaymentMethod')">
            <b-table small responsive :items="paymentMethodRows" :fields="breakdownFields" show-empty>
              <template #empty>
                <div class="text-center text-muted">{{ $t('messages.noData') }}</div>
              </template>
              <template #cell(label)="data">{{ formatPaymentMethod(data.item.key, data.value) }}</template>
              <template #cell(amount)="data">{{ formatCurrency(data.value) }}</template>
            </b-table>
          </b-card>
        </b-col>
      </b-row>

      <b-row>
        <b-col cols="12" lg="6">
          <b-card :title="$t('reports.reservationPaymentsByMethod')">
            <b-table small responsive :items="reservationPaymentMethodRows" :fields="breakdownFields" show-empty>
              <template #empty>
                <div class="text-center text-muted">{{ $t('messages.noData') }}</div>
              </template>
              <template #cell(label)="data">{{ formatPaymentMethod(data.item.key, data.value) }}</template>
              <template #cell(amount)="data">{{ formatCurrency(data.value) }}</template>
            </b-table>
          </b-card>
        </b-col>
        <b-col cols="12" lg="6">
          <b-card :title="$t('reports.additionalServicesPaymentsByMethod')">
            <b-table small responsive :items="additionalServicesPaymentMethodRows" :fields="breakdownFields" show-empty>
              <template #empty>
                <div class="text-center text-muted">{{ $t('messages.noData') }}</div>
              </template>
              <template #cell(label)="data">{{ formatPaymentMethod(data.item.key, data.value) }}</template>
              <template #cell(amount)="data">{{ formatCurrency(data.value) }}</template>
            </b-table>
          </b-card>
        </b-col>
      </b-row>

      <b-row>
        <b-col cols="12" md="4">
          <b-card :title="$t('reports.purchasesSummary')">
            <p><strong>{{ $t('financial.totalAmount') }}:</strong> {{ formatCurrency(summary.purchases.total_amount) }}</p>
            <p><strong>{{ $t('financial.totalRecords') }}:</strong> {{ summary.purchases.total_records }}</p>
          </b-card>
        </b-col>
        <b-col cols="12" md="4">
          <b-card :title="$t('reports.purchasesByCategory')">
            <b-table small responsive :items="purchaseCategoryRows" :fields="breakdownFields" show-empty>
              <template #empty>
                <div class="text-center text-muted">{{ $t('messages.noData') }}</div>
              </template>
              <template #cell(label)="data">{{ formatPurchaseCategory(data.item.key, data.value) }}</template>
              <template #cell(amount)="data">{{ formatCurrency(data.value) }}</template>
            </b-table>
          </b-card>
        </b-col>
        <b-col cols="12" md="4">
          <b-card :title="$t('reports.purchasesByPaymentMethod')">
            <b-table small responsive :items="purchasePaymentMethodRows" :fields="breakdownFields" show-empty>
              <template #empty>
                <div class="text-center text-muted">{{ $t('messages.noData') }}</div>
              </template>
              <template #cell(label)="data">{{ formatPurchasePaymentMethod(data.item.key, data.value) }}</template>
              <template #cell(amount)="data">{{ formatCurrency(data.value) }}</template>
            </b-table>
          </b-card>
        </b-col>
      </b-row>
    </template>
  </div>
</template>

<script>
import {
  BCard,
  BForm,
  BRow,
  BCol,
  BFormGroup,
  BFormInput,
  BFormSelect,
  BButton,
  BSpinner,
  BTable,
} from 'bootstrap-vue'
import reportsService from '@/services/reports'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'

export default {
  components: {
    BCard,
    BForm,
    BRow,
    BCol,
    BFormGroup,
    BFormInput,
    BFormSelect,
    BButton,
    BSpinner,
    BTable,
  },
  data() {
    return {
      pageLoading: true,
      loading: false,
      exportingPdf: false,
      filters: {
        date_from: '',
        date_to: '',
      },
      summary: {
        reservations: {
          total: 0,
          pending: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0,
          requires_xray: 0,
          requires_lab: 0,
        },
        financials: {
          total_amount: 0,
          total_paid: 0,
          total_remaining: 0,
          total_records: 0,
          payments: {
            total: { amount: 0, count: 0 },
            reservation_invoices: { amount: 0, count: 0 },
            additional_services: { amount: 0, count: 0 },
            by_payment_method: [],
            reservation_by_payment_method: [],
            additional_services_by_payment_method: [],
          },
        },
        purchases: {
          total_amount: 0,
          total_records: 0,
          by_category: [],
          by_payment_method: [],
        },
      },
    }
  },
  computed: {
    currentUser() {
      return JSON.parse(localStorage.getItem('user') || 'null')
    },
    isAssistant() {
      return this.currentUser?.role === 'assistant'
    },
    breakdownFields() {
      return [
        { key: 'label', label: this.$t('reports.breakdown'), thClass: 'text-center', tdClass: 'text-center' },
        { key: 'amount', label: this.$t('financial.amount'), thClass: 'text-center', tdClass: 'text-center' },
        { key: 'count', label: this.$t('financial.totalRecords'), thClass: 'text-center', tdClass: 'text-center' },
      ]
    },
    incomeTypeRows() {
      const payments = this.summary.financials.payments || {}
      return [
        {
          key: 'reservation_invoices',
          label: this.$t('financial.reservationInvoice'),
          amount: payments.reservation_invoices?.amount || 0,
          count: payments.reservation_invoices?.count || 0,
        },
        {
          key: 'additional_services',
          label: this.$t('financial.additionalServicesInvoice'),
          amount: payments.additional_services?.amount || 0,
          count: payments.additional_services?.count || 0,
        },
      ]
    },
    paymentMethodRows() {
      return this.summary.financials.payments?.by_payment_method || []
    },
    reservationPaymentMethodRows() {
      return this.summary.financials.payments?.reservation_by_payment_method || []
    },
    additionalServicesPaymentMethodRows() {
      return this.summary.financials.payments?.additional_services_by_payment_method || []
    },
    purchaseCategoryRows() {
      return this.summary.purchases?.by_category || []
    },
    purchasePaymentMethodRows() {
      return this.summary.purchases?.by_payment_method || []
    },
  },
  async mounted() {
    const today = this.getTodayDate()
    this.filters.date_from = today
    this.filters.date_to = today

    try {
      await this.fetchSummary()
    } finally {
      this.pageLoading = false
    }
  },
  methods: {
    async fetchSummary() {
      this.loading = true
      try {
        const params = {
          date_from: this.filters.date_from,
          date_to: this.filters.date_to,
        }

        const response = await reportsService.getSummary(params)
        this.summary = response.data
      } catch (error) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.error'),
            text: this.$t('messages.reportsLoadError'),
            variant: 'danger',
          },
        })
      } finally {
        this.loading = false
      }
    },
    async downloadPdf() {
      this.exportingPdf = true
      try {
        const params = {
          date_from: this.filters.date_from,
          date_to: this.filters.date_to,
          lang: this.$i18n.locale,
        }

        const response = await reportsService.exportPdf(params)
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = this.$i18n.locale === 'ar' ? 'report-ar.pdf' : 'report-en.pdf'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (error) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.error'),
            text: this.$t('messages.reportsExportError'),
            variant: 'danger',
          },
        })
      } finally {
        this.exportingPdf = false
      }
    },
    resetFilters() {
      const today = this.getTodayDate()
      this.filters = {
        date_from: today,
        date_to: today,
      }
      this.fetchSummary()
    },
    getTodayDate() {
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    formatCurrency(value) {
      return Number(value || 0).toFixed(2)
    },
    formatPaymentMethod(key, fallback) {
      const normalized = String(key || '').toLowerCase().replace(/\s+/g, '_')
      const map = {
        bank_transfer: this.$t('financial.transfer'),
        transfer: this.$t('financial.transfer'),
        cash: this.$t('financial.cash'),
        card: this.$t('financial.card'),
        other: this.$t('financial.other'),
        instapay: this.$t('financial.instapay'),
      }
      return map[normalized] || fallback || key || ''
    },
    formatPurchasePaymentMethod(key, fallback) {
      return this.formatPaymentMethod(key, fallback)
    },
    formatPurchaseCategory(key, fallback) {
      const map = {
        'Medical Supplies': this.$t('categoryOptions.medicalSupplies'),
        Equipment: this.$t('categoryOptions.equipment'),
        Services: this.$t('categoryOptions.services'),
        Maintenance: this.$t('categoryOptions.maintenance'),
        Other: this.$t('categoryOptions.other'),
      }
      return map[key] || fallback || key || ''
    },
  },
}
</script>


