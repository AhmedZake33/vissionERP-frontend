<template>
  <div>
    <b-row>
      <!-- Roles List -->
      <b-col cols="12" lg="5">
        <b-card>
          <b-card-header>
            <div class="d-flex justify-content-between align-items-center">
              <h4 class="mb-0">
                <feather-icon icon="ShieldIcon" class="mr-50" />
                {{ $t('roles.rolesManagement') }}
              </h4>
              <b-button variant="primary" size="sm" @click="openAddRoleModal()">
                <feather-icon icon="PlusIcon" class="mr-50" />
                {{ $t('roles.addRole') }}
              </b-button>
            </div>
          </b-card-header>

          <b-table
            :items="roles"
            :fields="roleFields"
            :busy="loading"
            responsive
            striped
            hover
            selectable
            select-mode="single"
            @row-selected="onRoleSelected"
          >
            <template #cell(name)="data">
              <b-badge :variant="getRoleVariant(data.item.name)">
                {{ data.item.name }}
              </b-badge>
            </template>

            <template #cell(permissions)="data">
              <span class="text-muted">
                {{ data.item.permissions ? data.item.permissions.length : 0 }} {{ $t('roles.permissions') }}
              </span>
            </template>

            <template #cell(users_count)="data">
              <b-badge variant="light-info">
                {{ data.item.users_count }} {{ $t('roles.users') }}
              </b-badge>
            </template>

            <template #cell(actions)="data">
              <div class="d-flex align-items-center">
                <b-button
                  variant="flat-primary"
                  size="sm"
                  class="btn-icon"
                  @click.stop="editRole(data.item)"
                >
                  <feather-icon icon="EditIcon" />
                </b-button>
                <b-button
                  v-if="!isProtectedRole(data.item.name)"
                  variant="flat-danger"
                  size="sm"
                  class="btn-icon"
                  @click.stop="confirmDeleteRole(data.item)"
                >
                  <feather-icon icon="TrashIcon" />
                </b-button>
              </div>
            </template>
          </b-table>
        </b-card>
      </b-col>

      <!-- Permissions Matrix -->
      <b-col cols="12" lg="7">
        <b-card v-if="selectedRole">
          <b-card-header>
            <div class="d-flex justify-content-between align-items-center">
              <h4 class="mb-0">
                <feather-icon icon="KeyIcon" class="mr-50" />
                {{ $t('roles.permissionsFor') }}
                <b-badge :variant="getRoleVariant(selectedRole.name)" class="ml-50">
                  {{ selectedRole.name }}
                </b-badge>
              </h4>
              <b-button variant="success" size="sm" :disabled="saving" @click="savePermissions()">
                <b-spinner v-if="saving" small class="mr-50" />
                <feather-icon v-else icon="SaveIcon" class="mr-50" />
                {{ $t('actions.save') }}
              </b-button>
            </div>
          </b-card-header>

          <div class="permissions-matrix">
            <div
              v-for="(perms, group) in groupedPermissions"
              :key="group"
              class="permission-group mb-2"
            >
              <div class="d-flex align-items-center mb-1">
                <b-form-checkbox
                  :checked="isGroupFullySelected(group)"
                  :indeterminate="isGroupPartiallySelected(group)"
                  @change="toggleGroup(group, $event)"
                >
                  <h6 class="mb-0 text-capitalize">
                    <feather-icon :icon="getGroupIcon(group)" class="mr-50" />
                    {{ $t(`roles.groups.${group}`) || group }}
                  </h6>
                </b-form-checkbox>
              </div>

              <b-row class="ml-2">
                <b-col
                  v-for="perm in perms"
                  :key="perm.id"
                  md="6"
                  lg="4"
                  class="mb-50"
                >
                  <b-form-checkbox
                    v-model="selectedPermissions"
                    :value="perm.name"
                  >
                    <small>{{ formatPermissionLabel(perm.name) }}</small>
                  </b-form-checkbox>
                </b-col>
              </b-row>

              <hr class="my-1" />
            </div>
          </div>

          <!-- Select/Deselect All -->
          <div class="d-flex justify-content-between mt-1">
            <div>
              <b-button variant="outline-primary" size="sm" class="mr-1" @click="selectAllPermissions()">
                {{ $t('roles.selectAll') }}
              </b-button>
              <b-button variant="outline-secondary" size="sm" @click="deselectAllPermissions()">
                {{ $t('roles.deselectAll') }}
              </b-button>
            </div>
            <small class="text-muted align-self-center">
              {{ selectedPermissions.length }} / {{ allPermissionNames.length }} {{ $t('roles.selected') }}
            </small>
          </div>
        </b-card>

        <!-- No Role Selected -->
        <b-card v-else class="text-center py-5">
          <feather-icon icon="MousePointerIcon" size="48" class="text-muted mb-1" />
          <h5 class="text-muted">{{ $t('roles.selectRoleToManage') }}</h5>
          <p class="text-muted">{{ $t('roles.selectRoleDescription') }}</p>
        </b-card>
      </b-col>
    </b-row>

    <!-- Add/Edit Role Modal -->
    <b-modal
      id="role-modal"
      :title="editingRole ? $t('roles.editRole') : $t('roles.addRole')"
      @ok="saveRole"
      @hidden="resetModal"
      :ok-title="$t('actions.save')"
      :cancel-title="$t('actions.cancel')"
    >
      <b-form-group :label="$t('roles.roleName')" label-for="role-name">
        <b-form-input
          id="role-name"
          v-model="roleForm.name"
          :placeholder="$t('roles.enterRoleName')"
          :disabled="editingRole && isProtectedRole(editingRole.name)"
        />
      </b-form-group>
    </b-modal>
  </div>
