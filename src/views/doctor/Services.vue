<template>
  <div>
    <b-card>
      <b-row class="mb-2">
        <b-col cols="12" md="4">
          <h4>{{ $t('services.myServices') }}</h4>
        </b-col>
        <b-col cols="12" md="8" class="text-right">
          <b-button v-if="canManageServices" variant="primary" @click="openAddModal">
            <feather-icon icon="PlusIcon" class="mr-50" />
            {{ $t('services.addService') }}
          </b-button>
        </b-col>
      </b-row>

      <b-row v-if="isAssistant" class="mb-2">
        <b-col cols="12" md="4">
          <b-form-select
            v-model="selectedDoctorId"
            :options="doctorOptions"
            :disabled="loadingDoctors"
            @change="fetchServices"
          />
        </b-col>
      </b-row>
      
      <b-table
        :items="services"
        :fields="fields"
        :busy="loading"
        responsive
        striped
        hover
        show-empty
        :empty-text="$t('services.noServices')"
      >
        <template #cell(name)="data">
          <div>
            <strong>{{ data.item.name }}</strong>
            <div v-if="data.item.name_en" class="text-muted small">{{ data.item.name_en }}</div>
          </div>
        </template>

        <template #cell(price)="data">
          <span class="font-weight-bold text-success">{{ formatPrice(data.value) }}</span>
        </template>

        <template #cell(is_active)="data">
          <b-badge :variant="data.value ? 'success' : 'secondary'">
            {{ data.value ? $t('services.active') : $t('services.inactive') }}
          </b-badge>
        </template>

        <template #cell(actions)="data">
          <b-button v-if="canManageServices" size="sm" variant="flat-primary" class="btn-icon mr-25" @click="editService(data.item)">
            <feather-icon icon="EditIcon" />
          </b-button>
          <b-button v-if="canManageServices" size="sm" variant="flat-danger" class="btn-icon" @click="confirmDelete(data.item)">
            <feather-icon icon="TrashIcon" />
          </b-button>
        </template>

        <template #table-busy>
          <div class="text-center my-2">
            <b-spinner class="align-middle" />
          </div>
        </template>
      </b-table>
    </b-card>

    <!-- Add/Edit Modal -->
    <b-modal
      v-model="showModal"
      :title="isEditing ? $t('services.editService') : $t('services.addService')"
      no-close-on-backdrop
      @hidden="resetForm"
    >
      <b-form @submit.prevent="saveService">
        <b-form-group :label="$t('services.nameAr')" label-for="svc-name">
          <b-form-input id="svc-name" v-model="form.name" required :placeholder="$t('services.nameArPlaceholder')" />
        </b-form-group>

        <b-form-group :label="$t('services.nameEn')" label-for="svc-name-en">
          <b-form-input id="svc-name-en" v-model="form.name_en" :placeholder="$t('services.nameEnPlaceholder')" />
        </b-form-group>

        <b-form-group :label="$t('services.description')" label-for="svc-desc">
          <b-form-textarea id="svc-desc" v-model="form.description" rows="2" :placeholder="$t('services.descriptionPlaceholder')" />
        </b-form-group>

        <b-form-group :label="$t('services.price')" label-for="svc-price">
          <b-input-group :prepend="$t('services.currency')">
            <b-form-input id="svc-price" v-model="form.price" type="number" step="0.01" min="0" required />
          </b-input-group>
        </b-form-group>

        <b-form-checkbox v-model="form.is_active" class="mt-1">
          {{ $t('services.isActive') }}
        </b-form-checkbox>
      </b-form>

      <template #modal-footer>
        <b-button variant="secondary" @click="showModal = false">{{ $t('actions.cancel') }}</b-button>
        <b-button variant="primary" :disabled="saving" @click="saveService">
          <b-spinner v-if="saving" small class="mr-50" />
          {{ isEditing ? $t('actions.save') : $t('actions.add') }}
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import {
  BCard, BCardHeader, BTable, BButton, BModal, BForm, BFormGroup,
  BFormInput, BFormTextarea, BFormCheckbox, BBadge, BSpinner,
  BInputGroup, BRow, BCol, BFormSelect,
} from 'bootstrap-vue'
import doctorServicesApi from '@/services/doctorServices'
import reservationsApi from '@/services/reservations'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'

