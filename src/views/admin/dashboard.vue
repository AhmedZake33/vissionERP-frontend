<template>
  <div>
    <!-- Stats Cards -->
    <b-row class="mb-2">
      <b-col cols="12" sm="6" lg="3">
        <statistic-card-vertical
          icon="UsersIcon"
          :statistic="stats.total_doctors"
          statistic-title="Total Doctors"
          color="primary"
        />
      </b-col>
      <b-col cols="12" sm="6" lg="3">
        <statistic-card-vertical
          icon="CheckCircleIcon"
          :statistic="stats.active_subscriptions"
          statistic-title="Active Subscriptions"
          color="success"
        />
      </b-col>
      <b-col cols="12" sm="6" lg="3">
        <statistic-card-vertical
          icon="XCircleIcon"
          :statistic="stats.expired_subscriptions"
          statistic-title="Expired Subscriptions"
          color="danger"
        />
      </b-col>
      <b-col cols="12" sm="6" lg="3">
        <statistic-card-vertical
          icon="DollarSignIcon"
          :statistic="`$${stats.total_revenue}`"
          statistic-title="Total Revenue"
          color="warning"
        />
      </b-col>
    </b-row>

    <!-- Doctors Table -->
    <b-card>
      <b-card-header>
        <div class="d-flex justify-content-between align-items-center">
          <h4 class="mb-0">{{ $t('admin.doctorsManagement') }}</h4>
          <b-button
            variant="primary"
            @click="openAddModal()"
          >
            <feather-icon icon="PlusIcon" class="mr-50" />
            {{ $t('admin.addDoctor') }}
          </b-button>
        </div>
      </b-card-header>

      <b-table
        :items="doctors"
        :fields="fields"
        :busy="loading"
        responsive
        striped
        hover
      >
        <template #cell(subscription_status)="data">
          <b-badge
            :variant="getStatusVariant(data.value)"
          >
            {{ $t(`admin.status.${data.value}`) }}
          </b-badge>
        </template>

        <template #cell(actions)="data">
          <b-dropdown
            variant="link"
            no-caret
            :right="$store.state.appConfig.isRTL"
          >
            <template #button-content>
              <feather-icon
                icon="MoreVerticalIcon"
                size="16"
                class="align-middle text-body"
              />
            </template>
            <b-dropdown-item @click="viewDoctor(data.item)">
              <feather-icon icon="EyeIcon" class="mr-50" />
              {{ $t('actions.view') }}
            </b-dropdown-item>
            <b-dropdown-item @click="editDoctor(data.item)">
              <feather-icon icon="EditIcon" class="mr-50" />
              {{ $t('actions.edit') }}
            </b-dropdown-item>
            <b-dropdown-item
              variant="danger"
              @click="confirmDelete(data.item)"
            >
              <feather-icon icon="TrashIcon" class="mr-50" />
              {{ $t('actions.delete') }}
            </b-dropdown-item>
          </b-dropdown>
        </template>
      </b-table>
    </b-card>

    <!-- Add/Edit Doctor Modal -->
    <b-modal
      v-model="showModal"
      :title="isEditing ? $t('admin.editDoctor') : $t('admin.addDoctor')"
      size="lg"
      no-close-on-backdrop
    >
      <b-form @submit.prevent="saveDoctor">
        <b-row>
          <b-col cols="12" md="6">
            <b-form-group :label="$t('client.name')" label-for="name">
              <b-form-input
                id="name"
                v-model="form.name"
                required
              />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="6">
            <b-form-group :label="$t('clinic.email')" label-for="email">
              <b-form-input
                id="email"
                v-model="form.email"
                type="email"
                required
              />
            </b-form-group>
          </b-col>
        </b-row>

        <b-row>
          <b-col cols="12">
            <b-form-group :label="$t('client.phone')" label-for="doctor-phone">
              <div class="phone-combined-control" :class="{ 'phone-combined-control--rtl': $store.state.appConfig.isRTL }">
                <div class="country-col">
                  <b-form-select
                    id="doctor-country-code"
                    class="phone-country-select"
                    v-model="form.phone_country_code"
                    :options="countrySelectOptions"
                  />
                </div>
                <div class="number-col">
                  <b-form-input id="doctor-phone" class="phone-number-input" v-model="form.phone" :placeholder="$t('client.phone')" />
                </div>
              </div>
            </b-form-group>
          </b-col>
        </b-row>

        <b-row>
          <b-col cols="12">
            <b-form-group :label="$t('client.whatsappNumber')" label-for="doctor-whatsapp-number">
              <b-form-checkbox v-model="form.useSameMobile" class="mb-50" @change="handleUseSameMobileChange">
                {{ $t('client.useSameMobile') }}
              </b-form-checkbox>
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
                  <b-form-input id="doctor-whatsapp-number" class="phone-number-input" v-model="form.whatsapp_number" :placeholder="$t('client.whatsappPlaceholder')" :disabled="form.useSameMobile" />
                </div>
              </div>
            </b-form-group>
          </b-col>
        </b-row>

        <b-row v-if="!isEditing">
          <b-col cols="12" md="6">
            <b-form-group :label="$t('clinic.password')" label-for="password">
              <b-form-input
                id="password"
                v-model="form.password"
                type="password"
                required
              />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="6">
            <b-form-group :label="$t('validation.confirmPassword')" label-for="password_confirmation">
              <b-form-input
                id="password_confirmation"
                v-model="form.password_confirmation"
                type="password"
                required
              />
            </b-form-group>
          </b-col>
        </b-row>

        <b-row>
          <b-col cols="12" md="6">
            <b-form-group :label="$t('admin.subscriptionPlan')" label-for="subscription_plan">
              <b-form-input
                id="subscription_plan"
                v-model="form.subscription_plan"
                :placeholder="$t('admin.subscriptionPlanPlaceholder')"
              />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="6">
            <b-form-group :label="$t('admin.subscriptionAmount')" label-for="subscription_amount">
              <b-form-input
                id="subscription_amount"
                v-model="form.subscription_amount"
                type="number"
                step="0.01"
                min="0"
              />
            </b-form-group>
          </b-col>
        </b-row>

        <b-row>
          <b-col cols="12" md="6">
            <b-form-group :label="$t('admin.subscriptionStart')" label-for="subscription_start">
              <b-form-input
                id="subscription_start"
                v-model="form.subscription_start"
                type="date"
              />
            </b-form-group>
          </b-col>
          <b-col cols="12" md="6">
            <b-form-group :label="$t('admin.subscriptionEnd')" label-for="subscription_end">
              <b-form-input
                id="subscription_end"
                v-model="form.subscription_end"
                type="date"
              />
            </b-form-group>
          </b-col>
        </b-row>

        <b-form-group :label="$t('admin.notes')" label-for="notes">
          <b-form-textarea
            id="notes"
            v-model="form.notes"
            rows="3"
          />
        </b-form-group>

        <b-form-checkbox
          v-model="form.is_active"
          class="mb-1"
        >
          {{ $t('admin.isActive') }}
        </b-form-checkbox>

        <b-row>
          <b-col cols="12" md="6">
            <b-form-group :label="$t('admin.maxSubDoctors')" label-for="max_sub_doctors">
              <b-form-input
                id="max_sub_doctors"
                v-model="form.max_sub_doctors"
                type="number"
                min="0"
                max="255"
                :placeholder="$t('admin.maxSubDoctorsPlaceholder')"
              />
              <small class="text-muted">{{ $t('admin.maxSubDoctorsHint') }}</small>
            </b-form-group>
          </b-col>
        </b-row>
      </b-form>

      <template #modal-footer>
        <b-button variant="secondary" @click="closeModal">
          {{ $t('actions.cancel') }}
        </b-button>
        <b-button
          variant="primary"
          :disabled="saving"
          @click="saveDoctor"
        >
          <b-spinner v-if="saving" small class="mr-50" />
          {{ isEditing ? $t('actions.save') : $t('actions.add') }}
        </b-button>
      </template>
    </b-modal>

    <!-- View Doctor Modal -->
    <b-modal
      v-model="showViewModal"
      :title="$t('admin.doctorDetails')"
      size="lg"
      ok-only
    >
      <div v-if="selectedDoctor">
        <b-row class="mb-2">
          <b-col cols="12" md="6">
            <strong>{{ $t('client.name') }}:</strong> {{ selectedDoctor.name }}
          </b-col>
          <b-col cols="12" md="6">
            <strong>{{ $t('clinic.email') }}:</strong> {{ selectedDoctor.email }}
          </b-col>
        </b-row>

        <b-row class="mb-2">
          <b-col cols="12" md="6">
            <strong>{{ $t('client.phone') }}:</strong> {{ selectedDoctor.phone || 'N/A' }}
          </b-col>
          <b-col cols="12" md="6">
            <strong>{{ $t('client.whatsappNumber') }}:</strong> {{ selectedDoctor.whatsapp_number || 'N/A' }}
          </b-col>
        </b-row>

        <b-row class="mb-2">
          <b-col cols="12" md="6">
            <strong>{{ $t('admin.subscriptionStatus') }}:</strong>
            <b-badge :variant="getStatusVariant(selectedDoctor.subscription_status)" class="ml-50">
              {{ $t(`admin.status.${selectedDoctor.subscription_status}`) }}
            </b-badge>
          </b-col>
          <b-col cols="12" md="6">
            <strong>{{ $t('admin.subscriptionPlan') }}:</strong> {{ selectedDoctor.subscription_plan || 'N/A' }}
          </b-col>
        </b-row>

        <b-row class="mb-2">
          <b-col cols="12" md="6">
            <strong>{{ $t('admin.subscriptionStart') }}:</strong> {{ selectedDoctor.subscription_start || 'N/A' }}
          </b-col>
          <b-col cols="12" md="6">
            <strong>{{ $t('admin.subscriptionEnd') }}:</strong> {{ selectedDoctor.subscription_end || 'N/A' }}
          </b-col>
        </b-row>

        <b-row class="mb-2">
          <b-col cols="12" md="6">
            <strong>{{ $t('admin.subscriptionAmount') }}:</strong> ${{ selectedDoctor.subscription_amount || 0 }}
          </b-col>
          <b-col cols="12" md="6">
            <strong>{{ $t('admin.isActive') }}:</strong>
            <b-badge :variant="selectedDoctor.is_active ? 'success' : 'danger'">
              {{ selectedDoctor.is_active ? $t('admin.active') : $t('admin.inactive') }}
            </b-badge>
          </b-col>
        </b-row>

        <div v-if="selectedDoctor.stats" class="mb-2">
          <strong>{{ $t('admin.stats') }}:</strong>
          <ul class="mt-50">
            <li>{{ $t('admin.assistantsCount') }}: {{ selectedDoctor.stats.assistants_count }}</li>
            <li>{{ $t('admin.clientsCount') }}: {{ selectedDoctor.stats.clients_count }}</li>
            <li>{{ $t('admin.reservationsCount') }}: {{ selectedDoctor.stats.reservations_count }}</li>
          </ul>
        </div>
        <div v-else class="mb-2">
          <strong>{{ $t('admin.stats') }}:</strong>
          <ul class="mt-50">
            <li>{{ $t('admin.assistantsCount') }}: {{ selectedDoctor.assistants_count || 0 }}</li>
            <li>{{ $t('admin.clientsCount') }}: {{ selectedDoctor.clients_count || 0 }}</li>
            <li>{{ $t('admin.reservationsCount') }}: {{ selectedDoctor.reservations_count || 0 }}</li>
          </ul>
        </div>

        <b-row class="mb-2">
          <b-col cols="12" md="6">
            <strong>{{ $t('admin.maxSubDoctors') }}:</strong>
            <b-badge :variant="(selectedDoctor.max_sub_doctors || 0) > 0 ? 'success' : 'secondary'" class="ml-50">
              {{ selectedDoctor.max_sub_doctors || 0 }}
            </b-badge>
            <span v-if="(selectedDoctor.max_sub_doctors || 0) > 0" class="text-muted small ml-50">
              ({{ $t('admin.subDoctorsUsed') }}: {{ selectedDoctor.sub_doctors_count || 0 }} / {{ selectedDoctor.max_sub_doctors }})
            </span>
          </b-col>
        </b-row>

        <div v-if="selectedDoctor.notes">
          <strong>{{ $t('admin.notes') }}:</strong>
          <p class="mt-50">{{ selectedDoctor.notes }}</p>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import {
  BCard, BCardHeader, BTable, BButton, BModal, BForm, BFormGroup,
  BFormInput, BFormTextarea, BFormCheckbox, BFormSelect, BRow, BCol, BDropdown,
  BDropdownItem, BBadge, BSpinner,
} from 'bootstrap-vue'
import StatisticCardVertical from '@core/components/statistics-cards/StatisticCardVertical.vue'
import adminService from '@/services/admin'
import countryList from '@/utils/countries'
import { splitPhoneNumber } from '@/utils/phoneNumbers'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'

