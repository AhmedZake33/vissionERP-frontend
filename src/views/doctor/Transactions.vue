<template>
  <div>
    <div v-if="pageLoading" class="text-center py-5">
      <b-spinner variant="primary" class="mb-1" />
      <div class="text-muted">{{ $t('messages.loading') }}</div>
    </div>

    <div v-else>
      <b-card>
        <b-row class="mb-2">
          <b-col cols="12" md="6">
            <h4>{{ $t('transaction.transactions') }}</h4>
          </b-col>
        </b-row>

        <!-- Filters -->
        <b-form @submit.prevent="applyFilters" class="mb-2">
          <b-row>
            <b-col cols="6" md="3" class="mb-1 mb-md-0">
              <b-form-select v-model="filters.payment_method" :options="paymentMethodOptions" />
            </b-col>
            <b-col cols="6" md="3" class="mb-1 mb-md-0">
              <b-form-input v-model="filters.date_from" type="date" :placeholder="$t('transaction.dateFrom')" />
            </b-col>
            <b-col cols="6" md="3" class="mb-1 mb-md-0">
              <b-form-input v-model="filters.date_to" type="date" :placeholder="$t('transaction.dateTo')" />
            </b-col>
            <b-col cols="12" md="3" class="transaction-filter-actions text-right">
              <b-button type="submit" variant="primary" class="mr-1" :disabled="loading">
                {{ $t('filters.apply') }}
              </b-button>
              <b-button variant="outline-secondary" size="sm" @click="resetFilters" :disabled="loading">
                {{ $t('filters.reset') }}
              </b-button>
            </b-col>
          </b-row>
        </b-form>

        <b-table
          class="d-none d-md-block"
          :items="transactions"
          :fields="fields"
          responsive
          striped
          hover
          :busy="loading"
          show-empty
        >
          <template #cell(amount)="data">
            <strong class="text-success">{{ formatCurrency(data.value) }}</strong>
          </template>
          <template #cell(payment_method)="data">
            {{ $t('financial.' + data.value) }}
          </template>
          <template #cell(financial.client.name)="data">
            {{ data.value || '-' }}
          </template>
          <template #cell(created_at)="data">
            {{ formatDateTime(data.value) }}
          </template>

          <template #table-busy>
            <div class="text-center my-2">
              <b-spinner class="align-middle" />
            </div>
          </template>

          <template #empty>
            <div class="text-center text-muted py-3">
              {{ $t('transaction.noTransactions') }}
            </div>
          </template>
        </b-table>

        <div class="d-md-none">
          <div v-if="loading" class="text-center my-2">
            <b-spinner class="align-middle" />
          </div>
          <div v-else-if="!transactions.length" class="text-center text-muted py-3">
            {{ $t('transaction.noTransactions') }}
          </div>
          <b-card
            v-for="transaction in transactions"
            v-else
            :key="transaction.id"
            no-body
            class="transaction-mobile-card mb-1"
          >
            <div class="transaction-mobile-card__header">
              <div>
                <h6 class="mb-25">
                  {{ transaction.financial && transaction.financial.client ? transaction.financial.client.name : '-' }}
                </h6>
                <small class="text-muted">{{ formatDateTime(transaction.created_at) }}</small>
              </div>
              <strong class="text-success">{{ formatCurrency(transaction.amount) }}</strong>
            </div>
            <div class="transaction-mobile-card__body">
              <div>
                <small>{{ $t('financial.paymentMethod') }}</small>
                <span>{{ $t('financial.' + transaction.payment_method) }}</span>
              </div>
              <div>
                <small>{{ $t('financial.createdBy') }}</small>
                <span>{{ transaction.creator ? transaction.creator.name : '-' }}</span>
              </div>
              <div v-if="transaction.notes" class="transaction-mobile-card__notes">
                <small>{{ $t('reservation.notes') }}</small>
                <span>{{ transaction.notes }}</span>
              </div>
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
  </div>
</template>

