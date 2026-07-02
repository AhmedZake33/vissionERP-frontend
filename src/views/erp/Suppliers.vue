<template>
  <erp-resource-page
    :eyebrow="$t('erp.suppliers.eyebrow')"
    :title="$t('erp.suppliers.title')"
    :singular="$t('erp.suppliers.singular')"
    :subtitle="$t('erp.suppliers.subtitle')"
    :service="erp.suppliers"
    :fields="fields"
    :form-fields="formFields"
    :default-form="defaultForm"
    :status-options="statuses"
    create-permission="erp.suppliers.create"
    edit-permission="erp.suppliers.edit"
    delete-permission="erp.suppliers.delete"
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
      defaultForm: { name: '', phone: '', email: '', address: '', notes: '', status: 'active' },
    }
  },
  computed: {
    statuses() {
      return [{ value: 'active', text: this.$t('erp.common.active') }, { value: 'inactive', text: this.$t('erp.common.inactive') }]
    },
    fields() {
      return [
        { key: 'name', label: this.$t('erp.suppliers.supplier') },
        { key: 'phone', label: this.$t('erp.customers.phone') },
        { key: 'email', label: this.$t('erp.customers.email') },
        { key: 'status', label: this.$t('erp.common.status') },
      ]
    },
    formFields() {
      return [
        { key: 'name', label: this.$t('erp.suppliers.supplierName'), required: true },
        { key: 'phone', label: this.$t('erp.customers.phone') },
        { key: 'email', label: this.$t('erp.customers.email'), type: 'email' },
        { key: 'status', label: this.$t('erp.common.status'), type: 'select', options: this.statuses },
        { key: 'address', label: this.$t('erp.customers.address'), type: 'textarea', full: true },
        { key: 'notes', label: this.$t('erp.common.notes'), type: 'textarea', full: true },
      ]
    },
  },
}
</script>