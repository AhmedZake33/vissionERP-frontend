<template>
  <div class="erp-page">
    <div class="erp-page__heading">
      <div>
        <p class="erp-eyebrow">{{ $t('erp.invoices.eyebrow') }}</p>
        <h2>{{ $t('erp.invoices.title') }}</h2>
        <p class="text-muted mb-0">{{ $t('erp.invoices.subtitle') }}</p>
      </div>
      <b-button v-if="can('erp.invoices.create')" variant="primary" @click="openCreate">
        <feather-icon icon="PlusIcon" class="mr-50" /> {{ $t('erp.invoices.create') }}
      </b-button>
    </div>

    <div class="erp-stat-grid">
      <b-card class="erp-stat-card">
        <span>{{ $t('erp.stats.totalInvoices') }}</span>
        <strong>{{ stats.total_count }}</strong>
      </b-card>
      <b-card class="erp-stat-card">
        <span>{{ $t('erp.stats.totalAmount') }}</span>
        <strong>{{ currency(stats.total_amount) }}</strong>
      </b-card>
      <b-card class="erp-stat-card">
        <span>{{ $t('erp.invoices.paid') }}</span>
        <strong class="text-success">{{ currency(stats.paid_amount) }}</strong>
      </b-card>
      <b-card class="erp-stat-card">
        <span>{{ $t('erp.invoices.remaining') }}</span>
        <strong class="text-danger">{{ currency(stats.remaining_amount) }}</strong>
      </b-card>
      <b-card class="erp-stat-card">
        <span>{{ $t('erp.common.paid') }}</span>
        <strong>{{ stats.paid_count }}</strong>
      </b-card>
      <b-card class="erp-stat-card">
        <span>{{ $t('erp.common.unpaid') }}</span>
        <strong>{{ stats.unpaid_count }}</strong>
      </b-card>
    </div>

    <b-card class="erp-panel">
      <div class="erp-toolbar">
        <b-form-input v-model="filters.search" class="erp-search" :placeholder="$t('erp.invoices.invoiceNumberPlaceholder')" @keyup.enter="applyFilters" />
        <b-form-select v-model="filters.status" :options="statusFilterOptions" class="erp-filter" />
        <b-form-input v-model="filters.from" type="date" />
        <b-form-input v-model="filters.to" type="date" />
        <b-button variant="outline-primary" @click="applyFilters">{{ $t('erp.common.apply') }}</b-button>
      </div>

      <b-table :items="items" :fields="fields" :busy="loading" responsive hover show-empty>
        <template #cell(total)="data"><strong>{{ currency(data.value) }}</strong></template>
        <template #cell(paid_amount)="data"><span class="text-success">{{ currency(data.value) }}</span></template>
        <template #cell(remaining_amount)="data"><span :class="Number(data.value) > 0 ? 'text-danger' : 'text-success'">{{ currency(data.value) }}</span></template>
        <template #cell(status)="data"><b-badge :variant="statusVariant(data.value)">{{ statusText(data.value) }}</b-badge></template>
        <template #cell(actions)="data">
          <div class="erp-actions">
            <b-button variant="flat-info" class="btn-icon" @click="viewInvoice(data.item)"><feather-icon icon="EyeIcon" /></b-button>
            <b-button v-if="canPay(data.item)" variant="flat-success" class="btn-icon" @click="openPayment(data.item)"><feather-icon icon="DollarSignIcon" /></b-button>
            <b-button v-if="can('erp.invoices.edit')" variant="flat-warning" class="btn-icon" @click="openEdit(data.item)"><feather-icon icon="Edit2Icon" /></b-button>
            <b-button variant="flat-primary" class="btn-icon" @click="printInvoice(data.item)"><feather-icon icon="PrinterIcon" /></b-button>
            <b-button v-if="can('erp.invoices.delete')" variant="flat-danger" class="btn-icon" @click="remove(data.item)"><feather-icon icon="Trash2Icon" /></b-button>
          </div>
        </template>
      </b-table>
      <div class="erp-pagination">
        <span>{{ pagination.total }} {{ $t('erp.invoices.title') }}</span>
        <b-pagination v-model="pagination.current_page" :total-rows="pagination.total" :per-page="pagination.per_page" @change="changePage" />
      </div>
    </b-card>

    <b-modal v-model="formModal" :title="editing ? $t('erp.invoices.edit') : $t('erp.invoices.create')" hide-footer size="xl">
      <b-form @submit.prevent="save">
        <b-row>
          <b-col cols="12" md="4">
            <b-form-group :label="$t('erp.customers.customer')">
              <b-form-select v-model="form.customer_id" :options="customerOptions" required />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="3">
            <b-form-group :label="$t('erp.invoices.invoiceDate')"><b-form-input v-model="form.invoice_date" type="date" required /></b-form-group>
          </b-col>
          <b-col cols="12" md="3">
            <b-form-group :label="$t('erp.invoices.dueDate')"><b-form-input v-model="form.due_date" type="date" /></b-form-group>
          </b-col>
        </b-row>

        <div class="erp-section-title mt-1">
          <h4>{{ $t('erp.invoices.items') }}</h4>
          <b-button variant="outline-primary" size="sm" @click="addItem"><feather-icon icon="PlusIcon" class="mr-50" /> {{ $t('erp.invoices.addLine') }}</b-button>
        </div>
        <div v-for="(item, index) in form.items" :key="index" class="invoice-line">
          <b-row align-v="end">
            <b-col cols="12" md="4">
              <b-form-group :label="$t('erp.products.product')">
                <b-form-select v-model="item.product_id" :options="productOptions" required @change="selectProduct(item)" />
              </b-form-group>
            </b-col>
            <b-col cols="6" md="2"><b-form-group :label="$t('erp.common.quantity')"><b-form-input v-model.number="item.quantity" type="number" min="1" required /></b-form-group></b-col>
            <b-col cols="6" md="2"><b-form-group :label="$t('erp.invoices.unitPrice')"><b-form-input v-model.number="item.unit_price" type="number" min="0" step="0.01" /></b-form-group></b-col>
            <b-col cols="6" md="1"><b-form-group :label="$t('erp.invoices.discount')"><b-form-input v-model.number="item.discount" type="number" min="0" step="0.01" /></b-form-group></b-col>
            <b-col cols="6" md="1"><b-form-group :label="$t('erp.invoices.tax')"><b-form-input v-model.number="item.tax" type="number" min="0" step="0.01" /></b-form-group></b-col>
            <b-col cols="9" md="1" class="pb-1"><strong>{{ currency(lineTotal(item)) }}</strong></b-col>
            <b-col cols="3" md="1" class="pb-1 text-right">
              <b-button variant="flat-danger" class="btn-icon" :disabled="form.items.length === 1" @click="removeItem(index)"><feather-icon icon="XIcon" /></b-button>
            </b-col>
          </b-row>
        </div>

        <b-row class="mt-1">
          <b-col cols="12" md="7"><b-form-group :label="$t('erp.common.notes')"><b-form-textarea v-model="form.notes" rows="4" /></b-form-group></b-col>
          <b-col cols="12" md="5">
            <div class="invoice-totals">
              <div><span>{{ $t('erp.invoices.subtotal') }}</span><strong>{{ currency(totals.subtotal) }}</strong></div>
              <div><span>{{ $t('erp.invoices.discount') }}</span><strong>{{ currency(totals.discount) }}</strong></div>
              <div><span>{{ $t('erp.invoices.tax') }}</span><strong>{{ currency(totals.tax) }}</strong></div>
              <div class="invoice-totals__grand"><span>{{ $t('erp.customers.total') }}</span><strong>{{ currency(totals.total) }}</strong></div>
              <div><span>{{ $t('erp.invoices.remaining') }}</span><strong class="text-danger">{{ currency(totals.total) }}</strong></div>
            </div>
          </b-col>
        </b-row>
        <div class="text-right mt-1">
          <b-button variant="flat-secondary" class="mr-1" @click="formModal = false">{{ $t('erp.common.cancel') }}</b-button>
          <b-button type="submit" variant="primary" :disabled="saving"><b-spinner v-if="saving" small class="mr-50" /> {{ $t('erp.invoices.saveInvoice') }}</b-button>
        </div>
      </b-form>
    </b-modal>

    <b-modal v-model="detailModal" :title="$t('erp.invoices.details')" ok-only size="lg">
      <div v-if="selected">
        <div class="d-flex justify-content-between mb-2">
          <div><h4>{{ selected.invoice_number }}</h4><span class="text-muted">{{ selected.customer && selected.customer.name }}</span></div>
          <b-badge :variant="statusVariant(selected.status)">{{ statusText(selected.status) }}</b-badge>
        </div>
        <b-table :items="selected.items || []" :fields="itemFields" small responsive>
          <template #cell(total)="data">{{ currency(data.value) }}</template>
        </b-table>
        <div class="invoice-totals ml-auto">
          <div><span>{{ $t('erp.customers.total') }}</span><strong>{{ currency(selected.total) }}</strong></div>
          <div><span>{{ $t('erp.invoices.paid') }}</span><strong>{{ currency(selected.paid_amount) }}</strong></div>
          <div><span>{{ $t('erp.invoices.remaining') }}</span><strong>{{ currency(selected.remaining_amount) }}</strong></div>
        </div>
        <div class="erp-section-title mt-2">
          <h4>{{ $t('erp.invoices.paymentTransactions') }}</h4>
          <b-button v-if="canPay(selected)" size="sm" variant="outline-success" @click="openPayment(selected)">
            <feather-icon icon="DollarSignIcon" class="mr-50" /> {{ $t('erp.invoices.pay') }}
          </b-button>
        </div>
        <b-table :items="selected.payments || []" :fields="paymentFields" small responsive show-empty>
          <template #empty>
            <span class="text-muted">{{ $t('erp.invoices.noPayments') }}</span>
          </template>
          <template #cell(amount)="data">{{ currency(data.value) }}</template>
          <template #cell(payment_method)="data">{{ paymentMethodText(data.value) }}</template>
          <template #cell(creator)="data">
            {{ data.item.creator ? data.item.creator.name : '-' }}
          </template>
          <template #cell(actions)="data">
            <b-button v-if="can('erp.invoice-payments.delete')" variant="flat-danger" class="btn-icon" @click="deletePayment(data.item)">
              <feather-icon icon="Trash2Icon" />
            </b-button>
          </template>
        </b-table>
      </div>
    </b-modal>

    <b-modal v-model="paymentModal" :title="$t('erp.invoices.payInvoice')" hide-footer>
      <b-form @submit.prevent="savePayment">
        <b-alert v-if="paymentInvoice" show variant="light-info">
          {{ paymentInvoice.invoice_number }} -
          {{ $t('erp.invoices.remaining') }}:
          <strong>{{ currency(paymentInvoice.remaining_amount) }}</strong>
        </b-alert>
        <b-form-group :label="$t('erp.invoices.paymentAmount')">
          <b-form-input v-model.number="paymentForm.amount" type="number" min="0.01" step="0.01" required />
        </b-form-group>
        <b-form-group :label="$t('erp.invoices.paymentMethod')">
          <b-form-select v-model="paymentForm.payment_method" :options="paymentMethods" required />
        </b-form-group>
        <b-form-group :label="$t('erp.invoices.paymentDate')">
          <b-form-input v-model="paymentForm.payment_date" type="date" required />
        </b-form-group>
        <b-form-group :label="$t('erp.invoices.referenceNumber')">
          <b-form-input v-model="paymentForm.reference_number" />
        </b-form-group>
        <b-form-group :label="$t('erp.common.notes')">
          <b-form-textarea v-model="paymentForm.notes" rows="3" />
        </b-form-group>
        <div class="text-right">
          <b-button variant="flat-secondary" class="mr-1" @click="paymentModal = false">{{ $t('erp.common.cancel') }}</b-button>
          <b-button type="submit" variant="success" :disabled="paying">
            <b-spinner v-if="paying" small class="mr-50" /> {{ $t('erp.invoices.recordPayment') }}
          </b-button>
        </div>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import erp from '@/services/erp'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'