<script>
import {
  BCard,
  BRow,
  BCol,
  BButton,
  BTable,
  BPagination,
  BForm,
  BFormGroup,
  BFormInput,
  BFormSelect,
  BSpinner,
} from 'bootstrap-vue'
import financialsService from '@/services/financials'

export default {
  components: {
    BCard,
    BRow,
    BCol,
    BButton,
    BTable,
    BPagination,
    BForm,
    BFormGroup,
    BFormInput,
    BFormSelect,
    BSpinner,
  },
  data() {
    return {
      transactions: [],
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
      },
      pageLoading: true,
      loading: false,
      filters: {
        payment_method: '',
        date_from: '',
        date_to: '',
      },
    }
  },
  async mounted() {
    try {
      await this.fetchTransactions()
    } finally {
      this.pageLoading = false
    }
  },
  computed: {
    fields() {
      return [
        { key: 'financial.client.name', label: this.$t('table.client') },
        { key: 'amount', label: this.$t('transaction.amount') },
        { key: 'payment_method', label: this.$t('financial.paymentMethod') },
        { key: 'creator.name', label: this.$t('financial.createdBy') },
        { key: 'notes', label: this.$t('reservation.notes') },
        { key: 'created_at', label: this.$t('reservation.created'), sortable: true },
      ]
    },
    paymentMethodOptions() {
      return [
        { value: '', text: this.$t('filters.all') },
        { value: 'cash', text: this.$t('financial.cash') },
        { value: 'card', text: this.$t('financial.card') },
        { value: 'transfer', text: this.$t('financial.transfer') },
        { value: 'other', text: this.$t('financial.other') },
        { value: 'instapay', text: this.$t('financial.instapay') },
      ]
    },
  },
  methods: {
    async fetchTransactions() {
      this.loading = true
      try {
        const params = { page: this.pagination.current_page }
        if (this.filters.payment_method) params.payment_method = this.filters.payment_method
        if (this.filters.date_from) params.date_from = this.filters.date_from
        if (this.filters.date_to) params.date_to = this.filters.date_to

        const response = await financialsService.getAllTransactions(params)
        this.transactions = response.data.data
        this.pagination = {
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
        }
      } catch (error) {
        this.$toast({
          component: 'ToastificationContent',
          props: { title: this.$t('messages.error'), text: this.$t('messages.loadError'), variant: 'danger' },
        })
      } finally {
        this.loading = false
      }
    },
    applyFilters() {
      this.pagination.current_page = 1
      this.fetchTransactions()
    },
    resetFilters() {
      this.filters = { payment_method: '', date_from: '', date_to: '' }
      this.pagination.current_page = 1
      this.fetchTransactions()
    },
    onPageChange(page) {
      this.pagination.current_page = page
      this.fetchTransactions()
    },
    formatDateTime(value) {
      if (!value) return ''
      return new Date(value).toLocaleString()
    },
    formatCurrency(value) {
      return parseFloat(value || 0).toFixed(2)
    },
    paginationCountText(p) {
      if (!p?.total) return '0 / 0'
      const from = ((p.current_page - 1) * p.per_page) + 1
      const to = Math.min(p.current_page * p.per_page, p.total)
      return `${from}-${to} / ${p.total}`
    },
  },
}
</script>

<style scoped>
.transaction-filter-actions {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
}

.transaction-mobile-card {
  border: 1px solid #ebe9f1;
}

.transaction-mobile-card__header,
.transaction-mobile-card__body {
  padding: 0.85rem 1rem;
}

.transaction-mobile-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  border-bottom: 1px solid #ebe9f1;
}

.transaction-mobile-card__body {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  background: #f8f8f8;
}

.transaction-mobile-card__body small {
  display: block;
  color: #6e6b7b;
  margin-bottom: 0.2rem;
}

.transaction-mobile-card__body span {
  display: block;
  word-break: break-word;
}

.transaction-mobile-card__notes {
  padding-top: 0.25rem;
}

@media (max-width: 767.98px) {
  .transaction-filter-actions {
    gap: 0.5rem;
  }

  .transaction-filter-actions .btn {
    flex: 1 1 0;
  }
}
</style>
