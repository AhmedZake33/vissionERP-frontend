/**
 * Vuex module for global broadcast state.
 * Components can watch `state.broadcast.lastEvent` to react to real-time events.
 */
export default {
  namespaced: true,
  state: {
    // Incremented on every event so watchers always fire
    eventCounter: 0,
    // The most recent event: { type: 'created'|'updated'|'completed'|'deleted', data: {...} }
    lastEvent: null,
  },
  mutations: {
    RESERVATION_EVENT(state, event) {
      state.lastEvent = { ...event, _ts: Date.now() }
      state.eventCounter++
    },
  },
}