</template>

<script>
import {
  BRow, BCol, BCard, BCardHeader, BTable, BButton, BBadge,
  BFormCheckbox, BFormGroup, BFormInput, BModal, BSpinner,
} from 'bootstrap-vue'
import rolesService from '@/services/roles'

export default {
  components: {
    BRow, BCol, BCard, BCardHeader, BTable, BButton, BBadge,
    BFormCheckbox, BFormGroup, BFormInput, BModal, BSpinner,
  },
  data() {
    return {
      loading: false,
      saving: false,
      roles: [],
      allPermissions: [],
      groupedPermissions: {},
      selectedRole: null,
      selectedPermissions: [],
      editingRole: null,
      roleForm: {
        name: '',
      },
      roleFields: [
        { key: 'name', label: this.$t('roles.name'), sortable: true },
        { key: 'permissions', label: this.$t('roles.permissions') },
        { key: 'users_count', label: this.$t('roles.users') },
        { key: 'actions', label: this.$t('actions.actions'), thStyle: { width: '100px' } },
      ],
    }
  },
  computed: {
    allPermissionNames() {
      return this.allPermissions.map(p => p.name)
    },
  },
  created() {
    this.fetchRoles()
    this.fetchPermissions()
  },
  methods: {
    async fetchRoles() {
      this.loading = true
      try {
        const res = await rolesService.getRoles()
        this.roles = res.data
      } catch (e) {
        this.$toast({ component: { render: h => h('span', this.$t('errors.fetchFailed')) }, props: { variant: 'danger' } })
      } finally {
        this.loading = false
      }
    },

    async fetchPermissions() {
      try {
        const [flatRes, groupedRes] = await Promise.all([
          rolesService.getPermissions(false),
          rolesService.getPermissions(true),
        ])
        this.allPermissions = flatRes.data
        this.groupedPermissions = groupedRes.data
      } catch (e) {
        console.error('Failed to fetch permissions', e)
      }
    },

    onRoleSelected(items) {
      if (items.length > 0) {
        this.selectedRole = items[0]
        this.selectedPermissions = [...(items[0].permissions || [])]
      }
    },

    async savePermissions() {
      if (!this.selectedRole) return
      this.saving = true
      try {
        const res = await rolesService.updateRole(this.selectedRole.id, {
          name: this.selectedRole.name,
          permissions: this.selectedPermissions,
        })
        // Update role in list
        const idx = this.roles.findIndex(r => r.id === this.selectedRole.id)
        if (idx !== -1) {
          this.$set(this.roles, idx, res.data)
          this.selectedRole = res.data
        }
        this.$swal({
          icon: 'success',
          title: this.$t('roles.permissionsSaved'),
          showConfirmButton: false,
          timer: 1500,
        })

        // If the updated role is the current user's role, refresh permissions
        const userRole = this.$store.getters['auth/userRole']
        if (this.selectedRole.name === userRole) {
          this.$store.dispatch('auth/updatePermissions', {
            permissions: this.selectedPermissions,
            roles: this.$store.getters['auth/userRoles'],
          })
        }
      } catch (e) {
        this.$swal({
          icon: 'error',
          title: this.$t('roles.saveFailed'),
          text: e.response?.data?.message || e.message,
        })
      } finally {
        this.saving = false
      }
    },

    openAddRoleModal() {
      this.editingRole = null
      this.roleForm = { name: '' }
      this.$bvModal.show('role-modal')
    },

    editRole(role) {
      this.editingRole = role
      this.roleForm = { name: role.name }
      this.$bvModal.show('role-modal')
    },

    async saveRole(bvModalEvt) {
      bvModalEvt.preventDefault()
      if (!this.roleForm.name) return

      try {
        if (this.editingRole) {
          await rolesService.updateRole(this.editingRole.id, {
            name: this.roleForm.name,
            permissions: this.editingRole.permissions || [],
          })
        } else {
          await rolesService.createRole({
            name: this.roleForm.name,
            permissions: [],
          })
        }
        await this.fetchRoles()
        this.$bvModal.hide('role-modal')
        this.$swal({
          icon: 'success',
          title: this.$t('roles.roleSaved'),
          showConfirmButton: false,
          timer: 1500,
        })
      } catch (e) {
        this.$swal({
          icon: 'error',
          title: this.$t('roles.saveFailed'),
          text: e.response?.data?.message || e.message,
        })
      }
    },

    async confirmDeleteRole(role) {
      const result = await this.$swal({
        title: this.$t('roles.confirmDelete'),
        text: this.$t('roles.deleteWarning', { name: role.name }),
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
          await rolesService.deleteRole(role.id)
          await this.fetchRoles()
          if (this.selectedRole && this.selectedRole.id === role.id) {
            this.selectedRole = null
            this.selectedPermissions = []
          }
          this.$swal({
            icon: 'success',
            title: this.$t('roles.roleDeleted'),
            showConfirmButton: false,
            timer: 1500,
          })
        } catch (e) {
          this.$swal({
            icon: 'error',
            title: this.$t('roles.deleteFailed'),
            text: e.response?.data?.error || e.message,
          })
        }
      }
    },

    resetModal() {
      this.editingRole = null
      this.roleForm = { name: '' }
    },

    // Permission group helpers
    isGroupFullySelected(group) {
      const perms = this.groupedPermissions[group] || []
      return perms.every(p => this.selectedPermissions.includes(p.name))
    },

    isGroupPartiallySelected(group) {
      const perms = this.groupedPermissions[group] || []
      const selected = perms.filter(p => this.selectedPermissions.includes(p.name))
      return selected.length > 0 && selected.length < perms.length
    },

    toggleGroup(group, checked) {
      const perms = (this.groupedPermissions[group] || []).map(p => p.name)
      if (checked) {
        const newPerms = new Set([...this.selectedPermissions, ...perms])
        this.selectedPermissions = Array.from(newPerms)
      } else {
        this.selectedPermissions = this.selectedPermissions.filter(p => !perms.includes(p))
      }
    },

    selectAllPermissions() {
      this.selectedPermissions = [...this.allPermissionNames]
    },

    deselectAllPermissions() {
      this.selectedPermissions = []
    },

    // UI helpers
    getRoleVariant(name) {
      const variants = {
        admin: 'danger',
        doctor: 'primary',
        assistant: 'success',
        client: 'info',
      }
      return variants[name] || 'secondary'
    },

    isProtectedRole(name) {
      return ['admin', 'doctor', 'assistant', 'client'].includes(name)
    },

    getGroupIcon(group) {
      const icons = {
        dashboard: 'HomeIcon',
        clients: 'UsersIcon',
        reservations: 'CalendarIcon',
        schedule: 'ClockIcon',
        financials: 'DollarSignIcon',
        reports: 'BarChart2Icon',
        'waiting-queue': 'ListIcon',
        'check-in-patients': 'CheckSquareIcon',
        assistants: 'UserPlusIcon',
        drugs: 'PackageIcon',
        prescriptions: 'FileTextIcon',
        doctors: 'UserIcon',
        subscriptions: 'CreditCardIcon',
        roles: 'ShieldIcon',
        permissions: 'KeyIcon',
      }
      return icons[group] || 'CircleIcon'
    },

    formatPermissionLabel(name) {
      // "view-clients" → "View Clients"
      return name
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    },
  },
}
</script>

<style scoped>
.permissions-matrix {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0.5rem;
}

.permission-group {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 0.5rem;
  padding: 0.75rem;
}
</style>

