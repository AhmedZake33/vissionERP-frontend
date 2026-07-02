<template>
  <div class="erp-page">
    <div class="erp-page__heading">
      <div>
        <p class="erp-eyebrow">{{ $t('erp.payments.eyebrow') }}</p>
        <h2>{{ $t('erp.payments.title') }}</h2>
        <p class="text-muted mb-0">{{ $t('erp.payments.subtitle') }}</p>
      </div>
    </div>

    <div class="erp-stat-grid">
      <b-card class="erp-stat-card">
        <span>{{ $t('erp.stats.paymentTransactions') }}</span>
        <strong>{{ stats.total_count }}</strong>
      </b-card>
      <b-card class="erp-stat-card">
        <span>{{ $t('erp.stats.totalCollected') }}</span>
        <strong class="text-success">{{ currency(stats.total_amount) }}</strong>
      </b-card>
      <b-card class="erp-stat-card">
        <span>{{ $t('erp.invoices.cash') }}</span>
        <strong>{{ currency(stats.cash_total) }}</strong>
      </b-card>
      <b-card class="erp-stat-card">
        <span>{{ $t('erp.invoices.instapay') }}</span>
        <strong>{{ currency(stats.instapay_total) }}</strong>
      </b-card>
      <b-card class="erp-stat-card">
        <span>{{ $t('erp.invoices.bankTransfer') }}</span>
        <strong>{{ currency(stats.bank_transfer_total) }}</strong>
      </b-card>
      <b-card class="erp-stat-card">
        <span>{{ $t('erp.invoices.cheque') }}</span>
        <strong>{{ currency(stats.cheque_total) }}</strong>
      </b-card>
    </div>

    <b-card class="erp-panel">
      <div class="erp-toolbar">
        <b-input-group class="erp-search">
          <b-input-group-prepend is-text><feather-icon icon="SearchIcon" /></b-input-group-prepend>
          <b-form-input v-model="filters.search" :placeholder="$t('erp.payments.searchPlaceholder')" @keyup.enter="applyFilters" />
        </b-input-group>
        <b-form-select v-model="filters.payment_method" :options="methodOptions" class="erp-filter" />
        <b-form-input v-model="filters.from" type="date" />
        <b-form-input v-model="filters.to" type="date" />
        <b-button variant="outline-primary" @click="applyFilters">{{ $t('erp.common.apply') }}</b-button>
        <b-button variant="flat-secondary" @click="resetFilters">{{ $t('erp.common.reset') }}</b-button>
      </div>

      <b-table :items="items" :fields="fields" :busy="loading" responsive hover show-empty>
        <template #cell(amount)="data"><strong>{{ currency(data.value) }}</strong></template>
        <template #cell(payment_method)="data">{{ paymentMethodText(data.value) }}</template>
        <template #cell(payment_date)="data">{{ formatDate(data.value) }}</template>
        <template #cell(invoice)="data">
          <b-link v-if="data.item.invoice" :to="{ name: 'erp-invoices' }">{{ data.item.invoice.invoice_number }}</b-link>
          <span v-else>-</span>
        </template>
        <template #cell(customer)="data">{{ data.item.invoice && data.item.invoice.customer ? data.item.invoice.customer.name : '-' }}</template>
        <template #cell(creator)="data">{{ data.item.creator ? data.item.creator.name : '-' }}</template>
        <template #table-busy>
          <div class="text-center py-3"><b-spinner variant="primary" /></div>
        </template>
      </b-table>

      <div class="erp-pagination">
        <span>{{ pageSummary }}</span>
        <b-pagination v-model="pagination.current_page" :total-rows="pagination.total" :per-page="pagination.per_page" @change="changePage" />
      </div>
    </b-card>
  </div>
</template>

<script>
import erp from '@/services/erp'
import { formatDate } from '@/utils/dateFormat'

export default {
  data() {
    return {
      items: [],
      loading: false,
      stats: this.emptyStats(),
      filters: { search: '', payment_method: '', from: '', to: '' },
      pagination: { current_page: 1, per_page: 15, total: 0, from: 0, to: 0 },
    }
  },
  computed: {
    fields() {
      return [
        { key: 'payment_date', label: this.$t('erp.invoices.paymentDate') },
        { key: 'amount', label: this.$t('erp.invoices.paymentAmount') },
        { key: 'payment_method', label: this.$t('erp.payments.method') },
        { key: 'invoice', label: this.$t('erp.payments.invoice') },
        { key: 'customer', label: this.$t('erp.payments.customer') },
        { key: 'reference_number', label: this.$t('erp.payments.reference') },
        { key: 'creator', label: this.$t('erp.payments.recordedBy') },
      ]
    },
    methodOptions() {
      return [{ value: '', text: this.$t('erp.payments.allMethods') }, ...this.paymentMethods]
    },
    paymentMethods() {
      return [
        { value: 'cash', text: this.$t('erp.invoices.cash') },
        { value: 'instapay', text: this.$t('erp.invoices.instapay') },
        { value: 'bank_transfer', text: this.$t('erp.invoices.bankTransfer') },
        { value: 'cheque', text: this.$t('erp.invoices.cheque') },
      ]
    },
    pageSummary() {
      if (!this.pagination.total) return `0 ${this.$t('erp.common.records')}`
      return `${this.pagination.from || 1}-${this.pagination.to || this.items.length} ${this.$t('erp.common.of')} ${this.pagination.total}`
    },
  },
  mounted() {
    this.fetch()
  },
  methods: {
    emptyStats() {
      return { total_count: 0, total_amount: 0, cash_total: 0, instapay_total: 0, bank_transfer_total: 0, cheque_total: 0 }
    },
    async fetch() {
      this.loading = true
      try {
        const params = { ...this.filters, page: this.pagination.current_page, per_page: this.pagination.per_page }
        Object.keys(params).forEach(key => params[key] === '' && delete params[key])
        const { data } = await erp.payments.list(params)
        this.items = data.data || data
        this.stats = { ...this.emptyStats(), ...(data.stats || {}) }
        this.pagination = {
          current_page: data.current_page || 1,
          per_page: data.per_page || 15,
          total: data.total ?? this.items.length,
          from: data.from || 0,
          to: data.to || 0,
        }
      } finally {
        this.loading = false
      }
    },
    applyFilters() {
      this.pagination.current_page = 1
      this.fetch()
    },
    resetFilters() {
      this.filters = { search: '', payment_method: '', from: '', to: '' }
      this.applyFilters()
    },
    changePage(page) {
      this.pagination.current_page = page
      this.fetch()
    },
    paymentMethodText(value) {
      return this.paymentMethods.find(method => method.value === value)?.text || value
    },
    currency(value) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0))
    },
    formatDate,
  },
}
</script>
