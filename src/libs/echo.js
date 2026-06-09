import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import store from '@/store'

// Make Pusher available globally for Laravel Echo
window.Pusher = Pusher

/**
 * Initialize Laravel Echo with Reverb configuration
 * This creates a WebSocket connection to the Laravel Reverb server
 */
const echo = window.Echo = new Echo({
  broadcaster: 'reverb',
  key: process.env.VUE_APP_REVERB_APP_KEY || 'pqjszxneonx8bzvm7p3a',
  wsHost: process.env.VUE_APP_REVERB_HOST || 'localhost',
  wsPort: process.env.VUE_APP_REVERB_PORT || 9000,
  wssPort: process.env.VUE_APP_REVERB_PORT || 443,
  forceTLS: (process.env.VUE_APP_REVERB_SCHEME || 'http') === 'https',
  enabledTransports: ['ws', 'wss'],
  disableStats: true,
  authEndpoint: `${process.env.VUE_APP_API_URL || 'http://localhost:8000'}/api/broadcasting/auth`,
  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      Accept: 'application/json',
    },
  },
})

/**
 * Update Echo authorization headers when token changes
 * Call this after login/logout to ensure proper authentication
 */
export const updateEchoAuth = () => {
  const token = localStorage.getItem('token')
  echo.connector.options.auth.headers.Authorization = token ? `Bearer ${token}` : ''
}

/**
 * Subscribe to doctor-specific reservation channel
 * @param {number} doctorId - The doctor's user ID
 * @param {Function} onCreated - Callback when reservation is created
 * @param {Function} onUpdated - Callback when reservation is updated
 * @param {Function} onCompleted - Callback when reservation is completed
 * @param {Function} onDeleted - Callback when reservation is deleted
 * @returns {Object} - Echo channel subscription
 */
export const subscribeToDoctorChannel = (doctorId, { onCreated, onUpdated, onCompleted, onDeleted, onReordered }) => {
  const ch = echo.private(`doctor.${doctorId}`)
    .listen('.reservation.created', onCreated)
    .listen('.reservation.updated', onUpdated)
    .listen('.reservation.completed', onCompleted)
    .listen('.reservation.deleted', onDeleted)
  if (onReordered) ch.listen('.queue.reordered', onReordered)
  return ch
}

/**
 * Subscribe to assistant reservation channel
 * @param {Function} onCreated - Callback when reservation is created
 * @param {Function} onUpdated - Callback when reservation is updated
 * @param {Function} onCompleted - Callback when reservation is completed
 * @param {Function} onDeleted - Callback when reservation is deleted
 * @returns {Object} - Echo channel subscription
 */
export const subscribeToAssistantChannel = (doctorId, { onCreated, onUpdated, onCompleted, onDeleted, onReordered }) => {
  const ch = echo.private(`assistant.reservations.${doctorId}`)
    .listen('.reservation.created', onCreated)
    .listen('.reservation.updated', onUpdated)
    .listen('.reservation.completed', onCompleted)
    .listen('.reservation.deleted', onDeleted)
  if (onReordered) ch.listen('.queue.reordered', onReordered)
  return ch
}

/**
 * Unsubscribe from a channel
 * @param {string} channelName - The channel name to leave
 */
export const leaveChannel = (channelName) => {
  echo.leave(channelName)
}

/**
 * Leave all channels
 */
export const leaveAllChannels = () => {
  echo.disconnect()
}

export default echo