import { formatDate } from '@/utils/dateFormat'

const emptyItem = () => ({ product_id: null, quantity: 1, unit_price: 0, discount: 0, tax: 0 })

export default {
  data() {
    return {
      items: [],
      customers: [],
      products: [],
      loading: false,
      saving: false,
      editing: false,
      editId: null,
      formModal: false,
      detailModal: false,
      paymentModal: false,
      selected: null,
      paymentInvoice: null,
      paying: false,
      stats: this.emptyStats(),
      filters: { search: '', status: '', from: '', to: '' },
      pagination: { current_page: 1, per_page: 15, total: 0 },
      form: this.emptyForm(),
      paymentForm: this.emptyPaymentForm(),
    }
  },
  computed: {
    fields() {
      return [
        { key: 'invoice_number', label: this.$t('erp.invoices.invoice') },
        { key: 'customer.name', label: this.$t('erp.customers.customer') },
        { key: 'invoice_date', label: this.$t('erp.common.date'), formatter: value => this.formatDate(value) },
        { key: 'total', label: this.$t('erp.customers.total') },
        { key: 'paid_amount', label: this.$t('erp.invoices.paid') },
        { key: 'remaining_amount', label: this.$t('erp.invoices.remaining') },
        { key: 'status', label: this.$t('erp.common.status') },
        { key: 'actions', label: '' },
      ]
    },
    itemFields() {
      return [
        { key: 'product_name', label: this.$t('erp.products.product') },
        { key: 'sku', label: this.$t('erp.dashboard.sku') },
        { key: 'quantity', label: this.$t('erp.common.quantity') },
        { key: 'unit_price', label: this.$t('erp.products.price') },
        { key: 'total', label: this.$t('erp.customers.total') },
      ]
    },
    paymentFields() {
      return [
        { key: 'payment_date', label: this.$t('erp.invoices.paymentDate'), formatter: value => this.formatDate(value) },
        { key: 'amount', label: this.$t('erp.invoices.paymentAmount') },
        { key: 'payment_method', label: this.$t('erp.invoices.paymentMethod') },
        { key: 'reference_number', label: this.$t('erp.invoices.referenceNumber') },
        { key: 'creator', label: this.$t('erp.payments.recordedBy') },
        { key: 'actions', label: '' },
      ]
    },
    paymentMethods() {
      return [
        { value: 'cash', text: this.$t('erp.invoices.cash') },
        { value: 'instapay', text: this.$t('erp.invoices.instapay') },
        { value: 'bank_transfer', text: this.$t('erp.invoices.bankTransfer') },
        { value: 'cheque', text: this.$t('erp.invoices.cheque') },
      ]
    },
    statuses() {
      return [
        { value: 'paid', text: this.$t('erp.common.paid') },
        { value: 'unpaid', text: this.$t('erp.common.unpaid') },
        { value: 'partially_paid', text: this.$t('erp.common.partiallyPaid') },
      ]
    },
    statusFilterOptions() {
      return [{ value: '', text: this.$t('erp.common.allStatuses') }, ...this.statuses]
    },
    customerOptions() {
      return [{ value: null, text: this.$t('erp.common.selectCustomer') }, ...this.customers.map(item => ({ value: item.id, text: `${item.name} (${this.currency(item.balance)})` }))]
    },
    productOptions() {
      return [{ value: null, text: this.$t('erp.common.selectProduct') }, ...this.products.map(item => ({ value: item.id, text: `${item.name} - ${item.sku} (${item.stock_quantity} ${this.$t('erp.invoices.available')})` }))]
    },
    totals() {
      return this.form.items.reduce((totals, item) => {
        totals.subtotal += Number(item.quantity || 0) * Number(item.unit_price || 0)
        totals.discount += Number(item.discount || 0)
        totals.tax += Number(item.tax || 0)
        totals.total = totals.subtotal - totals.discount + totals.tax
        return totals
      }, { subtotal: 0, discount: 0, tax: 0, total: 0 })
    },
  },
  mounted() {
    Promise.all([this.fetch(), this.fetchOptions()])
  },
  methods: {
    can(permission) {
      return this.$store.getters['auth/hasPermission'](permission)
    },
    emptyForm() {
      return { customer_id: null, invoice_date: new Date().toISOString().slice(0, 10), due_date: '', notes: '', items: [emptyItem()] }
    },
    emptyStats() {
      return { total_count: 0, total_amount: 0, paid_amount: 0, remaining_amount: 0, paid_count: 0, unpaid_count: 0, partially_paid_count: 0 }
    },
    emptyPaymentForm() {
      return { amount: 0, payment_method: 'cash', payment_date: new Date().toISOString().slice(0, 10), reference_number: '', notes: '' }
    },
    canPay(invoice) {
      return this.can('erp.invoice-payments.create') && Number(invoice?.remaining_amount || 0) > 0
    },
    async fetch() {
      this.loading = true
      try {
        const params = { ...this.filters, page: this.pagination.current_page }
        Object.keys(params).forEach(key => !params[key] && delete params[key])
        const { data } = await erp.invoices.list(params)
        this.items = data.data || data
        this.stats = { ...this.emptyStats(), ...(data.stats || {}) }
        this.pagination = { current_page: data.current_page || 1, per_page: data.per_page || 15, total: data.total ?? this.items.length }
      } finally {
        this.loading = false
      }
    },
    async fetchOptions() {
      const [customers, products] = await Promise.all([
        erp.customers.list({ per_page: 100, status: 'active' }),
        erp.products.list({ per_page: 100, status: 'active' }),
      ])
      this.customers = customers.data.data || customers.data
      this.products = products.data.data || products.data
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
      this.editing = false
      this.editId = null
      this.form = this.emptyForm()
      this.formModal = true
    },
    async openEdit(item) {
      const { data } = await erp.invoices.get(item.id)
      this.editing = true
      this.editId = item.id
      this.form = {
        customer_id: data.customer_id,
        invoice_number: data.invoice_number,
        invoice_date: data.invoice_date,
        due_date: data.due_date || '',
        notes: data.notes || '',
        items: data.items.map(row => ({
          product_id: row.product_id,
          quantity: row.quantity,
          unit_price: Number(row.unit_price),
          discount: Number(row.discount),
          tax: Number(row.tax),
        })),
      }
      this.formModal = true
    },
    addItem() {
      this.form.items.push(emptyItem())
    },
    removeItem(index) {
      this.form.items.splice(index, 1)
    },
    selectProduct(item) {
      const product = this.products.find(productItem => productItem.id === item.product_id)
      if (product) item.unit_price = Number(product.price)
    },
    lineTotal(item) {
      return Math.max(Number(item.quantity || 0) * Number(item.unit_price || 0) - Number(item.discount || 0) + Number(item.tax || 0), 0)
    },
    async save() {
      this.saving = true
      try {
        if (this.editing) await erp.invoices.update(this.editId, this.form)
        else await erp.invoices.create(this.form)
        this.formModal = false
        this.notify(this.$t('erp.invoices.saved'), 'success')
        await Promise.all([this.fetch(), this.fetchOptions()])
      } catch (error) {
        const errors = error.response?.data?.errors
        this.notify(errors ? Object.values(errors).flat().join(' ') : (error.response?.data?.message || this.$t('erp.invoices.saveError')), 'danger')
      } finally {
        this.saving = false
      }
    },
    async viewInvoice(item) {
      const { data } = await erp.invoices.get(item.id)
      this.selected = data
      this.detailModal = true
    },
    openPayment(item) {
      this.paymentInvoice = item
      this.paymentForm = this.emptyPaymentForm()
      this.paymentForm.amount = Number(item.remaining_amount || 0)
      this.paymentModal = true
    },
    async savePayment() {
      if (!this.paymentInvoice) return
      this.paying = true
      try {
        await erp.invoices.pay(this.paymentInvoice.id, this.paymentForm)
        this.paymentModal = false
        this.notify(this.$t('erp.invoices.paymentSaved'), 'success')
        await this.fetch()
        if (this.selected && this.selected.id === this.paymentInvoice.id) {
          const { data } = await erp.invoices.get(this.paymentInvoice.id)
          this.selected = data
        }
      } catch (error) {
        const errors = error.response?.data?.errors
        this.notify(errors ? Object.values(errors).flat().join(' ') : (error.response?.data?.message || this.$t('erp.common.error')), 'danger')
      } finally {
        this.paying = false
      }
    },
    async deletePayment(payment) {
      if (!this.selected) return
      const answer = await this.$swal({
        title: this.$t('erp.invoices.deletePaymentTitle'),
        text: this.$t('erp.invoices.deletePaymentText'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: this.$t('erp.common.deleteConfirm'),
      })
      if (!answer.isConfirmed && !answer.value) return
      await erp.invoices.deletePayment(this.selected.id, payment.id)
      this.notify(this.$t('erp.invoices.paymentDeleted'), 'success')
      await this.fetch()
      const { data } = await erp.invoices.get(this.selected.id)
      this.selected = data
    },
    async remove(item) {
      const answer = await this.$swal({ title: this.$t('erp.invoices.deleteTitle'), text: this.$t('erp.invoices.deleteText'), icon: 'warning', showCancelButton: true, confirmButtonText: this.$t('erp.common.deleteConfirm') })
      if (!answer.isConfirmed && !answer.value) return
      await erp.invoices.remove(item.id)
      this.notify(this.$t('erp.invoices.deleted'), 'success')
      await this.fetch()
    },
    async printInvoice(item) {
      const { data } = await erp.invoices.print(item.id)
      const invoice = data.invoice
      const popup = window.open('', '_blank', 'width=900,height=700')
      const labels = {
        invoice: this.$t('erp.invoices.invoice'),
        customer: this.$t('erp.customers.customer'),
        date: this.$t('erp.common.date'),
        due: this.$t('erp.invoices.dueDate'),
        product: this.$t('erp.products.product'),
        quantity: this.$t('erp.common.quantity'),
        price: this.$t('erp.products.price'),
        discount: this.$t('erp.invoices.discount'),
        tax: this.$t('erp.invoices.tax'),
        subtotal: this.$t('erp.invoices.subtotal'),
        total: this.$t('erp.customers.total'),
        paid: this.$t('erp.invoices.paid'),
        remaining: this.$t('erp.invoices.remaining'),
      }
      popup.document.write(`
        <html><head><title>${invoice.invoice_number}</title><style>
        body{font-family:Arial,sans-serif;color:#17202a;padding:40px}h1{margin:0}.meta{display:flex;justify-content:space-between;margin:30px 0}
        table{width:100%;border-collapse:collapse}th,td{padding:10px;border-bottom:1px solid #ddd;text-align:left}.totals{margin-left:auto;width:320px;margin-top:25px}.totals div{display:flex;justify-content:space-between;padding:6px 0}
        </style></head><body>
        <h1>${data.company.name}</h1><p>${labels.invoice} ${invoice.invoice_number}</p>
        <div class="meta"><div><strong>${labels.customer}</strong><br>${invoice.customer.name}<br>${invoice.customer.email || ''}</div><div><strong>${labels.date}</strong><br>${this.formatDate(invoice.invoice_date)}<br><strong>${labels.due}</strong><br>${this.formatDate(invoice.due_date)}</div></div>
        <table><thead><tr><th>${labels.product}</th><th>${labels.quantity}</th><th>${labels.price}</th><th>${labels.discount}</th><th>${labels.tax}</th><th>${labels.total}</th></tr></thead><tbody>
        ${invoice.items.map(row => `<tr><td>${row.product_name}</td><td>${row.quantity}</td><td>${this.currency(row.unit_price)}</td><td>${this.currency(row.discount)}</td><td>${this.currency(row.tax)}</td><td>${this.currency(row.total)}</td></tr>`).join('')}
        </tbody></table>
        <div class="totals"><div><span>${labels.subtotal}</span><strong>${this.currency(invoice.subtotal)}</strong></div><div><span>${labels.total}</span><strong>${this.currency(invoice.total)}</strong></div><div><span>${labels.paid}</span><strong>${this.currency(invoice.paid_amount)}</strong></div><div><span>${labels.remaining}</span><strong>${this.currency(invoice.remaining_amount)}</strong></div></div>
        </body></html>`)
      popup.document.close()
      popup.focus()
      popup.print()
    },
    statusVariant(status) {
      return { paid: 'light-success', unpaid: 'light-danger', partially_paid: 'light-warning' }[status] || 'light-secondary'
    },
    humanize(value) {
      return String(value || '').replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase())
    },
    statusText(value) {
      const key = String(value || '').replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      const translationKey = `erp.common.${key}`
      const translated = this.$t(translationKey)
      return translated === translationKey ? this.humanize(value) : translated
    },
    paymentMethodText(value) {
      return this.paymentMethods.find(method => method.value === value)?.text || value
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
  margin-left: auto;
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
