<template>
  <div>
    <div v-if="pageLoading" class="text-center py-5">
      <b-spinner variant="primary" class="mb-1" />
      <div class="text-muted">{{ $t('messages.loading') }}</div>
    </div>

    <div v-else>
    <!-- Summary Cards -->
    <b-row class="mb-2">
      <b-col cols="12" sm="6" md="3">
        <b-card class="text-center">
          <b-card-text class="text-muted small mb-0">{{ $t('financial.totalAmount') }}</b-card-text>
          <h3 class="mb-0 text-primary">{{ formatCurrency(summary.total_amount) }}</h3>
        </b-card>
      </b-col>
      <b-col cols="12" sm="6" md="3">
        <b-card class="text-center">
          <b-card-text class="text-muted small mb-0">{{ $t('financial.totalPaid') }}</b-card-text>
          <h3 class="mb-0 text-success">{{ formatCurrency(summary.total_paid) }}</h3>
        </b-card>
      </b-col>
      <b-col cols="12" sm="6" md="3">
        <b-card class="text-center">
          <b-card-text class="text-muted small mb-0">{{ $t('financial.totalRemaining') }}</b-card-text>
          <h3 class="mb-0 text-danger">{{ formatCurrency(summary.total_remaining) }}</h3>
        </b-card>
      </b-col>
      <b-col cols="12" sm="6" md="3">
        <b-card class="text-center">
          <b-card-text class="text-muted small mb-0">{{ $t('financial.totalRecords') }}</b-card-text>
          <h3 class="mb-0 text-info">{{ summary.total_records }}</h3>
        </b-card>
      </b-col>
    </b-row>

    <!-- Payment Status Statistics -->
    <b-row class="mb-2">
      <b-col cols="12" sm="6" md="4">
        <b-card class="text-center border-success">
          <b-card-text class="text-muted small mb-0">{{ $t('financial.paidCount') }}</b-card-text>
          <h3 class="mb-0 text-success">{{ summary.paid_count || 0 }}</h3>
        </b-card>
      </b-col>
      <b-col cols="12" sm="6" md="4">
        <b-card class="text-center border-warning">
          <b-card-text class="text-muted small mb-0">{{ $t('financial.partialCount') }}</b-card-text>
          <h3 class="mb-0 text-warning">{{ summary.partial_count || 0 }}</h3>
        </b-card>
      </b-col>
      <b-col cols="12" sm="6" md="4">
        <b-card class="text-center border-danger">
          <b-card-text class="text-muted small mb-0">{{ $t('financial.unpaidCount') }}</b-card-text>
          <h3 class="mb-0 text-danger">{{ summary.unpaid_count || 0 }}</h3>
        </b-card>
      </b-col>
    </b-row>

    <!-- Per-Doctor Breakdown -->
    <b-card v-if="summary.by_doctor && summary.by_doctor.length > 1" class="mb-2">
      <div class="d-flex align-items-center justify-content-between mb-1" style="cursor:pointer" @click="showByDoctor = !showByDoctor">
        <h5 class="mb-0">{{ $t('financial.byDoctorTitle') }}</h5>
        <feather-icon :icon="showByDoctor ? 'ChevronUpIcon' : 'ChevronDownIcon'" />
      </div>
      <div v-if="showByDoctor">
        <b-row v-for="doc in summary.by_doctor" :key="doc.doctor_id" class="mb-1 align-items-center border-bottom pb-1">
          <b-col cols="12" md="3">
            <div class="font-weight-bold">{{ doc.doctor_name }}</div>
            <b-badge :variant="doc.doctor_role === 'sub-doctor' ? 'light-info' : 'light-primary'" class="text-capitalize">
              {{ doc.doctor_role === 'sub-doctor' ? $t('financial.subDoctor') : $t('financial.doctor') }}
            </b-badge>
          </b-col>
          <b-col cols="6" md="2" class="text-center">
            <div class="text-muted small">{{ $t('financial.totalAmount') }}</div>
            <strong class="text-primary">{{ formatCurrency(doc.total_amount) }}</strong>
          </b-col>
          <b-col cols="6" md="2" class="text-center">
            <div class="text-muted small">{{ $t('financial.totalPaid') }}</div>
            <strong class="text-success">{{ formatCurrency(doc.total_paid) }}</strong>
          </b-col>
          <b-col cols="6" md="2" class="text-center">
            <div class="text-muted small">{{ $t('financial.totalRemaining') }}</div>
            <strong :class="parseFloat(doc.total_remaining) > 0 ? 'text-danger' : 'text-success'">{{ formatCurrency(doc.total_remaining) }}</strong>
          </b-col>
          <b-col cols="6" md="3" class="text-center">
            <b-badge variant="success" class="mr-50">{{ doc.paid_count }} {{ $t('financial.paid') }}</b-badge>
            <b-badge variant="warning" class="mr-50">{{ doc.partial_count }} {{ $t('financial.partial') }}</b-badge>
            <b-badge variant="danger">{{ doc.unpaid_count }} {{ $t('financial.unpaid') }}</b-badge>
          </b-col>
        </b-row>
      </div>
    </b-card>

    <!-- Financials Table -->
    <b-card>
      <b-row class="mb-2">
        <b-col cols="12" md="4">
          <h4>{{ $t('financial.todayFinancials') }}</h4>
        </b-col>
        <b-col cols="12" md="8" class="text-right">
          <b-button variant="primary" @click="showAddModal">
            <feather-icon icon="PlusIcon" class="mr-50" />
            {{ $t('financial.addFinancial') }}
          </b-button>
        </b-col>
      </b-row>

      <b-form @submit.prevent="applyFilters" class="mb-2">
        <b-row>
          <b-col cols="12" md="3" class="mb-1 mb-md-0">
            <b-form-input v-model="filters.search" :placeholder="$t('financial.searchByClient')" />
          </b-col>
          <b-col cols="6" md="3" class="mb-1 mb-md-0">
            <b-form-select v-model="filters.payment_status" :options="paymentStatusOptions" />
          </b-col>
          <b-col cols="6" md="3" class="mb-1 mb-md-0">
            <b-form-select v-model="filters.payment_method" :options="paymentMethodOptions" />
          </b-col>
          <b-col cols="6" md="3" class="mb-1 mb-md-0">
            <b-form-input v-model="filters.date_from" type="date" :placeholder="$t('filters.dateFrom')" />
          </b-col>
          <b-col cols="6" md="3" class="mb-1 mb-md-0">
            <b-form-input v-model="filters.date_to" type="date" :placeholder="$t('filters.dateTo')" />
          </b-col>
          <b-col cols="12" md="12" class="text-right mt-1">
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
        :items="financials"
        :fields="fields"
        responsive
        striped
        hover
        :busy="loading"
        show-empty
      >
        <template #cell(amount)="data">
          <strong>{{ formatCurrency(data.value) }}</strong>
        </template>
        <template #cell(paid)="data">
          <span class="text-success">{{ formatCurrency(data.value) }}</span>
        </template>
        <template #cell(remaining)="data">
          <span :class="parseFloat(data.value) > 0 ? 'text-danger' : 'text-success'">
            {{ formatCurrency(data.value) }}
          </span>
        </template>
        <template #cell(invoice_type)="data">
          <b-badge :variant="getInvoiceTypeVariant(data.item)">
            {{ getInvoiceTypeLabel(data.item) }}
          </b-badge>
        </template>
        <template #cell(payment_status)="data">
          <b-badge :variant="getStatusVariant(data.value)">
            {{ $t('financial.' + data.value) }}
          </b-badge>
        </template>
        <template #cell(payment_method)="data">
          {{ $t('financial.' + data.value) }}
        </template>
        <template #cell(actions)="data">
          <b-button v-b-tooltip.hover :title="$t('actions.view')" variant="info" size="sm" class="mr-1" @click="viewFinancial(data.item)">
            <feather-icon icon="EyeIcon" />
          </b-button>
          <b-button v-if="parseFloat(data.item.remaining) > 0" v-b-tooltip.hover :title="$t('financial.pay')" variant="success" size="sm" class="mr-1" @click="viewFinancial(data.item); $nextTick(() => { activeTab = 1 })">
            <feather-icon icon="CreditCardIcon" />
          </b-button>
          <b-button v-b-tooltip.hover :title="$t('actions.edit')" variant="warning" size="sm" class="mr-1" @click="showEditModal(data.item)">
            <feather-icon icon="EditIcon" />
          </b-button>
          <b-button v-b-tooltip.hover :title="$t('actions.delete')" variant="danger" size="sm" @click="deleteFinancial(data.item)">
            <feather-icon icon="TrashIcon" />
          </b-button>
        </template>

        <template #table-busy>
          <div class="text-center my-2">
            <b-spinner class="align-middle" />
          </div>
        </template>
      </b-table>

      <div class="d-md-none">
        <div v-if="loading" class="text-center my-2">
          <b-spinner class="align-middle" />
        </div>
        <div v-else-if="!financials.length" class="text-center text-muted py-2">
          {{ $t('messages.noData') }}
        </div>
        <b-card
          v-for="item in financials"
          v-else
          :key="item.id"
          no-body
          class="financial-mobile-card mb-1"
        >
          <div class="financial-mobile-card__header">
            <div>
              <h6 class="mb-25">{{ item.client ? item.client.name : '-' }}</h6>
              <small v-if="item.doctor" class="text-muted">
                {{ item.doctor.name }}
              </small>
            </div>
            <b-badge :variant="getStatusVariant(item.payment_status)">
              {{ $t('financial.' + item.payment_status) }}
            </b-badge>
          </div>
          <div class="financial-mobile-card__meta">
            <span>{{ getInvoiceTypeLabel(item) }}</span>
            <span>{{ $t('financial.' + item.payment_method) }}</span>
          </div>
          <div class="financial-mobile-card__amounts">
            <div>
              <small>{{ $t('financial.amount') }}</small>
              <strong>{{ formatCurrency(item.amount) }}</strong>
            </div>
            <div>
              <small>{{ $t('financial.paid') }}</small>
              <strong class="text-success">{{ formatCurrency(item.paid) }}</strong>
            </div>
            <div>
              <small>{{ $t('financial.remaining') }}</small>
              <strong :class="parseFloat(item.remaining) > 0 ? 'text-danger' : 'text-success'">
                {{ formatCurrency(item.remaining) }}
              </strong>
            </div>
          </div>
          <div class="financial-mobile-card__actions">
            <b-button variant="info" size="sm" @click="viewFinancial(item)">
              <feather-icon icon="EyeIcon" />
            </b-button>
            <b-button
              v-if="parseFloat(item.remaining) > 0"
              variant="success"
              size="sm"
              @click="viewFinancial(item); $nextTick(() => { activeTab = 1 })"
            >
              <feather-icon icon="CreditCardIcon" />
            </b-button>
            <b-button variant="warning" size="sm" @click="showEditModal(item)">
              <feather-icon icon="EditIcon" />
            </b-button>
            <b-button variant="danger" size="sm" @click="deleteFinancial(item)">
              <feather-icon icon="TrashIcon" />
            </b-button>
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

    <!-- Add/Edit Modal -->
    <b-modal
      v-model="modalShow"
      :title="editMode ? $t('financial.editFinancial') : $t('financial.addFinancial')"
      hide-footer
      size="lg"
    >
      <b-form @submit.prevent="saveFinancial">
        <b-form-group v-if="!editMode" :label="$t('financial.reservation')" label-for="reservation">
          <b-form-select
            id="reservation"
            v-model="form.reservation_id"
            :options="reservationOptions"
            required
          >
            <template #first>
              <b-form-select-option :value="null" disabled>
                -- {{ $t('financial.selectReservation') }} --
              </b-form-select-option>
            </template>
          </b-form-select>
        </b-form-group>

        <b-form-group :label="$t('financial.amount')" label-for="amount">
          <b-form-input
            id="amount"
            v-model="form.amount"
            type="number"
            step="0.01"
            min="0"
            required
          />
        </b-form-group>

        <b-form-group :label="$t('financial.paid')" label-for="paid">
          <b-form-input
            id="paid"
            v-model="form.paid"
            type="number"
            step="0.01"
            min="0"
            :disabled="editMode"
          />
        </b-form-group>

        <b-form-group v-if="!editMode" :label="$t('financial.paymentMethod')" label-for="payment_method">
          <b-form-select
            id="payment_method"
            v-model="form.payment_method"
            :options="paymentMethodFormOptions"
            required
          />
        </b-form-group>

        <b-form-group :label="$t('reservation.notes')" label-for="notes">
          <b-form-textarea
            id="notes"
            v-model="form.notes"
            rows="3"
          />
        </b-form-group>

        <div class="text-right">
          <b-button variant="secondary" class="mr-1" @click="modalShow = false">
            {{ $t('actions.cancel') }}
          </b-button>
          <b-button type="submit" variant="primary" :disabled="saving">
            <b-spinner v-if="saving" small class="mr-1" />
            {{ editMode ? $t('actions.save') : $t('actions.add') }}
          </b-button>
        </div>
      </b-form>
    </b-modal>

    <!-- View Modal -->
    <b-modal
      v-model="viewModalShow"
      :title="$t('financial.financialDetails')"
      ok-only
      size="lg"
      @hide="onViewModalHide"
    >
      <div v-if="selectedFinancial">
        <b-tabs v-model="activeTab" @activate-tab="onActivateTab">
          <!-- Details Tab -->
          <b-tab :title="$t('financial.details')" active>
            <b-row class="mt-1">
              <b-col cols="12" md="6">
                <p v-if="selectedFinancial.client">
                  <strong>{{ $t('table.client') }}:</strong> {{ selectedFinancial.client.name }}
                </p>
                <p v-if="selectedFinancial.doctor">
                  <strong>{{ $t('table.doctor') }}:</strong> {{ selectedFinancial.doctor.name }}
                </p>
                <p v-if="selectedFinancial.reservation">
                  <strong>{{ $t('reservation.appointment') }}:</strong> {{ formatDateTime(selectedFinancial.reservation.appointment_date) }}
                </p>
                <p>
                  <strong>{{ $t('financial.invoiceType') }}:</strong>
                  <b-badge :variant="getInvoiceTypeVariant(selectedFinancial)">
                    {{ getInvoiceTypeLabel(selectedFinancial) }}
                  </b-badge>
                </p>
                <p>
                  <strong>{{ $t('financial.paymentMethod') }}:</strong> {{ $t('financial.' + selectedFinancial.payment_method) }}
                </p>
              </b-col>
              <b-col cols="12" md="6">
                <p><strong>{{ $t('financial.amount') }}:</strong> {{ formatCurrency(selectedFinancial.amount) }}</p>
                <p><strong>{{ $t('financial.paid') }}:</strong> <span class="text-success">{{ formatCurrency(selectedFinancial.paid) }}</span></p>
                <p><strong>{{ $t('financial.remaining') }}:</strong>
                  <span :class="parseFloat(selectedFinancial.remaining) > 0 ? 'text-danger' : 'text-success'">
                    {{ formatCurrency(selectedFinancial.remaining) }}
                  </span>
                </p>
                <p><strong>{{ $t('financial.paymentStatus') }}:</strong>
                  <b-badge :variant="getStatusVariant(selectedFinancial.payment_status)">
                    {{ $t('financial.' + selectedFinancial.payment_status) }}
                  </b-badge>
                </p>
              </b-col>
            </b-row>
            <hr>
            <p><strong>{{ $t('reservation.notes') }}:</strong></p>
            <p>{{ getFinancialNotes(selectedFinancial) }}</p>
            <p v-if="selectedFinancial.creator">
              <strong>{{ $t('financial.createdBy') }}:</strong> {{ selectedFinancial.creator.name }}
            </p>
            <p><strong>{{ $t('reservation.created') }}:</strong> {{ formatDateTime(selectedFinancial.created_at) }}</p>
            <div v-if="parseFloat(selectedFinancial.remaining) > 0" class="text-right mt-1">
              <b-button variant="success" @click="goToPayTab">
                <feather-icon icon="CreditCardIcon" class="mr-50" />
                {{ $t('financial.pay') }}
              </b-button>
            </div>
          </b-tab>

          <!-- Transactions Tab -->
          <b-tab :title="$t('transaction.transactions')" lazy>
            <div class="mt-1">
              <!-- Summary bar -->
              <b-alert show variant="info" class="mb-1 py-1 px-2">
                {{ $t('financial.paid') }}: <strong>{{ formatCurrency(selectedFinancial.paid) }}</strong>
                &nbsp;|&nbsp;
                {{ $t('financial.remaining') }}: <strong :class="parseFloat(selectedFinancial.remaining)>0?'text-danger':''">{{ formatCurrency(selectedFinancial.remaining) }}</strong>
              </b-alert>

              <!-- Add transaction form -->
              <b-card v-if="parseFloat(selectedFinancial.remaining) > 0" class="mb-1" bg-variant="light">
                <b-form @submit.prevent="addTransactions">
                  <b-row v-for="(row, idx) in txRows" :key="idx" align-v="end" class="mb-50">
                    <b-col cols="12" sm="4">
                      <b-form-group :label="idx === 0 ? $t('transaction.amount') : ''" label-size="sm">
                        <b-form-input v-model="row.amount" type="number" step="0.01" min="0.01" size="sm" required />
                      </b-form-group>
                    </b-col>
                    <b-col cols="12" sm="4">
                      <b-form-group :label="idx === 0 ? $t('financial.paymentMethod') : ''" label-size="sm">
                        <b-form-select v-model="row.payment_method" :options="txPaymentMethodOptions" size="sm" required />
                      </b-form-group>
                    </b-col>
                    <b-col cols="10" sm="3">
                      <b-form-group :label="idx === 0 ? $t('reservation.notes') : ''" label-size="sm">
                        <b-form-input v-model="row.notes" size="sm" />
                      </b-form-group>
                    </b-col>
                    <b-col cols="2" sm="1" class="mb-1">
                      <b-button v-if="txRows.length > 1" variant="outline-danger" size="sm" @click="removeTxRow(idx)">
                        <feather-icon icon="XIcon" />
                      </b-button>
                    </b-col>
                  </b-row>
                  <b-row>
                    <b-col cols="12" sm="6">
                      <b-button variant="outline-primary" size="sm" @click="addTxRow">
                        <feather-icon icon="PlusIcon" class="mr-50" />
                        {{ $t('transaction.addRow') }}
                      </b-button>
                    </b-col>
                    <b-col cols="12" sm="6" class="text-right">
                      <small class="text-muted mr-1">
                        {{ $t('transaction.total') }}: <strong>{{ formatCurrency(txRowsTotal) }}</strong>
                        <span v-if="txRowsTotal > parseFloat(selectedFinancial.remaining)" class="text-danger ml-1">
                          ({{ $t('transaction.exceedsRemaining') }})
                        </span>
                      </small>
                      <b-button type="submit" variant="success" size="sm"
                        :disabled="txSaving || txRowsTotal <= 0 || txRowsTotal > parseFloat(selectedFinancial.remaining)">
                        <b-spinner v-if="txSaving" small class="mr-50" />
                        <feather-icon v-else icon="SaveIcon" class="mr-50" />
                        {{ $t('transaction.addPayment') }}
                      </b-button>
                    </b-col>
                  </b-row>
                </b-form>
              </b-card>

              <!-- Transactions list -->
              <div v-if="txLoading" class="text-center py-2">
                <b-spinner variant="primary" small />
              </div>
              <b-table v-else :items="transactions" :fields="txFields" small responsive show-empty>
                <template #cell(amount)="data">
                  <strong class="text-success">{{ formatCurrency(data.value) }}</strong>
                </template>
                <template #cell(payment_method)="data">
                  {{ $t('financial.' + data.value) }}
                </template>
                <template #cell(created_at)="data">
                  {{ formatDateTime(data.value) }}
                </template>
                <template #cell(actions)="data">
                  <b-button variant="danger" size="sm" @click="deleteTransaction(data.item)">
                    <feather-icon icon="TrashIcon" />
                  </b-button>
                </template>
                <template #empty>
                  <div class="text-center text-muted py-2">{{ $t('transaction.noTransactions') }}</div>
                </template>
              </b-table>
            </div>
          </b-tab>
        </b-tabs>
      </div>
    </b-modal>
    </div>
  </div>
