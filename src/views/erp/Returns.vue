<template>
  <div class="erp-page">
    <div class="erp-page__heading">
      <div>
        <p class="erp-eyebrow">{{ $t('erp.returns.eyebrow') }}</p>
        <h2>{{ $t('erp.returns.title') }}</h2>
        <p class="text-muted mb-0">{{ $t('erp.returns.subtitle') }}</p>
      </div>
      <b-button v-if="can('erp.invoice-returns.create')" variant="primary" @click="openCreate">
        <feather-icon icon="RotateCcwIcon" class="mr-50" /> {{ $t('erp.returns.create') }}
      </b-button>
    </div>

    <div class="erp-stat-grid">
      <b-card class="erp-stat-card"><span>{{ $t('erp.returns.totalReturns') }}</span><strong>{{ stats.total_count }}</strong></b-card>
      <b-card class="erp-stat-card"><span>{{ $t('erp.returns.totalReturned') }}</span><strong class="text-warning">{{ currency(stats.total_amount) }}</strong></b-card>
    </div>

    <b-card class="erp-panel">
      <div class="erp-toolbar">
        <b-form-input v-model="filters.search" class="erp-search" :placeholder="$t('erp.returns.searchPlaceholder')" @keyup.enter="applyFilters" />
        <b-form-input v-model="filters.from" type="date" />
        <b-form-input v-model="filters.to" type="date" />
        <b-button variant="outline-primary" @click="applyFilters">{{ $t('erp.common.apply') }}</b-button>
      </div>

      <b-table :items="items" :fields="fields" :busy="loading" responsive hover show-empty>
        <template #cell(return_date)="data">{{ formatDate(data.value) }}</template>
        <template #cell(total)="data"><strong>{{ currency(data.value) }}</strong></template>
        <template #cell(created_by)="data">{{ data.item.creator ? data.item.creator.name : '-' }}</template>
        <template #cell(actions)="data">
          <div class="erp-actions">
            <b-button variant="flat-info" class="btn-icon" @click="viewReturn(data.item)"><feather-icon icon="EyeIcon" /></b-button>
            <b-button v-if="can('erp.invoice-returns.delete')" variant="flat-danger" class="btn-icon" @click="remove(data.item)"><feather-icon icon="Trash2Icon" /></b-button>
          </div>
        </template>
      </b-table>
      <div class="erp-pagination">
        <span>{{ pagination.total }} {{ $t('erp.returns.title') }}</span>
        <b-pagination v-model="pagination.current_page" :total-rows="pagination.total" :per-page="pagination.per_page" @change="changePage" />
      </div>
    </b-card>

    <b-modal v-model="formModal" :title="$t('erp.returns.create')" hide-footer size="xl">
      <b-form @submit.prevent="save">
        <b-row>
          <b-col cols="12" md="5">
            <b-form-group :label="$t('erp.invoices.invoice')">
              <b-form-select v-model="form.invoice_id" :options="invoiceOptions" required @change="loadInvoice" />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="3">
            <b-form-group :label="$t('erp.returns.returnDate')"><b-form-input v-model="form.return_date" type="date" required /></b-form-group>
          </b-col>
        </b-row>

        <b-alert v-if="selectedInvoice" show variant="light-info">
          {{ selectedInvoice.invoice_number }} -
          {{ selectedInvoice.customer && selectedInvoice.customer.name }} -
          {{ $t('erp.customers.total') }}: <strong>{{ currency(selectedInvoice.total) }}</strong>
        </b-alert>

        <div v-for="item in form.items" :key="item.invoice_item_id" class="invoice-line">
          <b-row align-v="end">
            <b-col cols="12" md="5">
              <strong>{{ item.product_name }}</strong>
              <div class="text-muted">{{ item.sku }}</div>
            </b-col>
            <b-col cols="6" md="2"><small>{{ $t('erp.returns.soldQuantity') }}</small><div>{{ item.sold_quantity }}</div></b-col>
            <b-col cols="6" md="2"><small>{{ $t('erp.returns.returnableQuantity') }}</small><div>{{ item.returnable_quantity }}</div></b-col>
            <b-col cols="6" md="2">
              <b-form-group :label="$t('erp.common.quantity')">
                <b-form-input v-model.number="item.quantity" type="number" min="0" :max="item.returnable_quantity" />
              </b-form-group>
            </b-col>
            <b-col cols="6" md="1" class="pb-1"><strong>{{ currency(lineTotal(item)) }}</strong></b-col>
          </b-row>
        </div>

        <b-form-group :label="$t('erp.returns.reason')">
          <b-form-textarea v-model="form.reason" rows="3" />
        </b-form-group>
        <div class="invoice-totals ml-auto">
          <div class="invoice-totals__grand"><span>{{ $t('erp.returns.returnTotal') }}</span><strong>{{ currency(returnTotal) }}</strong></div>
        </div>
        <div class="text-right mt-1">
          <b-button variant="flat-secondary" class="mr-1" @click="formModal = false">{{ $t('erp.common.cancel') }}</b-button>
          <b-button type="submit" variant="primary" :disabled="saving || !returnTotal">
            <b-spinner v-if="saving" small class="mr-50" /> {{ $t('erp.returns.save') }}
          </b-button>
        </div>
      </b-form>
    </b-modal>

    <b-modal v-model="detailModal" :title="$t('erp.returns.details')" ok-only size="lg">
      <div v-if="selected">
        <div class="d-flex justify-content-between mb-2">
          <div><h4>{{ selected.return_number }}</h4><span class="text-muted">{{ selected.invoice && selected.invoice.invoice_number }}</span></div>
          <strong>{{ currency(selected.total) }}</strong>
        </div>
        <p class="text-muted">{{ selected.reason }}</p>
        <b-table :items="selected.items || []" :fields="itemFields" small responsive>
          <template #cell(total)="data">{{ currency(data.value) }}</template>
        </b-table>
      </div>
    </b-modal>
  </div>
