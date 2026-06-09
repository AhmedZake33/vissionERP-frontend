import { ref, onMounted, onBeforeUnmount } from '@vue/composition-api'
import { subscribeToDoctorChannel, subscribeToAssistantChannel, leaveChannel, updateEchoAuth } from '@/libs/echo'
import store from '@/store'

/**
 * Composable for real-time reservation updates
 * Automatically subscribes to the appropriate channel based on user role
 */
export default function useRealtimeReservations() {
  const isConnected = ref(false)
  const lastEvent = ref(null)
  const notifications = ref([])
  let channel = null

  /**
   * Handle new reservation created
   */
  const handleReservationCreated = (data) => {
    console.log('🔔 Reservation Created:', data)
    lastEvent.value = { type: 'created', data, timestamp: new Date() }
    addNotification({
      type: 'success',
      title: 'New Reservation',
      message: data.message || 'A new reservation has been created',
      reservation: data.reservation,
    })
  }

  /**
   * Handle reservation updated
   */
  const handleReservationUpdated = (data) => {
    console.log('🔔 Reservation Updated:', data)
    lastEvent.value = { type: 'updated', data, timestamp: new Date() }
    addNotification({
      type: 'info',
      title: 'Reservation Updated',
      message: data.message || 'A reservation has been updated',
      reservation: data.reservation,
    })
  }

  /**
   * Handle reservation completed
   */
  const handleReservationCompleted = (data) => {
    console.log('🔔 Reservation Completed:', data)
    lastEvent.value = { type: 'completed', data, timestamp: new Date() }
    addNotification({
      type: 'success',
      title: 'Reservation Completed',
      message: data.message || 'A reservation has been completed',
      reservation: data.reservation,
    })
  }

  /**
   * Handle reservation deleted
   */
  const handleReservationDeleted = (data) => {
    console.log('🔔 Reservation Deleted:', data)
    lastEvent.value = { type: 'deleted', data, timestamp: new Date() }
    addNotification({
      type: 'warning',
      title: 'Reservation Deleted',
      message: data.message || 'A reservation has been deleted',
      reservationId: data.reservation_id,
    })
  }

  /**
   * Add notification to the list
   */
  const addNotification = (notification) => {
    notifications.value.unshift({
      ...notification,
      id: Date.now(),
      timestamp: new Date(),
    })
    // Keep only last 10 notifications
    if (notifications.value.length > 10) {
      notifications.value.pop()
    }
  }

  /**
   * Clear all notifications
   */
  const clearNotifications = () => {
    notifications.value = []
  }

  /**
   * Subscribe to reservation updates based on user role
   */
  const subscribe = () => {
    const user = store.state.auth?.user || JSON.parse(localStorage.getItem('user'))
    if (!user) {
      console.warn('No user found, cannot subscribe to real-time updates')
      return
    }

    // Update auth headers
    updateEchoAuth()

    const eventHandlers = {
      onCreated: handleReservationCreated,
      onUpdated: handleReservationUpdated,
      onCompleted: handleReservationCompleted,
      onDeleted: handleReservationDeleted,
    }

    if (user.role === 'doctor') {
      channel = subscribeToDoctorChannel(user.id, eventHandlers)
      console.log(`📡 Subscribed to doctor.${user.id} channel`)
    } else if (user.role === 'assistant') {
      const doctorId = user.doctor_id || user.doctor?.id
      if (!doctorId) return

      channel = subscribeToAssistantChannel(doctorId, eventHandlers)
      console.log(`📡 Subscribed to assistant.reservations.${doctorId} channel`)
    }

    isConnected.value = true
  }

  /**
   * Unsubscribe from reservation updates
   */
  const unsubscribe = () => {
    const user = store.state.auth?.user || JSON.parse(localStorage.getItem('user'))
    if (user) {
      if (user.role === 'doctor') {
        leaveChannel(`doctor.${user.id}`)
      } else if (user.role === 'assistant') {
        const doctorId = user.doctor_id || user.doctor?.id
        if (doctorId) leaveChannel(`assistant.reservations.${doctorId}`)
      }
    }
    channel = null
    isConnected.value = false
    console.log('📡 Unsubscribed from real-time updates')
  }

  return {
    isConnected,
    lastEvent,
    notifications,
    subscribe,
    unsubscribe,
    clearNotifications,
  }
}
