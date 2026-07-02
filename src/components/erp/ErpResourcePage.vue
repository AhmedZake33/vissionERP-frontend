<template>
  <div class="erp-page">
    <div class="erp-page__heading">
      <div>
        <p class="erp-eyebrow">{{ eyebrow }}</p>
        <h2>{{ title }}</h2>
        <p class="text-muted mb-0">{{ subtitle }}</p>
      </div>
      <b-button v-if="can(createPermission)" variant="primary" @click="openCreate">
        <feather-icon icon="PlusIcon" class="mr-50" />
        {{ $t('erp.common.add') }} {{ singular }}
      </b-button>
    </div>

    <b-card class="erp-panel">
      <div class="erp-toolbar">
        <b-input-group class="erp-search">
          <b-input-group-prepend is-text><feather-icon icon="SearchIcon" /></b-input-group-prepend>
          <b-form-input v-model="filters.search" :placeholder="$t('erp.resource.searchPlaceholder', { item: lowerTitle })" @keyup.enter="applyFilters" />
        </b-input-group>
        <b-form-select v-if="statusOptions.length" v-model="filters.status" :options="statusFilterOptions" class="erp-filter" />
        <b-button variant="outline-primary" @click="applyFilters">{{ $t('erp.common.apply') }}</b-button>
        <b-button variant="flat-secondary" @click="resetFilters">{{ $t('erp.common.reset') }}</b-button>
      </div>

      <b-table :items="items" :fields="tableFields" :busy="loading" responsive hover show-empty>
        <template #cell(status)="data">
          <b-badge :variant="statusVariant(data.value)">{{ statusText(data.value) }}</b-badge>
        </template>
        <template #cell(actions)="data">
          <div class="erp-actions">
            <b-button v-b-tooltip.hover :title="$t('erp.common.view')" variant="flat-info" class="btn-icon" @click="viewItem(data.item)">
              <feather-icon icon="EyeIcon" />
            </b-button>
            <b-button v-if="can(editPermission)" v-b-tooltip.hover :title="$t('erp.common.edit')" variant="flat-warning" class="btn-icon" @click="openEdit(data.item)">
              <feather-icon icon="Edit2Icon" />
            </b-button>
            <b-button v-if="can(deletePermission)" v-b-tooltip.hover :title="$t('erp.common.delete')" variant="flat-danger" class="btn-icon" @click="remove(data.item)">
              <feather-icon icon="Trash2Icon" />
            </b-button>
          </div>
        </template>
        <template #table-busy>
          <div class="text-center py-3"><b-spinner variant="primary" /></div>
        </template>
        <template #empty>
          <div class="erp-empty">
            <feather-icon icon="InboxIcon" size="34" />
            <strong>{{ $t('erp.resource.noRecords', { item: lowerTitle }) }}</strong>
            <span>{{ $t('erp.resource.emptyHint') }}</span>
          </div>
        </template>
      </b-table>

      <div class="erp-pagination">
        <span>{{ pageSummary }}</span>
        <b-pagination v-model="pagination.current_page" :total-rows="pagination.total" :per-page="pagination.per_page" @change="changePage" />
      </div>
    </b-card>

    <b-modal v-model="formModal" :title="formTitle" hide-footer size="lg">
      <b-form @submit.prevent="save">
        <b-row>
          <b-col v-for="field in formFields" :key="field.key" cols="12" :md="field.full ? 12 : 6">
            <b-form-group :label="field.label" :label-for="`erp-${field.key}`">
              <b-form-textarea
                v-if="field.type === 'textarea'"
                :id="`erp-${field.key}`"
                v-model="form[field.key]"
                :rows="field.rows || 3"
                :required="field.required"
              />
              <b-form-checkbox-group
                v-else-if="field.type === 'checkbox-group'"
                :id="`erp-${field.key}`"
                v-model="form[field.key]"
                :options="field.options || []"
                :stacked="field.stacked !== false"
              />
              <b-form-select
                v-else-if="field.type === 'select'"
                :id="`erp-${field.key}`"
                v-model="form[field.key]"
                :options="field.options || []"
                :required="field.required"
              />
              <b-form-input
                v-else
                :id="`erp-${field.key}`"
                v-model="form[field.key]"
                :type="field.type || 'text'"
                :step="field.step"
                :min="field.min"
                :required="field.required"
              />
            </b-form-group>
          </b-col>
        </b-row>
        <div class="text-right">
          <b-button variant="flat-secondary" class="mr-1" @click="formModal = false">{{ $t('erp.common.cancel') }}</b-button>
          <b-button type="submit" variant="primary" :disabled="saving">
            <b-spinner v-if="saving" small class="mr-50" /> {{ $t('erp.common.save') }}
          </b-button>
        </div>
      </b-form>
    </b-modal>

    <b-modal v-model="detailModal" :title="$t('erp.resource.detailsTitle', { item: singular })" ok-only>
      <dl v-if="selected" class="erp-details">
        <template v-for="field in detailFields">
          <dt :key="`${field.key}-label`">{{ field.label }}</dt>
          <dd :key="field.key">{{ displayValue(selected, field) }}</dd>
        </template>
      </dl>
      <slot name="details" :item="selected" />
    </b-modal>
  </div>
</template>

<script>
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'

