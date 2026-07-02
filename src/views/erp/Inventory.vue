<template>
  <div class="erp-page">
    <div class="erp-page__heading">
      <div>
        <p class="erp-eyebrow">{{ $t('erp.inventory.eyebrow') }}</p>
        <h2>{{ $t('erp.inventory.title') }}</h2>
        <p class="text-muted mb-0">{{ $t('erp.inventory.subtitle') }}</p>
      </div>
      <b-button v-if="activeTab === 0 && can('erp.inventory.create')" variant="primary" @click="movementModal = true">
        <feather-icon icon="RepeatIcon" class="mr-50" /> {{ $t('erp.inventory.recordMovement') }}
      </b-button>
      <b-button v-else-if="activeTab === 1 && can('erp.raw-material-operations.create')" variant="primary" @click="rawMovementModal = true">
        <feather-icon icon="RepeatIcon" class="mr-50" /> {{ $t('erp.inventory.recordMovement') }}
      </b-button>
    </div>

    <b-tabs v-model="activeTab" content-class="mt-2">
      <b-tab :title="$t('erp.products.products')">
        <b-card class="erp-panel mb-2">
          <div class="erp-section-title">
            <h4>{{ $t('erp.inventory.lowStockAlerts') }}</h4>
            <b-badge variant="light-danger">{{ lowStock.length }} {{ $t('erp.inventory.products') }}</b-badge>
          </div>
          <b-table :items="lowStock" :fields="lowFields" small responsive show-empty>
            <template #cell(stock_quantity)="data"><b-badge variant="danger">{{ data.value }}</b-badge></template>
          </b-table>
        </b-card>

        <b-card class="erp-panel">
          <div class="erp-toolbar">
            <b-form-select v-model="filters.product_id" :options="productFilterOptions" class="erp-filter" />
            <b-form-select v-model="filters.type" :options="typeFilterOptions" class="erp-filter" />
            <b-form-input v-model="filters.from" type="date" />
            <b-form-input v-model="filters.to" type="date" />
            <b-button variant="outline-primary" @click="applyFilters">{{ $t('erp.common.apply') }}</b-button>
          </div>
          <b-table :items="movements" :fields="fields" :busy="loading" responsive hover show-empty>
            <template #cell(type)="data"><b-badge :variant="typeVariant(data.value)">{{ movementTypeText(data.value) }}</b-badge></template>
            <template #cell(quantity)="data"><strong>{{ data.value }}</strong></template>
            <template #cell(created_at)="data">{{ dateTime(data.value) }}</template>
          </b-table>
          <div class="erp-pagination">
            <span>{{ pagination.total }} {{ $t('erp.inventory.movements') }}</span>
            <b-pagination v-model="pagination.current_page" :total-rows="pagination.total" :per-page="pagination.per_page" @change="changePage" />
          </div>
        </b-card>
      </b-tab>

      <b-tab v-if="can('erp.raw-materials.view') || can('erp.raw-material-operations.view')" :title="$t('erp.rawMaterials.title')">
        <b-card class="erp-panel mb-2">
          <div class="erp-section-title">
            <h4>{{ $t('erp.inventory.lowStockAlerts') }}</h4>
            <b-badge variant="light-danger">{{ rawLowStock.length }} {{ $t('erp.rawMaterials.title') }}</b-badge>
          </div>
          <b-table :items="rawLowStock" :fields="rawLowFields" small responsive show-empty>
            <template #cell(stock_quantity)="data"><b-badge variant="danger">{{ data.value }}</b-badge></template>
          </b-table>
        </b-card>

        <b-card class="erp-panel">
          <div class="erp-toolbar">
            <b-form-select v-model="rawFilters.raw_material_id" :options="rawMaterialFilterOptions" class="erp-filter" />
            <b-form-select v-model="rawFilters.type" :options="typeFilterOptions" class="erp-filter" />
            <b-form-input v-model="rawFilters.from" type="date" />
            <b-form-input v-model="rawFilters.to" type="date" />
            <b-button variant="outline-primary" @click="applyRawFilters">{{ $t('erp.common.apply') }}</b-button>
          </div>
          <b-table :items="rawMovements" :fields="rawFields" :busy="rawLoading" responsive hover show-empty>
            <template #cell(type)="data"><b-badge :variant="typeVariant(data.value)">{{ movementTypeText(data.value) }}</b-badge></template>
            <template #cell(quantity)="data"><strong>{{ data.value }}</strong></template>
            <template #cell(created_at)="data">{{ dateTime(data.value) }}</template>
          </b-table>
          <div class="erp-pagination">
            <span>{{ rawPagination.total }} {{ $t('erp.inventory.movements') }}</span>
            <b-pagination v-model="rawPagination.current_page" :total-rows="rawPagination.total" :per-page="rawPagination.per_page" @change="changeRawPage" />
          </div>
        </b-card>
      </b-tab>
    </b-tabs>

    <b-modal v-model="movementModal" :title="$t('erp.inventory.recordStockMovement')" hide-footer>
      <b-form @submit.prevent="saveMovement">
        <b-form-group :label="$t('erp.products.product')"><b-form-select v-model="form.product_id" :options="productOptions" required /></b-form-group>
        <b-form-group :label="$t('erp.inventory.movementType')"><b-form-select v-model="form.type" :options="movementTypes" required /></b-form-group>
        <b-form-group :label="$t('erp.common.quantity')"><b-form-input v-model.number="form.quantity" type="number" min="0" required /></b-form-group>
        <b-alert show variant="light-info">
          {{ $t('erp.inventory.adjustmentHelp') }}
        </b-alert>
        <b-form-group :label="$t('erp.common.notes')"><b-form-textarea v-model="form.notes" rows="3" /></b-form-group>
        <div class="text-right">
          <b-button variant="flat-secondary" class="mr-1" @click="movementModal = false">{{ $t('erp.common.cancel') }}</b-button>
          <b-button type="submit" variant="primary" :disabled="saving"><b-spinner v-if="saving" small class="mr-50" /> {{ $t('erp.common.save') }}</b-button>
        </div>
      </b-form>
    </b-modal>

    <b-modal v-model="rawMovementModal" :title="$t('erp.inventory.recordStockMovement')" hide-footer>
      <b-form @submit.prevent="saveRawMovement">
        <b-form-group :label="$t('erp.rawMaterials.material')"><b-form-select v-model="rawForm.raw_material_id" :options="rawMaterialOptions" required /></b-form-group>
        <b-form-group :label="$t('erp.inventory.movementType')"><b-form-select v-model="rawForm.type" :options="movementTypes" required /></b-form-group>
        <b-form-group :label="$t('erp.common.quantity')"><b-form-input v-model.number="rawForm.quantity" type="number" min="0" step="0.001" required /></b-form-group>
        <b-alert show variant="light-info">
          {{ $t('erp.inventory.adjustmentHelp') }}
        </b-alert>
        <b-form-group :label="$t('erp.common.notes')"><b-form-textarea v-model="rawForm.notes" rows="3" /></b-form-group>
        <div class="text-right">
          <b-button variant="flat-secondary" class="mr-1" @click="rawMovementModal = false">{{ $t('erp.common.cancel') }}</b-button>
          <b-button type="submit" variant="primary" :disabled="saving"><b-spinner v-if="saving" small class="mr-50" /> {{ $t('erp.common.save') }}</b-button>
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
      movements: [],
      rawMovements: [],
      products: [],
      rawMaterials: [],
      lowStock: [],
      rawLowStock: [],
      activeTab: 0,
      loading: false,
      rawLoading: false,
      saving: false,
      movementModal: false,
      rawMovementModal: false,
      filters: { product_id: '', type: '', from: '', to: '' },
      rawFilters: { raw_material_id: '', type: '', from: '', to: '' },
      form: { product_id: null, type: 'in', quantity: 1, notes: '' },
      rawForm: { raw_material_id: null, type: 'in', quantity: 1, notes: '' },
      pagination: { current_page: 1, per_page: 15, total: 0 },
      rawPagination: { current_page: 1, per_page: 15, total: 0 },
    }
  },
  computed: {
    fields() {
      return [
        { key: 'product.name', label: this.$t('erp.products.product') },
        { key: 'product.sku', label: this.$t('erp.dashboard.sku') },
        { key: 'type', label: this.$t('erp.common.type') },
        { key: 'quantity', label: this.$t('erp.common.quantity') },
        { key: 'stock_before', label: this.$t('erp.inventory.before') },
        { key: 'stock_after', label: this.$t('erp.inventory.after') },
        { key: 'creator.name', label: this.$t('erp.inventory.recordedBy') },
        { key: 'created_at', label: this.$t('erp.common.date') },
      ]
    },
    lowFields() {
      return [
        { key: 'name', label: this.$t('erp.products.product') },
        { key: 'sku', label: this.$t('erp.dashboard.sku') },
        { key: 'category.name', label: this.$t('erp.products.category') },
        { key: 'stock_quantity', label: this.$t('erp.inventory.available') },
        { key: 'low_stock_threshold', label: this.$t('erp.inventory.threshold') },
      ]
    },
    rawFields() {
      return [
        { key: 'raw_material.name', label: this.$t('erp.rawMaterials.material') },
        { key: 'raw_material.code', label: this.$t('erp.rawMaterials.code') },
        { key: 'type', label: this.$t('erp.common.type') },
        { key: 'quantity', label: this.$t('erp.common.quantity') },
        { key: 'stock_before', label: this.$t('erp.inventory.before') },
        { key: 'stock_after', label: this.$t('erp.inventory.after') },
        { key: 'creator.name', label: this.$t('erp.inventory.recordedBy') },
        { key: 'created_at', label: this.$t('erp.common.date') },
      ]
    },
    rawLowFields() {
      return [
        { key: 'name', label: this.$t('erp.rawMaterials.material') },
        { key: 'code', label: this.$t('erp.rawMaterials.code') },
        { key: 'supplier.name', label: this.$t('erp.suppliers.supplier') },
        { key: 'stock_quantity', label: this.$t('erp.inventory.available') },
        { key: 'reorder_level', label: this.$t('erp.inventory.threshold') },
      ]
    },
    movementTypes() {
      return [
        { value: 'in', text: this.$t('erp.inventory.stockIn') },
        { value: 'out', text: this.$t('erp.inventory.stockOut') },
        { value: 'adjustment', text: this.$t('erp.inventory.stockAdjustment') },
      ]
    },
    productOptions() {
      return [{ value: null, text: this.$t('erp.common.selectProduct') }, ...this.products.map(item => ({ value: item.id, text: `${item.name} (${item.stock_quantity} ${this.$t('erp.dashboard.stock')})` }))]
    },
    productFilterOptions() {
      return [{ value: '', text: this.$t('erp.common.allProducts') }, ...this.products.map(item => ({ value: item.id, text: item.name }))]
    },
    rawMaterialOptions() {
      return [{ value: null, text: this.$t('erp.rawMaterials.material') }, ...this.rawMaterials.map(item => ({ value: item.id, text: `${item.name} (${item.stock_quantity} ${this.$t('erp.dashboard.stock')})` }))]
    },
    rawMaterialFilterOptions() {
      return [{ value: '', text: this.$t('erp.rawMaterialOperations.allMaterials') }, ...this.rawMaterials.map(item => ({ value: item.id, text: item.name }))]
    },
    typeFilterOptions() {
      return [{ value: '', text: this.$t('erp.inventory.allMovementTypes') }, ...this.movementTypes]
    },
  },
  mounted() {
    const tasks = [this.fetchMovements(), this.fetchProducts(), this.fetchLowStock()]
    if (this.can('erp.raw-materials.view') || this.can('erp.raw-material-operations.view')) {
      tasks.push(this.fetchRawMovements(), this.fetchRawMaterials(), this.fetchRawLowStock())
    }
    Promise.all(tasks)
  },
  methods: {
    can(permission) {
      return this.$store.getters['auth/hasPermission'](permission)
    },
    async fetchMovements() {
      this.loading = true
      try {
        const params = { ...this.filters, page: this.pagination.current_page }
        Object.keys(params).forEach(key => params[key] === '' && delete params[key])
        const { data } = await erp.stockMovements.list(params)
        this.movements = data.data || data
        this.pagination = { current_page: data.current_page || 1, per_page: data.per_page || 15, total: data.total ?? this.movements.length }
      } finally {
        this.loading = false
      }
    },
    async fetchProducts() {
      const { data } = await erp.products.list({ per_page: 100 })
      this.products = data.data || data
    },
    async fetchRawMaterials() {
      const { data } = await erp.rawMaterials.list({ per_page: 100 })
      this.rawMaterials = data.data || data
    },
    async fetchLowStock() {
      const { data } = await erp.stockMovements.lowStock()
      this.lowStock = data.data || []
    },
    async fetchRawLowStock() {
      const { data } = await erp.rawMaterials.list({ per_page: 100, low_stock: 1 })
      this.rawLowStock = data.data || data
    },
    async fetchRawMovements() {
      this.rawLoading = true
      try {
        const params = { ...this.rawFilters, page: this.rawPagination.current_page }
        Object.keys(params).forEach(key => params[key] === '' && delete params[key])
        const { data } = await erp.rawMaterialMovements.list(params)
        this.rawMovements = data.data || data
        this.rawPagination = { current_page: data.current_page || 1, per_page: data.per_page || 15, total: data.total ?? this.rawMovements.length }
      } finally {
        this.rawLoading = false
      }
    },
    applyFilters() {
      this.pagination.current_page = 1
      this.fetchMovements()
    },
    changePage(page) {
      this.pagination.current_page = page
      this.fetchMovements()
    },
    applyRawFilters() {
      this.rawPagination.current_page = 1
      this.fetchRawMovements()
    },
    changeRawPage(page) {
      this.rawPagination.current_page = page
      this.fetchRawMovements()
    },
    async saveMovement() {
      this.saving = true
      try {
        await erp.stockMovements.create(this.form)
        this.movementModal = false
        this.form = { product_id: null, type: 'in', quantity: 1, notes: '' }
        this.notify(this.$t('erp.inventory.updated'), 'success')
        await Promise.all([this.fetchMovements(), this.fetchProducts(), this.fetchLowStock()])
      } catch (error) {
        this.notify(error.response?.data?.message || this.$t('erp.inventory.recordError'), 'danger')
      } finally {
        this.saving = false
      }
    },
    async saveRawMovement() {
      this.saving = true
      try {
        await erp.rawMaterialMovements.create(this.rawForm)
        this.rawMovementModal = false
        this.rawForm = { raw_material_id: null, type: 'in', quantity: 1, notes: '' }
        this.notify(this.$t('erp.inventory.updated'), 'success')
        await Promise.all([this.fetchRawMovements(), this.fetchRawMaterials(), this.fetchRawLowStock()])
      } catch (error) {
        this.notify(error.response?.data?.message || this.$t('erp.inventory.recordError'), 'danger')
      } finally {
        this.saving = false
      }
    },
    typeVariant(type) {
      return { in: 'light-success', out: 'light-danger', adjustment: 'light-warning' }[type]
    },
    movementTypeText(type) {
      return {
        in: this.$t('erp.inventory.stockIn'),
        out: this.$t('erp.inventory.stockOut'),
        adjustment: this.$t('erp.inventory.stockAdjustment'),
      }[type] || type
    },
    dateTime(value) {
      return formatDateTime(value)
    },
    notify(text, variant) {
      this.$toast({ component: ToastificationContent, props: { title: variant === 'success' ? this.$t('erp.common.success') : this.$t('erp.common.error'), text, variant } })
    },
  },
}
</script>
