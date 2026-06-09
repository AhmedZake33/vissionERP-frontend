import countryList from '@/utils/countries'

export function cleanPhonePrefix(prefix) {
  if (!prefix && prefix !== 0) return ''
  let value = String(prefix).trim()
  if (!value) return ''
  value = value.replace(/[^0-9+]/g, '')
  if (!value.startsWith('+')) value = `+${value.replace(/^0+/, '')}`
  return value
}

export function cleanPhoneNumber(number) {
  if (number === null || number === undefined) return ''
  return String(number).trim().replace(/[^0-9]/g, '').replace(/^0+/, '')
}

export function combineWithPhonePrefix(prefix, number) {
  const cleanPrefix = cleanPhonePrefix(prefix)
  const cleanNumber = cleanPhoneNumber(number)
  if (!cleanNumber) return ''
  if (!cleanPrefix) return cleanNumber
  if (String(number).includes(cleanPrefix)) return `${cleanPrefix}${cleanNumber}`.replace(/\+\+/, '+')
  return `${cleanPrefix}${cleanNumber}`
}

export function preparePhonePayload(data = {}) {
  const payload = { ...data }

  if ('phone' in payload) {
    const combined = combineWithPhonePrefix(payload.phone_country_code || payload.country_code || '', payload.phone)
    payload.phone = combined || ''
  }

  if ('whatsapp_number' in payload) {
    const combined = combineWithPhonePrefix(payload.whatsapp_country_code || payload.country_code || '', payload.whatsapp_number)
    payload.whatsapp_number = combined || ''
  }

  delete payload.phone_country_code
  delete payload.whatsapp_country_code
  delete payload.country_code
  delete payload.useSameMobile

  return payload
}

const sortedPrefixes = [...new Set(countryList.map(country => country.value))].sort((a, b) => b.length - a.length)

export function splitPhoneNumber(combined) {
  if (!combined) return { prefix: '', number: '' }
  const value = String(combined).trim()
  if (!value.startsWith('+')) return { prefix: '', number: value }
  const prefix = sortedPrefixes.find(item => value.startsWith(item))
  return prefix ? { prefix, number: value.slice(prefix.length) } : { prefix: '', number: value }
}
