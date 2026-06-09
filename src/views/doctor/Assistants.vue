<template>
  <div>
    <b-card>
      <b-row class="mb-2">
        <b-col cols="12" md="6">
          <h4 class="mb-0">
            <feather-icon icon="UsersIcon" class="mr-50" />
            {{ $t('assistant.title') }}
          </h4>
        </b-col>
        <b-col cols="12" md="6" class="text-right">
          <b-button variant="primary" @click="showAddModal">
            <feather-icon icon="PlusIcon" class="mr-50" />
            {{ $t('assistant.addAssistant') }}
          </b-button>
        </b-col>
      </b-row>

      <b-table
        :items="assistants"
        :fields="fields"
        responsive
        striped
        hover
        :busy="loading"
        show-empty
      >
        <template #cell(created_at)="data">
          {{ formatDate(data.item.created_at) }}
        </template>

        <template #cell(actions)="data">
          <b-button
            variant="warning"
            size="sm"
            class="mr-1"
            @click="showEditModal(data.item)"
          >
            <feather-icon icon="EditIcon" />
          </b-button>
          <b-button
            variant="danger"
            size="sm"
            @click="deleteAssistant(data.item)"
          >
            <feather-icon icon="TrashIcon" />
          </b-button>
        </template>

        <template #table-busy>
          <div class="text-center my-2">
            <b-spinner class="align-middle" />
          </div>
        </template>

        <template #empty>
          <div class="text-center text-muted py-2">
            {{ $t('assistant.noAssistants') }}
          </div>
        </template>
      </b-table>
    </b-card>

    <!-- Add Modal -->
    <b-modal
      v-model="showAdd"
      :title="$t('assistant.addAssistant')"
      @ok.prevent="saveAssistant"
      :ok-title="$t('actions.save')"
      :cancel-title="$t('actions.cancel')"
    >
      <b-form @submit.prevent="saveAssistant">
        <b-form-group :label="$t('assistant.name')" label-for="add-name">
          <b-form-input id="add-name" v-model="form.name" required />
        </b-form-group>
        <b-form-group :label="$t('assistant.email')" label-for="add-email">
          <b-form-input id="add-email" v-model="form.email" type="email" required />
        </b-form-group>
        <b-form-group :label="$t('client.phone')" label-for="add-phone">
          <div class="phone-combined-control" :class="{ 'phone-combined-control--rtl': $store.state.appConfig.isRTL }">
            <div class="country-col">
              <b-form-select class="phone-country-select" v-model="form.phone_country_code" :options="countrySelectOptions" />
            </div>
            <div class="number-col">
              <b-form-input id="add-phone" class="phone-number-input" v-model="form.phone" :placeholder="$t('client.phone')" />
            </div>
          </div>
        </b-form-group>
        <b-form-group :label="$t('client.whatsappNumber')" label-for="add-whatsapp-number">
          <b-form-checkbox v-model="form.useSameMobile" class="mb-50" @change="handleUseSameMobileChange(form)">
            {{ $t('client.useSameMobile') }}
          </b-form-checkbox>
          <div class="phone-combined-control" :class="{ 'phone-combined-control--rtl': $store.state.appConfig.isRTL }">
            <div class="country-col">
              <b-form-select class="phone-country-select" v-model="form.whatsapp_country_code" :options="countrySelectOptions" :disabled="form.useSameMobile" />
            </div>
            <div class="number-col">
              <b-form-input id="add-whatsapp-number" class="phone-number-input" v-model="form.whatsapp_number" :placeholder="$t('client.whatsappPlaceholder')" :disabled="form.useSameMobile" />
            </div>
          </div>
        </b-form-group>
        <b-form-group :label="$t('assistant.password')" label-for="add-password">
          <b-form-input id="add-password" v-model="form.password" type="password" required />
        </b-form-group>
        <b-form-group :label="$t('assistant.confirmPassword')" label-for="add-password-confirm">
          <b-form-input id="add-password-confirm" v-model="form.password_confirmation" type="password" required />
        </b-form-group>
      </b-form>
    </b-modal>

    <!-- Edit Modal -->
    <b-modal
      v-model="showEdit"
      :title="$t('assistant.editAssistant')"
      @ok.prevent="updateAssistant"
      :ok-title="$t('actions.save')"
      :cancel-title="$t('actions.cancel')"
    >
      <b-form @submit.prevent="updateAssistant">
        <b-form-group :label="$t('assistant.name')" label-for="edit-name">
          <b-form-input id="edit-name" v-model="editForm.name" required />
        </b-form-group>
        <b-form-group :label="$t('assistant.email')" label-for="edit-email">
          <b-form-input id="edit-email" v-model="editForm.email" type="email" required />
        </b-form-group>
        <b-form-group :label="$t('client.phone')" label-for="edit-phone">
          <div class="phone-combined-control" :class="{ 'phone-combined-control--rtl': $store.state.appConfig.isRTL }">
            <div class="country-col">
              <b-form-select class="phone-country-select" v-model="editForm.phone_country_code" :options="countrySelectOptions" />
            </div>
            <div class="number-col">
              <b-form-input id="edit-phone" class="phone-number-input" v-model="editForm.phone" :placeholder="$t('client.phone')" />
            </div>
          </div>
        </b-form-group>
        <b-form-group :label="$t('client.whatsappNumber')" label-for="edit-whatsapp-number">
          <b-form-checkbox v-model="editForm.useSameMobile" class="mb-50" @change="handleUseSameMobileChange(editForm)">
            {{ $t('client.useSameMobile') }}
          </b-form-checkbox>
          <div class="phone-combined-control" :class="{ 'phone-combined-control--rtl': $store.state.appConfig.isRTL }">
            <div class="country-col">
              <b-form-select class="phone-country-select" v-model="editForm.whatsapp_country_code" :options="countrySelectOptions" :disabled="editForm.useSameMobile" />
            </div>
            <div class="number-col">
              <b-form-input id="edit-whatsapp-number" class="phone-number-input" v-model="editForm.whatsapp_number" :placeholder="$t('client.whatsappPlaceholder')" :disabled="editForm.useSameMobile" />
            </div>
          </div>
        </b-form-group>
        <b-form-group :label="$t('assistant.newPassword')" label-for="edit-password">
          <b-form-input id="edit-password" v-model="editForm.password" type="password" :placeholder="$t('assistant.leaveBlank')" />
        </b-form-group>
        <b-form-group :label="$t('assistant.confirmPassword')" label-for="edit-password-confirm">
          <b-form-input id="edit-password-confirm" v-model="editForm.password_confirmation" type="password" />
        </b-form-group>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import {
  BCard, BRow, BCol, BButton, BTable, BSpinner,
  BModal, BForm, BFormGroup, BFormInput, BFormSelect, BFormCheckbox,
} from 'bootstrap-vue'
import assistantsService from '@/services/assistants'
import countryList from '@/utils/countries'
import { splitPhoneNumber } from '@/utils/phoneNumbers'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'

