<template>
  <div class="erp-page">
    <div class="erp-page__heading">
      <div>
        <p class="erp-eyebrow">{{ $t('erp.reports.eyebrow') }}</p>
        <h2>{{ $t('erp.reports.title') }}</h2>
        <p class="text-muted mb-0">{{ $t('erp.reports.subtitle') }}</p>
      </div>
      <div>
        <b-button variant="outline-primary" class="mr-50" @click="exportCsv"><feather-icon icon="DownloadIcon" class="mr-50" /> CSV</b-button>
        <b-button variant="primary" @click="printReport"><feather-icon icon="PrinterIcon" class="mr-50" /> {{ $t('erp.reports.printPdf') }}</b-button>
      </div>
    </div>

    <b-card class="erp-panel mb-2">
      <b-form inline @submit.prevent="fetchReport">
        <b-form-group :label="$t('erp.common.from')" class="mr-1"><b-form-input v-model="filters.from" type="date" /></b-form-group>
        <b-form-group :label="$t('erp.common.to')" class="mr-1"><b-form-input v-model="filters.to" type="date" /></b-form-group>
        <b-button type="submit" variant="primary" :disabled="loading"><b-spinner v-if="loading" small class="mr-50" /> {{ $t('erp.reports.runReport') }}</b-button>
      </b-form>
    </b-card>

    <div id="erp-report-print">
      <b-row>
        <b-col v-for="metric in metrics" :key="metric.label" cols="12" sm="6" lg>
          <b-card class="erp-metric">
            <div class="text-muted">{{ metric.label }}</div>
            <div class="erp-metric__value">{{ metric.currency ? money(metric.value) : number(metric.value) }}</div>
          </b-card>
        </b-col>
      </b-row>

      <b-row>
        <b-col cols="12" lg="7">
          <b-card class="erp-panel">
            <div class="erp-section-title"><h4>{{ $t('erp.reports.monthlySalesRevenue') }}</h4></div>
            <vue-apex-charts type="bar" height="300" :options="chartOptions" :series="chartSeries" />
          </b-card>
        </b-col>
        <b-col cols="12" lg="5">
          <b-card class="erp-panel">
            <div class="erp-section-title"><h4>{{ $t('erp.reports.invoiceStatusReport') }}</h4></div>
            <b-table :items="report.invoice_statuses || []" :fields="statusFields" small responsive>
              <template #cell(status)="data"><b-badge variant="light-primary">{{ statusText(data.value) }}</b-badge></template>
              <template #cell(total)="data">{{ money(data.value) }}</template>
            </b-table>
          </b-card>
        </b-col>
      </b-row>

      <b-row>
        <b-col cols="12" lg="7">
          <b-card class="erp-panel">
            <div class="erp-section-title"><h4>{{ $t('erp.reports.productSalesReport') }}</h4></div>
            <b-table :items="report.best_selling_products || []" :fields="productFields" responsive>
              <template #cell(sales_total)="data">{{ money(data.value) }}</template>
            </b-table>
          </b-card>
        </b-col>
        <b-col cols="12" lg="5">
          <b-card class="erp-panel">
            <div class="erp-section-title"><h4>{{ $t('erp.reports.stockRiskReport') }}</h4></div>
            <b-table :items="report.low_stock_products || []" :fields="stockFields" responsive>
              <template #cell(stock_quantity)="data"><b-badge variant="light-danger">{{ data.value }}</b-badge></template>
            </b-table>
          </b-card>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import VueApexCharts from 'vue-apexcharts'
import erp from '@/services/erp'

export default {
  components: { VueApexCharts },
  data() {
    const now = new Date()
    return {
      loading: false,
      filters: {
        from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10),
        to: now.toISOString().slice(0, 10),
      },
      report: { totals: {}, monthly_revenue: [], invoice_statuses: [], best_selling_products: [], low_stock_products: [] },
    }
  },
  computed: {
    statusFields() {
      return [{ key: 'status', label: this.$t('erp.common.status') }, { key: 'count', label: this.$t('erp.dashboard.invoices') }, { key: 'total', label: this.$t('erp.reports.value') }]
    },
    productFields() {
      return [{ key: 'product_name', label: this.$t('erp.dashboard.product') }, { key: 'sku', label: this.$t('erp.dashboard.sku') }, { key: 'sold_quantity', label: this.$t('erp.dashboard.units') }, { key: 'sales_total', label: this.$t('erp.dashboard.sales') }]
    },
    stockFields() {
      return [{ key: 'name', label: this.$t('erp.dashboard.product') }, { key: 'sku', label: this.$t('erp.dashboard.sku') }, { key: 'stock_quantity', label: this.$t('erp.dashboard.stock') }, { key: 'low_stock_threshold', label: this.$t('erp.reports.threshold') }]
    },
    metrics() {
      const totals = this.report.totals || {}
      return [
        { label: this.$t('erp.dashboard.sales'), value: totals.sales, currency: true },
        { label: this.$t('erp.dashboard.invoices'), value: totals.invoices },
        { label: this.$t('erp.dashboard.customers'), value: totals.customers },
        { label: this.$t('erp.dashboard.products'), value: totals.products },
        { label: this.$t('erp.dashboard.employees'), value: totals.employees },
      ]
    },
    chartSeries() {
      return [{ name: this.$t('erp.dashboard.revenue'), data: (this.report.monthly_revenue || []).map(item => Number(item.revenue)) }]
    },
    chartOptions() {
      return {
        chart: { toolbar: { show: false } },
        colors: ['#2764d8'],
        plotOptions: { bar: { borderRadius: 3, columnWidth: '46%' } },
        dataLabels: { enabled: false },
        xaxis: { categories: (this.report.monthly_revenue || []).map(item => item.month) },
        grid: { borderColor: '#eef0f2' },
      }
    },
  },
  mounted() {
    this.fetchReport()
  },
  methods: {
    async fetchReport() {
      this.loading = true
      try {
        const { data } = await erp.reports.summary(this.filters)
        this.report = data
      } finally {
        this.loading = false
      }
    },
    exportCsv() {
      const rows = [
        ['ERP Report', `${this.filters.from} to ${this.filters.to}`],
        [],
        ['Metric', 'Value'],
        ...this.metrics.map(item => [item.label, item.value || 0]),
        [],
        ['Product', 'SKU', 'Sold quantity', 'Sales total'],
        ...(this.report.best_selling_products || []).map(item => [item.product_name, item.sku, item.sold_quantity, item.sales_total]),
        [],
        ['Low stock product', 'SKU', 'Stock', 'Threshold'],
        ...(this.report.low_stock_products || []).map(item => [item.name, item.sku, item.stock_quantity, item.low_stock_threshold]),
      ]
      const csv = rows.map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')
      const link = document.createElement('a')
      link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
      link.download = `erp-report-${this.filters.from}-${this.filters.to}.csv`
      link.click()
      URL.revokeObjectURL(link.href)
    },
    printReport() {
      window.print()
    },
    money(value) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0))
    },
    number(value) {
      return new Intl.NumberFormat('en-US').format(Number(value || 0))
    },
    statusText(value) {
      const key = String(value || '').replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      const translationKey = `erp.common.${key}`
      const translated = this.$t(translationKey)
      return translated === translationKey ? String(value || '').replaceAll('_', ' ') : translated
    },
  },
}
</script>

<style>
@media print {
  body * { visibility: hidden; }
  #erp-report-print, #erp-report-print * { visibility: visible; }
  #erp-report-print { position: absolute; inset: 0; width: 100%; }
  .main-menu, .header-navbar, .footer { display: none !important; }
}
</style>
