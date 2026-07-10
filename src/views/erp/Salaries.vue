<template>
  <div class="erp-page">
    <div class="erp-page__heading">
      <div><p class="erp-eyebrow">{{ $t('erp.salaries.eyebrow') }}</p><h2>{{ $t('erp.salaries.title') }}</h2><p class="text-muted mb-0">{{ $t('erp.salaries.subtitle') }}</p></div>
      <b-button v-if="can('erp.salaries.create')" variant="primary" @click="openCreate"><feather-icon icon="PlusIcon" class="mr-50" /> {{ $t('erp.salaries.newRecord') }}</b-button>
    </div>
    <div class="erp-stat-grid">
      <b-card class="erp-stat-card">
        <span>{{ $t('erp.stats.salaryRecords') }}</span>
        <strong>{{ stats.total_count }}</strong>
      </b-card>
      <b-card class="erp-stat-card">
        <span>{{ $t('erp.salaries.netSalary') }}</span>
        <strong>{{ currency(stats.total_net_salary) }}</strong>
      </b-card>
      <b-card class="erp-stat-card">
        <span>{{ $t('erp.stats.paidSalaries') }}</span>
        <strong class="text-success">{{ currency(stats.paid_total) }}</strong>
      </b-card>
      <b-card class="erp-stat-card">
        <span>{{ $t('erp.stats.unpaidSalaries') }}</span>
        <strong class="text-danger">{{ currency(stats.unpaid_total) }}</strong>
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
        <b-form-select v-model="filters.employee_id" :options="employeeFilterOptions" class="erp-filter" />
        <b-form-select v-model="filters.payment_status" :options="paymentFilterOptions" class="erp-filter" />
        <b-form-input v-model="filters.month" type="date" />
        <b-button variant="outline-primary" @click="applyFilters">{{ $t('erp.common.apply') }}</b-button>
      </div>
      <b-table :items="items" :fields="fields" :busy="loading" responsive hover show-empty>
        <template #cell(net_salary)="data"><strong>{{ currency(data.value) }}</strong></template>
        <template #cell(payment_status)="data"><b-badge :variant="data.value === 'paid' ? 'light-success' : 'light-danger'">{{ statusText(data.value) }}</b-badge></template>
        <template #cell(actions)="data">
          <div class="erp-actions">
            <b-button v-if="can('erp.salaries.edit')" variant="flat-warning" class="btn-icon" @click="openEdit(data.item)"><feather-icon icon="Edit2Icon" /></b-button>
            <b-button v-if="can('erp.salaries.delete')" variant="flat-danger" class="btn-icon" @click="remove(data.item)"><feather-icon icon="Trash2Icon" /></b-button>
          </div>
        </template>
      </b-table>
      <div class="erp-pagination"><span>{{ pagination.total }} {{ $t('erp.salaries.records') }}</span><b-pagination v-model="pagination.current_page" :total-rows="pagination.total" :per-page="pagination.per_page" @change="changePage" /></div>
    </b-card>

    <b-modal v-model="modal" :title="editing ? $t('erp.salaries.editRecord') : $t('erp.salaries.createRecord')" hide-footer size="lg">
      <b-form @submit.prevent="save">
        <b-row>
          <b-col cols="12" md="6"><b-form-group :label="$t('erp.employees.employee')"><b-form-select v-model="form.employee_id" :options="employeeOptions" required @change="selectEmployee" /></b-form-group></b-col>
          <b-col cols="12" md="6"><b-form-group :label="$t('erp.salaries.salaryMonth')"><b-form-input v-model="form.salary_month" type="date" required @change="fetchAdjustmentSummary" /></b-form-group></b-col>
          <b-col cols="12" md="4"><b-form-group :label="$t('erp.salaries.basicSalary')"><b-form-input v-model.number="form.basic_salary" type="number" min="0" step="0.01" required /></b-form-group></b-col>
          <b-col cols="12" md="4"><b-form-group :label="$t('erp.salaries.bonuses')"><b-form-input v-model.number="form.bonuses" type="number" min="0" step="0.01" /></b-form-group></b-col>
          <b-col cols="12" md="4"><b-form-group :label="$t('erp.salaries.deductions')"><b-form-input v-model.number="form.deductions" type="number" min="0" step="0.01" /></b-form-group></b-col>
          <b-col cols="12">
            <b-alert show variant="light-info">
              <b-form-checkbox v-model="form.apply_adjustments" :disabled="editing" switch class="mb-50" @change="fetchAdjustmentSummary">
                {{ $t('erp.salaries.applyAdjustments') }}
              </b-form-checkbox>
              <span>{{ $t('erp.salaries.adjustmentSummary') }} <strong class="text-success">{{ currency(adjustmentSummary.bonuses) }}</strong> / <strong class="text-danger">{{ currency(adjustmentSummary.deductions) }}</strong></span>
            </b-alert>
          </b-col>
          <b-col cols="12" md="6"><b-form-group :label="$t('erp.salaries.paymentStatus')"><b-form-select v-model="form.payment_status" :options="paymentStatuses" /></b-form-group></b-col>
          <b-col cols="12" md="6"><b-form-group :label="$t('erp.salaries.paymentDate')"><b-form-input v-model="form.payment_date" type="date" /></b-form-group></b-col>
          <b-col cols="12"><b-alert show variant="light-success">{{ $t('erp.salaries.calculatedNet') }} <strong>{{ currency(netSalary) }}</strong></b-alert></b-col>
          <b-col cols="12"><b-form-group :label="$t('erp.common.notes')"><b-form-textarea v-model="form.notes" rows="3" /></b-form-group></b-col>
        </b-row>
        <div class="text-right"><b-button variant="flat-secondary" class="mr-1" @click="modal = false">{{ $t('erp.common.cancel') }}</b-button><b-button type="submit" variant="primary" :disabled="saving"><b-spinner v-if="saving" small class="mr-50" /> {{ $t('erp.common.save') }}</b-button></div>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import erp from '@/services/erp'
