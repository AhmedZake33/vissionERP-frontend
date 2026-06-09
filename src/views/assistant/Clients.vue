<template>
  <div>
    <b-card>

      <b-row class="mb-2">
        <b-col cols="12" md="4">
          <h4>{{ $t('client.clientsList') }}</h4>
        </b-col>
        <b-col cols="12" md="8" class="text-right">
          <b-button variant="primary" @click="showAddModal">
            <feather-icon icon="PlusIcon" class="mr-50" />
            {{ $t('client.addClient') }}
          </b-button>
        </b-col>
      </b-row>

      <b-form @submit.prevent="applyFilters" class="mb-2">
        <b-row>
          <b-col cols="12" md="5" class="mb-1 mb-md-0">
            <b-form-input v-model="filters.search" :placeholder="$t('client.searchPlaceholder')" />
          </b-col>
          <b-col cols="6" md="3" class="mb-1 mb-md-0">
            <b-form-input v-model="filters.created_from" type="date" placeholder="From" />
          </b-col>
          <b-col cols="6" md="3" class="mb-1 mb-md-0">
            <b-form-input v-model="filters.created_to" type="date" placeholder="To" />
          </b-col>
          <b-col cols="12" md="1" class="text-right">
            <b-button type="submit" variant="primary" class="mr-1" :disabled="loading">
              {{ $t('client.filter') }}
            </b-button>
          </b-col>
        </b-row>
        <b-row class="mt-1">
          <b-col cols="12" class="text-right">
            <b-button variant="outline-secondary" size="sm" @click="resetFilters" :disabled="loading">
              {{ $t('client.reset') }}
            </b-button>
          </b-col>
        </b-row>
      </b-form>

      <b-table
        :items="clients"
        :fields="computedFields"
        responsive
        striped
        hover
        :busy="loading"
        show-empty
      >
        <template #cell(actions)="data">
          <b-button
            variant="info"
            size="sm"
            class="mr-1"
            @click="viewClient(data.item)"
          >
            <feather-icon icon="EyeIcon" />
          </b-button>
          <b-button
            variant="primary"
            size="sm"
            class="mr-1"
            @click="goToProfile(data.item.id)"
          >
            <feather-icon icon="UserIcon" class="mr-50" />
            {{ $t('client.clientDetails') }}
          </b-button>
          <b-button
            variant="warning"
            size="sm"
            class="mr-1"
            @click="editClient(data.item)"
          >
            <feather-icon icon="EditIcon" />
          </b-button>
          <b-button
            variant="danger"
            size="sm"
            @click="deleteClient(data.item.id)"
          >
            <feather-icon icon="TrashIcon" />
          </b-button>
        </template>

        <template #table-busy>
          <div class="text-center my-2">
            <b-spinner class="align-middle" />
          </div>
        </template>
      </b-table>

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
      :title="editMode ? $t('client.editClient') : $t('client.addClient')"
      hide-footer
      size="lg"
    >
      <b-form @submit.prevent="saveClient">
        <b-form-group :label="$t('client.name')" label-for="name">
          <b-form-input
            id="name"
            v-model="form.name"
            required
            :placeholder="$t('client.name')"
          />
        </b-form-group>

        <b-form-group :label="$t('clinic.email')" label-for="email">
          <b-form-input
            id="email"
            v-model="form.email"
            type="email"
            :placeholder="$t('clinic.email')"
          />
        </b-form-group>

        <b-form-group :label="$t('client.phone')" label-for="phone">
          <div class="phone-combined-control" :class="{ 'phone-combined-control--rtl': $store.state.appConfig.isRTL }">
            <div class="country-col">
              <b-form-select
                id="country-code"
                class="phone-country-select"
                v-model="form.phone_country_code"
                :options="countrySelectOptions"
              />
            </div>
            <div class="number-col">
              <b-form-input
                id="phone"
                class="phone-number-input"
                v-model="form.phone"
                required
                :placeholder="$t('client.phone')"
              />
            </div>
          </div>
        </b-form-group>

        <b-form-group :label="$t('client.whatsappNumber')" label-for="whatsapp-number">
          <div class="mb-2">
            <b-form-checkbox
              v-model="form.useSameMobile"
              @change="handleUseSameMobileChange"
            >
              {{ $t('client.useSameMobile') }}
            </b-form-checkbox>
          </div>
          <div class="phone-combined-control" :class="{ 'phone-combined-control--rtl': $store.state.appConfig.isRTL }">
            <div class="country-col">
              <b-form-select
                class="phone-country-select"
                v-model="form.whatsapp_country_code"
                :options="countrySelectOptions"
                :disabled="form.useSameMobile"
              />
            </div>
            <div class="number-col">
              <b-form-input
                id="whatsapp-number"
                class="phone-number-input"
                v-model="form.whatsapp_number"
                :placeholder="$t('client.whatsappPlaceholder')"
                :disabled="form.useSameMobile"
              />
            </div>
          </div>
        </b-form-group>

        <b-form-group :label="$t('client.bloodType')" label-for="blood-type">
          <b-form-select
            id="blood-type"
            v-model="form.blood_type"
            :options="bloodTypeOptions()"
          />
        </b-form-group>

        <b-form-group :label="$t('client.dateOfBirth')" label-for="dob">
          <b-form-input
            id="dob"
            v-model="form.date_of_birth"
            type="date"
          />
        </b-form-group>

        <b-row>
          <b-col cols="6">
            <b-form-group :label="$t('client.height')" label-for="height">
              <b-form-input
                id="height"
                v-model="form.height"
                type="number"
                step="0.01"
                min="0"
                max="300"
                :placeholder="$t('client.heightPlaceholder')"
              />
            </b-form-group>
          </b-col>
          <b-col cols="6">
            <b-form-group :label="$t('client.weight')" label-for="weight">
              <b-form-input
                id="weight"
                v-model="form.weight"
                type="number"
                step="0.01"
                min="0"
                max="500"
                :placeholder="$t('client.weightPlaceholder')"
              />
            </b-form-group>
          </b-col>
        </b-row>

        <b-form-group :label="$t('client.address')" label-for="address">
          <b-form-textarea
            id="address"
            v-model="form.address"
            rows="2"
            :placeholder="$t('client.address')"
          />
        </b-form-group>

        <b-form-group :label="$t('client.job')" label-for="job">
          <b-form-input
            id="job"
            v-model="form.job"
            :placeholder="$t('client.jobPlaceholder')"
          />
        </b-form-group>

        <b-form-group :label="$t('client.medicalHistory')" label-for="history">
          <b-form-textarea
            id="history"
            v-model="form.medical_history"
            rows="3"
            :placeholder="$t('client.medicalHistory')"
          />
        </b-form-group>

        <b-form-group :label="$t('client.chronicIllnesses')" label-for="chronic-illnesses">
          <b-form-checkbox-group
            id="chronic-illnesses"
            v-model="form.chronic_illnesses"
            :options="chronicIllnessOptions"
            stacked
          />
          <small class="text-muted d-block mt-50">{{ $t('client.selectChronicIllnesses') }}</small>
        </b-form-group>

        <div class="text-right">
          <b-button variant="secondary" class="mr-1" @click="modalShow = false">
            {{ $t('actions.cancel') }}
          </b-button>
          <b-button type="submit" variant="primary" :disabled="saving">
            <b-spinner v-if="saving" small class="mr-1" />
            {{ $t('actions.save') }}
          </b-button>
        </div>
      </b-form>
    </b-modal>

    <!-- View Modal -->
    <b-modal
      v-model="viewModalShow"
      :title="$t('client.clientDetails')"
      ok-only
      size="lg"
    >
      <div v-if="selectedClient">
        <b-row>
          <b-col cols="12" md="6">
            <p><strong>{{ $t('client.name') }}:</strong> {{ selectedClient.name }}</p>
            <p><strong>{{ $t('clinic.email') }}:</strong> {{ selectedClient.email }}</p>
            <p><strong>{{ $t('client.phone') }}:</strong> {{ selectedClient.phone }}</p>
            <p><strong>{{ $t('client.whatsappNumber') }}:</strong> {{ selectedClient.whatsapp_number || $t('reservation.na') }}</p>
            <p><strong>{{ $t('client.bloodType') }}:</strong> {{ selectedClient.blood_type || $t('reservation.na') }}</p>
          </b-col>
          <b-col cols="12" md="6">
            <p><strong>{{ $t('client.dateOfBirth') }}:</strong> {{ selectedClient.date_of_birth || $t('reservation.na') }}</p>
            <p><strong>{{ $t('client.age') }}:</strong> {{ calculateAge(selectedClient.date_of_birth) }}</p>
            <p><strong>{{ $t('client.job') }}:</strong> {{ selectedClient.job || $t('reservation.na') }}</p>
            <p><strong>{{ $t('client.height') }}:</strong> {{ selectedClient.height ? selectedClient.height + ' cm' : $t('reservation.na') }}</p>
            <p><strong>{{ $t('client.weight') }}:</strong> {{ selectedClient.weight ? selectedClient.weight + ' kg' : $t('reservation.na') }}</p>
            <p><strong>{{ $t('reservation.created') }}:</strong> {{ formatDate(selectedClient.created_at) }}</p>
          </b-col>
        </b-row>
        <hr>
        <p><strong>{{ $t('client.address') }}:</strong></p>
        <p>{{ selectedClient.address || $t('reservation.na') }}</p>
        <p><strong>{{ $t('client.chronicIllnesses') }}:</strong></p>
        <p>{{ formatClientChronicIllnesses(selectedClient.chronic_illnesses) }}</p>
        <p><strong>{{ $t('client.medicalHistory') }}:</strong></p>
        <p>{{ selectedClient.medical_history || $t('reservation.na') }}</p>
      </div>
    </b-modal>
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
  BModal,
  BForm,
  BFormGroup,
  BFormCheckboxGroup,
  BFormInput,
  BFormSelect,
  BFormTextarea,
  BSpinner,
} from 'bootstrap-vue'
import vSelect from 'vue-select'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'
import clientsService, { splitPhoneNumber } from '@/services/clients'
import { buildChronicIllnessOptions, formatChronicIllnesses } from '@/utils/clientChronicIllnesses'
import { formatAgeFromBirthDate } from '@/utils/clientAge'
import countryList from '@/utils/countries'

