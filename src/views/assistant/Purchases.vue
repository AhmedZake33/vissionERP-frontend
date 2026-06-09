<template>
  <div>
    <b-card>
      <b-row class="mb-2">
        <b-col cols="12" md="4">
          <h4>{{ $t('purchases.purchasesList') }}</h4>
        </b-col>
        <b-col cols="12" md="8" class="text-right">
          <b-button v-permission="['assistant.create-purchases','doctor.create-purchases']" variant="primary" @click="showAddModalFlag = true" :disabled="loading">
            <feather-icon icon="PlusIcon" class="mr-50" />
            {{ $t('purchases.newPurchase') }}
          </b-button>
        </b-col>
      </b-row>

      <b-form @submit.prevent="applyFilters" class="mb-2">
        <b-row>
        <b-col cols="12" sm="6" md="3" class="mb-1 mb-md-0">
            <b-form-input type="date" v-model="filters.from" :placeholder="$t('filters.from')"></b-form-input>
          </b-col>
          <b-col cols="12" sm="6" md="3" class="mb-1 mb-md-0">
            <b-form-input type="date" v-model="filters.to" :placeholder="$t('filters.to')"></b-form-input>
          </b-col>
          <b-col cols="12" sm="6" md="3" class="mb-1 mb-md-0">
            <b-form-select v-model="filters.category" :options="categoryOptions" />
          </b-col>
          <b-col cols="12" sm="6" md="3" class="purchase-filter-actions text-right">
            <b-button class="mr-1" type="submit" variant="primary">{{ $t('filters.apply') }}</b-button>
            <b-button variant="danger" @click="resetFilters">{{ $t('filters.reset') }}</b-button>
          </b-col>
        </b-row>
      </b-form>

    <!-- Summary: Total purchases for selected period -->
    <b-row class="mb-2">
      <b-col cols="12" md="4">
        <b-card class="text-center border">
          <b-card-text class="text-muted small mb-0">{{ $t('purchases.periodTotal') }}</b-card-text>
          <h3 class="mb-0 text-primary">{{ formatCurrency(stats.periodTotal) }}</h3>
        </b-card>
      </b-col>
    </b-row>

      <b-modal v-model="showAddModalFlag" :title="$t('purchases.newPurchase')" hide-footer size="lg">
        <purchase-form :modal-mode="true" @saved="onSaved"></purchase-form>
      </b-modal>

      <div v-if="loading" class="text-center my-4">
        <b-spinner label="Loading..." small></b-spinner>
        <div class="mt-2">{{ $t('messages.loading') }}</div>
      </div>

      <b-table
        class="mt-3 d-none d-md-block"
        :items="purchases.data || []"
        :fields="translatedFields"
        responsive
        striped
        hover
        :busy="loading"
        show-empty
      >
        <template #empty>
          <div class="text-center text-muted py-2">{{ $t('purchases.noRecords') }}</div>
        </template>
        <template #cell(purchase_date)="data">
          {{ formatDate(data.item.purchase_date) }}
        </template>
        <template #cell(category)="data">
          <div>
            <div v-if="$i18n.locale == 'en'">{{ (data.item.category_labels && data.item.category_labels.en) || data.item.category }}</div>
            <div v-else>{{ (data.item.category_labels && data.item.category_labels.ar) || data.item.category }}</div>
          </div>
        </template>
        <template #cell(amount_paid)="data">
          {{ (Number(data.item.amount_paid) || 0).toFixed(2) }}
        </template>
        <template #cell(actions)="data">
          <router-link :to="{ name: editRouteName, params: { id: data.item.id } }">{{ $t('actions.edit') }}</router-link>
        </template>
      </b-table>

      <div class="d-md-none mt-2">
        <div v-if="!loading && !(purchases.data || []).length" class="text-center text-muted py-2">
          {{ $t('purchases.noRecords') }}
        </div>
        <b-card
          v-for="item in purchases.data || []"
          :key="item.id"
          no-body
          class="purchase-mobile-card mb-1"
        >
          <div class="purchase-mobile-card__header">
            <div>
              <h6 class="mb-25">{{ item.item_name }}</h6>
              <small class="text-muted">{{ formatDate(item.purchase_date) }}</small>
            </div>
            <strong class="text-primary">{{ formatCurrency(item.amount_paid) }}</strong>
          </div>
          <div class="purchase-mobile-card__body">
            <div>
              <small>{{ $t('purchases.category') }}</small>
              <span>{{ categoryLabel(item) }}</span>
            </div>
            <div>
              <small>{{ $t('purchases.supplier') }}</small>
              <span>{{ item.supplier || '-' }}</span>
            </div>
            <div>
              <small>{{ $t('purchases.paymentMethod') }}</small>
              <span>{{ item.payment_method || '-' }}</span>
            </div>
          </div>
          <div class="purchase-mobile-card__actions">
            <router-link
              class="btn btn-sm btn-outline-primary"
              :to="{ name: editRouteName, params: { id: item.id } }"
            >
              {{ $t('actions.edit') }}
            </router-link>
          </div>
        </b-card>
      </div>
      <b-pagination
        v-model="pagination.current_page"
        :total-rows="pagination.total"
        :per-page="pagination.per_page"
        @change="onPageChange"
        class="mt-2"
        align="center"
      />
      <div class="text-center text-muted small mt-1" v-if="pagination.total">
        {{ paginationCountText(pagination) }}
      </div>
    </b-card>
  </div>
</template>

<script>
import purchasesApi from '@/services/purchases'
import PurchaseForm from './PurchaseForm.vue'

