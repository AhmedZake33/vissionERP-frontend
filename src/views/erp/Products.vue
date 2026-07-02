<template>
  <div>
    <b-tabs content-class="mt-2">
      <b-tab :title="$t('erp.products.products')" active>
        <erp-resource-page
          :eyebrow="$t('erp.products.eyebrow')"
          :title="$t('erp.products.products')"
          :singular="$t('erp.products.product')"
          :subtitle="$t('erp.products.subtitle')"
          :service="erp.products"
          :fields="productFields"
          :form-fields="productFormFields"
          :default-form="productForm"
          :status-options="productStatuses"
          create-permission="erp.products.create"
          edit-permission="erp.products.edit"
          delete-permission="erp.products.delete"
        />
      </b-tab>
      <b-tab :title="$t('erp.products.categories')">
        <erp-resource-page
          :eyebrow="$t('erp.products.categoryEyebrow')"
          :title="$t('erp.products.categories')"
          :singular="$t('erp.products.category')"
          :subtitle="$t('erp.products.categorySubtitle')"
          :service="erp.categories"
          :fields="categoryFields"
          :form-fields="categoryFormFields"
          :default-form="categoryForm"
          :status-options="categoryStatuses"
          create-permission="erp.categories.create"
          edit-permission="erp.categories.edit"
          delete-permission="erp.categories.delete"
        />
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import ErpResourcePage from '@/components/erp/ErpResourcePage.vue'
import erp from '@/services/erp'

export default {
  components: { ErpResourcePage },
  data() {
    return {
      erp,
      categories: [],
      productForm: { product_category_id: null, name: '', sku: '', description: '', price: 0, cost: 0, stock_quantity: 0, low_stock_threshold: 5, status: 'active' },
      categoryForm: { name: '', description: '', status: 'active' },
    }
  },
  computed: {
    productFields() {
      return [
        { key: 'name', label: this.$t('erp.products.product') },
        { key: 'sku', label: this.$t('erp.dashboard.sku') },
        { key: 'category.name', label: this.$t('erp.products.category') },
        { key: 'price', label: this.$t('erp.products.price'), formatter: value => this.currency(value) },
        { key: 'cost', label: this.$t('erp.products.cost'), formatter: value => this.currency(value) },
        { key: 'stock_quantity', label: this.$t('erp.products.stock') },
        { key: 'status', label: this.$t('erp.common.status') },
      ]
    },
    categoryFields() {
      return [
        { key: 'name', label: this.$t('erp.products.category') },
        { key: 'products_count', label: this.$t('erp.products.productsCount') },
        { key: 'description', label: this.$t('erp.products.description') },
        { key: 'status', label: this.$t('erp.common.status') },
      ]
    },
    productStatuses() {
      return [
        { value: 'active', text: this.$t('erp.common.active') },
        { value: 'inactive', text: this.$t('erp.common.inactive') },
        { value: 'discontinued', text: this.$t('erp.common.discontinued') },
      ]
    },
    categoryStatuses() {
      return [
        { value: 'active', text: this.$t('erp.common.active') },
        { value: 'inactive', text: this.$t('erp.common.inactive') },
      ]
    },
    productFormFields() {
      return [
        { key: 'name', label: this.$t('erp.products.productName'), required: true },
        { key: 'sku', label: this.$t('erp.products.sku'), required: true },
        { key: 'product_category_id', label: this.$t('erp.products.category'), type: 'select', options: [{ value: null, text: this.$t('erp.products.noCategory') }, ...this.categories.map(item => ({ value: item.id, text: item.name }))] },
        { key: 'status', label: this.$t('erp.common.status'), type: 'select', options: this.productStatuses },
        { key: 'price', label: this.$t('erp.products.sellingPrice'), type: 'number', step: '0.01', min: 0, required: true },
        { key: 'cost', label: this.$t('erp.products.cost'), type: 'number', step: '0.01', min: 0 },
        { key: 'stock_quantity', label: this.$t('erp.products.openingStock'), type: 'number', min: 0 },
        { key: 'low_stock_threshold', label: this.$t('erp.products.lowStockThreshold'), type: 'number', min: 0 },
        { key: 'description', label: this.$t('erp.products.description'), type: 'textarea', full: true },
      ]
    },
    categoryFormFields() {
      return [
        { key: 'name', label: this.$t('erp.products.categoryName'), required: true },
        { key: 'status', label: this.$t('erp.common.status'), type: 'select', options: this.categoryStatuses, required: true },
        { key: 'description', label: this.$t('erp.products.description'), type: 'textarea', full: true },
      ]
    },
  },
  mounted() {
    this.fetchCategories()
  },
  methods: {
    async fetchCategories() {
      const { data } = await erp.categories.list({ per_page: 100, status: 'active' })
      this.categories = data.data || data
    },
    currency(value) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0))
    },
  },
}
</script>
