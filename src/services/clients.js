import apiClient from './api'
import countryList from '@/utils/countries'

function cleanPrefix(p) {
  if (!p && p !== 0) return ''
  let s = String(p).trim()
  if (!s) return ''
  // ensure starts with + and remove any non-digit/+ chars
  s = s.replace(/[^0-9+]/g, '')
  if (!s.startsWith('+')) s = '+' + s.replace(/^0+/, '')
  return s
}

function cleanNumber(n) {
  if (n === null || n === undefined) return ''
  let s = String(n).trim()
  if (!s) return ''
  // remove non-digit characters
  s = s.replace(/[^0-9]/g, '')
  // remove leading zeros so combined number doesn't have extra zeros
  s = s.replace(/^0+/, '')
  return s
}

function combineWithPrefix(prefix, number) {
  const p = cleanPrefix(prefix)
  const num = cleanNumber(number)
  if (!num) return ''
  if (!p) return num
  // if number already contains the prefix (e.g., +96650123), just return cleaned
  if (String(number).includes(p)) {
    return (p + num).replace(/\+\+/, '+')
  }
  return p + num
}

function prepareClientPayload(client = {}) {
  const payload = { ...client }

  // Combine phone country code with phone
  if ('phone' in payload) {
    const prefix = payload.phone_country_code || payload.country_code || ''
    const combined = combineWithPrefix(prefix, payload.phone)
    if (combined) payload.phone = combined
  }

  // Combine whatsapp country code with whatsapp_number
  if ('whatsapp_number' in payload) {
    const wprefix = payload.whatsapp_country_code || payload.country_code || ''
    const combined = combineWithPrefix(wprefix, payload.whatsapp_number)
    if (combined) payload.whatsapp_number = combined
  }

  return payload
}

// Sorted longest-first so e.g. +966 is matched before +9
const _sortedPrefixes = [...new Set(countryList.map(c => c.value))].sort((a, b) => b.length - a.length)

export function splitPhoneNumber(combined) {
  if (!combined) return { prefix: '', number: '' }
  const s = String(combined).trim()
  if (!s.startsWith('+')) return { prefix: '', number: s }
  for (const p of _sortedPrefixes) {
    if (s.startsWith(p)) return { prefix: p, number: s.slice(p.length) }
  }
  return { prefix: '', number: s }
}

export default {
  getClientOptions() {
    return apiClient.get('/clients/options')
  },

  getClients(params = {}) {
    return apiClient.get('/clients', { params })
  },
  
  getClient(id) {
    return apiClient.get(`/clients/${id}`)
  },
  
  createClient(clientData) {
    const payload = prepareClientPayload(clientData)
    return apiClient.post('/clients', payload)
  },
  
  updateClient(id, clientData) {
    const payload = prepareClientPayload(clientData)
    return apiClient.put(`/clients/${id}`, payload)
  },
  
  deleteClient(id) {
    return apiClient.delete(`/clients/${id}`)
  }
}