export default {
  components: {
    BCard,
    BRow,
    BCol,
    BButton,
    BTable,
    BPagination,
    BModal,
    BForm,
    BFormGroup,
    BFormCheckboxGroup,
    BFormInput,
    BFormSelect,
    BFormTextarea,
    BSpinner,
    vSelect,
  },
  computed: {
    chronicIllnessOptions() {
      return buildChronicIllnessOptions(this.chronicIllnessOptionValues, key => this.$t(key))
    },
    computedFields() {
      return [
        { key: 'name', label: this.$t('client.name'), sortable: true },
        { key: 'email', label: this.$t('clinic.email'), sortable: true },
        { key: 'phone', label: this.$t('client.phone') },
        { key: 'blood_type', label: this.$t('client.bloodType') },
        { key: 'age', label: this.$t('client.age'), formatter: (value, key, item) => this.calculateAge(item.date_of_birth) },
        { key: 'created_at', label: this.$t('reservation.created'), formatter: this.formatDate },
        { key: 'actions', label: this.$t('actions.actions') },
      ]
    },
    countryOptions() {
      return countryList
    },
    countrySelectOptions() {
      return [{ value: '', text: this.$t('client.selectCountryCode') }].concat(countryList.map(c => ({ value: c.value, text: c.label })))
    },
  },
  data() {
    return {
      clients: [],
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
      },
      loading: false,
      modalShow: false,
      viewModalShow: false,
      editMode: false,
      saving: false,
      selectedClient: null,
      filters: {
        search: '',
        created_from: '',
        created_to: '',
      },
      chronicIllnessOptionValues: [],
      form: {
        name: '',
        email: '',
        phone: '',
        phone_country_code: '',
        whatsapp_country_code: '',
        whatsapp_number: '',
        useSameMobile: false,
        blood_type: '',
        date_of_birth: '',
        height: '',
        weight: '',
        address: '',
        job: '',
        medical_history: '',
        chronic_illnesses: [],
      },
      
    }
  },
  mounted() {
    this.fetchClients()
    this.fetchClientOptions()
  },
  methods: {
    bloodTypeOptions() {
      return [
        { value: '', text: this.$t('reservation.na') },
        { value: 'A+', text: 'A+' },
        { value: 'A-', text: 'A-' },
        { value: 'B+', text: 'B+' },
        { value: 'B-', text: 'B-' },
        { value: 'AB+', text: 'AB+' },
        { value: 'AB-', text: 'AB-' },
        { value: 'O+', text: 'O+' },
        { value: 'O-', text: 'O-' },
      ]
    },

    async fetchClientOptions() {
      try {
        const response = await clientsService.getClientOptions()
        this.chronicIllnessOptionValues = response.data.chronic_illnesses || []
      } catch (error) {
        this.chronicIllnessOptionValues = []
      }
    },

    async fetchClients() {
      this.loading = true
      try {
        const params = {
          page: this.pagination.current_page,
        }
        if (this.filters.search) params.search = this.filters.search
        if (this.filters.created_from) params.created_from = this.filters.created_from
        if (this.filters.created_to) params.created_to = this.filters.created_to
        const response = await clientsService.getClients(params)
        this.clients = response.data.data
        this.pagination = {
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
        }
      } catch (error) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.error'),
            text: this.$t('messages.loadError'),
            variant: 'danger',
          },
        })
      } finally {
        this.loading = false
      }
    },
    goToProfile(id) {
      const routeName = this.$route.name === 'doctor-clients' ? 'doctor-client-profile' : 'assistant-client-profile'
      this.$router.push({ name: routeName, params: { id } })
    },
    applyFilters() {
      this.pagination.current_page = 1
      this.fetchClients()
    },
    resetFilters() {
      this.filters = { search: '', created_from: '', created_to: '' }
      this.pagination.current_page = 1
      this.fetchClients()
    },
    onPageChange(page) {
      this.pagination.current_page = page
      this.fetchClients()
    },
    showAddModal() {
      this.editMode = false
      this.form = {
        name: '',
        email: '',
        phone: '',
        phone_country_code: '',
        whatsapp_country_code: '',
        whatsapp_number: '',
        useSameMobile: false,
        blood_type: '',
        date_of_birth: '',
        height: '',
        weight: '',
        address: '',
        job: '',
        medical_history: '',
        chronic_illnesses: [],
      }
      this.modalShow = true
    },
    editClient(client) {
      this.editMode = true
      this.selectedClient = client
      const ph = splitPhoneNumber(client.phone)
      const wa = splitPhoneNumber(client.whatsapp_number)
      const useSame = client.phone === client.whatsapp_number && client.phone_country_code === client.whatsapp_country_code
      this.form = {
        ...client,
        phone: ph.number,
        phone_country_code: ph.prefix,
        whatsapp_number: wa.number,
        whatsapp_country_code: wa.prefix,
        useSameMobile: useSame,
        chronic_illnesses: [...(client.chronic_illnesses || [])],
      }
      this.modalShow = true
    },
    viewClient(client) {
      this.selectedClient = client
      this.viewModalShow = true
    },
    async saveClient() {
      this.saving = true
      try {
        if (this.editMode) {
          await clientsService.updateClient(this.selectedClient.id, this.form)
          this.$toast({
            component: ToastificationContent,
            props: {
              title: this.$t('messages.success'),
              text: this.$t('messages.updateSuccess'),
              variant: 'success',
            },
          })
        } else {
          await clientsService.createClient(this.form)
          this.$toast({
            component: ToastificationContent,
            props: {
              title: this.$t('messages.success'),
              text: this.$t('messages.addSuccess'),
              variant: 'success',
            },
          })
        }
        this.modalShow = false
        this.fetchClients()
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
    async deleteClient(id) {
      if (!confirm(this.$t('messages.deleteConfirm'))) return

      try {
        await clientsService.deleteClient(id)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.success'),
            text: this.$t('messages.deleteSuccess'),
            variant: 'success',
          },
        })
        this.fetchClients()
      } catch (error) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.error'),
            text: this.$t('messages.deleteError'),
            variant: 'danger',
          },
        })
      }
    },
    formatDate(value) {
      if (!value) return 'N/A'
      return new Date(value).toLocaleDateString()
    },
    calculateAge(value) {
      return formatAgeFromBirthDate(value, key => this.$t(key), 'N/A')
    },
    formatClientChronicIllnesses(values) {
      return formatChronicIllnesses(values, key => this.$t(key), 'N/A')
    },
    paginationCountText(paginationState) {
      if (!paginationState?.total) return '0 / 0'
      const from = ((paginationState.current_page - 1) * paginationState.per_page) + 1
      const to = Math.min(paginationState.current_page * paginationState.per_page, paginationState.total)
      return `${from}-${to} / ${paginationState.total}`
    },
    handleUseSameMobileChange() {
      if (this.form.useSameMobile) {
        this.form.whatsapp_number = this.form.phone
        this.form.whatsapp_country_code = this.form.phone_country_code
      }
    },
  },
}
</script>

