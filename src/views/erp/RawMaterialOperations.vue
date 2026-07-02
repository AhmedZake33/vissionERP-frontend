<template>
  <div class="erp-page">
    <div class="erp-page__heading">
      <div>
        <p class="erp-eyebrow">{{ $t('erp.rawMaterialOperations.eyebrow') }}</p>
        <h2>{{ $t('erp.rawMaterialOperations.title') }}</h2>
        <p class="text-muted mb-0">{{ $t('erp.rawMaterialOperations.subtitle') }}</p>
      </div>
      <b-button v-if="can('erp.raw-material-operations.create')" variant="primary" @click="openMovement">
        <feather-icon icon="PlusIcon" class="mr-50" /> {{ $t('erp.inventory.recordMovement') }}
      </b-button>
    </div>

    <b-card class="erp-panel">
      <div class="erp-toolbar">
        <b-form-select v-model="filters.raw_material_id" :options="materialOptions" class="erp-filter" />
        <b-form-select v-model="filters.type" :options="typeOptions" class="erp-filter" />
        <b-form-input v-model="filters.from" type="date" />
        <b-form-input v-model="filters.to" type="date" />
        <b-button variant="outline-primary" @click="applyFilters">{{ $t('erp.common.apply') }}</b-button>
        <b-button variant="flat-secondary" @click="resetFilters">{{ $t('erp.common.reset') }}</b-button>
      </div>

      <b-table :items="items" :fields="fields" :busy="loading" responsive hover show-empty>
        <template #cell(type)="data"><b-badge :variant="typeVariant(data.value)">{{ movementTypeText(data.value) }}</b-badge></template>
        <template #cell(stock)="data">{{ data.item.stock_before }} / {{ data.item.stock_after }}</template>
        <template #cell(created_at)="data">{{ formatDateTime(data.value) }}</template>
        <template #cell(reference)="data">{{ referenceText(data.item) }}</template>
        <template #table-busy><div class="text-center py-3"><b-spinner variant="primary" /></div></template>
      </b-table>

      <div class="erp-pagination">
        <span>{{ pageSummary }}</span>
        <b-pagination v-model="pagination.current_page" :total-rows="pagination.total" :per-page="pagination.per_page" @change="changePage" />
      </div>
    </b-card>

    <b-modal v-model="movementModal" :title="$t('erp.inventory.recordMovement')" hide-footer>
      <b-form @submit.prevent="saveMovement">
        <b-form-group :label="$t('erp.rawMaterials.material')">
          <b-form-select v-model="movement.raw_material_id" :options="movementMaterialOptions" required />
        </b-form-group>
        <b-form-group :label="$t('erp.inventory.movementType')">
          <b-form-select v-model="movement.type" :options="typeOptions.filter(option => option.value)" required />
        </b-form-group>
        <b-form-group :label="$t('erp.common.quantity')">
          <b-form-input v-model.number="movement.quantity" type="number" min="0" step="0.001" required />
        </b-form-group>
        <b-form-group :label="$t('erp.common.notes')">
          <b-form-textarea v-model="movement.notes" rows="3" />
        </b-form-group>
        <b-alert show variant="light-info">{{ $t('erp.inventory.adjustmentHelp') }}</b-alert>
        <div class="text-right">
          <b-button variant="flat-secondary" class="mr-1" @click="movementModal = false">{{ $t('erp.common.cancel') }}</b-button>
          <b-button type="submit" variant="primary" :disabled="saving"><b-spinner v-if="saving" small class="mr-50" />{{ $t('erp.common.save') }}</b-button>
        </div>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import erp from '@/services/erp'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'
import { formatDateTime } from '@/utils/dateFormat'