import { formatDate } from '@/utils/dateFormat'

export default {
  data() {
    return {
      items: [],
      employees: [],
      loading: false,
      saving: false,
      modal: false,
      editing: false,
      editId: null,
      stats: this.emptyStats(),
      adjustmentSummary: { bonuses: 0, deductions: 0 },
      filters: { employee_id: '', payment_status: '', month: '' },
      pagination: { current_page: 1, per_page: 15, total: 0 },
      form: this.emptyForm(),
    }
  },
  computed: {
    fields() {
      return [
        { key: 'employee.name', label: this.$t('erp.employees.employee') },
        { key: 'salary_month', label: this.$t('erp.salaries.month'), formatter: value => this.formatDate(value) },
        { key: 'basic_salary', label: this.$t('erp.salaries.basicSalary') },
        { key: 'bonuses', label: this.$t('erp.salaries.bonuses') },
        { key: 'deductions', label: this.$t('erp.salaries.deductions') },
        { key: 'net_salary', label: this.$t('erp.salaries.netSalary') },
        { key: 'payment_status', label: this.$t('erp.common.status') },
        { key: 'payment_date', label: this.$t('erp.salaries.paymentDate'), formatter: value => this.formatDate(value) },
        { key: 'actions', label: '' },
      ]
    },
    paymentStatuses() {
      return [{ value: 'unpaid', text: this.$t('erp.common.unpaid') }, { value: 'paid', text: this.$t('erp.common.paid') }]
    },
    employeeOptions() {
      return [{ value: null, text: this.$t('erp.common.selectEmployee') }, ...this.employees.map(item => ({ value: item.id, text: item.name }))]
    },
    employeeFilterOptions() {
      return [{ value: '', text: this.$t('erp.common.allEmployees') }, ...this.employees.map(item => ({ value: item.id, text: item.name }))]
    },
    paymentFilterOptions() {
      return [{ value: '', text: this.$t('erp.common.allStatuses') }, ...this.paymentStatuses]
    },
    netSalary() {
      return Number(this.form.basic_salary || 0) + Number(this.form.bonuses || 0) - Number(this.form.deductions || 0)
    },
  },
  mounted() {
    Promise.all([this.fetch(), this.fetchEmployees()])
  },
  methods: {
    can(permission) {
      return this.$store.getters['auth/hasPermission'](permission)
    },
    emptyForm() {
      return { employee_id: null, salary_month: new Date().toISOString().slice(0, 10), basic_salary: 0, bonuses: 0, deductions: 0, apply_adjustments: true, payment_status: 'unpaid', payment_date: '', notes: '' }
    },
    emptyStats() {
      return { total_count: 0, total_net_salary: 0, paid_total: 0, unpaid_total: 0, paid_count: 0, unpaid_count: 0 }
    },
    async fetch() {
      this.loading = true
      try {
        const params = { ...this.filters, page: this.pagination.current_page }
        Object.keys(params).forEach(key => params[key] === '' && delete params[key])
        const { data } = await erp.salaries.list(params)
        this.items = data.data || data
        this.stats = { ...this.emptyStats(), ...(data.stats || {}) }
        this.pagination = { current_page: data.current_page || 1, per_page: data.per_page || 15, total: data.total ?? this.items.length }
      } finally {
        this.loading = false
      }
    },
    async fetchEmployees() {
      const { data } = await erp.employees.list({ per_page: 100, status: 'active' })
      this.employees = data.data || data
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
      this.form = this.emptyForm()
      this.adjustmentSummary = { bonuses: 0, deductions: 0 }
      this.modal = true
    },
    async openEdit(item) {
      const { data } = await erp.salaries.get(item.id)
      this.editing = true
      this.editId = item.id
      this.form = { employee_id: data.employee_id, salary_month: data.salary_month, basic_salary: Number(data.basic_salary), bonuses: Number(data.bonuses), deductions: Number(data.deductions), apply_adjustments: false, payment_status: data.payment_status, payment_date: data.payment_date || '', notes: data.notes || '' }
      this.adjustmentSummary = { bonuses: Number(data.bonuses || 0), deductions: Number(data.deductions || 0) }
      this.modal = true
    },
    selectEmployee() {
      const employee = this.employees.find(item => item.id === this.form.employee_id)
      if (employee) this.form.basic_salary = Number(employee.salary || 0)
      this.fetchAdjustmentSummary()
    },
    async fetchAdjustmentSummary() {
      if (!this.form.employee_id || !this.form.salary_month || !this.form.apply_adjustments) return
      const { data } = await erp.employeeAdjustments.summary({
        employee_id: this.form.employee_id,
        salary_month: this.form.salary_month,
      })
      this.adjustmentSummary = { bonuses: Number(data.bonuses || 0), deductions: Number(data.deductions || 0) }
      this.form.bonuses = this.adjustmentSummary.bonuses
      this.form.deductions = this.adjustmentSummary.deductions
    },
    async save() {
      this.saving = true
      try {
        if (this.editing) await erp.salaries.update(this.editId, this.form)
        else await erp.salaries.create(this.form)
        this.modal = false
        await this.fetch()
      } finally {
        this.saving = false
      }
    },
    async remove(item) {
      const answer = await this.$swal({ title: this.$t('erp.salaries.deleteTitle'), icon: 'warning', showCancelButton: true })
      if (!answer.isConfirmed && !answer.value) return
      await erp.salaries.remove(item.id)
      await this.fetch()
    },
    currency(value) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0))
    },
    formatDate,
    statusText(value) {
      const key = String(value || '').replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      const translationKey = `erp.common.${key}`
      const translated = this.$t(translationKey)
      return translated === translationKey ? value : translated
    },
  },
}
</script>
