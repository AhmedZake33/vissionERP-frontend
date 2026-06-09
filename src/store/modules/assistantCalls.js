import assistantCallsService from '@/services/assistantCalls'

const state = {
  activeCalls: [],
}

const getters = {
  activeCalls: (s) => s.activeCalls,
}

const mutations = {
  SET_ACTIVE_CALLS(state, calls) {
    state.activeCalls = calls || []
  },
  ADD_CALL(state, call) {
    if (!state.activeCalls.find(c => c.id === call.id)) state.activeCalls.push(call)
  },
  UPDATE_CALL(state, call) {
    const idx = state.activeCalls.findIndex(c => c.id === call.id)
    if (idx !== -1) state.activeCalls.splice(idx, 1, { ...state.activeCalls[idx], ...call })
  },
  REMOVE_CALL(state, callId) {
    state.activeCalls = state.activeCalls.filter(c => c.id !== callId)
  },
}

const actions = {
  async fetchActiveCalls({ commit }) {
    try {
      const res = await assistantCallsService.getActiveCalls()
      commit('SET_ACTIVE_CALLS', res.data || [])
      return res
    } catch (e) {
      commit('SET_ACTIVE_CALLS', [])
      throw e
    }
  },
  async createCall({ commit }, payload) {
    const res = await assistantCallsService.createCall(payload)
    const call = res.data?.call || res.data
    if (call) commit('ADD_CALL', call)
    return res
  },
  async acceptCall({ commit }, callId) {
    const res = await assistantCallsService.acceptCall(callId)
    const call = res.data?.call || res.data
    if (call) commit('UPDATE_CALL', call)
    return res
  },
  async completeCall({ commit }, callId) {
    const res = await assistantCallsService.completeCall(callId)
    commit('REMOVE_CALL', callId)
    return res
  },
  // helper to process broadcast payloads
  processCallEvent({ commit }, payload) {
    const call = payload.call
    if (!call) return
    if (payload.action === 'created') commit('ADD_CALL', call)
    else if (payload.action === 'accepted') commit('UPDATE_CALL', call)
    else if (payload.action === 'completed') commit('REMOVE_CALL', call.id)
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}
