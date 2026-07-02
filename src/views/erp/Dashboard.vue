<template>
  <div class="erp-page">
    <div class="erp-page__heading">
      <div>
        <p class="erp-eyebrow">{{ $t('erp.dashboard.eyebrow') }}</p>
        <h2>{{ $t('erp.dashboard.title') }}</h2>
        <p class="text-muted mb-0">{{ $t('erp.dashboard.description') }}</p>
      </div>
      <div class="d-flex align-items-center">
        <b-form-input v-model="filters.from" type="date" class="mr-50" />
        <b-form-input v-model="filters.to" type="date" class="mr-50" />
        <b-button variant="primary" :disabled="loading" @click="fetchSummary">
          <feather-icon icon="RefreshCwIcon" />
        </b-button>
      </div>
    </div>

    <b-row>
      <b-col v-for="metric in metrics" :key="metric.label" cols="12" sm="6" lg>
        <b-card class="erp-metric">
          <span class="erp-metric__icon" :class="metric.class"><feather-icon :icon="metric.icon" /></span>
          <div class="erp-metric__value">{{ metric.format ? currency(metric.value) : number(metric.value) }}</div>
          <div class="text-muted">{{ metric.label }}</div>
        </b-card>
      </b-col>
    </b-row>

    <b-row>
      <b-col cols="12" lg="8">
        <b-card class="erp-panel">
          <div class="erp-section-title">
            <h4>{{ $t('erp.dashboard.monthlyRevenue') }}</h4>
            <span class="text-muted small">{{ $t('erp.dashboard.lastMonths') }}</span>
          </div>
          <vue-apex-charts height="300" type="area" :options="revenueOptions" :series="revenueSeries" />
        </b-card>
      </b-col>
      <b-col cols="12" lg="4">
        <b-card class="erp-panel">
          <div class="erp-section-title"><h4>{{ $t('erp.dashboard.invoiceStatus') }}</h4></div>
          <vue-apex-charts height="300" type="donut" :options="statusOptions" :series="statusSeries" />
        </b-card>
      </b-col>
    </b-row>

    <b-row>
      <b-col cols="12" lg="7">
        <b-card class="erp-panel">
          <div class="erp-section-title"><h4>{{ $t('erp.dashboard.bestSellingProducts') }}</h4><b-link :to="{ name: 'erp-products' }">{{ $t('erp.dashboard.viewProducts') }}</b-link></div>
          <b-table :items="summary.best_selling_products || []" :fields="bestFields" small responsive show-empty>
            <template #cell(sales_total)="data">{{ currency(data.value) }}</template>
          </b-table>
        </b-card>
      </b-col>
      <b-col cols="12" lg="5">
        <b-card class="erp-panel">
          <div class="erp-section-title"><h4>{{ $t('erp.dashboard.lowStock') }}</h4><b-link :to="{ name: 'erp-inventory' }">{{ $t('erp.dashboard.openInventory') }}</b-link></div>
          <b-table :items="summary.low_stock_products || []" :fields="stockFields" small responsive show-empty>
            <template #cell(stock_quantity)="data"><b-badge variant="light-danger">{{ data.value }}</b-badge></template>
          </b-table>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import VueApexCharts from 'vue-apexcharts'
import erp from '@/services/erp'

export default {
  components: { VueApexCharts },
  data() {
    const today = new Date()
    const first = new Date(today.getFullYear(), today.getMonth(), 1)
    return {
      loading: false,
      filters: { from: this.date(first), to: this.date(today) },
      summary: { totals: {}, monthly_revenue: [], invoice_statuses: [], best_selling_products: [], low_stock_products: [] },
    }
  },
  computed: {
    bestFields() {
      return [
        { key: 'product_name', label: this.$t('erp.dashboard.product') },
        { key: 'sku', label: this.$t('erp.dashboard.sku') },
        { key: 'sold_quantity', label: this.$t('erp.dashboard.units') },
        { key: 'sales_total', label: this.$t('erp.dashboard.sales') },
      ]
    },
    stockFields() {
      return [
        { key: 'name', label: this.$t('erp.dashboard.product') },
        { key: 'sku', label: this.$t('erp.dashboard.sku') },
        { key: 'stock_quantity', label: this.$t('erp.dashboard.stock') },
      ]
    },
    metrics() {
      const totals = this.summary.totals || {}
      return [
        { label: this.$t('erp.dashboard.totalSales'), value: totals.sales, icon: 'TrendingUpIcon', class: 'bg-light-success text-success', format: true },
        { label: this.$t('erp.dashboard.invoices'), value: totals.invoices, icon: 'FileTextIcon', class: 'bg-light-primary text-primary' },
        { label: this.$t('erp.dashboard.customers'), value: totals.customers, icon: 'UsersIcon', class: 'bg-light-info text-info' },
        { label: this.$t('erp.dashboard.products'), value: totals.products, icon: 'PackageIcon', class: 'bg-light-warning text-warning' },
        { label: this.$t('erp.dashboard.employees'), value: totals.employees, icon: 'BriefcaseIcon', class: 'bg-light-secondary text-secondary' },
      ]
    },
    revenueSeries() {
      return [{ name: this.$t('erp.dashboard.revenue'), data: (this.summary.monthly_revenue || []).map(item => Number(item.revenue)) }]
    },
    revenueOptions() {
      return {
        chart: { toolbar: { show: false }, zoom: { enabled: false } },
        colors: ['#16856b'],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        fill: { type: 'solid', opacity: 0.12 },
        xaxis: { categories: (this.summary.monthly_revenue || []).map(item => item.month) },
        yaxis: { labels: { formatter: value => this.compactCurrency(value) } },
        grid: { borderColor: '#eef0f2' },
      }
    },
    statusSeries() {
      return (this.summary.invoice_statuses || []).map(item => Number(item.count))
    },
    statusOptions() {
      return {
        labels: (this.summary.invoice_statuses || []).map(item => this.statusText(item.status)),
        colors: ['#16856b', '#d99b2b', '#d84b4b'],
        legend: { position: 'bottom' },
        dataLabels: { enabled: false },
      }
    },
  },
  mounted() {
    this.fetchSummary()
  },
  methods: {
    async fetchSummary() {
      this.loading = true
      try {
        const { data } = await erp.reports.summary(this.filters)
        this.summary = data
      } finally {
        this.loading = false
      }
    },
    currency(value) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0))
    },
    compactCurrency(value) {
      return new Intl.NumberFormat('en-US', { notation: 'compact', style: 'currency', currency: 'USD' }).format(Number(value || 0))
    },
    number(value) {
      return new Intl.NumberFormat('en-US').format(Number(value || 0))
    },
    date(value) {
      return value.toISOString().slice(0, 10)
    },
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
