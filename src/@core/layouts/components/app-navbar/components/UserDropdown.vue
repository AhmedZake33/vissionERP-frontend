<template>
  <b-nav-item-dropdown
    :right="isRTL"
    toggle-class="d-flex align-items-center dropdown-user-link"
    class="dropdown-user"
    :menu-class="isRTL ? 'dropdown-menu-left' : 'dropdown-menu-right'"
  >
    <template v-if="userData" #button-content>
      <div class="d-flex align-items-center" :class="isRTL ? 'flex-row-reverse' : ''">
        <div class="d-sm-flex d-none user-nav" :class="isRTL ? 'ml-1 text-right' : 'mr-1 text-left'">
          <p class="user-name font-weight-bolder mb-0">
            {{ userData.name }}
          </p>
          <span class="user-status">{{ userData.role }}</span>
        </div>
        <b-avatar
          size="40"
          :src="userData.avatar"
          variant="light-primary"
          badge
          class="badge-minimal"
          badge-variant="success"
        >
          <feather-icon
            v-if="!userData.avatar"
            icon="UserIcon"
            size="22"
          />
        </b-avatar>
      </div>
    </template>

   
    <b-dropdown-item
      :link-class="['d-flex', 'align-items-center', isRTL ? 'flex-row-reverse' : '']"
      @click="logout"
    >
      <feather-icon
        size="16"
        icon="LogOutIcon"
        :class="isRTL ? 'ml-50' : 'mr-50'"
      />
      <span>{{ $t('actions.logout') || 'Logout' }}</span>
    </b-dropdown-item></b-nav-item-dropdown>
</template>

<script>
import {
  BNavItemDropdown, BDropdownItem, BDropdownDivider, BAvatar,
} from 'bootstrap-vue'
import { initialAbility } from '@/libs/acl/config'
import useJwt from '@/auth/jwt/useJwt'
import { avatarText } from '@core/utils/filter'

export default {
  components: {
    BNavItemDropdown,
    BDropdownItem,
    BDropdownDivider,
    BAvatar,
  },
  data() {
    return {
      userData: JSON.parse(localStorage.getItem('user')),
      avatarText,
    }
  },
  computed: {
    isRTL() {
      return this.$store.state.appConfig.layout.isRTL
    },
  },
  methods: {
    logout() {
      // Remove userData and token from localStorage
      localStorage.removeItem('user')
      localStorage.removeItem('token')

      // Redirect to login page
      this.$router.push({ name: 'login' })
    },
  },
}
</script>