export default {
  components: {
    BCard, BCardHeader, BTable, BButton, BModal, BForm, BFormGroup,
    BFormInput, BFormTextarea, BFormCheckbox, BBadge, BSpinner, BInputGroup,
    BRow, BCol, BFormSelect,
  },

  data() {
    return {
      services: [],
      loading: false,
      loadingDoctors: false,
      saving: false,
      showModal: false,
      isEditing: false,
      selectedService: null,
      doctors: [],
      selectedDoctorId: '',
      form: {
        name: '',
        name_en: '',
        description: '',
        price: 0,
        is_active: true,
      },
    }
  },

  computed: {
    fields() {
      return [
        { key: 'name',      label: this.$t('services.name') },
        { key: 'price',     label: this.$t('services.price'), sortable: true },
        { key: 'is_active', label: this.$t('services.status') },
        { key: 'actions',   label: this.$t('table.actions') },
      ]
    },
    isRtl() {
      return this.$i18n && this.$i18n.locale === 'ar'
    },
    user() {
      return JSON.parse(localStorage.getItem('user') || 'null') || {}
    },
    isAssistant() {
      return this.user.role === 'assistant'
    },
    canManageServices() {
      return !this.isAssistant
    },
    doctorOptions() {
      return [
        { value: '', text: this.$t('reservation.selectDoctor') },
        ...this.doctors.map(doctor => ({
          value: doctor.id,
          text: doctor.name,
        })),
      ]
    },
  },

  async mounted() {
    if (this.isAssistant) {
      await this.fetchDoctors()
      return
    }

    this.fetchServices()
  },

  methods: {
    async fetchDoctors() {
      this.loadingDoctors = true
      try {
        const { data } = await reservationsApi.getDoctors()
        this.doctors = data
      } catch {
        this.$toast({ component: ToastificationContent, props: { title: this.$t('messages.error'), text: this.$t('messages.loadError'), variant: 'danger' } })
      } finally {
        this.loadingDoctors = false
      }
    },

    async fetchServices() {
      if (this.isAssistant && !this.selectedDoctorId) {
        this.services = []
        return
      }

      this.loading = true
      try {
        const { data } = this.isAssistant
          ? await doctorServicesApi.getAllForDoctor(this.selectedDoctorId)
          : await doctorServicesApi.getAll()
        this.services = data
      } catch {
        this.$toast({ component: ToastificationContent, props: { title: this.$t('messages.error'), text: this.$t('services.loadError'), variant: 'danger' } })
      } finally {
        this.loading = false
      }
    },

    openAddModal() {
      this.resetForm()
      this.showModal = true
    },

    editService(service) {
      this.form = {
        name: service.name,
        name_en: service.name_en || '',
        description: service.description || '',
        price: service.price,
        is_active: service.is_active,
      }
      this.isEditing = true
      this.selectedService = service
      this.showModal = true
    },

    async saveService() {
      this.saving = true
      try {
        if (this.isEditing) {
          const { data } = await doctorServicesApi.update(this.selectedService.id, this.form)
          const idx = this.services.findIndex(s => s.id === this.selectedService.id)
          if (idx !== -1) this.$set(this.services, idx, data)
          this.$toast({ component: ToastificationContent, props: { title: this.$t('messages.success'), text: this.$t('services.updated'), variant: 'success' } })
        } else {
          const { data } = await doctorServicesApi.create(this.form)
          this.services.push(data)
          this.$toast({ component: ToastificationContent, props: { title: this.$t('messages.success'), text: this.$t('services.created'), variant: 'success' } })
        }
        this.showModal = false
        this.resetForm()
      } catch (error) {
        const errors = error.response?.data?.errors
        const text = errors ? Object.values(errors).flat().join('\n') : (error.response?.data?.message || this.$t('services.saveError'))
        this.$toast({ component: ToastificationContent, props: { title: this.$t('messages.error'), text, variant: 'danger' } })
      } finally {
        this.saving = false
      }
    },

    confirmDelete(service) {
      this.$swal({
        title: this.$t('actions.confirm'),
        text: this.$t('services.deleteConfirm', { name: service.name }),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: this.$t('actions.delete'),
        cancelButtonText: this.$t('actions.cancel'),
        customClass: { confirmButton: 'btn btn-danger', cancelButton: 'btn btn-outline-secondary ml-1' },
        buttonsStyling: false,
      }).then(result => { if (result.value) this.deleteService(service) })
    },

    async deleteService(service) {
      try {
        await doctorServicesApi.delete(service.id)
        this.services = this.services.filter(s => s.id !== service.id)
        this.$toast({ component: ToastificationContent, props: { title: this.$t('messages.success'), text: this.$t('services.deleted'), variant: 'success' } })
      } catch {
        this.$toast({ component: ToastificationContent, props: { title: this.$t('messages.error'), text: this.$t('services.deleteError'), variant: 'danger' } })
      }
    },

    resetForm() {
      this.form = { name: '', name_en: '', description: '', price: 0, is_active: true }
      this.isEditing = false
      this.selectedService = null
    },

    formatPrice(val) {
      return Number(val).toFixed(2)
    },
  },
}
</script>
