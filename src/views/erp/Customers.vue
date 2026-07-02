<template>
  <erp-resource-page
    :eyebrow="$t('erp.customers.eyebrow')"
    :title="$t('erp.customers.title')"
    :singular="$t('erp.customers.singular')"
    :subtitle="$t('erp.customers.subtitle')"
    :service="erp.customers"
    :fields="fields"
    :form-fields="formFields"
    :default-form="defaultForm"
    :status-options="statuses"
    create-permission="erp.customers.create"
    edit-permission="erp.customers.edit"
    delete-permission="erp.customers.delete"
  >
    <template #details="{ item }">
      <div v-if="item && item.invoices && item.invoices.length" class="mt-2">
        <h6>{{ $t('erp.customers.recentInvoices') }}</h6>
        <b-table :items="item.invoices" :fields="invoiceFields" small responsive>
          <template #cell(total)="data">{{ currency(data.value) }}</template>
          <template #cell(status)="data"><b-badge variant="light-primary">{{ statusText(data.value) }}</b-badge></template>
        </b-table>
      </div>
    </template>
  </erp-resource-page>
</template>

<script>
import ErpResourcePage from '@/components/erp/ErpResourcePage.vue'
import erp from '@/services/erp'
import { formatDate } from '@/utils/dateFormat'

export default {
  components: { ErpResourcePage },
  data() {
    return {
      erp,
      defaultForm: { name: '', phone: '', email: '', address: '', balance: 0, status: 'active' },
    }
  },
  computed: {
    statuses() {
      return [{ value: 'active', text: this.$t('erp.common.active') }, { value: 'inactive', text: this.$t('erp.common.inactive') }]
    },
    fields() {
      return [
        { key: 'name', label: this.$t('erp.customers.customer') },
        { key: 'phone', label: this.$t('erp.customers.phone') },
        { key: 'email', label: this.$t('erp.customers.email') },
        { key: 'invoices_count', label: this.$t('erp.customers.invoices') },
        { key: 'balance', label: this.$t('erp.customers.balance'), formatter: value => this.currency(value) },
        { key: 'status', label: this.$t('erp.common.status') },
      ]
    },
    invoiceFields() {
      return [
        { key: 'invoice_number', label: this.$t('erp.customers.invoice') },
        { key: 'invoice_date', label: this.$t('erp.customers.date'), formatter: value => this.formatDate(value) },
        { key: 'total', label: this.$t('erp.customers.total') },
        { key: 'status', label: this.$t('erp.common.status') },
      ]
    },
    formFields() {
      return [
        { key: 'name', label: this.$t('erp.customers.customerName'), required: true },
        { key: 'phone', label: this.$t('erp.customers.phone') },
        { key: 'email', label: this.$t('erp.customers.email'), type: 'email' },
        { key: 'balance', label: this.$t('erp.customers.openingBalance'), type: 'number', step: '0.01' },
        { key: 'status', label: this.$t('erp.common.status'), type: 'select', options: this.statuses },
        { key: 'address', label: this.$t('erp.customers.address'), type: 'textarea', full: true },
      ]
    },
  },
  methods: {
    currency(value) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0))
    },
    formatDate,
    statusText(value) {
      const normalized = String(value || '')
      const key = normalized.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      const translationKey = `erp.common.${key}`
      const translated = this.$t(translationKey)
      return translated === translationKey ? normalized.replaceAll('_', ' ') : translated
    },
  },
}
</script>