</template>

<script>
import erp from '@/services/erp'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'
import { formatDate } from '@/utils/dateFormat'

export default {
  data() {
    return {
      items: [],
      invoices: [],
      loading: false,
      saving: false,
      formModal: false,
      detailModal: false,
      selected: null,
      selectedInvoice: null,
      stats: { total_count: 0, total_amount: 0 },
      filters: { search: '', from: '', to: '' },
      pagination: { current_page: 1, per_page: 15, total: 0 },
      form: this.emptyForm(),
    }
  },
  computed: {
    fields() {
      return [
        { key: 'return_number', label: this.$t('erp.returns.returnNumber') },
        { key: 'invoice.invoice_number', label: this.$t('erp.invoices.invoice') },
        { key: 'invoice.customer.name', label: this.$t('erp.customers.customer') },
        { key: 'return_date', label: this.$t('erp.returns.returnDate') },
        { key: 'total', label: this.$t('erp.returns.returnTotal') },
        { key: 'created_by', label: this.$t('erp.payments.recordedBy') },
        { key: 'actions', label: '' },
      ]
    },
    itemFields() {
      return [
        { key: 'product_name', label: this.$t('erp.products.product') },
        { key: 'sku', label: this.$t('erp.dashboard.sku') },
        { key: 'quantity', label: this.$t('erp.common.quantity') },
        { key: 'unit_price', label: this.$t('erp.invoices.unitPrice') },
        { key: 'total', label: this.$t('erp.customers.total') },
      ]
    },
    invoiceOptions() {
      return [{ value: null, text: this.$t('erp.returns.selectInvoice') }, ...this.invoices.map(item => ({ value: item.id, text: `${item.invoice_number} - ${item.customer?.name || ''}` }))]
    },
    returnTotal() {
      return this.form.items.reduce((sum, item) => sum + this.lineTotal(item), 0)
    },
  },
  mounted() {
    Promise.all([this.fetch(), this.fetchInvoices()])
  },
  methods: {
    can(permission) {
      return this.$store.getters['auth/hasPermission'](permission)
    },
    emptyForm() {
      return { invoice_id: null, return_date: new Date().toISOString().slice(0, 10), reason: '', items: [] }
    },
    async fetch() {
      this.loading = true
      try {
        const params = { ...this.filters, page: this.pagination.current_page }
        Object.keys(params).forEach(key => !params[key] && delete params[key])
        const { data } = await erp.invoiceReturns.list(params)
        this.items = data.data || data
        this.stats = { total_count: 0, total_amount: 0, ...(data.stats || {}) }
        this.pagination = { current_page: data.current_page || 1, per_page: data.per_page || 15, total: data.total ?? this.items.length }
      } finally {
        this.loading = false
      }
    },
    async fetchInvoices() {
      const { data } = await erp.invoices.list({ per_page: 100 })
      this.invoices = data.data || data
    },
    applyFilters() {
      this.pagination.current_page = 1
      this.fetch()
    },
    changePage(page) {
      this.pagination.current_page = page
      this.fetch()
    },
    openCreate() {
      this.form = this.emptyForm()
      this.selectedInvoice = null
      this.formModal = true
    },
    async loadInvoice() {
      if (!this.form.invoice_id) return
      const { data } = await erp.invoices.get(this.form.invoice_id)
      this.selectedInvoice = data
      this.form.items = data.items.map(item => {
        const returned = (data.returns || []).flatMap(row => row.items || []).filter(row => row.invoice_item_id === item.id).reduce((sum, row) => sum + Number(row.quantity || 0), 0)
        const returnable = Math.max(Number(item.quantity || 0) - returned, 0)
        return {
          invoice_item_id: item.id,
          product_name: item.product_name,
          sku: item.sku,
          sold_quantity: Number(item.quantity || 0),
          returnable_quantity: returnable,
          unit_price: Number(item.unit_price || 0),
          discount: Number(item.discount || 0),
          tax: Number(item.tax || 0),
          quantity: returnable ? 1 : 0,
        }
      })
    },
    lineTotal(item) {
      const quantity = Math.min(Number(item.quantity || 0), Number(item.returnable_quantity || 0))
      const ratio = quantity / Math.max(Number(item.sold_quantity || 1), 1)
      return Math.max(quantity * Number(item.unit_price || 0) - Number(item.discount || 0) * ratio + Number(item.tax || 0) * ratio, 0)
    },
    async save() {
      this.saving = true
      try {
        const payload = {
          return_date: this.form.return_date,
          reason: this.form.reason,
          items: this.form.items
            .filter(item => Number(item.quantity || 0) > 0)
            .map(item => ({ invoice_item_id: item.invoice_item_id, quantity: Number(item.quantity) })),
        }
        await erp.invoices.return(this.form.invoice_id, payload)
        this.formModal = false
        this.notify(this.$t('erp.returns.saved'), 'success')
        await Promise.all([this.fetch(), this.fetchInvoices()])
      } catch (error) {
        const errors = error.response?.data?.errors
        this.notify(errors ? Object.values(errors).flat().join(' ') : (error.response?.data?.message || this.$t('erp.common.error')), 'danger')
      } finally {
        this.saving = false
      }
    },
    async viewReturn(item) {
      const { data } = await erp.invoiceReturns.get(item.id)
      this.selected = data
      this.detailModal = true
    },
    async remove(item) {
      const answer = await this.$swal({ title: this.$t('erp.returns.deleteTitle'), text: this.$t('erp.returns.deleteText'), icon: 'warning', showCancelButton: true, confirmButtonText: this.$t('erp.common.deleteConfirm') })
      if (!answer.isConfirmed && !answer.value) return
      await erp.invoiceReturns.remove(item.id)
      this.notify(this.$t('erp.returns.deleted'), 'success')
      await Promise.all([this.fetch(), this.fetchInvoices()])
    },
    currency(value) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0))
    },
    formatDate,
    notify(text, variant) {
      this.$toast({ component: ToastificationContent, props: { title: variant === 'success' ? this.$t('erp.common.success') : this.$t('erp.common.error'), text, variant } })
    },
  },
}
</script>

<style scoped>
.invoice-line {
  padding: 0.75rem 1rem 0;
  margin-bottom: 0.65rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}
.invoice-totals {
  width: 100%;
  max-width: 390px;
  padding: 1rem;
  background: #f7f9fa;
  border-radius: 6px;
}
.invoice-totals > div {
  display: flex;
  justify-content: space-between;
  padding: 0.35rem 0;
}
.invoice-totals__grand {
  padding: 0.7rem 0 !important;
  margin: 0.35rem 0;
  border-top: 1px solid #dfe3e6;
  border-bottom: 1px solid #dfe3e6;
  font-size: 1.1rem;
}
</style>