export default {
  data() {
    return {
      items: [],
      materials: [],
      loading: false,
      saving: false,
      movementModal: false,
      movement: { raw_material_id: null, type: 'in', quantity: 0, notes: '' },
      filters: { raw_material_id: '', type: '', from: '', to: '' },
      pagination: { current_page: 1, per_page: 15, total: 0, from: 0, to: 0 },
    }
  },
  computed: {
    fields() {
      return [
        { key: 'raw_material.name', label: this.$t('erp.rawMaterials.material') },
        { key: 'raw_material.code', label: this.$t('erp.rawMaterials.code') },
        { key: 'type', label: this.$t('erp.common.type') },
        { key: 'quantity', label: this.$t('erp.common.quantity') },
        { key: 'stock', label: this.$t('erp.operations.stockBeforeAfter') },
        { key: 'reference', label: this.$t('erp.operations.reference') },
        { key: 'creator.name', label: this.$t('erp.inventory.recordedBy') },
        { key: 'created_at', label: this.$t('erp.common.date') },
      ]
    },
    materialOptions() {
      return [{ value: '', text: this.$t('erp.rawMaterialOperations.allMaterials') }, ...this.materials.map(item => ({ value: item.id, text: item.name }))]
    },
    movementMaterialOptions() {
      return [{ value: null, text: this.$t('erp.rawMaterials.material') }, ...this.materials.map(item => ({ value: item.id, text: `${item.name} (${item.stock_quantity})` }))]
    },
    typeOptions() {
      return [
        { value: '', text: this.$t('erp.operations.allTypes') },
        { value: 'in', text: this.$t('erp.inventory.stockIn') },
        { value: 'out', text: this.$t('erp.inventory.stockOut') },
        { value: 'adjustment', text: this.$t('erp.inventory.stockAdjustment') },
      ]
    },
    pageSummary() {
      if (!this.pagination.total) return `0 ${this.$t('erp.common.records')}`
      return `${this.pagination.from || 1}-${this.pagination.to || this.items.length} ${this.$t('erp.common.of')} ${this.pagination.total}`
    },
  },
  mounted() {
    Promise.all([this.fetch(), this.fetchMaterials()])
  },
  methods: {
    can(permission) {
      return this.$store.getters['auth/hasPermission'](permission)
    },
    async fetch() {
      this.loading = true
      try {
        const params = { ...this.filters, page: this.pagination.current_page, per_page: this.pagination.per_page }
        Object.keys(params).forEach(key => params[key] === '' && delete params[key])
        const { data } = await erp.rawMaterialMovements.list(params)
        this.items = data.data || data
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
    async fetchMaterials() {
      const { data } = await erp.rawMaterials.list({ per_page: 100 })
      this.materials = data.data || data
    },
    openMovement() {
      this.movement = { raw_material_id: null, type: 'in', quantity: 0, notes: '' }
      this.movementModal = true
    },
    async saveMovement() {
      this.saving = true
      try {
        await erp.rawMaterialMovements.create(this.movement)
        this.movementModal = false
        this.notify(this.$t('erp.inventory.updated'), 'success')
        await Promise.all([this.fetch(), this.fetchMaterials()])
      } catch (error) {
        const errors = error.response?.data?.errors
        this.notify(errors ? Object.values(errors).flat().join(' ') : (error.response?.data?.message || this.$t('erp.inventory.recordError')), 'danger')
      } finally {
        this.saving = false
      }
    },
    applyFilters() {
      this.pagination.current_page = 1
      this.fetch()
    },
    resetFilters() {
      this.filters = { raw_material_id: '', type: '', from: '', to: '' }
      this.applyFilters()
    },
    changePage(page) {
      this.pagination.current_page = page
      this.fetch()
    },
    typeVariant(type) {
      return { in: 'light-success', out: 'light-danger', adjustment: 'light-warning' }[type] || 'light-secondary'
    },
    movementTypeText(type) {
      return { in: this.$t('erp.inventory.stockIn'), out: this.$t('erp.inventory.stockOut'), adjustment: this.$t('erp.inventory.stockAdjustment') }[type] || type
    },
    referenceText(item) {
      if (!item.reference_type) return '-'
      return `${String(item.reference_type).split('\\').pop()} #${item.reference_id || '-'}`
    },
    notify(text, variant) {
      this.$toast({ component: ToastificationContent, props: { title: variant === 'success' ? this.$t('erp.common.success') : this.$t('erp.common.error'), text, variant } })
    },
    formatDateTime,
  },
}
</script>
