<template>
  <div class="erp-page">
    <div class="erp-page__heading">
      <div><p class="erp-eyebrow">{{ $t('erp.access.eyebrow') }}</p><h2>{{ $t('erp.access.title') }}</h2><p class="text-muted mb-0">{{ $t('erp.access.description') }}</p></div>
      <b-button v-if="canManage" variant="primary" @click="openUserModal">
        <feather-icon icon="UserPlusIcon" class="mr-50" />{{ $t('erp.access.addEmployee') }}
      </b-button>
    </div>
    <b-tabs content-class="mt-2">
      <b-tab :title="$t('erp.access.users')" active>
        <b-card class="erp-panel">
          <div class="erp-toolbar">
            <b-form-input v-model="search" class="erp-search" :placeholder="$t('erp.common.search')" @keyup.enter="fetchUsers" />
            <b-button variant="outline-primary" @click="fetchUsers">{{ $t('erp.common.search') }}</b-button>
          </div>
          <b-table :items="users" :fields="fields" :busy="loading" responsive hover>
            <template #cell(role)="data">
              <b-form-select
                :value="data.item.roles && data.item.roles[0] ? data.item.roles[0].id : null"
                :options="roleOptions"
                size="sm"
                :disabled="!canManage"
                @change="assignRole(data.item, $event)"
              />
            </template>
            <template #cell(status)="data"><b-badge :variant="data.item.is_active ? 'light-success' : 'light-secondary'">{{ data.item.is_active ? $t('erp.common.active') : $t('erp.common.inactive') }}</b-badge></template>
            <template #cell(actions)="data">
              <b-button v-if="canManage && data.item.role !== 'company_owner'" size="sm" variant="flat-danger" class="btn-icon" @click="removeUser(data.item)">
                <feather-icon icon="Trash2Icon" />
              </b-button>
            </template>
            <template #cell(created_at)="data">{{ formatDate(data.value) }}</template>
          </b-table>
          <div class="erp-pagination"><span>{{ pagination.total }} users</span><b-pagination v-model="pagination.current_page" :total-rows="pagination.total" :per-page="pagination.per_page" @change="changePage" /></div>
        </b-card>
      </b-tab>
      <b-tab :title="$t('erp.access.rolesMatrix')">
        <roles-permissions />
      </b-tab>
    </b-tabs>

    <b-modal v-model="showUserModal" :title="$t('erp.access.addEmployee')" hide-footer>
      <b-alert v-if="userError" show variant="danger">{{ userError }}</b-alert>
      <b-form @submit.prevent="createUser">
        <b-form-group :label="$t('erp.access.name')"><b-form-input v-model="userForm.name" required /></b-form-group>
        <b-form-group :label="$t('erp.access.email')"><b-form-input v-model="userForm.email" type="email" required /></b-form-group>
        <b-form-group :label="$t('erp.access.phone')"><b-form-input v-model="userForm.phone" /></b-form-group>
        <b-form-group :label="$t('erp.access.role')"><b-form-select v-model="userForm.role_id" :options="assignableRoleOptions" required /></b-form-group>
        <b-form-group :label="$t('erp.access.password')"><b-form-input v-model="userForm.password" type="password" required autocomplete="new-password" /></b-form-group>
        <b-form-group :label="$t('erp.access.confirmPassword')"><b-form-input v-model="userForm.password_confirmation" type="password" required autocomplete="new-password" /></b-form-group>
        <div class="d-flex justify-content-end">
          <b-button variant="outline-secondary" class="mr-1" @click="showUserModal = false">{{ $t('erp.common.cancel') }}</b-button>
          <b-button type="submit" variant="primary" :disabled="savingUser"><b-spinner v-if="savingUser" small class="mr-50" />{{ $t('erp.access.createUser') }}</b-button>
        </div>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import api from '@/services/api'
import rolesService from '@/services/roles'
import RolesPermissions from '@/views/admin/RolesPermissions.vue'
import { formatDate } from '@/utils/dateFormat'

export default {
  components: { RolesPermissions },
  data() {
    return {
      users: [],
      roles: [],
      search: '',
      loading: false,
      savingUser: false,
      showUserModal: false,
      userError: '',
      userForm: { name: '', email: '', phone: '', role_id: null, password: '', password_confirmation: '' },
      pagination: { current_page: 1, per_page: 15, total: 0 },
    }
  },
  computed: {
    fields() {
      return [
        { key: 'name', label: this.$t('erp.access.name') },
        { key: 'email', label: this.$t('erp.access.email') },
        { key: 'role', label: this.$t('erp.access.role') },
        { key: 'status', label: this.$t('erp.common.status') },
        { key: 'created_at', label: this.$t('erp.common.created') },
        { key: 'actions', label: '' },
      ]
    },
    canManage() {
      return this.$store.getters['auth/hasPermission']('erp.access.manage')
    },
    roleOptions() {
      return this.roles.map(role => ({ value: role.id, text: role.name.replace(/\b\w/g, letter => letter.toUpperCase()) }))
    },
    assignableRoleOptions() {
      return [
        { value: null, text: this.$t('erp.access.selectRole'), disabled: true },
        ...this.roles.filter(role => !role.system).map(role => ({ value: role.id, text: role.name })),
      ]
    },
  },
  mounted() {
    Promise.all([this.fetchUsers(), this.fetchRoles()])
  },
  methods: {
    async fetchUsers() {
      this.loading = true
      try {
        const { data } = await api.get('/users', { params: { search: this.search || undefined, page: this.pagination.current_page } })
        this.users = data.data || data
        this.pagination = { current_page: data.current_page || 1, per_page: data.per_page || 15, total: data.total ?? this.users.length }
      } finally {
        this.loading = false
      }
    },
    async fetchRoles() {
      const { data } = await rolesService.getRoles()
      this.roles = data
    },
    changePage(page) {
      this.pagination.current_page = page
      this.fetchUsers()
    },
    async assignRole(user, roleId) {
      await rolesService.assignRole(user.id, roleId)
      await this.fetchUsers()
    },
    openUserModal() {
      this.userForm = { name: '', email: '', phone: '', role_id: null, password: '', password_confirmation: '' }
      this.userError = ''
      this.showUserModal = true
    },
    async createUser() {
      this.savingUser = true
      this.userError = ''
      try {
        await rolesService.createUser(this.userForm)
        this.showUserModal = false
        await this.fetchUsers()
      } catch (error) {
        const errors = error.response?.data?.errors
        this.userError = errors ? Object.values(errors).flat()[0] : (error.response?.data?.message || 'Unable to create user.')
      } finally {
        this.savingUser = false
      }
    },
    async removeUser(user) {
      const confirmed = await this.$bvModal.msgBoxConfirm(`Delete ${user.name}?`, { okVariant: 'danger', okTitle: 'Delete' })
      if (!confirmed) return
      await rolesService.deleteUser(user.id)
      await this.fetchUsers()
    },
    formatDate,
  },
}
</script>
