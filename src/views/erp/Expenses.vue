<template>
  <div class="erp-page">
    <div class="erp-page__heading">
      <div>
        <p class="erp-eyebrow">{{ $t('erp.expenses.eyebrow') }}</p>
        <h2>{{ $t('erp.expenses.title') }}</h2>
        <p class="text-muted mb-0">{{ $t('erp.expenses.subtitle') }}</p>
      </div>
      <b-button v-if="can('erp.expenses.create')" variant="primary" @click="openCreate">
        <feather-icon icon="PlusIcon" class="mr-50" /> {{ $t('erp.expenses.addExpense') }}
      </b-button>
    </div>

    <div class="erp-stat-grid">
      <b-card class="erp-stat-card">
        <span>{{ $t('erp.stats.expenseRecords') }}</span>
        <strong>{{ stats.total_count }}</strong>
      </b-card>
      <b-card class="erp-stat-card">
        <span>{{ $t('erp.stats.totalSpent') }}</span>
        <strong class="text-danger">{{ currency(stats.total_amount) }}</strong>
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
          <b-form-input v-model="filters.search" :placeholder="$t('erp.expenses.searchPlaceholder')" @keyup.enter="applyFilters" />
        </b-input-group>
        <b-form-select v-model="filters.category" :options="categoryFilterOptions" class="erp-filter" />
        <b-form-select v-model="filters.payment_method" :options="methodFilterOptions" class="erp-filter" />
        <b-form-input v-model="filters.from" type="date" />
        <b-form-input v-model="filters.to" type="date" />
        <b-button variant="outline-primary" @click="applyFilters">{{ $t('erp.common.apply') }}</b-button>
        <b-button variant="flat-secondary" @click="resetFilters">{{ $t('erp.common.reset') }}</b-button>
      </div>

      <b-table :items="items" :fields="fields" :busy="loading" responsive hover show-empty>
        <template #cell(amount)="data"><strong class="text-danger">{{ currency(data.value) }}</strong></template>
        <template #cell(payment_method)="data">{{ paymentMethodText(data.value) }}</template>
        <template #cell(expense_date)="data">{{ formatDate(data.value) }}</template>
        <template #cell(actions)="data">
          <div class="erp-actions">
            <b-button v-if="can('erp.expenses.edit')" variant="flat-warning" class="btn-icon" @click="openEdit(data.item)">
              <feather-icon icon="Edit2Icon" />
            </b-button>
            <b-button v-if="can('erp.expenses.delete')" variant="flat-danger" class="btn-icon" @click="remove(data.item)">
              <feather-icon icon="Trash2Icon" />
            </b-button>
          </div>
        </template>
        <template #table-busy>
          <div class="text-center py-3"><b-spinner variant="primary" /></div>
        </template>
      </b-table>

      <div class="erp-pagination">
        <span>{{ pageSummary }}</span>
        <b-pagination v-model="pagination.current_page" :total-rows="pagination.total" :per-page="pagination.per_page" @change="changePage" />
      </div>
    </b-card>

    <b-modal v-model="modal" :title="editing ? $t('erp.expenses.editExpense') : $t('erp.expenses.addExpense')" hide-footer size="lg">
      <b-form @submit.prevent="save">
        <b-row>
          <b-col cols="12" md="7">
            <b-form-group :label="$t('erp.expenses.expenseTitle')">
              <b-form-input v-model="form.title" required />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="5">
            <b-form-group :label="$t('erp.expenses.category')">
              <b-form-input v-model="form.category" list="expense-categories" />
              <datalist id="expense-categories">
                <option v-for="category in categories" :key="category" :value="category" />
              </datalist>
            </b-form-group>
          </b-col>
          <b-col cols="12" md="4">
            <b-form-group :label="$t('erp.expenses.amount')">
              <b-form-input v-model.number="form.amount" type="number" min="0.01" step="0.01" required />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="4">
            <b-form-group :label="$t('erp.invoices.paymentMethod')">
              <b-form-select v-model="form.payment_method" :options="paymentMethods" required />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="4">
            <b-form-group :label="$t('erp.expenses.expenseDate')">
              <b-form-input v-model="form.expense_date" type="date" required />
            </b-form-group>
          </b-col>
          <b-col cols="12">
            <b-form-group :label="$t('erp.expenses.referenceNumber')">
              <b-form-input v-model="form.reference_number" />
            </b-form-group>
          </b-col>
          <b-col cols="12">
            <b-form-group :label="$t('erp.common.notes')">
              <b-form-textarea v-model="form.notes" rows="3" />
            </b-form-group>
          </b-col>
        </b-row>
        <div class="text-right">
          <b-button variant="flat-secondary" class="mr-1" @click="modal = false">{{ $t('erp.common.cancel') }}</b-button>
          <b-button type="submit" variant="primary" :disabled="saving">
            <b-spinner v-if="saving" small class="mr-50" /> {{ $t('erp.common.save') }}
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

