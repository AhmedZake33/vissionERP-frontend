<template>
  <div class="erp-page">
    <div class="erp-page__heading">
      <div>
        <p class="erp-eyebrow">{{ $t('erp.employeeAdjustments.eyebrow') }}</p>
        <h2>{{ $t('erp.employeeAdjustments.title') }}</h2>
        <p class="text-muted mb-0">{{ $t('erp.employeeAdjustments.subtitle') }}</p>
      </div>
      <b-button v-if="can('erp.employee-adjustments.create')" variant="primary" @click="openCreate">
        <feather-icon icon="PlusIcon" class="mr-50" /> {{ $t('erp.employeeAdjustments.addAdjustment') }}
      </b-button>
    </div>

    <div class="erp-stat-grid">
      <b-card class="erp-stat-card">
        <span>{{ $t('erp.employeeAdjustments.records') }}</span>
        <strong>{{ stats.total_count }}</strong>
      </b-card>
      <b-card class="erp-stat-card">
        <span>{{ $t('erp.employeeAdjustments.bonusesTotal') }}</span>
        <strong class="text-success">{{ currency(stats.bonuses_total) }}</strong>
      </b-card>
      <b-card class="erp-stat-card">
        <span>{{ $t('erp.employeeAdjustments.deductionsTotal') }}</span>
        <strong class="text-danger">{{ currency(stats.deductions_total) }}</strong>
      </b-card>
      <b-card class="erp-stat-card">
        <span>{{ $t('erp.employeeAdjustments.pending') }}</span>
        <strong>{{ stats.pending_count }}</strong>
      </b-card>
    </div>

    <b-card class="erp-panel">
      <div class="erp-toolbar">
        <b-input-group class="erp-search">
          <b-input-group-prepend is-text><feather-icon icon="SearchIcon" /></b-input-group-prepend>
          <b-form-input v-model="filters.search" :placeholder="$t('erp.employeeAdjustments.searchPlaceholder')" @keyup.enter="applyFilters" />
        </b-input-group>
        <b-form-select v-model="filters.employee_id" :options="employeeFilterOptions" class="erp-filter" />
        <b-form-select v-model="filters.type" :options="typeFilterOptions" class="erp-filter" />
        <b-form-select v-model="filters.applied_to_salary" :options="appliedFilterOptions" class="erp-filter" />
        <b-form-input v-model="filters.from" type="date" />
        <b-form-input v-model="filters.to" type="date" />
        <b-button variant="outline-primary" @click="applyFilters">{{ $t('erp.common.apply') }}</b-button>
        <b-button variant="flat-secondary" @click="resetFilters">{{ $t('erp.common.reset') }}</b-button>
      </div>

      <b-table :items="items" :fields="fields" :busy="loading" responsive hover show-empty>
        <template #cell(adjustment_date)="data">{{ formatDate(data.value) }}</template>
        <template #cell(type)="data">
          <b-badge :variant="data.value === 'bonus' ? 'light-success' : 'light-danger'">{{ adjustmentTypeText(data.value) }}</b-badge>
        </template>
        <template #cell(amount)="data"><strong :class="data.item.type === 'bonus' ? 'text-success' : 'text-danger'">{{ currency(data.value) }}</strong></template>
        <template #cell(applied_to_salary)="data">
          <b-badge :variant="data.value ? 'light-primary' : 'light-warning'">{{ data.value ? $t('erp.employeeAdjustments.applied') : $t('erp.employeeAdjustments.pending') }}</b-badge>
        </template>
        <template #cell(actions)="data">
          <div class="erp-actions">
            <b-button v-if="can('erp.employee-adjustments.edit') && !data.item.applied_to_salary" variant="flat-warning" class="btn-icon" @click="openEdit(data.item)">
              <feather-icon icon="Edit2Icon" />
            </b-button>
            <b-button v-if="can('erp.employee-adjustments.delete') && !data.item.applied_to_salary" variant="flat-danger" class="btn-icon" @click="remove(data.item)">
              <feather-icon icon="Trash2Icon" />
            </b-button>
          </div>
        </template>
      </b-table>

      <div class="erp-pagination">
        <span>{{ pageSummary }}</span>
        <b-pagination v-model="pagination.current_page" :total-rows="pagination.total" :per-page="pagination.per_page" @change="changePage" />
      </div>
    </b-card>

    <b-modal v-model="modal" :title="editing ? $t('erp.employeeAdjustments.editAdjustment') : $t('erp.employeeAdjustments.addAdjustment')" hide-footer size="lg">
      <b-form @submit.prevent="save">
        <b-row>
          <b-col cols="12" md="6">
            <b-form-group :label="$t('erp.employees.employee')">
              <b-form-select v-model="form.employee_id" :options="employeeOptions" required />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="6">
            <b-form-group :label="$t('erp.common.type')">
              <b-form-select v-model="form.type" :options="typeOptions" required />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="6">
            <b-form-group :label="$t('erp.employeeAdjustments.titleField')">
              <b-form-input v-model="form.title" required />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="3">
            <b-form-group :label="$t('erp.employeeAdjustments.amount')">
              <b-form-input v-model.number="form.amount" type="number" min="0.01" step="0.01" required />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="3">
            <b-form-group :label="$t('erp.common.date')">
              <b-form-input v-model="form.adjustment_date" type="date" required />
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
      employees: [],
      loading: false,
      saving: false,
      modal: false,
      editing: false,
      editId: null,
      stats: this.emptyStats(),
      filters: { search: '', employee_id: '', type: '', applied_to_salary: '', from: '', to: '' },
      pagination: { current_page: 1, per_page: 15, total: 0, from: 0, to: 0 },
      form: this.emptyForm(),
    }
  },
  computed: {
    fields() {
      return [
        { key: 'adjustment_date', label: this.$t('erp.common.date') },
        { key: 'employee.name', label: this.$t('erp.employees.employee') },
        { key: 'title', label: this.$t('erp.employeeAdjustments.titleField') },
        { key: 'type', label: this.$t('erp.common.type') },
        { key: 'amount', label: this.$t('erp.employeeAdjustments.amount') },
        { key: 'applied_to_salary', label: this.$t('erp.employeeAdjustments.salaryStatus') },
        { key: 'creator.name', label: this.$t('erp.inventory.recordedBy') },
        { key: 'actions', label: '' },
      ]
    },
    employeeOptions() {
      return [{ value: null, text: this.$t('erp.common.selectEmployee') }, ...this.employees.map(item => ({ value: item.id, text: item.name }))]
    },
    employeeFilterOptions() {
      return [{ value: '', text: this.$t('erp.common.allEmployees') }, ...this.employees.map(item => ({ value: item.id, text: item.name }))]
    },
    typeOptions() {
      return [
        { value: 'bonus', text: this.$t('erp.employeeAdjustments.bonus') },
        { value: 'deduction', text: this.$t('erp.employeeAdjustments.deduction') },
      ]
    },
    typeFilterOptions() {
      return [{ value: '', text: this.$t('erp.employeeAdjustments.allTypes') }, ...this.typeOptions]
    },
    appliedFilterOptions() {
      return [
        { value: '', text: this.$t('erp.employeeAdjustments.allSalaryStatuses') },
        { value: '0', text: this.$t('erp.employeeAdjustments.pending') },
        { value: '1', text: this.$t('erp.employeeAdjustments.applied') },
      ]
    },
    pageSummary() {
      if (!this.pagination.total) return `0 ${this.$t('erp.common.records')}`
      return `${this.pagination.from || 1}-${this.pagination.to || this.items.length} ${this.$t('erp.common.of')} ${this.pagination.total}`
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
      return { employee_id: null, type: 'bonus', title: '', amount: 0, adjustment_date: new Date().toISOString().slice(0, 10), notes: '' }
    },
    emptyStats() {
      return { total_count: 0, bonuses_total: 0, deductions_total: 0, pending_count: 0 }
    },
    async fetch() {
      this.loading = true
      try {
        const params = { ...this.filters, page: this.pagination.current_page, per_page: this.pagination.per_page }
        Object.keys(params).forEach(key => params[key] === '' && delete params[key])
        const { data } = await erp.employeeAdjustments.list(params)
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
    async fetchEmployees() {
      const { data } = await erp.employees.list({ per_page: 100, status: 'active' })
      this.employees = data.data || data
    },
    applyFilters() {
      this.pagination.current_page = 1
      this.fetch()
    },
    resetFilters() {
      this.filters = { search: '', employee_id: '', type: '', applied_to_salary: '', from: '', to: '' }
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
        employee_id: item.employee_id,
        type: item.type,
        title: item.title,
        amount: Number(item.amount || 0),
        adjustment_date: item.adjustment_date,
        notes: item.notes || '',
      }
      this.modal = true
    },
    async save() {
      this.saving = true
      try {
        if (this.editing) await erp.employeeAdjustments.update(this.editId, this.form)
        else await erp.employeeAdjustments.create(this.form)
        this.modal = false
        this.notify(this.$t('erp.employeeAdjustments.saved'), 'success')
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
        title: this.$t('erp.employeeAdjustments.deleteTitle'),
        text: this.$t('erp.common.deleteWarning'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: this.$t('erp.common.deleteConfirm'),
      })
      if (!answer.isConfirmed && !answer.value) return
      await erp.employeeAdjustments.remove(item.id)
      this.notify(this.$t('erp.employeeAdjustments.deleted'), 'success')
      await this.fetch()
    },
    adjustmentTypeText(value) {
      return this.typeOptions.find(item => item.value === value)?.text || value
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