</template>

<script>
import {
  BCard,
  BCardText,
  BRow,
  BCol,
  BButton,
  BTable,
  BPagination,
  BModal,
  BForm,
  BFormGroup,
  BFormInput,
  BFormSelect,
  BFormSelectOption,
  BFormTextarea,
  BSpinner,
  BBadge,
  BTabs,
  BTab,
  BAlert,
  VBTooltip,
} from 'bootstrap-vue'
import financialsService from '@/services/financials'
import reservationsService from '@/services/reservations'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'

export default {
  components: {
    BCard,
    BCardText,
    BRow,
    BCol,
    BButton,
    BTable,
    BPagination,
    BModal,
    BForm,
    BFormGroup,
    BFormInput,
    BFormSelect,
    BFormSelectOption,
    BFormTextarea,
    BSpinner,
    BBadge,
    BTabs,
    BTab,
    BAlert,
  },
  directives: {
    'b-tooltip': VBTooltip,
  },
  data() {
    return {
      financials: [],
      reservations: [],
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
      },
      summary: {
        total_amount: 0,
        total_paid: 0,
        total_remaining: 0,
        total_records: 0,
        by_doctor: [],
      },
      showByDoctor: true,
      pageLoading: true,
      loading: false,
      modalShow: false,
      viewModalShow: false,
      editMode: false,
      saving: false,
      selectedFinancial: null,
      editId: null,
      filters: {
        search: '',
        payment_status: '',
        payment_method: '',
        date_from: '',
        date_to: '',
      },
      form: {
        reservation_id: null,
        amount: '',
        paid: '',
        payment_method: 'cash',
        notes: '',
      },
      // Transactions
      transactions: [],
      txLoading: false,
      txSaving: false,
      txRows: [{ amount: '', payment_method: 'cash', notes: '' }],
      activeTab: 0,
    }
  },
  watch: {
    '$store.state.broadcast.eventCounter'() {
      this.fetchFinancials()
      this.fetchSummary()
    },
  },
  async mounted() {
    try {
      await Promise.all([
        this.fetchFinancials(),
        this.fetchSummary(),
        this.fetchReservations(),
      ])
    } finally {
      this.pageLoading = false
    }
  },
  computed: {
    fields() {
      return [
        { key: 'client.name', label: this.$t('table.client'), sortable: true },
        { key: 'doctor.name', label: this.$t('table.doctor'), sortable: true },
        { key: 'invoice_type', label: this.$t('financial.invoiceType') },
        { key: 'amount', label: this.$t('financial.amount'), sortable: true },
        { key: 'paid', label: this.$t('financial.paid'), sortable: true },
        { key: 'remaining', label: this.$t('financial.remaining'), sortable: true },
        { key: 'payment_status', label: this.$t('financial.paymentStatus'), sortable: true },
        { key: 'payment_method', label: this.$t('financial.paymentMethod'), sortable: true },
        { key: 'actions', label: this.$t('table.actions') },
      ]
    },
    paymentStatusOptions() {
      return [
        { value: '', text: this.$t('filters.all') },
        { value: 'unpaid', text: this.$t('financial.unpaid') },
        { value: 'partial', text: this.$t('financial.partial') },
        { value: 'paid', text: this.$t('financial.paid') },
      ]
    },
    paymentMethodOptions() {
      return [
        { value: '', text: this.$t('filters.all') },
        { value: 'cash', text: this.$t('financial.cash') },
        { value: 'card', text: this.$t('financial.card') },
        { value: 'transfer', text: this.$t('financial.transfer') },
        { value: 'other', text: this.$t('financial.other') },
      ]
    },
    paymentMethodFormOptions() {
      return [
        { value: 'cash', text: this.$t('financial.cash') },
        { value: 'card', text: this.$t('financial.card') },
        { value: 'transfer', text: this.$t('financial.transfer') },
        { value: 'other', text: this.$t('financial.other') },
      ]
    },
    txPaymentMethodOptions() {
      return [
        { value: 'cash', text: this.$t('financial.cash') },
        { value: 'card', text: this.$t('financial.card') },
        { value: 'transfer', text: this.$t('financial.transfer') },
        { value: 'other', text: this.$t('financial.other') },
        { value: 'instapay', text: this.$t('financial.instapay') },
      ]
    },
    reservationOptions() {
      return this.reservations.map(r => ({
        value: r.id,
        text: `#${r.id} - ${r.client?.name || ''} - ${r.appointment_date ? new Date(r.appointment_date + (r.appointment_date.includes(' ') ? '' : '')).toLocaleDateString() : ''}`,
      }))
    },
    txFields() {
      return [
        { key: 'amount', label: this.$t('transaction.amount') },
        { key: 'payment_method', label: this.$t('financial.paymentMethod') },
        { key: 'creator.name', label: this.$t('financial.createdBy') },
        { key: 'notes', label: this.$t('reservation.notes') },
        { key: 'created_at', label: this.$t('reservation.created') },
        { key: 'actions', label: '' },
      ]
    },
    txRowsTotal() {
      return this.txRows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)
    },
  },
  methods: {
    async fetchFinancials() {
      this.loading = true
      try {
        const today = this.getTodayDate()
        const params = {
          page: this.pagination.current_page,
          date_from: this.filters.date_from || today,
          date_to: this.filters.date_to || today,
        }
        if (this.filters.search) params.search = this.filters.search
        if (this.filters.payment_status) params.payment_status = this.filters.payment_status
        if (this.filters.payment_method) params.payment_method = this.filters.payment_method
        const response = await financialsService.getFinancials(params)
        this.financials = response.data.data
        this.pagination = {
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
        }
      } catch (error) {
        this.$toast({
          component: ToastificationContent,
          props: { title: this.$t('messages.error'), text: this.$t('financial.loadError'), variant: 'danger' },
        })
      } finally {
        this.loading = false
      }
    },
    async fetchSummary() {
      try {
        const today = this.getTodayDate()
        const params = {
          date_from: this.filters.date_from || today,
          date_to: this.filters.date_to || today,
        }
        const response = await financialsService.getSummary(params)
        this.summary = response.data
      } catch (e) {
        // silent
      }
    },
    async fetchReservations() {
      try {
        const response = await reservationsService.getReservations()
        this.reservations = Array.isArray(response.data) ? response.data : (response.data.data || [])
      } catch (e) {
        this.reservations = []
      }
    },
    applyFilters() {
      this.pagination.current_page = 1
      this.fetchFinancials()
      this.fetchSummary()
    },
    resetFilters() {
      this.filters = { search: '', payment_status: '', payment_method: '', date_from: '', date_to: '' }
      this.pagination.current_page = 1
      this.fetchFinancials()
      this.fetchSummary()
    },
    onPageChange(page) {
      this.pagination.current_page = page
      this.fetchFinancials()
    },
    isAdditionalServicesInvoice(item) {
      return item && item.notes && item.notes.startsWith('Additional services invoice')
    },
    getInvoiceTypeLabel(item) {
      return this.isAdditionalServicesInvoice(item)
        ? this.$t('financial.additionalServicesInvoice')
        : this.$t('financial.reservationInvoice')
    },
    getInvoiceTypeVariant(item) {
      return this.isAdditionalServicesInvoice(item) ? 'light-info' : 'light-primary'
    },
    getFinancialNotes(item) {
      if (!item || !item.notes) return this.$t('reservation.na')
      if (!this.isAdditionalServicesInvoice(item)) return item.notes

      const serviceNames = item.notes.replace('Additional services invoice', '').replace(/^:\s*/, '')
      return serviceNames
        ? `${this.$t('financial.additionalServicesInvoice')}: ${serviceNames}`
        : this.$t('financial.additionalServicesInvoice')
    },
    showAddModal() {
      this.editMode = false
      this.editId = null
      this.form = { reservation_id: null, amount: '', paid: '', payment_method: 'cash', notes: '' }
      this.modalShow = true
    },
    showEditModal(item) {
      this.editMode = true
      this.editId = item.id
      this.form = {
        reservation_id: item.reservation_id,
        amount: item.amount,
        paid: item.paid,
        payment_method: item.payment_method,
        notes: item.notes || '',
      }
      this.modalShow = true
    },
    async saveFinancial() {
      this.saving = true
      try {
        if (this.editMode) {
          await financialsService.updateFinancial(this.editId, this.form)
          this.$toast({
            component: ToastificationContent,
            props: { title: this.$t('messages.success'), text: this.$t('messages.updateSuccess'), variant: 'success' },
          })
        } else {
          await financialsService.createFinancial(this.form)
          this.$toast({
            component: ToastificationContent,
            props: { title: this.$t('messages.success'), text: this.$t('messages.addSuccess'), variant: 'success' },
          })
        }
        this.modalShow = false
        this.fetchFinancials()
        this.fetchSummary()
      } catch (error) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.error'),
            text: error.response?.data?.message || this.$t('messages.saveError'),
            variant: 'danger',
          },
        })
      } finally {
        this.saving = false
      }
    },
    async deleteFinancial(item) {
      const result = await this.$swal({
        title: this.$t('messages.deleteConfirm'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: this.$t('actions.confirm'),
        cancelButtonText: this.$t('actions.cancel'),
        customClass: {
          confirmButton: 'btn btn-danger',
          cancelButton: 'btn btn-outline-secondary ml-1',
        },
        buttonsStyling: false,
      })
      if (!result.isConfirmed) return
      try {
        await financialsService.deleteFinancial(item.id)
        this.$toast({
          component: ToastificationContent,
          props: { title: this.$t('messages.success'), text: this.$t('messages.deleteSuccess'), variant: 'success' },
        })
        this.fetchFinancials()
        this.fetchSummary()
      } catch (error) {
        this.$toast({
          component: ToastificationContent,
          props: { title: this.$t('messages.error'), text: this.$t('messages.deleteError'), variant: 'danger' },
        })
      }
    },
    viewFinancial(item) {
      this.selectedFinancial = { ...item }
      this.transactions = []
      this.txRows = [{ amount: '', payment_method: 'cash', notes: '' }]
      this.activeTab = 0
      this.viewModalShow = true
      this.fetchTransactions()
    },
    onViewModalHide() {
      this.transactions = []
      this.txRows = [{ amount: '', payment_method: 'cash', notes: '' }]
      this.activeTab = 0
    },
    goToPayTab() {
      this.activeTab = 1
    },
    onActivateTab(newIndex) {
      if (newIndex === 1) this.fetchTransactions()
    },
    addTxRow() {
      this.txRows.push({ amount: '', payment_method: 'cash', notes: '' })
    },
    removeTxRow(idx) {
      this.txRows.splice(idx, 1)
    },
    async fetchTransactions() {
      if (!this.selectedFinancial) return
      this.txLoading = true
      try {
        const res = await financialsService.getTransactions(this.selectedFinancial.id)
        this.transactions = res.data
      } catch (e) {
        // silent
      } finally {
        this.txLoading = false
      }
    },
    async addTransactions() {
      this.txSaving = true
      try {
        const res = await financialsService.createTransactionBatch(this.selectedFinancial.id, this.txRows)
        this.selectedFinancial = res.data
        this.txRows = [{ amount: '', payment_method: 'cash', notes: '' }]
        await this.fetchTransactions()
        await this.fetchFinancials()
        await this.fetchSummary()
        this.$toast({ component: ToastificationContent, props: { title: this.$t('messages.success'), text: this.$t('transaction.addSuccess'), variant: 'success' } })
      } catch (error) {
        const msg = error.response?.data?.message || this.$t('messages.saveError')
        this.$toast({ component: ToastificationContent, props: { title: this.$t('messages.error'), text: msg, variant: 'danger' } })
      } finally {
        this.txSaving = false
      }
    },
    async deleteTransaction(tx) {
      const result = await this.$swal({
        title: this.$t('messages.deleteConfirm'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: this.$t('actions.confirm'),
        cancelButtonText: this.$t('actions.cancel'),
        customClass: { confirmButton: 'btn btn-danger', cancelButton: 'btn btn-outline-secondary ml-1' },
        buttonsStyling: false,
      })
      if (!result.isConfirmed) return
      try {
        const res = await financialsService.deleteTransaction(this.selectedFinancial.id, tx.id)
        this.selectedFinancial = res.data
        await this.fetchTransactions()
        await this.fetchFinancials()
        await this.fetchSummary()
        this.$toast({ component: ToastificationContent, props: { title: this.$t('messages.success'), text: this.$t('messages.deleteSuccess'), variant: 'success' } })
      } catch (e) {
        this.$toast({ component: ToastificationContent, props: { title: this.$t('messages.error'), text: this.$t('messages.deleteError'), variant: 'danger' } })
      }
    },
    getStatusVariant(status) {
      const map = { paid: 'success', partial: 'warning', unpaid: 'danger' }
      return map[status] || 'secondary'
    },
    formatDateTime(value) {
      if (!value) return ''
      // Parse as local time since backend returns Y-m-d H:i:s format
      const date = new Date(value + (value.includes(' ') ? '' : ''))
      return date.toLocaleString()
    },
    formatCurrency(value) {
      return parseFloat(value || 0).toFixed(2)
    },
    getTodayDate() {
      const d = new Date()
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    paginationCountText(paginationState) {
      if (!paginationState?.total) return '0 / 0'
      const from = ((paginationState.current_page - 1) * paginationState.per_page) + 1
      const to = Math.min(paginationState.current_page * paginationState.per_page, paginationState.total)
      return `${from}-${to} / ${paginationState.total}`
    },
  },
}
</script>

<style scoped>
.financial-mobile-card {
  border: 1px solid #ebe9f1;
}

.financial-mobile-card__header,
.financial-mobile-card__meta,
.financial-mobile-card__amounts,
.financial-mobile-card__actions {
  padding: 0.85rem 1rem;
}

.financial-mobile-card__header,
.financial-mobile-card__meta,
.financial-mobile-card__amounts,
.financial-mobile-card__actions {
  display: flex;
}

.financial-mobile-card__header {
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  border-bottom: 1px solid #ebe9f1;
}

.financial-mobile-card__meta {
  justify-content: space-between;
  gap: 0.75rem;
  color: #6e6b7b;
  font-size: 0.85rem;
}

.financial-mobile-card__amounts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
  background: #f8f8f8;
}

.financial-mobile-card__amounts small {
  display: block;
  color: #6e6b7b;
  margin-bottom: 0.2rem;
}

.financial-mobile-card__amounts strong {
  display: block;
  font-size: 0.9rem;
  word-break: break-word;
}

.financial-mobile-card__actions {
  justify-content: flex-end;
  gap: 0.5rem;
  flex-wrap: wrap;
}
</style>