export default {
  data() {
    return {
      items: [],
      loading: false,
      saving: false,
      modal: false,
      editing: false,
      editId: null,
      stats: this.emptyStats(),
      filters: { search: '', category: '', payment_method: '', from: '', to: '' },
      pagination: { current_page: 1, per_page: 15, total: 0, from: 0, to: 0 },
      form: this.emptyForm(),
    }
  },
  computed: {
    fields() {
      return [
        { key: 'expense_date', label: this.$t('erp.expenses.expenseDate') },
        { key: 'title', label: this.$t('erp.expenses.expenseTitle') },
        { key: 'category', label: this.$t('erp.expenses.category') },
        { key: 'amount', label: this.$t('erp.expenses.amount') },
        { key: 'payment_method', label: this.$t('erp.payments.method') },
        { key: 'reference_number', label: this.$t('erp.expenses.referenceNumber') },
        { key: 'creator.name', label: this.$t('erp.payments.recordedBy') },
        { key: 'actions', label: '' },
      ]
    },
    categories() {
      return [...new Set(this.items.map(item => item.category).filter(Boolean))].sort()
    },
    categoryFilterOptions() {
      return [{ value: '', text: this.$t('erp.expenses.allCategories') }, ...this.categories.map(category => ({ value: category, text: category }))]
    },
    methodFilterOptions() {
      return [{ value: '', text: this.$t('erp.expenses.allMethods') }, ...this.paymentMethods]
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
    can(permission) {
      return this.$store.getters['auth/hasPermission'](permission)
    },
    emptyForm() {
      return { title: '', category: '', amount: 0, payment_method: 'cash', expense_date: new Date().toISOString().slice(0, 10), reference_number: '', notes: '' }
    },
    emptyStats() {
      return { total_count: 0, total_amount: 0, cash_total: 0, instapay_total: 0, bank_transfer_total: 0, cheque_total: 0 }
    },
    async fetch() {
      this.loading = true
      try {
        const params = { ...this.filters, page: this.pagination.current_page, per_page: this.pagination.per_page }
        Object.keys(params).forEach(key => params[key] === '' && delete params[key])
        const { data } = await erp.expenses.list(params)
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
      this.filters = { search: '', category: '', payment_method: '', from: '', to: '' }
      this.applyFilters()
    },
    changePage(page) {
      this.pagination.current_page = page
      this.fetch()
    },
    openCreate() {
      this.editing = false
      this.editId = null
      this.form = this.emptyForm()
      this.modal = true
    },
    openEdit(item) {
      this.editing = true
      this.editId = item.id
      this.form = {
        title: item.title || '',
        category: item.category || '',
        amount: Number(item.amount || 0),
        payment_method: item.payment_method || 'cash',
        expense_date: item.expense_date || new Date().toISOString().slice(0, 10),
        reference_number: item.reference_number || '',
        notes: item.notes || '',
      }
      this.modal = true
    },
    async save() {
      this.saving = true
      try {
        if (this.editing) await erp.expenses.update(this.editId, this.form)
        else await erp.expenses.create(this.form)
        this.modal = false
        this.notify(this.$t('erp.expenses.saved'), 'success')
        await this.fetch()
      } catch (error) {
        const errors = error.response?.data?.errors
        this.notify(errors ? Object.values(errors).flat().join(' ') : (error.response?.data?.message || this.$t('erp.common.error')), 'danger')
      } finally {
        this.saving = false
      }
    },
    async remove(item) {
      const answer = await this.$swal({
        title: this.$t('erp.expenses.deleteTitle'),
        text: this.$t('erp.common.deleteWarning'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: this.$t('erp.common.deleteConfirm'),
      })
      if (!answer.isConfirmed && !answer.value) return
      await erp.expenses.remove(item.id)
      this.notify(this.$t('erp.expenses.deleted'), 'success')
      await this.fetch()
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
