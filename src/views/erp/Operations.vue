<template>
  <div class="erp-page">
    <div class="erp-page__heading">
      <div>
        <p class="erp-eyebrow">{{ $t('erp.operations.eyebrow') }}</p>
        <h2>{{ $t('erp.operations.title') }}</h2>
        <p class="text-muted mb-0">{{ $t('erp.operations.subtitle') }}</p>
      </div>
    </div>

    <b-card class="erp-panel">
      <div class="erp-toolbar">
        <b-form-select v-model="filters.product_id" :options="productOptions" class="erp-filter" />
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
import { formatDateTime } from '@/utils/dateFormat'

export default {
  data() {
    return {
      items: [],
      products: [],
      loading: false,
      filters: { product_id: '', type: '', from: '', to: '' },
      pagination: { current_page: 1, per_page: 15, total: 0, from: 0, to: 0 },
    }
  },
  computed: {
    fields() {
      return [
        { key: 'product.name', label: this.$t('erp.products.product') },
        { key: 'product.sku', label: this.$t('erp.dashboard.sku') },
        { key: 'type', label: this.$t('erp.common.type') },
        { key: 'quantity', label: this.$t('erp.common.quantity') },
        { key: 'stock', label: this.$t('erp.operations.stockBeforeAfter') },
        { key: 'reference', label: this.$t('erp.operations.reference') },
        { key: 'creator.name', label: this.$t('erp.inventory.recordedBy') },
        { key: 'created_at', label: this.$t('erp.common.date') },
      ]
    },
    productOptions() {
      return [{ value: '', text: this.$t('erp.common.allProducts') }, ...this.products.map(item => ({ value: item.id, text: item.name }))]
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
    Promise.all([this.fetch(), this.fetchProducts()])
  },
  methods: {
    async fetch() {
      this.loading = true
      try {
        const params = { ...this.filters, page: this.pagination.current_page, per_page: this.pagination.per_page }
        Object.keys(params).forEach(key => params[key] === '' && delete params[key])
        const { data } = await erp.operations.list(params)
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
    async fetchProducts() {
      const { data } = await erp.products.list({ per_page: 100 })
      this.products = data.data || data
    },
    applyFilters() {
      this.pagination.current_page = 1
      this.fetch()
    },
    resetFilters() {
      this.filters = { product_id: '', type: '', from: '', to: '' }
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
      return {
        in: this.$t('erp.inventory.stockIn'),
        out: this.$t('erp.inventory.stockOut'),
        adjustment: this.$t('erp.inventory.stockAdjustment'),
      }[type] || type
    },
    referenceText(item) {
      if (!item.reference_type) return '-'
      const model = String(item.reference_type).split('\\').pop()
      return `${model} #${item.reference_id || '-'}`
    },
    formatDateTime,
  },
}
</script>
