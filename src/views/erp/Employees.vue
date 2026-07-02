<template>
  <erp-resource-page
    :eyebrow="$t('erp.employees.eyebrow')"
    :title="$t('erp.employees.title')"
    :singular="$t('erp.employees.singular')"
    :subtitle="$t('erp.employees.subtitle')"
    :service="erp.employees"
    :fields="fields"
    :form-fields="formFields"
    :default-form="defaultForm"
    :status-options="statuses"
    create-permission="erp.employees.create"
    edit-permission="erp.employees.edit"
    delete-permission="erp.employees.delete"
  />
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
      defaultForm: { name: '', phone: '', email: '', address: '', job_title: '', department: '', hire_date: '', salary: 0, status: 'active' },
    }
  },
  computed: {
    statuses() {
      return [
        { value: 'active', text: this.$t('erp.common.active') },
        { value: 'inactive', text: this.$t('erp.common.inactive') },
        { value: 'terminated', text: this.$t('erp.common.terminated') },
      ]
    },
    fields() {
      return [
        { key: 'name', label: this.$t('erp.employees.employee') },
        { key: 'job_title', label: this.$t('erp.employees.jobTitle') },
        { key: 'department', label: this.$t('erp.employees.department') },
        { key: 'phone', label: this.$t('erp.employees.phone') },
        { key: 'salary', label: this.$t('erp.employees.baseSalary'), formatter: value => this.currency(value) },
        { key: 'hire_date', label: this.$t('erp.employees.hireDate'), formatter: value => this.formatDate(value) },
        { key: 'status', label: this.$t('erp.common.status') },
      ]
    },
    formFields() {
      return [
        { key: 'name', label: this.$t('erp.employees.employeeName'), required: true },
        { key: 'job_title', label: this.$t('erp.employees.jobTitle'), required: true },
        { key: 'department', label: this.$t('erp.employees.department') },
        { key: 'status', label: this.$t('erp.common.status'), type: 'select', options: this.statuses },
        { key: 'phone', label: this.$t('erp.employees.phone') },
        { key: 'email', label: this.$t('erp.employees.email'), type: 'email' },
        { key: 'hire_date', label: this.$t('erp.employees.hireDate'), type: 'date' },
        { key: 'salary', label: this.$t('erp.employees.baseSalary'), type: 'number', step: '0.01', min: 0 },
        { key: 'address', label: this.$t('erp.employees.address'), type: 'textarea', full: true },
      ]
    },
  },
  methods: {
    currency(value) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0))
    },
    formatDate,
  },
}
</script>
