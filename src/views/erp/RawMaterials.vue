<template>
  <erp-resource-page
    :eyebrow="$t('erp.rawMaterials.eyebrow')"
    :title="$t('erp.rawMaterials.title')"
    :singular="$t('erp.rawMaterials.singular')"
    :subtitle="$t('erp.rawMaterials.subtitle')"
    :service="erp.rawMaterials"
    :fields="fields"
    :form-fields="formFields"
    :default-form="defaultForm"
    :status-options="statuses"
    create-permission="erp.raw-materials.create"
    edit-permission="erp.raw-materials.edit"
    delete-permission="erp.raw-materials.delete"
  />
</template>

<script>
import ErpResourcePage from '@/components/erp/ErpResourcePage.vue'
import erp from '@/services/erp'

export default {
  components: { ErpResourcePage },
  data() {
    return {
      erp,
      defaultForm: {
        name: '',
        code: '',
        unit: 'kg',
        description: '',
        cost: 0,
        stock_quantity: 0,
        reorder_level: 0,
        status: 'active',
      },
    }
  },
  computed: {
    statuses() {
      return [
        { value: 'active', text: this.$t('erp.common.active') },
        { value: 'inactive', text: this.$t('erp.common.inactive') },
        { value: 'discontinued', text: this.$t('erp.common.discontinued') },
      ]
    },
    unitOptions() {
      return [
        { value: 'kg', text: this.$t('erp.rawMaterials.units.kg') },
        { value: 'g', text: this.$t('erp.rawMaterials.units.g') },
        { value: 'ton', text: this.$t('erp.rawMaterials.units.ton') },
        { value: 'liter', text: this.$t('erp.rawMaterials.units.liter') },
        { value: 'ml', text: this.$t('erp.rawMaterials.units.ml') },
        { value: 'meter', text: this.$t('erp.rawMaterials.units.meter') },
        { value: 'cm', text: this.$t('erp.rawMaterials.units.cm') },
        { value: 'piece', text: this.$t('erp.rawMaterials.units.piece') },
        { value: 'box', text: this.$t('erp.rawMaterials.units.box') },
        { value: 'pack', text: this.$t('erp.rawMaterials.units.pack') },
        { value: 'roll', text: this.$t('erp.rawMaterials.units.roll') },
        { value: 'bag', text: this.$t('erp.rawMaterials.units.bag') },
        { value: 'unit', text: this.$t('erp.rawMaterials.units.unit') },
      ]
    },
    fields() {
      return [
        { key: 'name', label: this.$t('erp.rawMaterials.material') },
        { key: 'code', label: this.$t('erp.rawMaterials.code') },
        { key: 'unit', label: this.$t('erp.rawMaterials.unit'), formatter: value => this.unitLabel(value) },
        { key: 'cost', label: this.$t('erp.rawMaterials.cost'), formatter: value => this.currency(value) },
        { key: 'stock_quantity', label: this.$t('erp.rawMaterials.stock') },
        { key: 'reorder_level', label: this.$t('erp.rawMaterials.reorderLevel') },
        { key: 'status', label: this.$t('erp.common.status') },
      ]
    },
    formFields() {
      return [
        { key: 'name', label: this.$t('erp.rawMaterials.materialName'), required: true },
        { key: 'code', label: this.$t('erp.rawMaterials.code'), required: true },
        { key: 'status', label: this.$t('erp.common.status'), type: 'select', options: this.statuses },
        { key: 'unit', label: this.$t('erp.rawMaterials.unit'), type: 'select', options: this.unitOptions, required: true },
        { key: 'cost', label: this.$t('erp.rawMaterials.cost'), type: 'number', step: '0.01', min: 0 },
        { key: 'stock_quantity', label: this.$t('erp.rawMaterials.openingStock'), type: 'number', step: '0.001', min: 0 },
        { key: 'reorder_level', label: this.$t('erp.rawMaterials.reorderLevel'), type: 'number', step: '0.001', min: 0 },
        { key: 'description', label: this.$t('erp.products.description'), type: 'textarea', full: true },
      ]
    },
  },
  methods: {
    currency(value) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0))
    },
    unitLabel(value) {
      return this.unitOptions.find(option => option.value === value)?.text || value
    },
  },
}
</script>
