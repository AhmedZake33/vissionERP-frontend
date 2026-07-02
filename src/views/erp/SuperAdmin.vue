<template>
  <div class="erp-page">
    <div class="erp-page__heading">
      <div>
        <p class="erp-eyebrow">{{ $t('erp.superAdmin.eyebrow') }}</p>
        <h2>{{ $t('erp.superAdmin.companies') }}</h2>
        <p class="text-muted mb-0">{{ $t('erp.superAdmin.subtitle') }}</p>
      </div>
      <b-button variant="primary" @click="openCreate">
        <feather-icon icon="PlusIcon" class="mr-50" />{{ $t('erp.superAdmin.newCompany') }}
      </b-button>
    </div>

    <b-row>
      <b-col v-for="metric in metrics" :key="metric.label" cols="12" sm="6" xl>
        <b-card class="erp-metric">
          <span class="erp-metric__icon" :class="metric.class"><feather-icon :icon="metric.icon" /></span>
          <div class="erp-metric__value">{{ format(metric.value, metric.money) }}</div>
          <div class="text-muted">{{ metric.label }}</div>
        </b-card>
      </b-col>
    </b-row>

    <b-card class="erp-panel">
      <div class="erp-toolbar">
        <b-input-group class="erp-search">
          <b-input-group-prepend is-text><feather-icon icon="SearchIcon" /></b-input-group-prepend>
          <b-form-input v-model="filters.search" :placeholder="$t('erp.superAdmin.searchPlaceholder')" @keyup.enter="fetchCompanies" />
        </b-input-group>
        <b-form-select v-model="filters.status" :options="statusFilters" @change="fetchCompanies" />
        <b-form-select v-model="filters.company_type" :options="typeFilters" @change="fetchCompanies" />
        <b-button variant="outline-primary" @click="fetchCompanies"><feather-icon icon="RefreshCwIcon" /></b-button>
      </div>

      <b-table :items="companies" :fields="fields" :busy="loading" responsive hover show-empty>
        <template #table-busy><div class="text-center py-3"><b-spinner small /> {{ $t('erp.superAdmin.loadingCompanies') }}</div></template>
        <template #cell(company)="data">
          <strong>{{ data.item.company_name }}</strong>
          <div class="small text-muted">{{ humanize(data.item.company_type) }}</div>
        </template>
        <template #cell(owner)="data">
          <span>{{ data.item.owner_name }}</span>
          <div class="small text-muted">{{ data.item.owner_email }}</div>
        </template>
        <template #cell(usage)="data">
          <div>{{ data.item.users_count || 0 }} / {{ data.item.max_users }} {{ $t('erp.superAdmin.users') }}</div>
          <div class="small text-muted">{{ data.item.products_count || 0 }} / {{ data.item.max_products }} {{ $t('erp.dashboard.products') }}</div>
        </template>
        <template #cell(subscription)="data">
          <span>{{ humanize(data.item.subscription_plan) }}</span>
          <div class="small text-muted">{{ data.item.subscription_ends_at ? date(data.item.subscription_ends_at) : $t('erp.superAdmin.noExpiry') }}</div>
        </template>
        <template #cell(status)="data">
          <b-badge :variant="statusVariant(data.value)">{{ statusText(data.value) }}</b-badge>
        </template>
        <template #cell(actions)="data">
          <div class="d-flex">
            <b-button v-b-tooltip.hover :title="$t('erp.superAdmin.editCompany')" size="sm" variant="flat-primary" class="btn-icon" @click="openEdit(data.item)">
              <feather-icon icon="Edit2Icon" />
            </b-button>
            <b-button
              v-b-tooltip.hover
              :title="data.item.status === 'active' ? $t('erp.superAdmin.suspendCompany') : $t('erp.superAdmin.activateCompany')"
              size="sm"
              :variant="data.item.status === 'active' ? 'flat-warning' : 'flat-success'"
              class="btn-icon"
              @click="toggleStatus(data.item)"
            >
              <feather-icon :icon="data.item.status === 'active' ? 'PauseCircleIcon' : 'PlayCircleIcon'" />
            </b-button>
            <b-button v-b-tooltip.hover :title="$t('erp.superAdmin.deleteCompany')" size="sm" variant="flat-danger" class="btn-icon" @click="removeCompany(data.item)">
              <feather-icon icon="Trash2Icon" />
            </b-button>
          </div>
        </template>
      </b-table>

      <div class="erp-pagination">
        <span>{{ pagination.total }} {{ $t('erp.superAdmin.companies') }}</span>
        <b-pagination
          v-model="pagination.current_page"
          :total-rows="pagination.total"
          :per-page="pagination.per_page"
          @change="changePage"
        />
      </div>
    </b-card>

    <b-modal v-model="showModal" :title="editing ? $t('erp.superAdmin.editCompany') : $t('erp.superAdmin.createCompany')" size="lg" hide-footer>
      <b-alert v-if="formError" variant="danger" show>{{ formError }}</b-alert>
      <b-form @submit.prevent="saveCompany">
        <b-row>
          <b-col cols="12" md="7"><b-form-group :label="$t('erp.superAdmin.companyName')"><b-form-input v-model="form.company_name" required /></b-form-group></b-col>
          <b-col cols="12" md="5"><b-form-group :label="$t('erp.superAdmin.companyTypeLabel')"><b-form-select v-model="form.company_type" :options="companyTypes" required /></b-form-group></b-col>
          <b-col cols="12" md="6"><b-form-group :label="$t('erp.superAdmin.ownerName')"><b-form-input v-model="form.owner_name" required /></b-form-group></b-col>
          <b-col cols="12" md="6"><b-form-group :label="$t('erp.superAdmin.ownerPhone')"><b-form-input v-model="form.owner_phone" /></b-form-group></b-col>
          <b-col cols="12" md="6"><b-form-group :label="$t('erp.superAdmin.ownerEmail')"><b-form-input v-model="form.owner_email" type="email" required /></b-form-group></b-col>
          <b-col cols="12" md="6">
            <b-form-group :label="editing ? $t('erp.superAdmin.newOwnerPassword') : $t('erp.superAdmin.ownerPassword')">
              <b-form-input v-model="form.owner_password" type="password" :required="!editing" autocomplete="new-password" />
            </b-form-group>
          </b-col>
          <b-col cols="12"><b-form-group :label="$t('erp.customers.address')"><b-form-textarea v-model="form.address" rows="2" /></b-form-group></b-col>
          <b-col cols="12" md="4"><b-form-group :label="$t('erp.superAdmin.subscriptionPlan')"><b-form-input v-model="form.subscription_plan" required /></b-form-group></b-col>
          <b-col cols="12" md="4"><b-form-group :label="$t('erp.superAdmin.subscriptionEnds')"><b-form-input v-model="form.subscription_ends_at" type="date" /></b-form-group></b-col>
          <b-col cols="12" md="4"><b-form-group :label="$t('erp.common.status')"><b-form-select v-model="form.status" :options="statusOptions" /></b-form-group></b-col>
          <b-col cols="12" md="4"><b-form-group :label="$t('erp.superAdmin.maxUsers')"><b-form-input v-model.number="form.max_users" type="number" min="1" required /></b-form-group></b-col>
          <b-col cols="12" md="4"><b-form-group :label="$t('erp.superAdmin.maxProducts')"><b-form-input v-model.number="form.max_products" type="number" min="1" required /></b-form-group></b-col>
          <b-col cols="12" md="4"><b-form-group :label="$t('erp.superAdmin.maxBranches')"><b-form-input v-model.number="form.max_branches" type="number" min="1" required /></b-form-group></b-col>
        </b-row>
        <div class="d-flex justify-content-end">
          <b-button variant="outline-secondary" class="mr-1" @click="showModal = false">{{ $t('erp.common.cancel') }}</b-button>
          <b-button type="submit" variant="primary" :disabled="saving">
            <b-spinner v-if="saving" small class="mr-50" />{{ editing ? $t('erp.superAdmin.saveChanges') : $t('erp.superAdmin.createCompany') }}
          </b-button>
        </div>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import companiesService from '@/services/companies'