<style scoped>
.phone-combined-control {
  display: flex;
  width: 100%;
  align-items: stretch;
  transition: box-shadow 0.2s ease;
}

.phone-combined-control:focus-within {
  border-radius: 0.357rem;
  box-shadow: 0 0 0 0.2rem rgba(115, 103, 240, 0.15);
}

.country-col {
  flex: 0 0 200px;
  max-width: 200px;
}

.number-col {
  flex: 1 1 auto;
  min-width: 0;
}

::v-deep .phone-country-select .vs__dropdown-toggle {
  display: flex;
  align-items: center;
  min-height: 38px;
  height: 38px;
  padding: 0.375rem 0.5rem;
  border: 1px solid #d8d6de;
  background: #fff;
  border-radius: 0.357rem 0 0 0.357rem;
  box-sizing: border-box;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

::v-deep .phone-country-select .vs__dropdown-toggle:hover {
  background-color: #f8f8f8;
  border-color: #c9c9c9;
}

::v-deep .phone-country-select .vs__selected-options,
::v-deep .phone-country-select .vs__actions {
  padding: 0;
  margin: 0;
  height: 100%;
  display: flex;
  align-items: center;
}

::v-deep .phone-country-select .vs__selected {
  margin: 0;
  padding-right: 0.25rem;
}

::v-deep .phone-country-select .vs__search {
  margin: 0;
}

::v-deep .phone-country-select.vs--open .vs__dropdown-toggle {
  border-color: #7367f0;
}

/* Match b-form-input typography and caret */
::v-deep .phone-country-select .vs__dropdown-toggle,
::v-deep .phone-country-select .vs__selected,
::v-deep .phone-country-select .vs__selected-options {
  font-size: 0.875rem;
  line-height: 1.5;
  color: #495057;
}

::v-deep .phone-country-select .vs__open-indicator {
  margin-left: 0.375rem;
  color: #6c6c6c;
}

::v-deep .phone-country-select .vs__dropdown-toggle .vs__open-indicator svg {
  width: 18px;
  height: 18px;
}

/* Ensure placeholder text matches input placeholder styling */
::v-deep .phone-country-select .vs__search::-webkit-input-placeholder {
  color: #9aa0a6;
}
::v-deep .phone-country-select .vs__search::placeholder {
  color: #9aa0a6;
}

.phone-number-input {
  height: 38px;
  border: 1px solid #d8d6de;
  border-left: 0;
  border-radius: 0 0.357rem 0.357rem 0;
  padding: 0.375rem 0.75rem;
  box-sizing: border-box;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.phone-number-input:hover {
  background-color: #fcfcfc;
  border-color: #c9c9c9;
}

.phone-number-input:focus {
  box-shadow: none;
  border-color: #7367f0;
}

.phone-combined-control:focus-within ::v-deep .phone-country-select .vs__dropdown-toggle,
.phone-combined-control:focus-within .phone-number-input {
  border-color: #7367f0;
}

.phone-combined-control--rtl {
  flex-direction: row-reverse;
}

.phone-combined-control--rtl ::v-deep .phone-country-select .vs__dropdown-toggle {
  border-top-right-radius: 0.357rem;
  border-bottom-right-radius: 0.357rem;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-right: 1px solid #d8d6de;
  border-left: 0;
}

.phone-combined-control--rtl .phone-number-input {
  border-top-left-radius: 0.357rem;
  border-bottom-left-radius: 0.357rem;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-left: 1px solid #d8d6de;
  border-right: 0;
}

@media (max-width: 575.98px) {
  .country-col {
    flex-basis: 160px;
    max-width: 160px;
  }
}
</style>