export default {
  props: {
    eyebrow: { type: String, default: 'ERP workspace' },
    title: { type: String, required: true },
    singular: { type: String, required: true },
    subtitle: { type: String, default: '' },
    service: { type: Object, required: true },
    fields: { type: Array, required: true },
    formFields: { type: Array, required: true },
    defaultForm: { type: Object, required: true },
    statusOptions: { type: Array, default: () => [] },
    createPermission: { type: String, default: '' },
    editPermission: { type: String, default: '' },
    deletePermission: { type: String, default: '' },
  },
  data() {
    return {
      items: [],
      loading: false,
      saving: false,
      editing: false,
      editId: null,
      formModal: false,
      detailModal: false,
      selected: null,
      form: { ...this.defaultForm },
      filters: { search: '', status: '' },
      pagination: { current_page: 1, per_page: 15, total: 0, from: 0, to: 0 },
    }
  },
  computed: {
    tableFields() {
      return [...this.fields, { key: 'actions', label: '', class: 'text-right' }]
    },
    detailFields() {
      return this.fields.filter(field => field.key !== 'actions')
    },
    statusFilterOptions() {
      return [{ value: '', text: this.$t('erp.common.allStatuses') }, ...this.statusOptions]
    },
    lowerTitle() {
      return String(this.title || '').toLowerCase()
    },
    formTitle() {
      return this.$t(this.editing ? 'erp.resource.editTitle' : 'erp.resource.addTitle', { item: this.singular })
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
      return !permission || this.$store.getters['auth/hasPermission'](permission)
    },
    async fetch() {
      this.loading = true
      try {
        const params = { page: this.pagination.current_page, per_page: this.pagination.per_page }
        if (this.filters.search) params.search = this.filters.search
        if (this.filters.status) params.status = this.filters.status
        const { data } = await this.service.list(params)
        this.items = data.data || data
        this.pagination = {
          current_page: data.current_page || 1,
          per_page: data.per_page || 15,
          total: data.total ?? this.items.length,
          from: data.from || 0,
          to: data.to || 0,
        }
      } catch (error) {
        this.notify(error.response?.data?.message || this.$t('erp.resource.loadError', { item: this.lowerTitle }), 'danger')
      } finally {
        this.loading = false
      }
    },
    applyFilters() {
      this.pagination.current_page = 1
      this.fetch()
    },
    resetFilters() {
      this.filters = { search: '', status: '' }
      this.applyFilters()
    },
    changePage(page) {
      this.pagination.current_page = page
      this.fetch()
    },
    openCreate() {
      this.editing = false
      this.editId = null
      this.form = Object.keys(this.defaultForm).reduce((result, key) => { result[key] = Array.isArray(this.defaultForm[key]) ? [...this.defaultForm[key]] : this.defaultForm[key]; return result }, {})
      this.formModal = true
    },
    async openEdit(item) {
      this.editing = true
      this.editId = item.id
      let source = item
      try {
        const { data } = await this.service.get(item.id)
        source = data
      } catch (error) {
        source = item
      }
      this.form = Object.keys(this.defaultForm).reduce((result, key) => {
        result[key] = this.formValueFromItem(source, key)
        return result
      }, {})
      this.formModal = true
    },
    formValueFromItem(item, key) {
      if (item[key] !== undefined && item[key] !== null) return item[key]
      if (key.endsWith('_ids')) {
        const relation = key.replace(/_ids$/, 's')
        if (Array.isArray(item[relation])) return item[relation].map(row => row.id)
      }
      return Array.isArray(this.defaultForm[key]) ? [...this.defaultForm[key]] : this.defaultForm[key]
    },
    async viewItem(item) {
      try {
        const { data } = await this.service.get(item.id)
        this.selected = data
      } catch (error) {
        this.selected = item
      }
      this.detailModal = true
    },
    async save() {
      this.saving = true
      try {
        if (this.editing) await this.service.update(this.editId, this.form)
        else await this.service.create(this.form)
        this.formModal = false
        this.notify(this.$t('erp.resource.saved', { item: this.singular }), 'success')
        await this.fetch()
      } catch (error) {
        const errors = error.response?.data?.errors
        this.notify(errors ? Object.values(errors).flat().join(' ') : (error.response?.data?.message || this.$t('erp.resource.saveError')), 'danger')
      } finally {
        this.saving = false
      }
    },
    async remove(item) {
      const answer = await this.$swal({
        title: this.$t('erp.resource.deleteTitle', { item: this.singular }),
        text: this.$t('erp.common.deleteWarning'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: this.$t('erp.common.deleteConfirm'),
        cancelButtonText: this.$t('erp.common.cancel'),
        customClass: { confirmButton: 'btn btn-danger', cancelButton: 'btn btn-outline-secondary ml-1' },
        buttonsStyling: false,
      })
      if (!answer.isConfirmed && !answer.value) return
      try {
        await this.service.remove(item.id)
        this.notify(this.$t('erp.resource.deleted', { item: this.singular }), 'success')
        await this.fetch()
      } catch (error) {
        this.notify(error.response?.data?.message || this.$t('erp.resource.deleteError'), 'danger')
      }
    },
    displayValue(item, field) {
      const value = field.key.split('.').reduce((current, key) => current?.[key], item)
      if (field.formatter) return field.formatter(value, field.key, item)
      if (field.type === 'currency') return this.currency(value)
      return value === null || value === undefined || value === '' ? '-' : this.statusText(value)
    },
    currency(value) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0))
    },
    humanize(value) {
      return String(value || '').replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase())
    },
    statusText(value) {
      const normalized = String(value || '')
      const key = normalized.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      const translationKey = `erp.common.${key}`
      const translated = this.$t(translationKey)
      return translated === translationKey ? this.humanize(value) : translated
    },
    statusVariant(status) {
      return {
        active: 'light-success',
        paid: 'light-success',
        inactive: 'light-secondary',
        unpaid: 'light-danger',
        terminated: 'light-danger',
        discontinued: 'light-warning',
      }[status] || 'light-primary'
    },
    notify(text, variant) {
      this.$toast({ component: ToastificationContent, props: { title: variant === 'success' ? this.$t('erp.common.success') : this.$t('erp.common.error'), text, variant } })
    },
  },
}
</script>