import { formatDate } from '@/utils/dateFormat'

const emptyForm = () => ({
  company_name: '',
  company_type: 'company',
  owner_name: '',
  owner_email: '',
  owner_phone: '',
  owner_password: '',
  address: '',
  subscription_plan: 'starter',
  subscription_ends_at: '',
  max_users: 5,
  max_products: 100,
  max_branches: 1,
  status: 'active',
})

export default {
  data() {
    return {
      statistics: {},
      companies: [],
      loading: false,
      saving: false,
      showModal: false,
      editing: null,
      formError: '',
      form: emptyForm(),
      filters: { search: '', status: '', company_type: '' },
      pagination: { current_page: 1, per_page: 15, total: 0 },
    }
  },
  computed: {
    fields() {
      return [
        { key: 'company', label: this.$t('erp.superAdmin.company') },
        { key: 'owner', label: this.$t('erp.superAdmin.owner') },
        { key: 'usage', label: this.$t('erp.superAdmin.usage') },
        { key: 'subscription', label: this.$t('erp.superAdmin.subscription') },
        { key: 'status', label: this.$t('erp.common.status') },
        { key: 'actions', label: '', thStyle: { width: '130px' } },
      ]
    },
    companyTypes() {
      return [{ value: 'factory', text: this.$t('erp.superAdmin.factory') }, { value: 'company', text: this.$t('erp.superAdmin.companyType') }]
    },
    statusOptions() {
      return ['active', 'suspended', 'inactive'].map(value => ({ value, text: this.statusText(value) }))
    },
    statusFilters() {
      return [{ value: '', text: this.$t('erp.common.allStatuses') }, ...this.statusOptions]
    },
    typeFilters() {
      return [{ value: '', text: this.$t('erp.superAdmin.allTypes') }, ...this.companyTypes]
    },
    metrics() {
      return [
        { label: this.$t('erp.superAdmin.companies'), value: this.statistics.total_companies, icon: 'HomeIcon', class: 'bg-light-primary text-primary' },
        { label: this.$t('erp.common.active'), value: this.statistics.active_companies, icon: 'CheckCircleIcon', class: 'bg-light-success text-success' },
        { label: this.$t('erp.common.suspended'), value: this.statistics.suspended_companies, icon: 'PauseCircleIcon', class: 'bg-light-warning text-warning' },
        { label: this.$t('erp.superAdmin.users'), value: this.statistics.total_users, icon: 'UsersIcon', class: 'bg-light-info text-info' },
      ]
    },
  },
  mounted() {
    Promise.all([this.fetchStatistics(), this.fetchCompanies()])
  },
  methods: {
    async fetchStatistics() {
      const { data } = await companiesService.statistics()
      this.statistics = data
    },
    async fetchCompanies() {
      this.loading = true
      try {
        const { data } = await companiesService.list({
          ...this.filters,
          page: this.pagination.current_page,
          per_page: this.pagination.per_page,
        })
        this.companies = data.data || []
        this.pagination = { current_page: data.current_page, per_page: data.per_page, total: data.total }
      } finally {
        this.loading = false
      }
    },
    openCreate() {
      this.editing = null
      this.form = emptyForm()
      this.formError = ''
      this.showModal = true
    },
    openEdit(company) {
      this.editing = company
      this.form = {
        ...emptyForm(),
        ...company,
        owner_password: '',
        subscription_ends_at: company.subscription_ends_at ? String(company.subscription_ends_at).slice(0, 10) : '',
      }
      this.formError = ''
      this.showModal = true
    },
    async saveCompany() {
      this.saving = true
      this.formError = ''
      try {
        const payload = { ...this.form }
        if (!payload.owner_password) delete payload.owner_password
        if (!payload.subscription_ends_at) payload.subscription_ends_at = null
        if (this.editing) await companiesService.update(this.editing.id, payload)
        else await companiesService.create(payload)
        this.showModal = false
        await Promise.all([this.fetchStatistics(), this.fetchCompanies()])
        this.$bvToast.toast(this.editing ? this.$t('erp.superAdmin.updated') : this.$t('erp.superAdmin.created'), { variant: 'success', solid: true })
      } catch (error) {
        const errors = error.response?.data?.errors
        this.formError = errors ? Object.values(errors).flat()[0] : (error.response?.data?.message || this.$t('erp.superAdmin.saveError'))
      } finally {
        this.saving = false
      }
    },
    async toggleStatus(company) {
      const status = company.status === 'active' ? 'suspended' : 'active'
      const confirmed = await this.$bvModal.msgBoxConfirm(`${status === 'active' ? this.$t('erp.superAdmin.activateCompany') : this.$t('erp.superAdmin.suspendCompany')} ${company.company_name}?`)
      if (!confirmed) return
      await companiesService.setStatus(company.id, status)
      await Promise.all([this.fetchStatistics(), this.fetchCompanies()])
    },
    async removeCompany(company) {
      const confirmed = await this.$bvModal.msgBoxConfirm(this.$t('erp.superAdmin.deleteAll', { company: company.company_name }), {
        title: this.$t('erp.superAdmin.deleteCompany'),
        okVariant: 'danger',
        okTitle: this.$t('erp.common.deleteConfirm'),
      })
      if (!confirmed) return
      await companiesService.remove(company.id)
      await Promise.all([this.fetchStatistics(), this.fetchCompanies()])
    },
    changePage(page) {
      this.pagination.current_page = page
      this.fetchCompanies()
    },
    statusVariant(status) {
      return { active: 'light-success', suspended: 'light-warning', inactive: 'light-secondary' }[status] || 'light-secondary'
    },
    humanize(value) {
      return String(value || '').replaceAll('_', ' ').replace(/\b\w/g, char => char.toUpperCase())
    },
    statusText(value) {
      const key = String(value || '').replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      const translationKey = `erp.common.${key}`
      const translated = this.$t(translationKey)
      return translated === translationKey ? this.humanize(value) : translated
    },
    date(value) {
      return formatDate(value)
    },
    format(value, money) {
      return new Intl.NumberFormat('en-US', money ? { style: 'currency', currency: 'USD' } : {}).format(Number(value || 0))
    },
  },
}
</script>