export default {
  data() {
    return {
      purchases: {},
      showAddModalFlag: false,
      loading: false,
      pagination: {
        current_page: 1,
        per_page: 10,
        total: 0,
      },
      // filters
      filters: {
        from: new Date().toISOString().substr(0, 10),
        to: new Date().toISOString().substr(0, 10),
        category: '',
      },
      // stats (only period total required)
      stats: {
        periodTotal: 0,
      },
      fields: [
        { key: 'purchase_date', label: 'purchases.purchaseDate' },
        { key: 'item_name', label: 'purchases.itemName' },
        { key: 'category', label: 'purchases.category' },
        { key: 'amount_paid', label: 'purchases.amountPaid' },
        { key: 'supplier', label: 'purchases.supplier' },
        { key: 'payment_method', label: 'purchases.paymentMethod' },
        { key: 'actions', label: 'table.actions' },
      ],
    }
  },
  computed: {
    translatedFields() {
      return this.fields.map(field => ({ ...field, label: this.$t(field.label) }))
    },
    categoryOptions() {
      return [
        { value: '', text: this.$t('categoryOptions.selectCategory') },
        { value: 'Medical Supplies', text: this.$t('categoryOptions.medicalSupplies') },
        { value: 'Equipment', text: this.$t('categoryOptions.equipment') },
        { value: 'Services', text: this.$t('categoryOptions.services') },
        { value: 'Maintenance', text: this.$t('categoryOptions.maintenance') },
        { value: 'Other', text: this.$t('categoryOptions.other') },
      ]
    },
    editRouteName() {
      return this.$route.name === 'doctor-purchases' ? 'doctor-purchase-edit' : 'assistant-purchase-edit'
    },
  },
  async created() {
    await this.load()
    await this.loadStats()
  },
  methods: {
    async load() {
      this.loading = true
      try {
        const params = { ...this.filters, page: this.pagination.current_page, per_page: this.pagination.per_page }
        const res = await purchasesApi.getPurchases(params)
        // Debug: log response shape so we can troubleshoot UI vs API
        console.log('GET /purchases response:', res)
        // Handle both paginated responses (res.data is object with .data array)
        // and plain arrays (res.data is an array)
        if (Array.isArray(res.data)) {
          this.purchases = { data: res.data, total: res.data.length, per_page: res.data.length, current_page: 1 }
        } else {
          this.purchases = res.data
        }
        // Update pagination state if present
        if (this.purchases && typeof this.purchases.current_page !== 'undefined') {
          this.pagination.current_page = this.purchases.current_page
        }
        if (this.purchases && typeof this.purchases.per_page !== 'undefined') {
          this.pagination.per_page = this.purchases.per_page
        }
        if (this.purchases && typeof this.purchases.total !== 'undefined') {
          this.pagination.total = this.purchases.total
        }
      } finally {
        this.loading = false
      }
    },
      async applyFilters() {
        await this.load()
        await this.loadStats()
      },
    onSaved(purchase) {
      this.showAddModalFlag = false
      this.load()
      this.loadStats()
    },
    formatDate(d) {
      if (!d) return ''
      const dt = new Date(d)
      if (isNaN(dt)) return d
      return dt.toLocaleDateString()
    },
    
    async loadStats() {
      try {
        const from = this.filters.from || undefined
        const to = this.filters.to || undefined
        let params = { category: this.filters.category || undefined }
        if (from && to) {
          params.from = from
          params.to = to
        } else if (from) {
          params.date = from
        }
        // request stats (POST) and extract period total
        const res = await purchasesApi.stats(params)
        console.debug('purchases.stats response', res)
        const payload = (res && typeof res.data !== 'undefined') ? res.data : res
        this.stats.periodTotal = payload.period_total || payload.periodTotal || 0
      } catch (e) {
        console.error('loadStats error', e)
      }
    },
    formatCurrency(value) {
      return parseFloat(value || 0).toFixed(2)
    },
    categoryLabel(item) {
      if (!item) return ''
      const labels = item.category_labels || {}
      return this.$i18n.locale === 'en'
        ? labels.en || item.category
        : labels.ar || item.category
    },
    onPageChange(page) {
      this.pagination.current_page = page
      this.load()
    },
    paginationCountText(paginationState) {
      if (!paginationState || !paginationState.total) return '0 / 0'
      const from = ((paginationState.current_page - 1) * paginationState.per_page) + 1
      const to = Math.min(paginationState.current_page * paginationState.per_page, paginationState.total)
      return `${from}-${to} / ${paginationState.total}`
    },
    resetFilters() {
      const today = new Date().toISOString().substr(0, 10)
      this.filters.from = today
      this.filters.to = today
      this.filters.category = ''
      this.load()
      this.loadStats()
    },
  },
  components: {
    PurchaseForm,
  },
}
</script>

<style scoped>
.purchase-filter-actions {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
}

.purchase-mobile-card {
  border: 1px solid #ebe9f1;
}

.purchase-mobile-card__header,
.purchase-mobile-card__body,
.purchase-mobile-card__actions {
  padding: 0.85rem 1rem;
}

.purchase-mobile-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  border-bottom: 1px solid #ebe9f1;
}

.purchase-mobile-card__body {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  background: #f8f8f8;
}

.purchase-mobile-card__body small {
  display: block;
  color: #6e6b7b;
  margin-bottom: 0.2rem;
}

.purchase-mobile-card__body span {
  display: block;
  word-break: break-word;
}

.purchase-mobile-card__actions {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 767.98px) {
  .purchase-filter-actions {
    gap: 0.5rem;
  }

  .purchase-filter-actions .btn {
    flex: 1 1 0;
  }
}
</style>