export default {
  components: {
    BCard,
    BCardHeader,
    BTable,
    BButton,
    BModal,
    BForm,
    BFormGroup,
    BFormInput,
    BFormTextarea,
    BFormCheckbox,
    BFormSelect,
    BRow,
    BCol,
    BDropdown,
    BDropdownItem,
    BBadge,
    BSpinner,
    StatisticCardVertical,
  },
  data() {
    return {
      doctors: [],
      stats: {
        total_doctors: 0,
        active_subscriptions: 0,
        expired_subscriptions: 0,
        no_subscription: 0,
        total_revenue: 0,
      },
      loading: false,
      saving: false,
      showViewModal: false,
      showAddModal: false,
      isEditing: false,
      selectedDoctor: null,
      form: {
        name: '',
        email: '',
        phone: '',
        phone_country_code: '',
        whatsapp_number: '',
        whatsapp_country_code: '',
        useSameMobile: false,
        password: '',
        password_confirmation: '',
        subscription_plan: '',
        subscription_amount: '',
        subscription_start: '',
        subscription_end: '',
        is_active: true,
        notes: '',
        max_sub_doctors: 0,
      },
      fields: [
        { key: 'name', label: this.$t('client.name'), sortable: true },
        { key: 'email', label: this.$t('clinic.email'), sortable: true },
        { key: 'phone', label: this.$t('client.phone'), sortable: true },
        { key: 'subscription_status', label: this.$t('admin.subscriptionStatus') },
        { key: 'subscription_plan', label: this.$t('admin.subscriptionPlan') },
        { key: 'assistants_count', label: this.$t('admin.assistants'), sortable: true },
        { key: 'clients_count', label: this.$t('admin.clients'), sortable: true },
        { key: 'created_at', label: this.$t('admin.createdAt'), sortable: true, formatter: this.formatDate },
        { key: 'actions', label: this.$t('table.actions') },
      ],
    }
  },
  computed: {
    countrySelectOptions() {
      return [{ value: '', text: this.$t('client.selectCountryCode') }].concat(countryList.map(country => ({ value: country.value, text: country.label })))
    },
    showModal: {
      get() {
        return this.showAddModal || this.isEditing
      },
      set(value) {
        if (!value) {
          this.showAddModal = false
          this.isEditing = false
        }
      },
    },
  },
  async mounted() {
    await this.fetchDoctors()
    await this.fetchStats()
  },
  methods: {
    async fetchDoctors() {
      this.loading = true
      try {
        const response = await adminService.getDoctors()
        this.doctors = response.data
      } catch (error) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.error'),
            text: this.$t('admin.loadDoctorsError'),
            variant: 'danger',
          },
        })
      } finally {
        this.loading = false
      }
    },

    async fetchStats() {
      try {
        const response = await adminService.getSubscriptionStats()
        this.stats = response.data
      } catch (error) {
        console.error('Failed to load stats', error)
      }
    },

    openAddModal() {
      this.resetForm()
      this.showAddModal = true
    },

    formatDateForInput(dateStr) {
      if (!dateStr) return ''
      // Handle ISO datetime strings like "2026-02-26T00:00:00.000000Z"
      return dateStr.substring(0, 10)
    },

    editDoctor(doctor) {
      const phone = splitPhoneNumber(doctor.phone)
      const whatsapp = splitPhoneNumber(doctor.whatsapp_number)
      this.form = {
        name: doctor.name,
        email: doctor.email,
        phone: phone.number,
        phone_country_code: phone.prefix,
        whatsapp_number: whatsapp.number,
        whatsapp_country_code: whatsapp.prefix,
        useSameMobile: doctor.phone && doctor.phone === doctor.whatsapp_number,
        password: '',
        password_confirmation: '',
        subscription_plan: doctor.subscription_plan || '',
        subscription_amount: doctor.subscription_amount || '',
        subscription_start: this.formatDateForInput(doctor.subscription_start),
        subscription_end: this.formatDateForInput(doctor.subscription_end),
        is_active: doctor.is_active,
        notes: doctor.notes || '',
        max_sub_doctors: doctor.max_sub_doctors ?? 0,
      }
      this.isEditing = true
      this.selectedDoctor = doctor
    },

    async viewDoctor(doctor) {
      try {
        const response = await adminService.getDoctor(doctor.id)
        this.selectedDoctor = response.data
      } catch (error) {
        this.selectedDoctor = doctor
      }
      this.showViewModal = true
    },

    async saveDoctor() {
      this.saving = true
      try {
        if (this.isEditing) {
          await adminService.updateDoctor(this.selectedDoctor.id, this.form)
          this.$toast({
            component: ToastificationContent,
            props: {
              title: this.$t('messages.success'),
              text: this.$t('admin.doctorUpdated'),
              variant: 'success',
            },
          })
        } else {
          await adminService.createDoctor(this.form)
          this.$toast({
            component: ToastificationContent,
            props: {
              title: this.$t('messages.success'),
              text: this.$t('admin.doctorCreated'),
              variant: 'success',
            },
          })
        }
        this.closeModal()
        await this.fetchDoctors()
        await this.fetchStats()
      } catch (error) {
        const errors = error.response?.data?.errors
        let errorText = error.response?.data?.message || this.$t('admin.saveDoctorError')
        if (errors) {
          errorText = Object.values(errors).flat().join('\n')
        }
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.error'),
            text: errorText,
            variant: 'danger',
          },
        })
      } finally {
        this.saving = false
      }
    },

    confirmDelete(doctor) {
      this.$swal({
        title: this.$t('actions.confirm'),
        text: this.$t('admin.deleteDoctorConfirm', { name: doctor.name }),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: this.$t('actions.delete'),
        cancelButtonText: this.$t('actions.cancel'),
        customClass: {
          confirmButton: 'btn btn-danger',
          cancelButton: 'btn btn-outline-secondary ml-1',
        },
        buttonsStyling: false,
      }).then(result => {
        if (result.value) {
          this.deleteDoctor(doctor)
        }
      })
    },

    async deleteDoctor(doctor) {
      try {
        await adminService.deleteDoctor(doctor.id)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.success'),
            text: this.$t('admin.doctorDeleted'),
            variant: 'success',
          },
        })
        await this.fetchDoctors()
        await this.fetchStats()
      } catch (error) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('messages.error'),
            text: error.response?.data?.error || error.response?.data?.message || this.$t('admin.deleteDoctorError'),
            variant: 'danger',
          },
        })
      }
    },

    closeModal() {
      this.showModal = false
      this.resetForm()
    },

    resetForm() {
      this.form = {
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        subscription_plan: '',
        subscription_amount: '',
        subscription_start: '',
        subscription_end: '',
        is_active: true,
        notes: '',
        phone: '',
        phone_country_code: '',
        whatsapp_number: '',
        whatsapp_country_code: '',
        useSameMobile: false,
        max_sub_doctors: 0,
      }
      this.selectedDoctor = null
    },

    handleUseSameMobileChange() {
      if (this.form.useSameMobile) {
        this.form.whatsapp_number = this.form.phone
        this.form.whatsapp_country_code = this.form.phone_country_code
      }
    },

    getStatusVariant(status) {
      switch (status) {
        case 'active': return 'success'
        case 'expired': return 'danger'
        case 'inactive': return 'warning'
        default: return 'secondary'
      }
    },

    formatDate(value) {
      if (!value) return ''
      return new Date(value).toLocaleDateString()
    },
  },
}
</script>

<style scoped>
.phone-combined-control {
  display: flex;
  width: 100%;
}

.country-col {
  flex: 0 0 150px;
  max-width: 150px;
}

.number-col {
  flex: 1;
  min-width: 0;
}

::v-deep .phone-country-select .custom-select {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.phone-number-input {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.phone-combined-control--rtl ::v-deep .phone-country-select .custom-select {
  border-radius: 0 0.357rem 0.357rem 0;
}

.phone-combined-control--rtl .phone-number-input {
  border-radius: 0.357rem 0 0 0.357rem;
}
</style>