export default {
  components: {
    BCard, BRow, BCol, BButton, BTable, BSpinner,
    BModal, BForm, BFormGroup, BFormInput, BFormSelect, BFormCheckbox,
  },
  data() {
    return {
      loading: false,
      assistants: [],
      showAdd: false,
      showEdit: false,
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
      },
      editForm: {
        id: null,
        name: '',
        email: '',
        phone: '',
        phone_country_code: '',
        whatsapp_number: '',
        whatsapp_country_code: '',
        useSameMobile: false,
        password: '',
        password_confirmation: '',
      },
    }
  },
  computed: {
    countrySelectOptions() {
      return [{ value: '', text: this.$t('client.selectCountryCode') }].concat(countryList.map(country => ({ value: country.value, text: country.label })))
    },
    fields() {
      return [
        { key: 'name', label: this.$t('assistant.name'), sortable: true },
        { key: 'email', label: this.$t('assistant.email'), sortable: true },
        { key: 'phone', label: this.$t('client.phone'), sortable: true },
        { key: 'whatsapp_number', label: this.$t('client.whatsappNumber'), sortable: true },
        { key: 'created_at', label: this.$t('assistant.createdAt'), sortable: true },
        { key: 'actions', label: this.$t('assistant.actions') },
      ]
    },
  },
  mounted() {
    this.fetchAssistants()
  },
  methods: {
    async fetchAssistants() {
      this.loading = true
      try {
        const response = await assistantsService.getAssistants()
        this.assistants = response.data
      } catch (error) {
        this.assistants = []
      } finally {
        this.loading = false
      }
    },

    showAddModal() {
      this.form = this.emptyForm()
      this.showAdd = true
    },

    async saveAssistant() {
      try {
        await assistantsService.createAssistant(this.form)
        this.showAdd = false
        this.fetchAssistants()
        this.$toast({
          component: ToastificationContent,
          props: { title: this.$t('assistant.created'), icon: 'CheckIcon', variant: 'success' },
        })
      } catch (error) {
        const msg = error.response?.data?.message || error.response?.data?.error || this.$t('assistant.createError')
        this.$toast({
          component: ToastificationContent,
          props: { title: msg, icon: 'AlertTriangleIcon', variant: 'danger' },
        })
      }
    },

    showEditModal(assistant) {
      const phone = splitPhoneNumber(assistant.phone)
      const whatsapp = splitPhoneNumber(assistant.whatsapp_number)
      this.editForm = {
        id: assistant.id,
        name: assistant.name,
        email: assistant.email,
        phone: phone.number,
        phone_country_code: phone.prefix,
        whatsapp_number: whatsapp.number,
        whatsapp_country_code: whatsapp.prefix,
        useSameMobile: assistant.phone && assistant.phone === assistant.whatsapp_number,
        password: '',
        password_confirmation: '',
      }
      this.showEdit = true
    },

    async updateAssistant() {
      try {
        const data = {
          name: this.editForm.name,
          email: this.editForm.email,
          phone: this.editForm.phone,
          phone_country_code: this.editForm.phone_country_code,
          whatsapp_number: this.editForm.whatsapp_number,
          whatsapp_country_code: this.editForm.whatsapp_country_code,
          useSameMobile: this.editForm.useSameMobile,
        }
        if (this.editForm.password) {
          data.password = this.editForm.password
          data.password_confirmation = this.editForm.password_confirmation
        }
        await assistantsService.updateAssistant(this.editForm.id, data)
        this.showEdit = false
        this.fetchAssistants()
        this.$toast({
          component: ToastificationContent,
          props: { title: this.$t('assistant.updated'), icon: 'CheckIcon', variant: 'success' },
        })
      } catch (error) {
        const msg = error.response?.data?.message || error.response?.data?.error || this.$t('assistant.updateError')
        this.$toast({
          component: ToastificationContent,
          props: { title: msg, icon: 'AlertTriangleIcon', variant: 'danger' },
        })
      }
    },

    async deleteAssistant(assistant) {
      const result = await this.$swal({
        title: this.$t('assistant.deleteConfirm'),
        text: this.$t('assistant.deleteText', { name: assistant.name }),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: this.$t('actions.delete'),
        cancelButtonText: this.$t('actions.cancel'),
        customClass: {
          confirmButton: 'btn btn-danger',
          cancelButton: 'btn btn-outline-secondary ml-1',
        },
        buttonsStyling: false,
      })

      if (result.isConfirmed) {
        try {
          await assistantsService.deleteAssistant(assistant.id)
          this.fetchAssistants()
          this.$toast({
            component: ToastificationContent,
            props: { title: this.$t('assistant.deleted'), icon: 'CheckIcon', variant: 'success' },
          })
        } catch (error) {
          this.$toast({
            component: ToastificationContent,
            props: { title: this.$t('assistant.deleteError'), icon: 'AlertTriangleIcon', variant: 'danger' },
          })
        }
      }
    },

    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString()
    },

    emptyForm() {
      return {
        name: '',
        email: '',
        phone: '',
        phone_country_code: '',
        whatsapp_number: '',
        whatsapp_country_code: '',
        useSameMobile: false,
        password: '',
        password_confirmation: '',
      }
    },

    handleUseSameMobileChange(form) {
      if (form.useSameMobile) {
        form.whatsapp_number = form.phone
        form.whatsapp_country_code = form.phone_country_code
      }
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

::v-deep .phone-country-select.custom-select {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.phone-number-input {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.phone-combined-control--rtl ::v-deep .phone-country-select.custom-select {
  border-radius: 0 0.357rem 0.357rem 0;
}

.phone-combined-control--rtl .phone-number-input {
  border-radius: 0.357rem 0 0 0.357rem;
}
</style>
