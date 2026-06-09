// src/store/modules/auth.js
import { updateEchoAuth, leaveAllChannels } from '@/libs/echo'
import authService from '@/services/auth'

export default {
  namespaced: true,
  state: {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    permissions: JSON.parse(localStorage.getItem('permissions') || '[]'),
    roles: JSON.parse(localStorage.getItem('userRoles') || '[]'),
  },
  getters: {
    isLoggedIn: state => !!state.token,
    userRole: state => {
      // prefer Vuex state, fallback to localStorage
      if (state.user && state.user.role) return state.user.role
      try {
        const u = JSON.parse(localStorage.getItem('user') || 'null')
        return u?.role || ''
      } catch (e) {
        return ''
      }
    },
    // Resolve the doctor_id for the current user (multi-tenant)
    // Doctor → own id, Assistant → doctor_id field
    doctorId: state => {
      if (!state.user) return null
      if (state.user.role === 'doctor') return state.user.id
      if (state.user.role === 'assistant') return state.user.doctor_id
      return null
    },
    doctorName: state => {
      if (!state.user) return ''
      if (state.user.role === 'doctor') return state.user.name
      if (state.user.role === 'assistant' && state.user.doctor) return state.user.doctor.name
      return ''
    },
    isAdmin: state => {
      const role = state.user?.role || JSON.parse(localStorage.getItem('user') || 'null')?.role
      return role === 'admin'
    },
    isDoctor: state => {
      const role = state.user?.role || JSON.parse(localStorage.getItem('user') || 'null')?.role
      return role === 'doctor'
    },
    isAssistant: state => {
      const role = state.user?.role || JSON.parse(localStorage.getItem('user') || 'null')?.role
      return role === 'assistant'
    },
    isClient: state => {
      const role = state.user?.role || JSON.parse(localStorage.getItem('user') || 'null')?.role
      return role === 'client'
    },
    subscriptionStatus: state => {
      return state.user?.subscription_status || 'unknown'
    },
    // Permission-based getters
    permissions: state => {
      return state.permissions || JSON.parse(localStorage.getItem('permissions') || '[]')
    },
    userRoles: state => {
      return state.roles || JSON.parse(localStorage.getItem('userRoles') || '[]')
    },
    hasPermission: state => permission => {
      const perms = state.permissions || JSON.parse(localStorage.getItem('permissions') || '[]')
      // Admin has all permissions
      const role = state.user?.role || JSON.parse(localStorage.getItem('user') || 'null')?.role
      if (role === 'admin') return true
      return perms.includes(permission)
    },
    hasAnyPermission: state => permissions => {
      const perms = state.permissions || JSON.parse(localStorage.getItem('permissions') || '[]')
      const role = state.user?.role || JSON.parse(localStorage.getItem('user') || 'null')?.role
      if (role === 'admin') return true
      return permissions.some(p => perms.includes(p))
    },
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
      localStorage.setItem('token', token)
    },
    SET_USER(state, user) {
      state.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },
    SET_PERMISSIONS(state, permissions) {
      state.permissions = permissions
      localStorage.setItem('permissions', JSON.stringify(permissions))
    },
    SET_ROLES(state, roles) {
      state.roles = roles
      localStorage.setItem('userRoles', JSON.stringify(roles))
    },
    LOGOUT(state) {
      state.token = null
      state.user = null
      state.permissions = []
      state.roles = []
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('permissions')
      localStorage.removeItem('userRoles')
    },
  },
  actions: {
    login({ commit, dispatch }, { token, user, permissions, roles }) {
      commit('SET_TOKEN', token)
      commit('SET_USER', user)
      commit('SET_PERMISSIONS', permissions || [])
      commit('SET_ROLES', roles || [])
      // Update Echo auth headers so WebSocket channels can authenticate
      updateEchoAuth()
      // Fetch fresh permissions from the dedicated endpoint
      dispatch('fetchPermissions')
    },

    /**
     * Fetch the current user's permissions & roles from the server.
     * Called after login and on every page refresh.
     */
    async fetchPermissions({ commit, state }) {
      if (!state.token) return
      try {
        const { data } = await authService.getMyPermissions()
        commit('SET_PERMISSIONS', data.permissions || [])
        commit('SET_ROLES', data.roles || [])
      } catch (e) {
        // If 401, token is invalid – clear auth
        if (e.response && e.response.status === 401) {
          commit('LOGOUT')
        }
        console.error('Failed to fetch permissions', e)
      }
    },

    updatePermissions({ commit }, { permissions, roles }) {
      commit('SET_PERMISSIONS', permissions || [])
      commit('SET_ROLES', roles || [])
    },
    logout({ commit }) {
      // Disconnect all WebSocket channels before clearing credentials
      leaveAllChannels()
      commit('LOGOUT')
    },
  },
}
